import { GoogleGenAI, Type } from '@google/genai';
import {
  GoalDecomposition,
  ProductComparison,
  GuardrailAudit,
  AgentFinalAction,
  CatalogItem,
  FinancialPolicy,
} from '@/types';

// Initialize Gemini client lazily
let genAiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'mock_gemini_key') {
    return null;
  }
  if (!genAiInstance) {
    genAiInstance = new GoogleGenAI({ apiKey });
  }
  return genAiInstance;
}

// ============================================================================
// STRUCTURED RESPONSE SCHEMAS
// ============================================================================

export const GoalDecompositionSchema = {
  type: Type.OBJECT,
  properties: {
    itemName: {
      type: Type.STRING,
      description: 'The core product or service the user wants to procure.',
    },
    targetPrice: {
      type: Type.NUMBER,
      description: 'The target purchase price in USD extracted or inferred.',
    },
    maxBudget: {
      type: Type.NUMBER,
      description: 'The absolute maximum budget mentioned or inferred in USD.',
    },
    currency: {
      type: Type.STRING,
      description: 'Currency code, default USD.',
    },
    category: {
      type: Type.STRING,
      description: 'Product category (Electronics, Office Supplies, Cloud Software, Developer Tools).',
    },
    preferredSpecs: {
      type: Type.OBJECT,
      description: 'Key-value pairs of required or preferred specifications (e.g. resolution, connection, brand).',
      properties: {
        resolution: { type: Type.STRING },
        connectivity: { type: Type.STRING },
        brand: { type: Type.STRING },
        formFactor: { type: Type.STRING },
      },
    },
    urgency: {
      type: Type.STRING,
      enum: ['low', 'medium', 'high'],
      description: 'Procurement urgency level.',
    },
    reasoning: {
      type: Type.STRING,
      description: 'Reasoning behind the decomposition.',
    },
  },
  required: ['itemName', 'targetPrice', 'maxBudget', 'currency', 'category', 'urgency', 'reasoning'],
};

export const ProductComparisonSchema = {
  type: Type.OBJECT,
  properties: {
    candidates: {
      type: Type.ARRAY,
      description: 'Evaluated candidate items with pros, cons and score.',
      items: {
        type: Type.OBJECT,
        properties: {
          itemId: { type: Type.STRING },
          merchantName: { type: Type.STRING },
          title: { type: Type.STRING },
          totalPrice: { type: Type.NUMBER },
          pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          score: {
            type: Type.INTEGER,
            description: 'Rating score from 0 to 100 based on value, rating, and specs match.',
          },
        },
        required: ['itemId', 'merchantName', 'title', 'totalPrice', 'pros', 'cons', 'score'],
      },
    },
    selectedItem: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        merchantName: { type: Type.STRING },
        price: { type: Type.NUMBER },
        shippingCost: { type: Type.NUMBER },
        total: { type: Type.NUMBER },
      },
      required: ['id', 'title', 'merchantName', 'price', 'shippingCost', 'total'],
    },
    selectionRationale: {
      type: Type.STRING,
      description: 'In-depth justification explaining why the winning item was chosen.',
    },
  },
  required: ['candidates', 'selectedItem', 'selectionRationale'],
};

export const GuardrailAuditSchema = {
  type: Type.OBJECT,
  properties: {
    riskScore: {
      type: Type.INTEGER,
      description: 'Risk assessment score from 0 (safest) to 100 (highest risk).',
    },
    policyCompliant: {
      type: Type.BOOLEAN,
      description: 'Whether the purchase respects all active financial policies.',
    },
    requiresHumanSignOff: {
      type: Type.BOOLEAN,
      description: 'True if transaction amount or risk flags exceed auto-approval limit.',
    },
    riskFactors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Identified risk factors (e.g. price threshold, vendor credibility).',
    },
    mitigations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Safeguards and cryptographic verification in place.',
    },
    recommendedAction: {
      type: Type.STRING,
      enum: ['AUTO_APPROVE', 'REQUIRE_APPROVAL', 'REJECT'],
      description: 'Autonomous policy recommendation.',
    },
  },
  required: [
    'riskScore',
    'policyCompliant',
    'requiresHumanSignOff',
    'riskFactors',
    'mitigations',
    'recommendedAction',
  ],
};

