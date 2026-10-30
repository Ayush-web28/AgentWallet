import {
  AgentRunResponse,
  AgentStep,
  CatalogItem,
  GoalDecomposition,
  Order,
  ProductComparison,
  GuardrailAudit,
  AgentFinalAction,
} from '@/types';
import { decomposeProcurementGoal, auditGuardrailsWithAI } from '@/lib/ai/gemini';
import { searchCatalog, getProductDetails } from './tools/catalog';
import { evaluateCandidates } from './evaluator';
import { evaluatePurchaseAgainstPolicy } from './guardrails';
import { generateIntentHash, generateApprovalToken } from './crypto';
import { createOrder, captureOrder } from '@/lib/paypal/orders';
import { saveOrder, calculateDailySpend, getPolicy } from '@/lib/store';

/**
 * Multi-Step Autonomous Agent Execution Loop
 * Executes the procurement lifecycle: Decomposition -> Search -> Evaluation -> Guardrail Audit -> PayPal Order Execution
 */
export async function executeProcurementLoop(userPrompt: string): Promise<AgentRunResponse> {
  const runId = `RUN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const steps: AgentStep[] = [];
  const startTime = Date.now();

  const addStep = (
    phase: AgentStep['phase'],
    title: string,
    status: AgentStep['status'],
    thought?: string,
    toolCall?: AgentStep['toolCall'],
    data?: any
  ): AgentStep => {
    const step: AgentStep = {
      id: `step-${steps.length + 1}`,
      phase,
      title,
      status,
      timestamp: Date.now(),
      thought,
      toolCall,
      data,
    };
    steps.push(step);
    return step;
  };

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Parse user procurement prompt (Goal Decomposition)
    // -------------------------------------------------------------------------
    addStep(
      'DECOMPOSITION',
      'Deconstructing Procurement Objective & Constraints',
      'running',
      `Analyzing prompt: "${userPrompt}". Extracting hardware specifications, price ceiling, and delivery requirements.`
    );

    const goal: GoalDecomposition = await decomposeProcurementGoal(userPrompt);

    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].data = goal;
    steps[steps.length - 1].thought = `Identified objective: "${goal.itemName}" under $${goal.maxBudget.toFixed(2)} with ${goal.urgency} urgency. Target category: ${goal.category}.`;

    // -------------------------------------------------------------------------
    // STEP 2: Multi-Merchant Inventory Search
    // -------------------------------------------------------------------------
    addStep(
      'SEARCH',
      'Scanning Multi-Merchant Inventory Catalogs',
      'running',
      `Querying merchant inventories for "${goal.itemName}" within budget <= $${goal.maxBudget}...`,
      {
        toolName: 'searchCatalog',
        input: { query: goal.itemName, maxBudget: goal.maxBudget, category: goal.category },
      }
    );

    let candidates: CatalogItem[] = await searchCatalog(goal.itemName, goal.maxBudget, goal.category);

    // Fallback search if empty: search broader query
    if (candidates.length === 0) {
      const broaderTerm = goal.itemName.split(' ')[0];
      candidates = await searchCatalog(broaderTerm, goal.maxBudget);
    }

    if (candidates.length === 0) {
      addStep(
        'FAILED',
        'Catalog Search Yielded Zero Available Items',
        'error',
        `No merchant currently lists "${goal.itemName}" meeting budget constraints.`
      );
      return {
        runId,
        success: false,
        steps,
        goal,
        error: `No items found matching "${goal.itemName}" within budget $${goal.maxBudget}.`,
      };
    }

    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].toolCall!.output = {
      itemsFound: candidates.length,
      merchants: Array.from(new Set(candidates.map((c) => c.merchantName))),
    };
    steps[steps.length - 1].thought = `Discovered ${candidates.length} candidate items across merchants: ${candidates
      .map((c) => `${c.merchantName} ($${c.price})`)
      .join(', ')}.`;

    // -------------------------------------------------------------------------
    // STEP 3: Multi-Candidate Deal Evaluator
    // -------------------------------------------------------------------------
    addStep(
      'EVALUATION',
      'Balancing Price, Logistics & Vendor Reputation',
      'running',
      `Executing multi-criteria decision evaluation across ${candidates.length} candidates using Gemini 2.5 Flash.`
    );

    const comparison: ProductComparison = await evaluateCandidates(goal, candidates);
    const selectedItem = candidates.find((c) => c.id === comparison.selectedItem.id) || candidates[0];

    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].data = comparison;
    steps[steps.length - 1].thought = comparison.selectionRationale;

    // -------------------------------------------------------------------------
    // STEP 4: Policy & Guardrail Verification
    // -------------------------------------------------------------------------
    addStep(
      'GUARDRAIL',
      'Cryptographic Guardrail & Spending Policy Verification',
      'running',
      `Auditing selected item "${selectedItem.title}" ($${comparison.selectedItem.total.toFixed(2)}) against corporate limits.`
    );

    const totalAmount = comparison.selectedItem.total;
    const currentDailySpend = calculateDailySpend();
    const policy = getPolicy();

    const policyEval = evaluatePurchaseAgainstPolicy(
      totalAmount,
      selectedItem.category,
      selectedItem.merchantName,
      currentDailySpend,
      policy
    );

    const aiAudit: GuardrailAudit = await auditGuardrailsWithAI(selectedItem, policy, currentDailySpend);

    // Generate cryptographic intent hash for non-repudiation
    const customId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const intentHash = generateIntentHash({
      customId,
      amount: totalAmount,
      currency: selectedItem.currency,
      itemId: selectedItem.id,
      itemTitle: selectedItem.title,
      merchantName: selectedItem.merchantName,
      userPrompt,
      timestamp: startTime,
    });

    const guardrailNotes = [
      ...policyEval.reasons,
      ...aiAudit.riskFactors,
      `Cryptographic Intent Hash: ${intentHash.slice(0, 16)}...`,
    ];

    steps[steps.length - 1].status = policyEval.allowed ? 'completed' : 'error';
    steps[steps.length - 1].data = {
      riskScore: policyEval.riskScore,
      policyAllowed: policyEval.allowed,
      autoApproved: policyEval.autoApproved,
      requiresApproval: policyEval.requiresApproval,
      intentHash,
      notes: guardrailNotes,
    };
    steps[steps.length - 1].thought = policyEval.allowed
      ? policyEval.autoApproved
        ? `Policy clear: Item cost ($${totalAmount.toFixed(2)}) is below auto-approval limit ($${policy.autoApproveThreshold}). Risk score: ${policyEval.riskScore}/100.`
        : `Policy flag: Amount ($${totalAmount.toFixed(2)}) exceeds auto-approval threshold ($${policy.autoApproveThreshold}). Human-in-the-loop authorization required.`
      : `Strict Policy Violation: ${policyEval.policyViolations.join('; ')}`;

    // -------------------------------------------------------------------------
    // CASE A: BLOCKED BY POLICY (Abort)
    // -------------------------------------------------------------------------
    if (!policyEval.allowed) {
      const rejectedOrder: Order = {
        id: customId,
        customId,
        intentHash,
        status: 'REJECTED',
        executionMode: 'REJECTED',
        item: selectedItem,
        amount: {
          total: totalAmount,
          currency: selectedItem.currency,
          itemTotal: selectedItem.price,
          shipping: selectedItem.shippingCost,
        },
        rejectionReason: policyEval.policyViolations.join('; '),
        riskScore: policyEval.riskScore,
        guardrailNotes,
        evaluationReasoning: comparison.selectionRationale,
        userPrompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveOrder(rejectedOrder);

      const finalAction: AgentFinalAction = {
        actionType: 'ABORT',
        explanation: `Order blocked by corporate policy: ${policyEval.policyViolations.join('; ')}`,
        rejectionReason: policyEval.policyViolations.join('; '),
      };

      addStep('FAILED', 'Order Aborted by Financial Guardrail', 'error', finalAction.explanation);

      return {
        runId,
        success: false,
        steps,
        goal,
        comparison,
        guardrailAudit: aiAudit,
        order: rejectedOrder,
        finalAction,
      };
    }

    // -------------------------------------------------------------------------
    // CASE B: REQUIRES HUMAN-IN-THE-LOOP APPROVAL
    // -------------------------------------------------------------------------
    if (policyEval.requiresApproval) {
      const approvalToken = generateApprovalToken();
      const approvalExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes window

      // Create PayPal order in sandbox state
      const paypalOrder = await createOrder({
        amount: totalAmount,
        currency: selectedItem.currency,
        customId,
        itemSummary: {
          id: selectedItem.id,
          name: selectedItem.title,
          description: selectedItem.description,
          unitPrice: selectedItem.price,
          quantity: 1,
          shippingCost: selectedItem.shippingCost,
          category: selectedItem.category,
        },
      });

      const pendingOrder: Order = {
        id: customId,
        customId,
        intentHash,
        status: 'PENDING_APPROVAL',
        executionMode: 'PENDING',
        item: selectedItem,
        amount: {
          total: totalAmount,
          currency: selectedItem.currency,
          itemTotal: selectedItem.price,
          shipping: selectedItem.shippingCost,
        },
        paypalOrderId: paypalOrder.id,
        approvalToken,
        approvalExpiresAt,
        riskScore: policyEval.riskScore,
        guardrailNotes,
        evaluationReasoning: comparison.selectionRationale,
        userPrompt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveOrder(pendingOrder);

      const finalAction: AgentFinalAction = {
        actionType: 'REQUEST_APPROVAL',
        explanation: `Staged PayPal Order #${paypalOrder.id}. Pending human operator authorization due to amount ($${totalAmount.toFixed(2)}) exceeding auto-threshold ($${policy.autoApproveThreshold}).`,
        orderPayload: pendingOrder,
      };

      addStep(
        'ORDER_CREATION',
        'Staged PayPal Sandbox Order Awaiting Human Approval',
        'warning',
        `Generated 15-minute authorization token. Operator review requested for PayPal Order ${paypalOrder.id}.`,
        {
          toolName: 'createPayPalOrder',
          input: { total: totalAmount, currency: selectedItem.currency },
          output: { paypalOrderId: paypalOrder.id, status: paypalOrder.status },
        },
        { orderId: customId, approvalToken, expiresAt: approvalExpiresAt }
      );

      return {
        runId,
        success: true,
        steps,
        goal,
        comparison,
        guardrailAudit: aiAudit,
        order: pendingOrder,
        finalAction,
      };
    }

    // -------------------------------------------------------------------------
    // CASE C: FULLY AUTO-APPROVED PROCUREMENT
    // -------------------------------------------------------------------------
    addStep(
      'ORDER_CREATION',
      'Executing Autonomous PayPal Orders API v2 Capture',
      'running',
      `Auto-approval granted. Calling PayPal Sandbox endpoint to create and capture order for $${totalAmount.toFixed(2)}.`
    );

    const paypalOrder = await createOrder({
      amount: totalAmount,
      currency: selectedItem.currency,
      customId,
      itemSummary: {
        id: selectedItem.id,
        name: selectedItem.title,
        description: selectedItem.description,
        unitPrice: selectedItem.price,
        quantity: 1,
        shippingCost: selectedItem.shippingCost,
        category: selectedItem.category,
      },
    });

    const captureResult = await captureOrder(paypalOrder.id);

    const completedOrder: Order = {
      id: customId,
      customId,
      intentHash,
      status: 'CAPTURED',
      executionMode: 'AUTO_APPROVED',
      item: selectedItem,
      amount: {
        total: totalAmount,
        currency: selectedItem.currency,
        itemTotal: selectedItem.price,
        shipping: selectedItem.shippingCost,
      },
      paypalOrderId: paypalOrder.id,
      paypalCaptureId: captureResult.id,
      riskScore: policyEval.riskScore,
      guardrailNotes,
      evaluationReasoning: comparison.selectionRationale,
      userPrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOrder(completedOrder);

    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].toolCall = {
      toolName: 'capturePayPalOrder',
      input: { paypalOrderId: paypalOrder.id },
      output: { captureId: captureResult.id, status: captureResult.status },
    };
    steps[steps.length - 1].thought = `Autonomous settlement confirmed! PayPal Order: ${paypalOrder.id}, Capture ID: ${captureResult.id}.`;

    addStep(
      'COMPLETED',
      'Autonomous Procurement Successfully Settled',
      'completed',
      `Procurement concluded autonomously. Item "${selectedItem.title}" ordered from ${selectedItem.merchantName} for $${totalAmount.toFixed(2)}.`
    );

    const finalAction: AgentFinalAction = {
      actionType: 'CREATE_ORDER',
      explanation: `Successfully created and captured PayPal Order #${paypalOrder.id} with capture transaction ID #${captureResult.id}.`,
      orderPayload: completedOrder,
    };

    return {
      runId,
      success: true,
      steps,
      goal,
      comparison,
      guardrailAudit: aiAudit,
      order: completedOrder,
      finalAction,
    };
  } catch (error: any) {
    addStep('FAILED', 'Runtime Loop Encountered Error', 'error', error?.message || 'Unknown agent loop error');
    return {
      runId,
      success: false,
      steps,
      error: error?.message || 'Agent loop failure',
    };
  }
}
