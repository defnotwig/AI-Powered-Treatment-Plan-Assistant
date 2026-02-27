/**
 * Unit Tests: NLP Chief Complaint Analyzer
 * 
 * Tests symptom extraction, negation detection, duration parsing,
 * acuity classification, red-flag detection, and differential diagnosis.
 */
import { describe, it, expect } from 'vitest';
import {
  analyzeChiefComplaint,
  analyzeMultipleComplaints,
} from '../../services/nlp-complaint-analyzer';

describe('NLP Chief Complaint Analyzer', () => {
  // ─── Symptom Extraction ─────────────────────────────────────────────────
  describe('Symptom Extraction', () => {
    it('should extract cardiovascular symptoms', () => {
      const result = analyzeChiefComplaint('Patient reports chest pain and shortness of breath');
      const terms = result.symptoms.map(s => s.term);
      expect(terms).toContain('chest pain');
      expect(terms).toContain('shortness of breath');
      expect(result.bodySystems).toContain('cardiovascular');
    });

    it('should extract neurological symptoms', () => {
      const result = analyzeChiefComplaint('severe headache with dizziness and numbness in left arm');
      const terms = result.symptoms.map(s => s.term);
      expect(terms).toContain('headache');
      expect(terms).toContain('dizziness');
      expect(terms).toContain('numbness');
    });

    it('should extract gastrointestinal symptoms', () => {
      const result = analyzeChiefComplaint('abdominal pain, nausea, and diarrhea for 2 days');
      const terms = result.symptoms.map(s => s.term);
      expect(terms).toContain('abdominal pain');
      expect(terms).toContain('nausea');
      expect(terms).toContain('diarrhea');
      expect(result.bodySystems).toContain('gastrointestinal');
    });

    it('should handle empty input gracefully', () => {
      const result = analyzeChiefComplaint('');
      expect(result.symptoms).toHaveLength(0);
      expect(result.acuity).toBe('routine');
      expect(result.confidence).toBe(0);
    });

    it('should handle gibberish input without crashing', () => {
      const result = analyzeChiefComplaint('asdfghjkl qwerty xyz123');
      expect(result.symptoms).toHaveLength(0);
      expect(result.bodySystems).toContain('general');
    });
  });

  // ─── Negation Detection ─────────────────────────────────────────────────
  describe('Negation Detection', () => {
    it('should detect negated symptoms', () => {
      const result = analyzeChiefComplaint('denies chest pain');
      const chestPain = result.symptoms.find(s => s.term === 'chest pain');
      expect(chestPain?.isNegated).toBe(true);
    });

    it('should detect non-negated symptoms in isolation', () => {
      const result = analyzeChiefComplaint('has shortness of breath');
      const sob = result.symptoms.find(s => s.term === 'shortness of breath');
      expect(sob?.isNegated).toBe(false);
    });

    it('should detect "no" negation', () => {
      const result = analyzeChiefComplaint('no fever');
      const fever = result.symptoms.find(s => s.term === 'fever');
      expect(fever?.isNegated).toBe(true);
    });

    it('should detect non-negated headache in separate clause', () => {
      const result = analyzeChiefComplaint('has headache');
      const headache = result.symptoms.find(s => s.term === 'headache');
      expect(headache?.isNegated).toBe(false);
    });

    it('should detect "without" negation', () => {
      const result = analyzeChiefComplaint('cough without fever');
      const fever = result.symptoms.find(s => s.term === 'fever');
      expect(fever?.isNegated).toBe(true);
    });

    it('should not flag negated symptoms as red flags', () => {
      const result = analyzeChiefComplaint('denies chest pain, has mild headache');
      const chestPain = result.symptoms.find(s => s.term === 'chest pain');
      expect(chestPain?.isRedFlag).toBe(false);
    });
  });

  // ─── Duration Extraction ────────────────────────────────────────────────
  describe('Duration Extraction', () => {
    it('should extract days duration', () => {
      const result = analyzeChiefComplaint('headache for 3 days');
      expect(result.duration).not.toBeNull();
      expect(result.duration?.estimatedDays).toBeCloseTo(3, 0);
      expect(result.duration?.acuteVsChronic).toBe('acute');
    });

    it('should extract weeks duration', () => {
      const result = analyzeChiefComplaint('back pain for 4 weeks');
      expect(result.duration).not.toBeNull();
      expect(result.duration?.estimatedDays).toBeCloseTo(28, 0);
      expect(result.duration?.acuteVsChronic).toBe('subacute');
    });

    it('should extract months duration', () => {
      const result = analyzeChiefComplaint('fatigue for 6 months');
      expect(result.duration).not.toBeNull();
      expect(result.duration?.estimatedDays).toBeCloseTo(180, 0);
      expect(result.duration?.acuteVsChronic).toBe('chronic');
    });

    it('should recognize "today" as acute', () => {
      const result = analyzeChiefComplaint('chest pain onset today');
      expect(result.duration).not.toBeNull();
      expect(result.duration?.acuteVsChronic).toBe('acute');
    });

    it('should recognize chronic indicators', () => {
      const result = analyzeChiefComplaint('chronic back pain for years');
      expect(result.duration).not.toBeNull();
      expect(result.duration?.acuteVsChronic).toBe('chronic');
    });
  });

  // ─── Acuity Classification ──────────────────────────────────────────────
  describe('Acuity Classification', () => {
    it('should classify emergent acuity for stroke symptoms', () => {
      const result = analyzeChiefComplaint('sudden weakness, facial droop, and slurred speech');
      expect(result.acuity).toBe('emergent');
    });

    it('should classify urgent acuity for chest pain', () => {
      const result = analyzeChiefComplaint('chest pain radiating to left arm');
      expect(result.acuity).toBe('urgent');
    });

    it('should classify routine for mild symptoms', () => {
      const result = analyzeChiefComplaint('mild headache');
      expect(['routine', 'semi-urgent']).toContain(result.acuity);
    });

    it('should boost acuity for acute onset', () => {
      const result = analyzeChiefComplaint('palpitations onset today');
      // Palpitations (severity 6) + acute onset should bump up
      expect(['semi-urgent', 'urgent']).toContain(result.acuity);
    });
  });

  // ─── Red Flag Detection ─────────────────────────────────────────────────
  describe('Red Flag Detection', () => {
    it('should flag chest pain as red flag', () => {
      const result = analyzeChiefComplaint('chest pain and shortness of breath');
      expect(result.redFlags.length).toBeGreaterThan(0);
      expect(result.redFlags).toContain('chest pain');
    });

    it('should flag suicidal ideation', () => {
      const result = analyzeChiefComplaint('patient reports suicidal ideation');
      expect(result.redFlags.length).toBeGreaterThan(0);
    });

    it('should flag hemoptysis', () => {
      const result = analyzeChiefComplaint('coughing blood since yesterday');
      expect(result.redFlags).toContain('coughing blood');
    });

    it('should flag bloody stool', () => {
      const result = analyzeChiefComplaint('blood in stool for 2 days');
      expect(result.redFlags.length).toBeGreaterThan(0);
    });

    it('should not flag negated red-flag symptoms', () => {
      const result = analyzeChiefComplaint('denies chest pain, has mild cough');
      expect(result.redFlags).not.toContain('chest pain');
    });
  });

  // ─── Severity Modifiers ─────────────────────────────────────────────────
  describe('Severity Modifiers', () => {
    it('should increase severity with "severe" modifier', () => {
      const mild = analyzeChiefComplaint('headache');
      const severe = analyzeChiefComplaint('severe headache');
      const mildSev = mild.symptoms.find(s => s.term === 'headache')?.severity ?? 0;
      const severeSev = severe.symptoms.find(s => s.term === 'headache')?.severity ?? 0;
      expect(severeSev).toBeGreaterThan(mildSev);
    });

    it('should decrease severity with "mild" modifier', () => {
      const normal = analyzeChiefComplaint('headache');
      const mild = analyzeChiefComplaint('mild headache');
      const normalSev = normal.symptoms.find(s => s.term === 'headache')?.severity ?? 0;
      const mildSev = mild.symptoms.find(s => s.term === 'headache')?.severity ?? 0;
      expect(mildSev).toBeLessThan(normalSev);
    });
  });

  // ─── Differential Diagnoses ─────────────────────────────────────────────
  describe('Differential Diagnoses', () => {
    it('should suggest ACS for chest pain + nausea + shortness of breath', () => {
      const result = analyzeChiefComplaint('chest pain with nausea and shortness of breath');
      const acs = result.differentials.find(d => d.condition.includes('Acute Coronary'));
      expect(acs).toBeDefined();
      expect(acs!.probability).toBeGreaterThan(0.2);
    });

    it('should suggest UTI for dysuria + frequency', () => {
      const result = analyzeChiefComplaint('painful urination and frequent urination, mild fever');
      const uti = result.differentials.find(d => d.condition.includes('Urinary Tract'));
      expect(uti).toBeDefined();
    });

    it('should suggest pneumonia for cough + fever + SOB', () => {
      const result = analyzeChiefComplaint('cough with fever and shortness of breath for 3 days');
      const pneumonia = result.differentials.find(d => d.condition.includes('Pneumonia'));
      expect(pneumonia).toBeDefined();
    });

    it('should rank differentials by probability', () => {
      const result = analyzeChiefComplaint('chest pain, shortness of breath, nausea');
      if (result.differentials.length >= 2) {
        expect(result.differentials[0].probability).toBeGreaterThanOrEqual(result.differentials[1].probability);
      }
    });
  });

  // ─── Suggested Questions ────────────────────────────────────────────────
  describe('Suggested Questions', () => {
    it('should suggest cardiovascular questions for chest pain', () => {
      const result = analyzeChiefComplaint('chest pain');
      expect(result.suggestedQuestions.length).toBeGreaterThan(0);
    });

    it('should suggest general questions when no symptoms matched', () => {
      const result = analyzeChiefComplaint('feeling unwell');
      expect(result.suggestedQuestions.length).toBeGreaterThan(0);
    });
  });

  // ─── Multiple Complaints ───────────────────────────────────────────────
  describe('Multiple Complaints', () => {
    it('should merge analysis of multiple texts', () => {
      const result = analyzeMultipleComplaints(['chest pain', 'nausea and vomiting']);
      const terms = result.symptoms.map(s => s.term);
      expect(terms).toContain('chest pain');
      expect(terms).toContain('nausea');
    });

    it('should handle empty array', () => {
      const result = analyzeMultipleComplaints([]);
      expect(result.symptoms).toHaveLength(0);
    });
  });

  // ─── Confidence Score ──────────────────────────────────────────────────
  describe('Confidence Score', () => {
    it('should have higher confidence with more symptoms detected', () => {
      const simple = analyzeChiefComplaint('headache');
      const complex = analyzeChiefComplaint('severe chest pain with shortness of breath, nausea, and sweating for 2 hours');
      expect(complex.confidence).toBeGreaterThan(simple.confidence);
    });

    it('should be between 0 and 100', () => {
      const result = analyzeChiefComplaint('chest pain and fever');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });
});
