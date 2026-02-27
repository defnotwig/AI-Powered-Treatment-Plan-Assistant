/**
 * Unit Tests: Ensemble Risk Scorer
 * 
 * Tests the ensemble system's heuristic scoring, flag generation,
 * sub-model integration, risk levels, and confidence intervals.
 */
import { describe, it, expect } from 'vitest';
import {
  computeEnsembleRisk,
  type EnsemblePatientInput,
} from '../../services/ensemble-risk-scorer';

// ── Test Patient Factory ────────────────────────────────────────────────────

const createBasePatient = (overrides?: Partial<EnsemblePatientInput>): EnsemblePatientInput => ({
  demographics: {
    age: 45,
    bmi: 24.5,
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    gender: 'male',
    ...overrides?.demographics,
  },
  medicalHistory: {
    conditions: [],
    allergies: [],
    ...overrides?.medicalHistory,
  },
  currentMedications: {
    medications: [],
    ...overrides?.currentMedications,
  },
  lifestyleFactors: {
    smokingStatus: 'never',
    alcoholUse: 'none',
    exerciseLevel: 'moderate',
    chiefComplaint: 'routine checkup',
    ...overrides?.lifestyleFactors,
  },
  labs: overrides?.labs,
});

describe('Ensemble Risk Scorer', () => {
  // ─── Basic Functionality ───────────────────────────────────────────────
  describe('Basic Computation', () => {
    it('should return a valid EnsembleRiskResult', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('confidenceInterval');
      expect(result).toHaveProperty('ensembleConfidence');
      expect(result).toHaveProperty('subModels');
      expect(result).toHaveProperty('flags');
    });

    it('should return overallScore between 0 and 100', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should return valid risk level', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.riskLevel);
    });

    it('should include confidence interval', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      expect(result.confidenceInterval.low).toBeLessThanOrEqual(result.overallScore);
      expect(result.confidenceInterval.high).toBeGreaterThanOrEqual(result.overallScore);
    });

    it('should include a timestamp', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });
  });

  // ─── Heuristic Risk Factors ─────────────────────────────────────────────
  describe('Heuristic Risk Assessment', () => {
    it('should assign higher risk to elderly patients (>65)', async () => {
      const young = createBasePatient({ demographics: { age: 30, bmi: 24.5, bloodPressure: { systolic: 120, diastolic: 80 }, heartRate: 72 } });
      const elderly = createBasePatient({ demographics: { age: 75, bmi: 24.5, bloodPressure: { systolic: 120, diastolic: 80 }, heartRate: 72 } });

      const youngResult = await computeEnsembleRisk(young);
      const elderlyResult = await computeEnsembleRisk(elderly);

      expect(elderlyResult.overallScore).toBeGreaterThan(youngResult.overallScore);
    });

    it('should flag high blood pressure', async () => {
      const patient = createBasePatient({
        demographics: {
          age: 50, bmi: 26.1,
          bloodPressure: { systolic: 180, diastolic: 110 },
          heartRate: 80,
        },
      });
      const result = await computeEnsembleRisk(patient);
      const bpFlags = result.flags.filter(f =>
        f.message.toLowerCase().includes('bp ') || f.message.toLowerCase().includes('hypertensive'),
      );
      expect(bpFlags.length).toBeGreaterThan(0);
    });

    it('should flag polypharmacy (5+ medications)', async () => {
      const meds = [
        { drugName: 'metformin', genericName: 'metformin', dosage: '500mg' },
        { drugName: 'lisinopril', genericName: 'lisinopril', dosage: '10mg' },
        { drugName: 'atorvastatin', genericName: 'atorvastatin', dosage: '20mg' },
        { drugName: 'aspirin', genericName: 'aspirin', dosage: '81mg' },
        { drugName: 'omeprazole', genericName: 'omeprazole', dosage: '20mg' },
        { drugName: 'amlodipine', genericName: 'amlodipine', dosage: '5mg' },
      ];
      const patient = createBasePatient({
        currentMedications: { medications: meds },
      });
      const result = await computeEnsembleRisk(patient);
      const polyFlags = result.flags.filter(f =>
        f.message.toLowerCase().includes('polypharmacy') || f.category === 'polypharmacy',
      );
      expect(polyFlags.length).toBeGreaterThan(0);
    });

    it('should flag high BMI', async () => {
      const patient = createBasePatient({
        demographics: {
          age: 45, bmi: 41.5,
          bloodPressure: { systolic: 130, diastolic: 85 },
          heartRate: 80,
        },
      });
      const result = await computeEnsembleRisk(patient);
      const bmiFlags = result.flags.filter(f =>
        f.message.toLowerCase().includes('bmi') || f.message.toLowerCase().includes('obes'),
      );
      expect(bmiFlags.length).toBeGreaterThan(0);
    });
  });

  // ─── Sub-Model Weights ─────────────────────────────────────────────────
  describe('Sub-Model Integration', () => {
    it('should include heuristic model in sub-models', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      const heuristic = result.subModels.find(m =>
        m.name.toLowerCase().includes('heuristic') || m.name.toLowerCase().includes('clinical'),
      );
      expect(heuristic).toBeDefined();
    });

    it('should have non-zero weight for each sub-model', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      for (const model of result.subModels) {
        expect(model.weight).toBeGreaterThan(0);
      }
    });

    it('should have weights that sum to a meaningful total', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      const totalWeight = result.subModels.reduce((sum, m) => sum + m.weight, 0);
      // Weights reflect available models — untrained models get lower weights
      expect(totalWeight).toBeGreaterThan(0.3);
      expect(totalWeight).toBeLessThanOrEqual(1);
    });

    it('should report model availability', async () => {
      const patient = createBasePatient();
      const result = await computeEnsembleRisk(patient);
      for (const model of result.subModels) {
        expect(typeof model.available).toBe('boolean');
      }
    });
  });

  // ─── Risk Level Thresholds ──────────────────────────────────────────────
  describe('Risk Level Classification', () => {
    it('should classify low-risk patient appropriately', async () => {
      const patient = createBasePatient({
        demographics: {
          age: 30, bmi: 22.9,
          bloodPressure: { systolic: 110, diastolic: 70 },
          heartRate: 65,
        },
        currentMedications: { medications: [] },
      });
      const result = await computeEnsembleRisk(patient);
      expect(['LOW', 'MEDIUM']).toContain(result.riskLevel);
    });

    it('should classify high-risk patient appropriately', async () => {
      const meds = [
        { drugName: 'warfarin', genericName: 'warfarin', dosage: '5mg' },
        { drugName: 'aspirin', genericName: 'aspirin', dosage: '325mg' },
        { drugName: 'metformin', genericName: 'metformin', dosage: '1000mg' },
        { drugName: 'furosemide', genericName: 'furosemide', dosage: '40mg' },
        { drugName: 'digoxin', genericName: 'digoxin', dosage: '0.25mg' },
        { drugName: 'amiodarone', genericName: 'amiodarone', dosage: '200mg' },
      ];
      const patient = createBasePatient({
        demographics: {
          age: 78, bmi: 22,
          bloodPressure: { systolic: 170, diastolic: 100 },
          heartRate: 95,
        },
        currentMedications: { medications: meds },
        medicalHistory: {
          conditions: [
            { condition: 'heart failure' },
            { condition: 'diabetes' },
            { condition: 'atrial fibrillation' },
            { condition: 'chronic kidney disease' },
          ],
          allergies: [],
        },
        lifestyleFactors: {
          smokingStatus: 'current',
          alcoholUse: 'heavy',
          exerciseLevel: 'none',
          chiefComplaint: 'chest pain and shortness of breath for 3 days',
        },
      });
      const result = await computeEnsembleRisk(patient);
      expect(['HIGH', 'CRITICAL']).toContain(result.riskLevel);
    });
  });

  // ─── NLP Integration ───────────────────────────────────────────────────
  describe('NLP Complaint Analysis Integration', () => {
    it('should analyze chief complaint when present', async () => {
      const patient = createBasePatient({
        lifestyleFactors: {
          smokingStatus: 'never',
          alcoholUse: 'none',
          exerciseLevel: 'moderate',
          chiefComplaint: 'severe chest pain radiating to left arm with sweating',
        },
      });
      const result = await computeEnsembleRisk(patient);
      expect(result.complaintAnalysis).toBeDefined();
      if (result.complaintAnalysis) {
        expect(result.complaintAnalysis.symptoms.length).toBeGreaterThan(0);
      }
    });

    it('should handle empty chief complaint', async () => {
      const patient = createBasePatient({
        lifestyleFactors: {
          smokingStatus: 'never',
          alcoholUse: 'none',
          exerciseLevel: 'moderate',
          chiefComplaint: '',
        },
      });
      const result = await computeEnsembleRisk(patient);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('should populate differentials from NLP', async () => {
      const patient = createBasePatient({
        lifestyleFactors: {
          smokingStatus: 'never',
          alcoholUse: 'none',
          exerciseLevel: 'moderate',
          chiefComplaint: 'chest pain with nausea and shortness of breath',
        },
      });
      const result = await computeEnsembleRisk(patient);
      expect(result.differentials).toBeDefined();
      expect(Array.isArray(result.differentials)).toBe(true);
    });
  });

  // ─── Critical Override ──────────────────────────────────────────────────
  describe('Critical Flag Override', () => {
    it('should upgrade risk level when critical flags present', async () => {
      const patient = createBasePatient({
        demographics: {
          age: 30, bmi: 22.9,
          bloodPressure: { systolic: 200, diastolic: 120 },
          heartRate: 110,
        },
        lifestyleFactors: {
          smokingStatus: 'never',
          alcoholUse: 'none',
          exerciseLevel: 'moderate',
          chiefComplaint: 'severe chest pain with syncope',
        },
      });
      const result = await computeEnsembleRisk(patient);
      expect(result.riskLevel).not.toBe('LOW');
    });
  });

  // ─── Lab Values ──────────────────────────────────────────────────────────
  describe('Lab Value Integration', () => {
    it('should flag elevated creatinine', async () => {
      const patient = createBasePatient({
        labs: { creatinine: 3.5, gfr: 25 },
      });
      const result = await computeEnsembleRisk(patient);
      const renalFlags = result.flags.filter(f =>
        f.category === 'renal' || f.message.toLowerCase().includes('renal') || f.message.toLowerCase().includes('creatinine'),
      );
      expect(renalFlags.length).toBeGreaterThan(0);
    });

    it('should flag elevated liver enzymes', async () => {
      const patient = createBasePatient({
        labs: { ast: 250, alt: 300 },
      });
      const result = await computeEnsembleRisk(patient);
      const hepaticFlags = result.flags.filter(f =>
        f.category === 'hepatic' || f.message.toLowerCase().includes('hepatic') || f.message.toLowerCase().includes('liver'),
      );
      expect(hepaticFlags.length).toBeGreaterThan(0);
    });

    it('should flag high INR', async () => {
      const patient = createBasePatient({
        labs: { inr: 4.5 },
      });
      const result = await computeEnsembleRisk(patient);
      const inrFlags = result.flags.filter(f =>
        f.message.toLowerCase().includes('inr') || f.message.toLowerCase().includes('bleed'),
      );
      expect(inrFlags.length).toBeGreaterThan(0);
    });
  });
});
