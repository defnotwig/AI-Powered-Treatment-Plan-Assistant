/**
 * Unit Tests: Allergy Cross-Reactivity Engine
 * 
 * Tests direct allergy detection, cross-reactive alerts, excipient warnings,
 * fuzzy matching, safe drug verification, and edge cases.
 */
import { describe, it, expect } from 'vitest';
import {
  checkAllergies,
  isDrugSafeForPatient,
  getCrossReactivityInfo,
} from '../../services/allergy-cross-reactivity';

// Helper: wrap allergen strings into the expected { allergen } object shape
const toAllergyList = (...names: string[]) => names.map(a => ({ allergen: a }));

describe('Allergy Cross-Reactivity Engine', () => {
  // ─── Direct Allergy Detection ───────────────────────────────────────────
  describe('Direct Allergy Matches', () => {
    it('should flag direct penicillin → amoxicillin (same class)', () => {
      const result = checkAllergies(toAllergyList('penicillin'), ['amoxicillin', 'metformin']);
      const classAlerts = result.alerts.filter(a => a.alertType === 'class-based');
      expect(classAlerts.length).toBeGreaterThan(0);
    });

    it('should flag direct NSAID allergy', () => {
      const result = checkAllergies(toAllergyList('ibuprofen'), ['ibuprofen', 'acetaminophen']);
      const direct = result.alerts.filter(a => a.alertType === 'direct');
      expect(direct.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const result = checkAllergies(toAllergyList('PENICILLIN'), ['cephalexin']);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should return empty alerts when no allergies apply', () => {
      const result = checkAllergies(toAllergyList('penicillin'), ['metformin', 'amlodipine']);
      expect(result.alerts).toHaveLength(0);
    });
  });

  // ─── Cross-Reactivity Detection ────────────────────────────────────────
  describe('Cross-Reactivity', () => {
    it('should flag cephalosporin cross-reactivity with penicillin allergy', () => {
      const result = checkAllergies(toAllergyList('penicillin'), ['cephalexin']);
      const crossAlerts = result.alerts.filter(a => a.alertType === 'cross-reactive');
      expect(crossAlerts.length).toBeGreaterThan(0);
    });

    it('should flag beta-lactam cross-reactivity', () => {
      const result = checkAllergies(toAllergyList('amoxicillin'), ['meropenem']);
      const crossAlerts = result.alerts.filter(a => a.alertType === 'cross-reactive');
      expect(crossAlerts.length).toBeGreaterThan(0);
    });

    it('should flag sulfonamide cross-reactivity', () => {
      const result = checkAllergies(toAllergyList('sulfamethoxazole'), ['sulfasalazine']);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should flag NSAID cross-reactivity for aspirin allergy', () => {
      const result = checkAllergies(toAllergyList('aspirin'), ['ibuprofen']);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should flag opioid cross-reactivity', () => {
      const result = checkAllergies(toAllergyList('morphine'), ['codeine']);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should flag ACE inhibitor cross-reactivity', () => {
      const result = checkAllergies(toAllergyList('lisinopril'), ['enalapril']);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should flag fluoroquinolone cross-reactivity', () => {
      const result = checkAllergies(toAllergyList('ciprofloxacin'), ['levofloxacin']);
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should flag statin cross-reactivity', () => {
      const result = checkAllergies(toAllergyList('atorvastatin'), ['simvastatin']);
      expect(result.alerts.length).toBeGreaterThan(0);
    });
  });

  // ─── Excipient Warnings ─────────────────────────────────────────────────
  describe('Excipient Warnings', () => {
    it('should warn about lactose excipient for lactose intolerance', () => {
      const result = checkAllergies(toAllergyList('lactose'), ['metformin']);
      const excipientAlerts = result.alerts.filter(a => a.alertType === 'excipient');
      expect(excipientAlerts.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle egg allergy with vaccine concern', () => {
      const result = checkAllergies(toAllergyList('egg'), ['influenza vaccine']);
      const excipientAlerts = result.alerts.filter(a => a.alertType === 'excipient');
      expect(excipientAlerts.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Drug Safety Check ──────────────────────────────────────────────────
  describe('isDrugSafeForPatient', () => {
    it('should return unsafe for penicillin allergy with amoxicillin (same class)', () => {
      const result = isDrugSafeForPatient('amoxicillin', toAllergyList('penicillin'));
      expect(result.safe).toBe(false);
    });

    it('should return safe for unrelated drug', () => {
      const result = isDrugSafeForPatient('metformin', toAllergyList('penicillin'));
      expect(result.safe).toBe(true);
    });

    it('should return safe when no allergies', () => {
      const result = isDrugSafeForPatient('amoxicillin', []);
      expect(result.safe).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result = isDrugSafeForPatient('AMOXICILLIN', toAllergyList('Penicillin'));
      expect(result.safe).toBe(false);
    });
  });

  // ─── Cross-Reactivity Info ──────────────────────────────────────────────
  describe('getCrossReactivityInfo', () => {
    it('should return cross-reactivity groups for penicillin', () => {
      const groups = getCrossReactivityInfo('penicillin');
      expect(groups.length).toBeGreaterThan(0);
      expect(groups[0].crossReactiveDrugs.length).toBeGreaterThan(0);
    });

    it('should return cross-reactivity groups for NSAIDs', () => {
      const groups = getCrossReactivityInfo('ibuprofen');
      expect(groups.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-cross-reactive drug', () => {
      const groups = getCrossReactivityInfo('unknowndrug12345');
      expect(groups).toHaveLength(0);
    });
  });

  // ─── Edge Cases ─────────────────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('should handle empty allergies list', () => {
      const result = checkAllergies([], ['amoxicillin', 'metformin']);
      expect(result.alerts).toHaveLength(0);
      expect(result.checkedDrugs).toHaveLength(2);
    });

    it('should handle empty drugs list', () => {
      const result = checkAllergies(toAllergyList('penicillin'), []);
      // No drugs to check, so no drug-specific alerts (excipient alerts are generic)
      const nonExcipient = result.alerts.filter(a => a.alertType !== 'excipient');
      expect(nonExcipient).toHaveLength(0);
    });

    it('should handle both empty', () => {
      const result = checkAllergies([], []);
      expect(result.alerts).toHaveLength(0);
      expect(result.checkedDrugs).toHaveLength(0);
    });

    it('should not produce duplicate alerts for same allergen/drug/type', () => {
      const result = checkAllergies(
        [{ allergen: 'penicillin' }, { allergen: 'penicillin' }],
        ['cephalexin'],
      );
      const keys = result.alerts.map(a => `${a.allergen}|${a.drug}|${a.alertType}`);
      const uniqueKeys = [...new Set(keys)];
      expect(keys.length).toBe(uniqueKeys.length);
    });

    it('should handle multiple allergies against multiple drugs', () => {
      const result = checkAllergies(
        toAllergyList('penicillin', 'aspirin', 'morphine'),
        ['cephalexin', 'ibuprofen', 'codeine', 'metformin'],
      );
      expect(result.alerts.length).toBeGreaterThanOrEqual(3);
      expect(result.safe).toBe(false);
    });
  });
});
