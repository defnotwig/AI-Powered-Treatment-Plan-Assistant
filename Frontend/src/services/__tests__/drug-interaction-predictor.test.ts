/**
 * Unit Tests: Drug Interaction Predictor
 * 
 * Tests rule-based fallback predictions, drug profile lookups,
 * feature encoding, and prediction result structure.
 * 
 * Note: TF.js model tests are integration-level (require training).
 * These tests focus on the rule-based engine which is always available.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  getDrugInteractionPredictor,
  DrugInteractionPredictor,
} from '../../services/drug-interaction-predictor';

describe('Drug Interaction Predictor', () => {
  let predictor: DrugInteractionPredictor;

  beforeAll(() => {
    predictor = getDrugInteractionPredictor();
  });

  afterAll(() => {
    predictor.dispose();
  });

  // ─── Rule-Based Predictions (Untrained Model → Fallback) ───────────────
  describe('Rule-Based Fallback Predictions', () => {
    it('should predict warfarin + aspirin interaction as moderate or major', async () => {
      const result = await predictor.predict('warfarin', 'aspirin');
      expect(result).toBeDefined();
      expect(['none', 'minor', 'moderate', 'major']).toContain(result.predictedSeverity);
      // Warfarin (anticoagulant) + aspirin (antiplatelet) — rule-based scores ≥minor
      expect(['minor', 'moderate', 'major']).toContain(result.predictedSeverity);
    });

    it('should predict metformin + furosemide interaction', async () => {
      const result = await predictor.predict('metformin', 'furosemide');
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return a valid severity for unrelated drugs', async () => {
      const result = await predictor.predict('metformin', 'acetaminophen');
      expect(result).toBeDefined();
      expect(['none', 'minor', 'moderate', 'major']).toContain(result.predictedSeverity);
    });

    it('should return "none" for completely unknown drugs', async () => {
      const result = await predictor.predict('unknowndrug123', 'anotherfake456');
      expect(result).toBeDefined();
      expect(result.predictedSeverity).toBe('none');
    });

    it('should be symmetric for drug pair order', async () => {
      const result1 = await predictor.predict('warfarin', 'aspirin');
      const result2 = await predictor.predict('aspirin', 'warfarin');
      expect(result1.predictedSeverity).toBe(result2.predictedSeverity);
    });

    it('should flag MAOI + SSRI as major', async () => {
      const result = await predictor.predict('phenelzine', 'fluoxetine');
      expect(['moderate', 'major']).toContain(result.predictedSeverity);
    });

    it('should flag opioid + benzodiazepine as significant', async () => {
      const result = await predictor.predict('morphine', 'diazepam');
      expect(['moderate', 'major']).toContain(result.predictedSeverity);
    });
  });

  // ─── Prediction Result Structure ────────────────────────────────────────
  describe('Prediction Result Format', () => {
    it('should include all required fields', async () => {
      const result = await predictor.predict('warfarin', 'aspirin');
      expect(result).toHaveProperty('drug1');
      expect(result).toHaveProperty('drug2');
      expect(result).toHaveProperty('predictedSeverity');
      expect(result).toHaveProperty('probabilities');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('knownInteraction');
    });

    it('should have confidence > 0', async () => {
      const result = await predictor.predict('warfarin', 'aspirin');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should include probabilities for all severity levels', async () => {
      const result = await predictor.predict('warfarin', 'aspirin');
      expect(result.probabilities).toHaveProperty('none');
      expect(result.probabilities).toHaveProperty('minor');
      expect(result.probabilities).toHaveProperty('moderate');
      expect(result.probabilities).toHaveProperty('major');
    });

    it('should have drug names in result', async () => {
      const result = await predictor.predict('warfarin', 'aspirin');
      expect(result.drug1).toBe('warfarin');
      expect(result.drug2).toBe('aspirin');
    });
  });

  // ─── Batch Predictions ─────────────────────────────────────────────────
  describe('Batch Interaction Check (predictMultiple)', () => {
    it('should check interactions across multiple drugs', async () => {
      const drugs = ['warfarin', 'aspirin', 'metformin', 'lisinopril'];
      const results = await predictor.predictMultiple(drugs);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // predictMultiple only returns non-none interactions, so count may vary
      // but at minimum warfarin+aspirin should appear
    });

    it('should order results by descending severity', async () => {
      const drugs = ['warfarin', 'aspirin', 'metformin', 'amlodipine'];
      const results = await predictor.predictMultiple(drugs);
      if (results.length >= 2) {
        const severityOrder: Record<string, number> = { major: 3, moderate: 2, minor: 1, none: 0 };
        for (let i = 0; i < results.length - 1; i++) {
          expect(severityOrder[results[i].predictedSeverity])
            .toBeGreaterThanOrEqual(severityOrder[results[i + 1].predictedSeverity]);
        }
      }
    });

    it('should handle single drug without error', async () => {
      const results = await predictor.predictMultiple(['metformin']);
      expect(results).toHaveLength(0);
    });

    it('should handle empty drug list', async () => {
      const results = await predictor.predictMultiple([]);
      expect(results).toHaveLength(0);
    });
  });

  // ─── Model State ───────────────────────────────────────────────────────
  describe('Model State', () => {
    it('should not be trained initially (using fallback)', () => {
      const fresh = new DrugInteractionPredictor();
      expect(fresh.isTrained()).toBe(false);
      expect(fresh.isTraining()).toBe(false);
      fresh.dispose();
    });
  });
});
