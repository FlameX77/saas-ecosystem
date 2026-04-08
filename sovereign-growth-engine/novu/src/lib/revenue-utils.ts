/** 
 * Novu Revenue Platform: Core Recovery Utilities
 * (C) 2026 Novu Health UAE - Production
 */

export interface Claim {
  insurer: string;
  amount: number;
  denialCode: string;
  providerId: string;
}

export interface DenialResult {
  action: 'APPEND_MODIFIER_25' | 'PRIOR_AUTH_FIX' | 'MANUAL_REVIEW' | 'RESUBMIT';
  successProbability: number;
  recoveryValue: number;
  needsEscalation: boolean;
}

/**
 * processClaimDenial:
 * Analyzes an insurer's denial pattern and returns the optimal recovery path.
 */
export function processClaimDenial(claim: Claim): DenialResult {
  const { insurer, denialCode, amount } = claim;

  // Daman Modifier 25 Logic (Classic UAE Denial Pattern)
  if (insurer === 'Daman' && denialCode === '99213') {
    return {
      action: 'APPEND_MODIFIER_25',
      successProbability: 0.94,
      recoveryValue: amount,
      needsEscalation: false
    };
  }

  // AXA Prior Auth Logic
  if (insurer === 'AXA Gulf' && denialCode === 'PA_MISSING') {
    return {
      action: 'PRIOR_AUTH_FIX',
      successProbability: 0.82,
      recoveryValue: amount,
      needsEscalation: false
    };
  }

  // Default Fallback
  return {
    action: 'MANUAL_REVIEW',
    successProbability: 0.5,
    recoveryValue: 0,
    needsEscalation: true
  };
}

/**
 * calculateForecast:
 * Sums weighted revenue across a batch of unrecovered claims.
 */
export function calculateForecast(batch: { amount: number, recoveryProbability: number }[]): number {
  return batch.reduce((acc, c) => acc + (c.amount * c.recoveryProbability), 0);
}

/**
 * validateEmiratesId:
 * Ensures regulatory compliance for UAE clinical data entry.
 */
export function validateEmiratesId(eid: string): boolean {
  const regex = /^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$/;
  return regex.test(eid);
}
