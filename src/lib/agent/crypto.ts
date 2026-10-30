import crypto from 'crypto';
import { IntentVerificationPayload } from '@/types';

/**
 * Generates an immutable SHA-256 cryptographic intent verification hash.
 * This establishes non-repudiation and ensures the agent cannot modify
 * purchase amounts, merchant identity, or target items downstream.
 */
export function generateIntentHash(payload: IntentVerificationPayload): string {
  // Sort keys deterministically to avoid hash drift
  const canonicalString = JSON.stringify({
    customId: payload.customId,
    amount: payload.amount.toFixed(2),
    currency: payload.currency.toUpperCase(),
    itemId: payload.itemId,
    itemTitle: payload.itemTitle.trim(),
    merchantName: payload.merchantName.trim(),
    userPrompt: payload.userPrompt.trim(),
    timestamp: payload.timestamp,
  });

  return crypto.createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * Verifies an intent verification hash against an order payload.
 */
export function verifyIntentHash(payload: IntentVerificationPayload, hash: string): boolean {
  const recomputed = generateIntentHash(payload);
  return crypto.timingSafeEqual(Buffer.from(recomputed), Buffer.from(hash));
}

/**
 * Generates a high-entropy secure one-time approval token.
 */
export function generateApprovalToken(): string {
  return `APV-${crypto.randomBytes(24).toString('hex')}`;
}