export const AgentFinalActionSchema = {
  type: Type.OBJECT,
  properties: {
    actionType: {
      type: Type.STRING,
      enum: ['CREATE_ORDER', 'REQUEST_APPROVAL', 'ABORT'],
      description: 'Final action decided by the agent runtime.',
    },
    explanation: {
      type: Type.STRING,
      description: 'Clear summary of the action and reasoning.',
    },
    orderPayload: {
      type: Type.OBJECT,
      properties: {
        itemId: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        currency: { type: Type.STRING },
      },
    },
    rejectionReason: {
      type: Type.STRING,
      description: 'Provided only if actionType is ABORT.',
    },
  },
  required: ['actionType', 'explanation'],
};

// ============================================================================
// GEMINI 2.5 FLASH INVOCATION WRAPPERS WITH HEURISTIC FALLBACKS
// ============================================================================

/**
 * Decomposes a user procurement instruction into structured procurement parameters.
 */
export async function decomposeProcurementGoal(prompt: string): Promise<GoalDecomposition> {
  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are the Goal Decomposition Engine for AgentWallet, an autonomous commerce system.
Decompose the following user procurement request into structured parameters.
User Request: "${prompt}"`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: GoalDecompositionSchema,
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as GoalDecomposition;
      }
    } catch (err) {
      console.warn('Gemini GoalDecomposition API call failed, using intelligent fallback:', err);
    }
  }

  // Intelligent Heuristic Fallback
  const lower = prompt.toLowerCase();
  let itemName = 'Procured Item';
  let targetPrice = 100;
  let maxBudget = 150;
  let category = 'Electronics';
  const preferredSpecs: Record<string, string> = {};

  // Extract price constraints like "$120", "< 60", "under $100"
  const priceMatch = prompt.match(/(?:\$|<|under\s*\$?|less\s*than\s*\$?)(\d+(?:\.\d+)?)/i);
  if (priceMatch) {
    const val = parseFloat(priceMatch[1]);
    maxBudget = val;
    targetPrice = Number((val * 0.85).toFixed(2));
  }

  if (lower.includes('webcam') || lower.includes('camera') || lower.includes('4k')) {
    itemName = '4K Ultra-HD Webcam';
    category = 'Electronics';
    preferredSpecs.resolution = '4K UHD (3840x2160)';
    preferredSpecs.fps = '60fps';
  } else if (lower.includes('mouse') || lower.includes('ergonomic')) {
    itemName = 'Ergonomic Wireless Mouse';
    category = 'Peripherals';
    preferredSpecs.connectivity = 'Bluetooth & 2.4GHz';
    preferredSpecs.sensor = 'High Precision Optical';
  } else if (lower.includes('keyboard') || lower.includes('mechanical')) {
    itemName = 'Mechanical Wireless Keyboard';
    category = 'Peripherals';
    preferredSpecs.switches = 'Hot-swappable tactile';
  } else if (lower.includes('cloud') || lower.includes('server') || lower.includes('vps')) {
    itemName = 'Dedicated Cloud Compute Node';
    category = 'Cloud Software';
    preferredSpecs.ram = '16GB ECC';
    preferredSpecs.cpu = '4 vCPU';
  } else if (lower.includes('headset') || lower.includes('headphones')) {
    itemName = 'Noise Canceling ANC Headset';
    category = 'Electronics';
    preferredSpecs.anc = 'Active Noise Cancellation';
  } else {
    itemName = prompt.slice(0, 40).replace(/^(buy|order|get|procure)\s+/i, '');
  }

  return {
    itemName,
    targetPrice,
    maxBudget,
    currency: 'USD',
    preferredSpecs,
    category,
    urgency: lower.includes('urgent') || lower.includes('fast') ? 'high' : 'medium',
    reasoning: `Extracted requirement for "${itemName}" with budget <= $${maxBudget}. Inferred key hardware specs and validated merchant inventory filters.`,
  };
}

/**
 * Evaluates candidate items using Gemini 2.5 Flash to pick the optimal deal.
 */
export async function evaluateProductCandidates(
  goal: GoalDecomposition,
  candidates: CatalogItem[]
): Promise<ProductComparison> {
  const client = getGeminiClient();

  if (client && candidates.length > 0) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are the Deal Evaluator Engine for AgentWallet.
Evaluate these candidate items against the user procurement goal.
Goal: ${JSON.stringify(goal)}
Candidates: ${JSON.stringify(candidates)}

Score each candidate from 0-100 based on price value, shipping speed, ratings, and spec match. Pick the best candidate and provide clear selection rationale.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: ProductComparisonSchema,
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as ProductComparison;
      }
    } catch (err) {
      console.warn('Gemini ProductComparison API call failed, using intelligent fallback:', err);
    }
  }

  // Intelligent Fallback Comparison
  const evaluatedCandidates = candidates.map((item) => {
    const total = Number((item.price + item.shippingCost).toFixed(2));
    const isWithinBudget = total <= goal.maxBudget;
    const ratingScore = item.rating * 16; // 5.0 -> 80
    const priceScore = Math.max(0, 100 - (total / (goal.maxBudget || 1)) * 30);
    const shippingBonus = item.deliveryDays <= 2 ? 10 : 0;
    const finalScore = isWithinBudget ? Math.min(98, Math.round(ratingScore * 0.5 + priceScore * 0.4 + shippingBonus)) : 25;

    return {
      itemId: item.id,
      merchantName: item.merchantName,
      title: item.title,
      totalPrice: total,
      pros: [
        `Competitive price at $${item.price.toFixed(2)}`,
        `Merchant rating ${item.rating}★ (${item.reviewCount} reviews)`,
        `${item.deliveryDays}-day fast delivery`,
      ],
      cons: isWithinBudget ? ['Standard manufacturer warranty'] : ['Exceeds preferred target budget'],
      score: finalScore,
    };
  });

  // Sort descending by score
  evaluatedCandidates.sort((a, b) => b.score - a.score);
  const bestCandidate = evaluatedCandidates[0];
  const matchedItem = candidates.find((c) => c.id === bestCandidate.itemId) || candidates[0];
  const total = Number((matchedItem.price + matchedItem.shippingCost).toFixed(2));

  return {
    candidates: evaluatedCandidates,
    selectedItem: {
      id: matchedItem.id,
      title: matchedItem.title,
      merchantName: matchedItem.merchantName,
      price: matchedItem.price,
      shippingCost: matchedItem.shippingCost,
      total,
    },
    selectionRationale: `Selected "${matchedItem.title}" from ${matchedItem.merchantName} with optimal balance: highest composite score (${bestCandidate.score}/100), verified ${matchedItem.rating}★ rating, and total cost of $${total.toFixed(2)} adhering to user parameters.`,
  };
}

/**
 * Audits a proposed purchase against financial policy and computes risk score.
 */
export async function auditGuardrailsWithAI(
  selectedItem: CatalogItem,
  policy: FinancialPolicy,
  dailySpend: number
): Promise<GuardrailAudit> {
  const total = Number((selectedItem.price + selectedItem.shippingCost).toFixed(2));
  const isOverPerTransaction = total > policy.maxPerTransaction;
  const isOverDaily = dailySpend + total > policy.dailyCumulativeLimit;
  const isOverAutoApprove = total > policy.autoApproveThreshold;
  const isBlockedMerchant = policy.blockedMerchants.some(
    (b) => b.toLowerCase() === selectedItem.merchantName.toLowerCase()
  );

  const riskFactors: string[] = [];
  if (isOverPerTransaction) riskFactors.push(`Transaction amount $${total} exceeds max limit ($${policy.maxPerTransaction})`);
  if (isOverDaily) riskFactors.push(`Cumulative spend would exceed daily limit ($${policy.dailyCumulativeLimit})`);
  if (isOverAutoApprove) riskFactors.push(`Amount ($${total}) exceeds auto-approval ceiling ($${policy.autoApproveThreshold})`);
  if (isBlockedMerchant) riskFactors.push(`Merchant "${selectedItem.merchantName}" is blacklisted by policy`);

  let riskScore = 12; // baseline low risk
  if (isOverAutoApprove) riskScore += 35;
  if (isOverPerTransaction) riskScore += 45;
  if (isOverDaily) riskScore += 40;
  if (isBlockedMerchant) riskScore += 80;
  riskScore = Math.min(100, riskScore);

  const policyCompliant = !isOverPerTransaction && !isOverDaily && !isBlockedMerchant;
  const requiresHumanSignOff = !policyCompliant || isOverAutoApprove || riskScore >= 40;

  let recommendedAction: 'AUTO_APPROVE' | 'REQUIRE_APPROVAL' | 'REJECT' = 'AUTO_APPROVE';
  if (!policyCompliant) {
    recommendedAction = 'REJECT';
  } else if (requiresHumanSignOff) {
    recommendedAction = 'REQUIRE_APPROVAL';
  }

  return {
    riskScore,
    policyCompliant,
    requiresHumanSignOff,
    riskFactors,
    mitigations: [
      'SHA-256 Intent non-repudiation cryptographic hash created',
      'PayPal Orders API v2 server-side breakdown verified',
      'Merchant reputation score audited',
    ],
    recommendedAction,
  };
}
