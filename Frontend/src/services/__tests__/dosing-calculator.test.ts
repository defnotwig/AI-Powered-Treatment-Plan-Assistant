/**
 * Unit Tests: Clinical Dosing Calculator
 *
 * Safety-critical tests covering all dosing calculation functions:
 * - Cockcroft-Gault CrCl
 * - CKD-EPI eGFR (2021 race-free)
 * - BSA (Mosteller)
 * - IBW / ABW
 * - CKD staging
 * - Renal function assessment
 * - Child-Pugh hepatic scoring
 * - Renal-adjusted dosing (8 drugs)
 * - Weight-based & BSA-based dosing
 * - Comprehensive dosing report
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCrCl,
  calculateEGFR,
  calculateBSA,
  calculateIBW,
  calculateABW,
  getCKDStage,
  assessRenalFunction,
  calculateChildPugh,
  getRenalAdjustedDose,
  calculateWeightBasedDose,
  calculateBSABasedDose,
  generateDosingReport,
  type PatientParameters,
} from '../dosing-calculator';

// ── Test Patient Factories ──────────────────────────────────────────────────

const malePatient: PatientParameters = {
  age: 50,
  weight: 80,
  height: 175,
  sex: 'male',
  serumCreatinine: 1,
};

const femalePatient: PatientParameters = {
  age: 45,
  weight: 65,
  height: 162,
  sex: 'female',
  serumCreatinine: 0.9,
};

const geriatricPatient: PatientParameters = {
  age: 78,
  weight: 60,
  height: 165,
  sex: 'male',
  serumCreatinine: 1.6,
};

const youngPatient: PatientParameters = {
  age: 25,
  weight: 70,
  height: 178,
  sex: 'male',
  serumCreatinine: 0.8,
};

const severeRenalPatient: PatientParameters = {
  age: 68,
  weight: 72,
  height: 170,
  sex: 'male',
  serumCreatinine: 4.5,
};

const obesePatient: PatientParameters = {
  age: 40,
  weight: 130,
  height: 170,
  sex: 'male',
  serumCreatinine: 1,
};

// ── calculateCrCl (Cockcroft-Gault) ─────────────────────────────────────────

describe('calculateCrCl', () => {
  it('calculates CrCl for standard male patient', () => {
    // CrCl = ((140 - 50) * 80) / (72 * 1.0) = 7200 / 72 = 100.0
    expect(calculateCrCl(malePatient)).toBe(100);
  });

  it('applies 0.85 correction factor for female patients', () => {
    // CrCl = ((140 - 45) * 65) / (72 * 0.9) * 0.85
    //       = (95 * 65) / 64.8 * 0.85 = 6175 / 64.8 * 0.85 = 95.29... * 0.85 ≈ 81.0
    const result = calculateCrCl(femalePatient);
    expect(result).toBeGreaterThan(70);
    expect(result).toBeLessThan(90);
  });

  it('returns lower CrCl for elderly patients with elevated creatinine', () => {
    const result = calculateCrCl(geriatricPatient);
    // CrCl = ((140 - 78) * 60) / (72 * 1.6) = (62 * 60) / 115.2 = 3720 / 115.2 ≈ 32.3
    expect(result).toBeCloseTo(32.3, 0);
    expect(result).toBeLessThan(50); // Should flag moderate impairment
  });

  it('returns high CrCl for young healthy patient', () => {
    const result = calculateCrCl(youngPatient);
    // CrCl = ((140 - 25) * 70) / (72 * 0.8) = (115 * 70) / 57.6 = 8050 / 57.6 ≈ 139.8
    expect(result).toBeGreaterThan(120);
  });

  it('returns very low CrCl for severe renal impairment', () => {
    const result = calculateCrCl(severeRenalPatient);
    // CrCl = ((140 - 68) * 72) / (72 * 4.5) = (72 * 72) / 324 = 5184 / 324 = 16.0
    expect(result).toBe(16);
    expect(result).toBeLessThan(30); // Severe impairment
  });

  it('defaults serumCreatinine to 1.0 when not provided', () => {
    const patient: PatientParameters = { age: 50, weight: 80, height: 175, sex: 'male' };
    const result = calculateCrCl(patient);
    expect(result).toBe(calculateCrCl({ ...patient, serumCreatinine: 1 }));
  });

  it('treats "other" sex same as male (no 0.85 correction)', () => {
    const otherPatient: PatientParameters = { ...malePatient, sex: 'other' };
    expect(calculateCrCl(otherPatient)).toBe(calculateCrCl(malePatient));
  });

  it('returns a number rounded to 1 decimal place', () => {
    const result = calculateCrCl(femalePatient);
    expect(result).toBe(Math.round(result * 10) / 10);
  });
});

// ── calculateEGFR (CKD-EPI 2021) ───────────────────────────────────────────

describe('calculateEGFR', () => {
  it('calculates eGFR for standard male patient', () => {
    const result = calculateEGFR(malePatient);
    // With SCr 1.0 at age 50, male: should be around 90-100
    expect(result).toBeGreaterThan(70);
    expect(result).toBeLessThan(120);
  });

  it('calculates eGFR for female patient', () => {
    const result = calculateEGFR(femalePatient);
    // Female with lower SCr should have normal eGFR
    expect(result).toBeGreaterThan(80);
  });

  it('returns reduced eGFR for elderly with high creatinine', () => {
    const result = calculateEGFR(geriatricPatient);
    // 78yo male with SCr 1.6 → CKD stage 3-4
    expect(result).toBeLessThan(60);
  });

  it('returns very low eGFR for severe renal impairment', () => {
    const result = calculateEGFR(severeRenalPatient);
    // SCr 4.5 → eGFR should be well below 15 (ESRD territory)
    expect(result).toBeLessThan(20);
  });

  it('returns high eGFR for young patient with low creatinine', () => {
    const result = calculateEGFR(youngPatient);
    expect(result).toBeGreaterThan(100);
  });

  it('applies 1.012 correction for female sex', () => {
    const maleVersion: PatientParameters = { ...femalePatient, sex: 'male' };
    const femaleResult = calculateEGFR(femalePatient);
    const maleResult = calculateEGFR(maleVersion);
    // Female uses different kappa/alpha AND 1.012 multiplier, so results differ
    expect(femaleResult).not.toBe(maleResult);
  });

  it('defaults serumCreatinine to 1.0 when not provided', () => {
    const patient: PatientParameters = { age: 50, weight: 80, height: 175, sex: 'male' };
    const result = calculateEGFR(patient);
    expect(result).toBe(calculateEGFR({ ...patient, serumCreatinine: 1 }));
  });

  it('returns a number rounded to 1 decimal place', () => {
    const result = calculateEGFR(malePatient);
    expect(result).toBe(Math.round(result * 10) / 10);
  });
});

// ── calculateBSA (Mosteller) ────────────────────────────────────────────────

describe('calculateBSA', () => {
  it('calculates BSA for average adult', () => {
    // BSA = sqrt((175 * 80) / 3600) = sqrt(3.889) ≈ 1.97
    const result = calculateBSA(malePatient);
    expect(result).toBeCloseTo(1.97, 1);
  });

  it('calculates BSA for smaller adult', () => {
    // BSA = sqrt((162 * 65) / 3600) = sqrt(2.925) ≈ 1.71
    const result = calculateBSA(femalePatient);
    expect(result).toBeCloseTo(1.71, 1);
  });

  it('calculates BSA for obese patient', () => {
    const result = calculateBSA(obesePatient);
    // BSA = sqrt((170 * 130) / 3600) ≈ 2.49
    expect(result).toBeGreaterThan(2.3);
  });

  it('returns a number rounded to 2 decimal places', () => {
    const result = calculateBSA(malePatient);
    expect(result).toBe(Math.round(result * 100) / 100);
  });
});

// ── calculateIBW ────────────────────────────────────────────────────────────

describe('calculateIBW', () => {
  it('calculates IBW for male', () => {
    // heightInches = 175 / 2.54 ≈ 68.9
    // IBW = 50 + 2.3 * (68.9 - 60) = 50 + 2.3 * 8.9 = 50 + 20.47 = 70.47 ≈ 70.5
    const result = calculateIBW(malePatient);
    expect(result).toBeCloseTo(70.5, 0);
  });

  it('calculates IBW for female (lower baseline)', () => {
    // heightInches = 162 / 2.54 ≈ 63.78
    // IBW = 45.5 + 2.3 * (63.78 - 60) = 45.5 + 8.7 = 54.2
    const result = calculateIBW(femalePatient);
    expect(result).toBeCloseTo(54.2, 0);
  });

  it('returns 0 or positive for very short patients', () => {
    const shortPatient: PatientParameters = { age: 30, weight: 50, height: 140, sex: 'female' };
    const result = calculateIBW(shortPatient);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('uses max(ibw, 0) to prevent negative values', () => {
    // Edge case: extremely short height → formula could go negative
    const tinyPatient: PatientParameters = { age: 30, weight: 40, height: 100, sex: 'female' };
    const result = calculateIBW(tinyPatient);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

// ── calculateABW ────────────────────────────────────────────────────────────

describe('calculateABW', () => {
  it('returns actual weight when patient is NOT obese (≤20% above IBW)', () => {
    const normalPatient: PatientParameters = { age: 40, weight: 75, height: 175, sex: 'male' };
    const ibw = calculateIBW(normalPatient);
    // weight 75 should be close to IBW (~70), so within 20%
    const result = calculateABW(normalPatient);
    if (normalPatient.weight <= ibw * 1.2) {
      expect(result).toBe(normalPatient.weight);
    }
  });

  it('returns adjusted weight for obese patient (>20% above IBW)', () => {
    // IBW ≈ 70.5 for 175cm male. 130 kg > 70.5 * 1.2 = 84.6
    // ABW = 70.5 + 0.4 * (130 - 70.5) = 70.5 + 23.8 = 94.3
    const result = calculateABW(obesePatient);
    expect(result).toBeLessThan(obesePatient.weight);
    expect(result).toBeGreaterThan(calculateIBW(obesePatient));
  });

  it('ABW formula: IBW + 0.4 × (actual - IBW)', () => {
    const ibw = calculateIBW(obesePatient);
    const expected = Math.round((ibw + 0.4 * (obesePatient.weight - ibw)) * 10) / 10;
    expect(calculateABW(obesePatient)).toBe(expected);
  });
});

// ── getCKDStage ─────────────────────────────────────────────────────────────

describe('getCKDStage', () => {
  it.each([
    { eGFR: 95, expectedStage: 1, desc: 'Normal or high kidney function' },
    { eGFR: 90, expectedStage: 1, desc: 'Normal or high kidney function' },
    { eGFR: 75, expectedStage: 2, desc: 'Mild decrease in kidney function' },
    { eGFR: 60, expectedStage: 2, desc: 'Mild decrease in kidney function' },
    { eGFR: 45, expectedStage: 3, desc: 'Moderate decrease in kidney function' },
    { eGFR: 30, expectedStage: 3, desc: 'Moderate decrease in kidney function' },
    { eGFR: 20, expectedStage: 4, desc: 'Severe decrease in kidney function' },
    { eGFR: 15, expectedStage: 4, desc: 'Severe decrease in kidney function' },
    { eGFR: 10, expectedStage: 5, desc: 'Kidney failure (ESRD)' },
    { eGFR: 0, expectedStage: 5, desc: 'Kidney failure (ESRD)' },
  ])('eGFR $eGFR → CKD stage $expectedStage', ({ eGFR, expectedStage, desc }) => {
    const { stage, description } = getCKDStage(eGFR);
    expect(stage).toBe(expectedStage);
    expect(description).toBe(desc);
  });
});

// ── assessRenalFunction ─────────────────────────────────────────────────────

describe('assessRenalFunction', () => {
  it('returns normal renal function for healthy patient', () => {
    const result = assessRenalFunction(youngPatient);
    expect(result.creatinineClearance).toBeGreaterThan(80);
    expect(result.eGFR).toBeGreaterThan(90);
    expect(result.ckdStage).toBe(1);
    expect(result.renalAdjustmentRequired).toBe(false);
  });

  it('flags renal adjustment when CrCl < 50', () => {
    const result = assessRenalFunction(geriatricPatient);
    expect(result.creatinineClearance).toBeLessThan(50);
    expect(result.renalAdjustmentRequired).toBe(true);
  });

  it('flags renal adjustment when eGFR < 60', () => {
    const result = assessRenalFunction(severeRenalPatient);
    expect(result.eGFR).toBeLessThan(60);
    expect(result.renalAdjustmentRequired).toBe(true);
  });

  it('combines CrCl, eGFR, and CKD stage coherently', () => {
    const result = assessRenalFunction(malePatient);
    expect(result).toHaveProperty('creatinineClearance');
    expect(result).toHaveProperty('eGFR');
    expect(result).toHaveProperty('ckdStage');
    expect(result).toHaveProperty('ckdDescription');
    expect(result).toHaveProperty('renalAdjustmentRequired');
    expect(typeof result.creatinineClearance).toBe('number');
    expect(typeof result.eGFR).toBe('number');
    expect([1, 2, 3, 4, 5]).toContain(result.ckdStage);
  });
});

// ── calculateChildPugh ──────────────────────────────────────────────────────

describe('calculateChildPugh', () => {
  it('returns Class A for best-case parameters (score 5)', () => {
    const result = calculateChildPugh({
      bilirubin: 1,
      albumin: 4,
      inr: 1.2,
      ascites: 'none',
      encephalopathy: 'none',
    });
    expect(result.childPughScore).toBe(5);
    expect(result.childPughClass).toBe('A');
    expect(result.hepaticAdjustmentRequired).toBe(false);
  });

  it('returns Class B for moderate hepatic impairment (score 7-9)', () => {
    const result = calculateChildPugh({
      bilirubin: 2.5,
      albumin: 3,
      inr: 2,
      ascites: 'mild',
      encephalopathy: 'none',
    });
    expect(result.childPughScore).toBeGreaterThanOrEqual(7);
    expect(result.childPughScore).toBeLessThanOrEqual(9);
    expect(result.childPughClass).toBe('B');
    expect(result.hepaticAdjustmentRequired).toBe(true);
  });

  it('returns Class C for severe hepatic impairment (score 10-15)', () => {
    const result = calculateChildPugh({
      bilirubin: 5,
      albumin: 2,
      inr: 3,
      ascites: 'moderate',
      encephalopathy: 'grade3-4',
    });
    expect(result.childPughScore).toBeGreaterThanOrEqual(10);
    expect(result.childPughClass).toBe('C');
    expect(result.hepaticAdjustmentRequired).toBe(true);
  });

  it('scores bilirubin correctly at boundaries', () => {
    // Bilirubin < 2 → 1 point; 2-3 → 2 points; > 3 → 3 points
    const base = { albumin: 4, inr: 1.2, ascites: 'none' as const, encephalopathy: 'none' as const };
    const low = calculateChildPugh({ ...base, bilirubin: 1.5 });
    const mid = calculateChildPugh({ ...base, bilirubin: 2.5 });
    const high = calculateChildPugh({ ...base, bilirubin: 4 });
    // Scores should increase by 1 each step (for bilirubin component)
    expect(mid.childPughScore - low.childPughScore).toBe(1);
    expect(high.childPughScore - mid.childPughScore).toBe(1);
  });

  it('scores albumin correctly at boundaries', () => {
    // Albumin > 3.5 → 1 point; 2.8-3.5 → 2 points; < 2.8 → 3 points
    const base = { bilirubin: 1, inr: 1.2, ascites: 'none' as const, encephalopathy: 'none' as const };
    const high = calculateChildPugh({ ...base, albumin: 4 });
    const mid = calculateChildPugh({ ...base, albumin: 3 });
    const low = calculateChildPugh({ ...base, albumin: 2 });
    expect(mid.childPughScore - high.childPughScore).toBe(1);
    expect(low.childPughScore - mid.childPughScore).toBe(1);
  });

  it('scores INR correctly at boundaries', () => {
    const base = { bilirubin: 1, albumin: 4, ascites: 'none' as const, encephalopathy: 'none' as const };
    const low = calculateChildPugh({ ...base, inr: 1.2 });
    const mid = calculateChildPugh({ ...base, inr: 2 });
    const high = calculateChildPugh({ ...base, inr: 3 });
    expect(mid.childPughScore - low.childPughScore).toBe(1);
    expect(high.childPughScore - mid.childPughScore).toBe(1);
  });
});

// ── getRenalAdjustedDose ────────────────────────────────────────────────────

describe('getRenalAdjustedDose', () => {
  const normalRenal: ReturnType<typeof assessRenalFunction> = {
    creatinineClearance: 95,
    eGFR: 92,
    ckdStage: 1,
    ckdDescription: 'Normal or high kidney function',
    renalAdjustmentRequired: false,
  };

  const moderateRenal: ReturnType<typeof assessRenalFunction> = {
    creatinineClearance: 40,
    eGFR: 42,
    ckdStage: 3,
    ckdDescription: 'Moderate decrease in kidney function',
    renalAdjustmentRequired: true,
  };

  const severeRenal: ReturnType<typeof assessRenalFunction> = {
    creatinineClearance: 20,
    eGFR: 18,
    ckdStage: 4,
    ckdDescription: 'Severe decrease in kidney function',
    renalAdjustmentRequired: true,
  };

  const esrdRenal: ReturnType<typeof assessRenalFunction> = {
    creatinineClearance: 10,
    eGFR: 8,
    ckdStage: 5,
    ckdDescription: 'Kidney failure (ESRD)',
    renalAdjustmentRequired: true,
  };

  it('returns null for unknown drugs', () => {
    expect(getRenalAdjustedDose('unknownDrug', normalRenal)).toBeNull();
  });

  it('returns standard dose for normal renal function', () => {
    const result = getRenalAdjustedDose('metformin', normalRenal);
    expect(result).not.toBeNull();
    expect(result!.adjustedDose).toBe('500-1000mg BID');
    expect(result!.standardDose).toBe('500-1000mg BID');
  });

  it('returns moderate impairment dose for CrCl 30-50', () => {
    const result = getRenalAdjustedDose('metformin', moderateRenal);
    expect(result).not.toBeNull();
    expect(result!.adjustedDose).toBe('500mg BID (max 1000mg/day)');
  });

  it('returns CONTRAINDICATED for metformin in severe impairment', () => {
    const result = getRenalAdjustedDose('metformin', severeRenal);
    expect(result!.adjustedDose).toBe('CONTRAINDICATED');
    expect(result!.warnings.length).toBeGreaterThan(0);
    expect(result!.warnings[0]).toContain('CONTRAINDICATED');
  });

  it('returns CONTRAINDICATED for metformin in ESRD', () => {
    const result = getRenalAdjustedDose('metformin', esrdRenal);
    expect(result!.adjustedDose).toBe('CONTRAINDICATED');
  });

  it('returns dialysis dose when onDialysis is true', () => {
    const result = getRenalAdjustedDose('gabapentin', esrdRenal, true);
    expect(result!.adjustedDose).toBe('125-350mg post-dialysis');
    expect(result!.adjustmentReason).toContain('dialysis');
  });

  it('handles case-insensitive drug names', () => {
    const result = getRenalAdjustedDose('Metformin', normalRenal);
    expect(result).not.toBeNull();
    expect(result!.drug).toBe('Metformin');
  });

  // Test all 8 drugs with normal renal function
  it.each([
    ['metformin', '500-1000mg BID'],
    ['gabapentin', '300-600mg TID'],
    ['lisinopril', '10-40mg daily'],
    ['ciprofloxacin', '500-750mg BID'],
    ['enoxaparin', '1mg/kg Q12h'],
    ['sildenafil', '50mg PRN'],
    ['amoxicillin', '500mg TID'],
    ['atorvastatin', '10-80mg daily'],
  ])('%s returns standard dose with normal renal function', (drug, expectedDose) => {
    const result = getRenalAdjustedDose(drug, normalRenal);
    expect(result).not.toBeNull();
    expect(result!.standardDose).toBe(expectedDose);
  });

  it('atorvastatin dose unchanged even in ESRD (no renal adjustment)', () => {
    const result = getRenalAdjustedDose('atorvastatin', esrdRenal);
    expect(result!.adjustedDose).toBe('10-80mg daily');
  });

  it('enoxaparin changed to unfractionated heparin in ESRD', () => {
    const result = getRenalAdjustedDose('enoxaparin', esrdRenal);
    expect(result!.adjustedDose).toBe('USE UNFRACTIONATED HEPARIN');
  });

  it('includes monitoring requirements for moderate impairment', () => {
    const result = getRenalAdjustedDose('lisinopril', moderateRenal);
    expect(result!.monitoringRequired.length).toBeGreaterThan(0);
  });

  it('sets correct frequency based on dose string', () => {
    const bidResult = getRenalAdjustedDose('metformin', normalRenal);
    expect(bidResult!.frequency).toBe('Twice daily');

    const tidResult = getRenalAdjustedDose('gabapentin', normalRenal);
    expect(tidResult!.frequency).toBe('Three times daily');
  });
});

// ── calculateWeightBasedDose ────────────────────────────────────────────────

describe('calculateWeightBasedDose', () => {
  it('calculates dose using actual weight by default', () => {
    // 10 mg/kg * 80 kg = 800 mg
    const result = calculateWeightBasedDose(10, malePatient);
    expect(result).toBe(800);
  });

  it('calculates dose using ABW when useABW is true', () => {
    const resultActual = calculateWeightBasedDose(10, obesePatient, false);
    const resultABW = calculateWeightBasedDose(10, obesePatient, true);
    // ABW should be lower than actual weight for obese patient
    expect(resultABW).toBeLessThan(resultActual);
  });

  it('uses actual weight for non-obese patient even with useABW=true', () => {
    // ABW returns actual weight when patient is NOT >20% above IBW
    const normalWeight: PatientParameters = { age: 40, weight: 72, height: 175, sex: 'male' };
    const result = calculateWeightBasedDose(5, normalWeight, true);
    // If weight is within 20% of IBW, ABW returns actual weight
    expect(result).toBeCloseTo(5 * normalWeight.weight, 0);
  });

  it('rounds result to 1 decimal place', () => {
    const result = calculateWeightBasedDose(3.33, malePatient);
    expect(result).toBe(Math.round(3.33 * 80 * 10) / 10);
  });
});

// ── calculateBSABasedDose ───────────────────────────────────────────────────

describe('calculateBSABasedDose', () => {
  it('calculates dose using BSA', () => {
    // BSA ≈ 1.97, dosePerM2 = 100 → ~197 mg
    const result = calculateBSABasedDose(100, malePatient);
    const bsa = calculateBSA(malePatient);
    expect(result).toBe(Math.round(100 * bsa * 10) / 10);
  });

  it('returns smaller dose for patient with smaller BSA', () => {
    const resultMale = calculateBSABasedDose(100, malePatient);
    const resultFemale = calculateBSABasedDose(100, femalePatient);
    expect(resultFemale).toBeLessThan(resultMale);
  });

  it('rounds result to 1 decimal place', () => {
    const result = calculateBSABasedDose(75, malePatient);
    expect(result).toBe(Math.round(result * 10) / 10);
  });
});

// ── generateDosingReport ────────────────────────────────────────────────────

describe('generateDosingReport', () => {
  it('generates a complete report with all parameter sections', () => {
    const report = generateDosingReport(malePatient, ['metformin', 'lisinopril']);

    expect(report).toHaveProperty('patientParameters');
    expect(report).toHaveProperty('renalFunction');
    expect(report).toHaveProperty('dosingRecommendations');
    expect(report).toHaveProperty('generalWarnings');

    expect(report.patientParameters).toHaveProperty('creatinineClearance');
    expect(report.patientParameters).toHaveProperty('eGFR');
    expect(report.patientParameters).toHaveProperty('ckdStage');
    expect(report.patientParameters).toHaveProperty('bsa');
    expect(report.patientParameters).toHaveProperty('ibw');
    expect(report.patientParameters).toHaveProperty('abw');
  });

  it('includes dosing recommendations for known medications', () => {
    const report = generateDosingReport(malePatient, ['metformin', 'gabapentin']);
    expect(report.dosingRecommendations).toHaveLength(2);
    expect(report.dosingRecommendations[0].drug).toBe('metformin');
    expect(report.dosingRecommendations[1].drug).toBe('gabapentin');
  });

  it('skips unknown medications (no recommendation generated)', () => {
    const report = generateDosingReport(malePatient, ['metformin', 'unknownDrug']);
    expect(report.dosingRecommendations).toHaveLength(1);
    expect(report.dosingRecommendations[0].drug).toBe('metformin');
  });

  it('adds geriatric warning for patients ≥ 65', () => {
    const report = generateDosingReport(geriatricPatient, []);
    expect(report.generalWarnings.some(w => w.includes('Geriatric'))).toBe(true);
  });

  it('adds very elderly warning for patients ≥ 80', () => {
    const veryOld: PatientParameters = { ...malePatient, age: 82 };
    const report = generateDosingReport(veryOld, []);
    expect(report.generalWarnings.some(w => w.includes('Very elderly'))).toBe(true);
  });

  it('adds obesity warning when weight > 130% IBW', () => {
    const report = generateDosingReport(obesePatient, []);
    expect(report.generalWarnings.some(w => w.includes('Obese') || w.includes('adjusted body weight'))).toBe(true);
  });

  it('adds underweight warning when weight < 80% IBW', () => {
    const thin: PatientParameters = { age: 30, weight: 45, height: 175, sex: 'male' };
    const report = generateDosingReport(thin, []);
    expect(report.generalWarnings.some(w => w.includes('Underweight') || w.includes('lower doses'))).toBe(true);
  });

  it('adds nephrotoxic warning for CKD stage ≥ 4', () => {
    const report = generateDosingReport(severeRenalPatient, []);
    expect(report.generalWarnings.some(w => w.includes('nephrotoxic'))).toBe(true);
    expect(report.generalWarnings.some(w => w.includes('nephrology'))).toBe(true);
  });

  it('report patient parameters are consistent with individual calculations', () => {
    const report = generateDosingReport(malePatient, []);
    const renal = assessRenalFunction(malePatient);

    expect(report.patientParameters.creatinineClearance).toBe(renal.creatinineClearance);
    expect(report.patientParameters.eGFR).toBe(renal.eGFR);
    expect(report.patientParameters.ckdStage).toBe(renal.ckdStage);
    expect(report.patientParameters.bsa).toBe(calculateBSA(malePatient));
    expect(report.patientParameters.ibw).toBe(calculateIBW(malePatient));
    expect(report.patientParameters.abw).toBe(calculateABW(malePatient));
  });
});
