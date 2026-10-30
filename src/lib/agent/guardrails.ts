import { FinancialPolicy, GuardrailResult } from '@/types';
import { getPolicy, calculateDailySpend } from '@/lib/store';

/**
 * Autonomous Financial Policy & Guardrails Engine
 * Evaluates proposed transactions against hard organizational limits,
 * merchant credibility checks, and human-in-the-loop authorization gates.
 */
export function evaluatePurchaseAgainstPolicy(
  cartTotal: number,
  category: string,
  merchant: string,
  currentDailySpend?: number,
  customPolicy?: FinancialPolicy
): GuardrailResult {
  const policy = customPolicy || getPolicy();
  const dailySpend = currentDailySpend !== undefined ? currentDailySpend : calculateDailySpend();

  const reasons: string[] = [];
  const policyViolations: string[] = [];
  let riskScore = 15; // baseline low risk

  // 1. Check Blacklisted Merchants
  const isMerchantBlocked = policy.blockedMerchants.some(
    (b) => b.trim().toLowerCase() === merchant.trim().toLowerCase()
  );
  if (isMerchantBlocked) {
    policyViolations.push(`Merchant "${merchant}" is blacklisted by organizational policy.`);
    riskScore += 75;
  }

  // 2. Check Allowed Categories
  const isCategoryAllowed =
    policy.allowedCategories.length === 0 ||
    policy.allowedCategories.some(
      (c) => c.trim().toLowerCase() === category.trim().toLowerCase()
    );
  if (!isCategoryAllowed) {
    policyViolations.push(
      `Category "${category}" is not in the approved procurement list (${policy.allowedCategories.join(', ')}).`
    );
    riskScore += 35;
  }

  // 3. Check Per-Transaction Limit ($150 default)
  if (cartTotal > policy.maxPerTransaction) {
    policyViolations.push(
      `Transaction total ($${cartTotal.toFixed(2)}) exceeds maximum limit of $${policy.maxPerTransaction.toFixed(2)}.`
    );
    riskScore += 45;
  }

  // 4. Check Daily Cumulative Limit ($500 default)
  const projectedDailySpend = dailySpend + cartTotal;
  if (projectedDailySpend > policy.dailyCumulativeLimit) {
    policyViolations.push(
      `Transaction would exceed daily cumulative budget ($${projectedDailySpend.toFixed(2)} / $${policy.dailyCumulativeLimit.toFixed(2)}).`
    );
    riskScore += 40;
  }

  // Determine Overall Policy Compliance
  const allowed = policyViolations.length === 0;

  // 5. Evaluate Auto-Approve vs. Human Sign-Off Threshold ($75 default)
  let requiresApproval = false;
  let autoApproved = false;

  if (!allowed) {
    // If blocked, cannot auto-approve; requires either full override or is rejected
    requiresApproval = false;
    autoApproved = false;
    reasons.push(...policyViolations);
  } else if (cartTotal <= policy.autoApproveThreshold && riskScore < 30) {
    // Auto-approve when under threshold and low risk
    autoApproved = true;
    requiresApproval = false;
    reasons.push(
      `Transaction total ($${cartTotal.toFixed(2)}) is within autonomous approval threshold ($${policy.autoApproveThreshold.toFixed(2)}) with low risk score (${riskScore}/100).`
    );
  } else {
    // Requires Human-in-the-loop sign-off
    requiresApproval = true;
    autoApproved = false;
    riskScore = Math.max(riskScore, 42);
    reasons.push(
      `Transaction ($${cartTotal.toFixed(2)}) exceeds auto-approval threshold ($${policy.autoApproveThreshold.toFixed(2)}). Human authorization required.`
    );
  }

  return {
    allowed,
    requiresApproval,
    autoApproved,
    riskScore: Math.min(100, riskScore),
    reasons,
    policyViolations,
  };
}
