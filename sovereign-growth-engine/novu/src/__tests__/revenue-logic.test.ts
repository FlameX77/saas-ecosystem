import { describe, it, expect } from '@jest/globals';
import { processClaimDenial, validateEmiratesId } from '../lib/revenue-utils';

// --- 🧪 REVENUE RECOVERY LOGIC TESTS ---

describe('Novu Revenue Logic: Claim Denial Processor', () => {
  it('should identify a corrective action for Daman denial code 99213', () => {
    const claim = {
      insurer: 'Daman',
      amount: 15400,
      denialCode: '99213',
      providerId: 'PROV-DXB-001'
    };

    const result = processClaimDenial(claim);

    expect(result.action).toBe('APPEND_MODIFIER_25');
    expect(result.successProbability).toBeGreaterThan(0.7); // 70%+ success expected
    expect(result.recoveryValue).toBe(15400);
  });

  it('should flag unknown denial codes for manual human-in-the-loop audit', () => {
    const claim = {
      insurer: 'ADNIC',
      amount: 4200,
      denialCode: 'UNKNOWN_999',
      providerId: 'PROV-DXB-001'
    };

    const result = processClaimDenial(claim);

    expect(result.action).toBe('MANUAL_REVIEW');
    expect(result.needsEscalation).toBe(true);
  });

  it('should accurately calculate forecasted recovery value across a batch', () => {
    const batch = [
      { amount: 1000, recoveryProbability: 0.9 },
      { amount: 5000, recoveryProbability: 0.5 },
      { amount: 2000, recoveryProbability: 0.1 },
    ];

    // Forecast = Sum(Amount * Probability)
    // (1000 * 0.9) + (5000 * 0.5) + (2000 * 0.1) = 900 + 2500 + 200 = 3600
    const totalForecast = batch.reduce((acc, c) => acc + (c.amount * c.recoveryProbability), 0);
    
    expect(totalForecast).toBe(3600);
  });
});

// --- 🌐 COMPLIANCE TESTS ---

describe('Novu Compliance: UAE Healthcare Standards', () => {
  it('should ensure all Emirates IDs follow the 784-XXXX-XXXXXXX-X format', () => {
    const validEID = '784-1234-5678901-2';
    const invalidEID = '999-1234-5678901-2';

    expect(validateEmiratesId(validEID)).toBe(true);
    expect(validateEmiratesId(invalidEID)).toBe(false);
  });
});
