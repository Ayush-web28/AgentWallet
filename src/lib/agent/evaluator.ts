import { CatalogItem, GoalDecomposition, ProductComparison } from '@/types';
import { evaluateProductCandidates } from '@/lib/ai/gemini';

/**
 * Deal Evaluator: Compares candidate items across multiple merchants,
 * balancing price competitiveness, shipping speed, customer reviews,
 * and exact hardware specification match.
 */
export async function evaluateCandidates(
  goal: GoalDecomposition,
  candidates: CatalogItem[]
): Promise<ProductComparison> {
  if (!candidates || candidates.length === 0) {
    throw new Error('No catalog items found matching the requested procurement criteria.');
  }

  // Use Gemini 2.5 Flash reasoning (with intelligent heuristic fallback)
  return await evaluateProductCandidates(goal, candidates);
}
