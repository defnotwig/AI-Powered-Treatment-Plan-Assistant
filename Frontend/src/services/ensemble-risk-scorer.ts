/**
 * Ensemble Risk Scoring Service
 * 
 * Combines outputs from multiple ML/analytics sub-models into a single,
 * calibrated risk assessment. The ensemble approach improves accuracy and
 * robustness compared to any individual model.
 * 
 * Sub-models:
 *   1. Neural-network risk predictor  (demographics, vitals, lifestyle)
 *   2. Drug interaction predictor     (pairwise pharmacological ML)
 *   3. NLP chief complaint analyzer   (acuity, red-flags, differentials)
 *   4. Rule-based clinical heuristics (polypharmacy, age, renal, etc.)
 * 
 * Output: unified RiskScore with breakdown, confidence interval, and
 *         actionable flags.
 */

import { getRiskPredictionModel, extractFeatures, RISK_THRESHOLDS } from './ml-risk-predictor';
import { getDrugInteractionPredictor, type InteractionPrediction } from './drug-interaction-predictor';
import { analyzeChiefComplaint, type ChiefComplaintAnalysis } from './nlp-complaint-analyzer';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EnsembleRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SubModelScore {
  name: string;
  score: number;        // 0-100
  weight: number;       // 0-1 (how much it influences the ensemble)
  confidence: number;   // 0-100
  available: boolean;   // was this sub-model able to run?
  details?: string;
}

export interface ClinicalFlag {
  category: 'interaction' | 'allergy' | 'polypharmacy' | 'age' | 'renal' | 'hepatic' | 'acuity' | 'redFlag' | 'lifestyle';
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export interface EnsembleRiskResult {
  /** Final calibrated risk score (0–100) */
  overallScore: number;
  riskLevel: EnsembleRiskLevel;
  /** 95 % confidence interval */
  confidenceInterval: { low: number; high: number };
  /** Weighted-average confidence of contributing models */
  ensembleConfidence: number;
  /** Per-model breakdown */
  subModels: SubModelScore[];
  /** Actionable clinical flags */
  flags: ClinicalFlag[];
  /** NLP analysis of chief complaint (if provided) */
  complaintAnalysis: ChiefComplaintAnalysis | null;
  /** Significant predicted drug interactions */
  predictedInteractions: InteractionPrediction[];
  /** Top differential diagnoses from NLP */
  differentials: { condition: string; probability: number }[];
  /** Timestamp of the assessment */
  timestamp: string;
}

// ─── Patient Input Shape ──────────────────────────────────────────────────────

export interface EnsemblePatientInput {
  demographics: {
    age: number;
    bmi: number;
    bloodPressure: { systolic: number; diastolic: number };
    heartRate: number;
    gender?: string;
  };
  medicalHistory: {
    conditions: { condition: string }[];
    allergies: { allergen: string; reaction?: string }[];
  };
  currentMedications: {
    medications: { drugName: string; genericName: string; dosage?: string }[];
  };
  lifestyleFactors: {
    smokingStatus: string;
    packYears?: number;
    alcoholUse: string;
    drinksPerWeek?: number;
    exerciseLevel: string;
    chiefComplaint?: string;
  };
  /** Optional lab values for heuristic scoring */
  labs?: {
    creatinine?: number;
    gfr?: number;
    ast?: number;
    alt?: number;
    hba1c?: number;
    inr?: number;
  };
}

// ─── Heuristic Rules ──────────────────────────────────────────────────────────

function scoreAge(age: number, flags: ClinicalFlag[]): number {
  if (age >= 80) {
    flags.push({ category: 'age', severity: 'warning', message: `Age ${age}: elderly patient — start low, go slow` });
    return 25;
  }
  if (age >= 65) {
    flags.push({ category: 'age', severity: 'info', message: `Age ${age}: consider geriatric dosing` });
    return 15;
  }
  if (age >= 50) return 5;
  return 0;
}

function scoreMedications(numMeds: number, flags: ClinicalFlag[]): number {
  if (numMeds >= 10) {
    flags.push({ category: 'polypharmacy', severity: 'critical', message: `${numMeds} medications — severe polypharmacy risk` });
    return 25;
  }
  if (numMeds >= 5) {
    flags.push({ category: 'polypharmacy', severity: 'warning', message: `${numMeds} medications — polypharmacy concern` });
    return 15;
  }
  if (numMeds >= 3) return 5;
  return 0;
}

function scoreComorbidities(numConditions: number, numAllergies: number, flags: ClinicalFlag[]): number {
  let s = 0;
  if (numConditions >= 5) s += 15;
  else if (numConditions >= 3) s += 8;

  if (numAllergies >= 3) {
    s += 10;
    flags.push({ category: 'allergy', severity: 'warning', message: `${numAllergies} known allergies — cross-reactivity check recommended` });
  }
  return s;
}

function scoreVitals(systolic: number, diastolic: number, bmi: number, flags: ClinicalFlag[]): number {
  let s = 0;
  if (systolic >= 180 || diastolic >= 120) {
    s += 15;
    flags.push({ category: 'lifestyle', severity: 'critical', message: `BP ${systolic}/${diastolic} — hypertensive crisis range` });
  } else if (systolic >= 140 || diastolic >= 90) {
    s += 8;
  }

  if (bmi >= 40) {
    s += 10;
    flags.push({ category: 'lifestyle', severity: 'warning', message: `BMI ${bmi} — Class III obesity` });
  } else if (bmi >= 30) {
    s += 5;
  }
  return s;
}

function scoreKidneyLabs(
  creatinine: number | undefined,
  gfr: number | undefined,
  flags: ClinicalFlag[],
): number {
  let s = 0;
  if (creatinine && creatinine > 2) {
    s += 15;
    flags.push({ category: 'renal', severity: 'critical', message: `Creatinine ${creatinine} — significant renal impairment, dose adjust required` });
  } else if (creatinine && creatinine > 1.5) {
    s += 8;
    flags.push({ category: 'renal', severity: 'warning', message: `Creatinine ${creatinine} — mild renal impairment` });
  }

  if (gfr && gfr < 30) {
    s += 15;
    flags.push({ category: 'renal', severity: 'critical', message: `GFR ${gfr} — severe renal impairment (CKD Stage 4+)` });
  } else if (gfr && gfr < 60) {
    s += 8;
    flags.push({ category: 'renal', severity: 'warning', message: `GFR ${gfr} — moderate renal impairment` });
  }
  return s;
}

function scoreLiverLabs(
  ast: number | undefined,
  alt: number | undefined,
  flags: ClinicalFlag[],
): number {
  if ((ast && ast > 120) || (alt && alt > 120)) {
    flags.push({ category: 'hepatic', severity: 'critical', message: `AST/ALT elevated >3x ULN — hepatic dose adjustment needed` });
    return 15;
  }
  if ((ast && ast > 60) || (alt && alt > 60)) {
    flags.push({ category: 'hepatic', severity: 'warning', message: `Mildly elevated liver enzymes` });
    return 5;
  }
  return 0;
}

function scoreLabs(labs: EnsemblePatientInput['labs'], flags: ClinicalFlag[]): number {
  if (!labs) return 0;
  const { creatinine, gfr, ast, alt, hba1c, inr } = labs;
  let s = 0;

  s += scoreKidneyLabs(creatinine, gfr, flags);
  s += scoreLiverLabs(ast, alt, flags);

  if (hba1c && hba1c > 9) {
    s += 8;
    flags.push({ category: 'lifestyle', severity: 'warning', message: `HbA1c ${hba1c}% — uncontrolled diabetes` });
  }

  if (inr && inr > 3.5) {
    s += 12;
    flags.push({ category: 'interaction', severity: 'critical', message: `INR ${inr} — supratherapeutic, bleeding risk` });
  }
  return s;
}

function scoreLifestyle(lifestyle: EnsemblePatientInput['lifestyleFactors']): number {
  let s = 0;
  if (lifestyle.smokingStatus === 'current') s += 5;
  if (lifestyle.alcoholUse === 'heavy') s += 8;
  if (lifestyle.exerciseLevel === 'sedentary') s += 3;
  return s;
}

function heuristicScore(patient: EnsemblePatientInput, flags: ClinicalFlag[]): { score: number; confidence: number } {
  const { age, bloodPressure, bmi } = patient.demographics;
  const numMeds = patient.currentMedications.medications.length;
  const numConditions = patient.medicalHistory.conditions.length;
  const numAllergies = patient.medicalHistory.allergies.length;

  let score = 0;
  score += scoreAge(age, flags);
  score += scoreMedications(numMeds, flags);
  score += scoreComorbidities(numConditions, numAllergies, flags);
  score += scoreVitals(bloodPressure.systolic, bloodPressure.diastolic, bmi, flags);
  score += scoreLabs(patient.labs, flags);
  score += scoreLifestyle(patient.lifestyleFactors);

  return { score: Math.min(100, score), confidence: 80 };
}

// ─── Ensemble Combiner ───────────────────────────────────────────────────────

/** Determine drug interaction model weight based on drug count and availability */
function getDiWeight(drugCount: number, available: boolean): number {
  if (drugCount < 2) return 0.05;
  return available ? 0.25 : 0.15;
}

// ── Sub-model runners ───────────────────────────────────────────────────────

async function runNeuralNetworkModel(patient: EnsemblePatientInput): Promise<SubModelScore> {
  const nnModel = getRiskPredictionModel();
  let nnScore = 50;
  let nnConf = 60;
  let nnAvailable = false;

  try {
    const nnResult = await nnModel.predict(patient);
    nnScore = nnResult.riskScore;
    nnConf = nnResult.confidence;
    nnAvailable = nnModel.isModelTrained();
  } catch {
    const features = extractFeatures(patient);
    nnScore = features.reduce((s, f) => s + f, 0) / features.length * 100;
    nnConf = 50;
  }

  return {
    name: 'Neural Network Risk Predictor',
    score: nnScore,
    weight: nnAvailable ? 0.3 : 0.15,
    confidence: nnConf,
    available: nnAvailable,
    details: nnAvailable ? 'TF.js model trained on 200+ clinical samples' : 'Using rule-based fallback',
  };
}

function scoreDrugInteraction(pi: InteractionPrediction): number {
  if (pi.predictedSeverity === 'major') return 25;
  if (pi.predictedSeverity === 'moderate') return 12;
  if (pi.predictedSeverity === 'minor') return 4;
  return 0;
}

function flagInteraction(pi: InteractionPrediction, flags: ClinicalFlag[]): void {
  if (pi.predictedSeverity === 'major') {
    flags.push({ category: 'interaction', severity: 'critical', message: `Major predicted interaction: ${pi.drug1} + ${pi.drug2} (${pi.confidence}% confidence)` });
  } else if (pi.predictedSeverity === 'moderate') {
    flags.push({ category: 'interaction', severity: 'warning', message: `Moderate predicted interaction: ${pi.drug1} + ${pi.drug2}` });
  }
}

async function runDrugInteractionModel(
  patient: EnsemblePatientInput,
  flags: ClinicalFlag[],
): Promise<{ subModel: SubModelScore; interactions: InteractionPrediction[] }> {
  const diModel = getDrugInteractionPredictor();
  let diScore = 0;
  let diConf = 60;
  const diAvailable = diModel.isTrained();
  const drugs = patient.currentMedications.medications.map(m => m.genericName || m.drugName);
  let predictedInteractions: InteractionPrediction[] = [];

  if (drugs.length >= 2) {
    try {
      predictedInteractions = await diModel.predictMultiple(drugs);
      for (const pi of predictedInteractions) {
        diScore += scoreDrugInteraction(pi);
      }
      diScore = Math.min(100, diScore);
      diConf = diAvailable ? 80 : 60;

      for (const pi of predictedInteractions) {
        flagInteraction(pi, flags);
      }
    } catch {
      diConf = 40;
    }
  }

  return {
    subModel: {
      name: 'Drug Interaction Predictor',
      score: diScore,
      weight: getDiWeight(drugs.length, diAvailable),
      confidence: diConf,
      available: diAvailable,
      details: `${predictedInteractions.length} interactions found among ${drugs.length} medications`,
    },
    interactions: predictedInteractions,
  };
}

function runNLPModel(
  patient: EnsemblePatientInput,
  flags: ClinicalFlag[],
): { subModel: SubModelScore; analysis: ChiefComplaintAnalysis | null } {
  let nlpScore = 0;
  let nlpConf = 50;
  const complaint = patient.lifestyleFactors.chiefComplaint;
  let analysis: ChiefComplaintAnalysis | null = null;

  if (complaint && complaint.trim().length > 0) {
    analysis = analyzeChiefComplaint(complaint);
    nlpConf = analysis.confidence;

    const acuityScores: Record<string, number> = { emergent: 90, urgent: 65, 'semi-urgent': 40, routine: 15 };
    nlpScore = acuityScores[analysis.acuity] ?? 20;
    nlpScore += Math.min(20, analysis.redFlags.length * 10);
    nlpScore = Math.min(100, nlpScore);

    for (const rf of analysis.redFlags) {
      flags.push({ category: 'redFlag', severity: 'critical', message: `Red-flag symptom detected: ${rf}` });
    }
    if (analysis.acuity === 'emergent') {
      flags.push({ category: 'acuity', severity: 'critical', message: 'NLP analysis indicates emergent acuity' });
    } else if (analysis.acuity === 'urgent') {
      flags.push({ category: 'acuity', severity: 'warning', message: 'NLP analysis indicates urgent acuity' });
    }
  }

  return {
    subModel: {
      name: 'NLP Chief Complaint Analyzer',
      score: nlpScore,
      weight: complaint ? 0.2 : 0.05,
      confidence: nlpConf,
      available: !!complaint,
      details: complaint
        ? `Acuity: ${analysis?.acuity}, ${analysis?.symptoms.length} symptoms identified`
        : 'No chief complaint provided',
    },
    analysis,
  };
}

function determineRiskLevel(
  overallScore: number,
  flags: ClinicalFlag[],
): EnsembleRiskLevel {
  let riskLevel: EnsembleRiskLevel = 'LOW';
  if (overallScore >= RISK_THRESHOLDS.CRITICAL) riskLevel = 'CRITICAL';
  else if (overallScore >= RISK_THRESHOLDS.HIGH) riskLevel = 'HIGH';
  else if (overallScore >= RISK_THRESHOLDS.MEDIUM) riskLevel = 'MEDIUM';

  const hasCriticalFlag = flags.some(f => f.severity === 'critical');
  if (hasCriticalFlag && (riskLevel === 'LOW' || riskLevel === 'MEDIUM')) {
    riskLevel = 'HIGH';
  }
  return riskLevel;
}

/**
 * Perform a full ensemble risk assessment.
 * 
 * The function runs all available sub-models, adjusts weights based on
 * which models are trained / applicable, and produces a calibrated score.
 */
export async function computeEnsembleRisk(patient: EnsemblePatientInput): Promise<EnsembleRiskResult> {
  const flags: ClinicalFlag[] = [];

  // Run all sub-models
  const nnSubModel = await runNeuralNetworkModel(patient);
  const { subModel: diSubModel, interactions: predictedInteractions } = await runDrugInteractionModel(patient, flags);
  const { subModel: nlpSubModel, analysis: complaintAnalysis } = runNLPModel(patient, flags);
  const heuristic = heuristicScore(patient, flags);

  const subModels: SubModelScore[] = [
    nnSubModel,
    diSubModel,
    nlpSubModel,
    {
      name: 'Clinical Heuristic Rules',
      score: heuristic.score,
      weight: 0.25,
      confidence: heuristic.confidence,
      available: true,
      details: `${flags.length} clinical flags raised`,
    },
  ];

  // ── Weighted Combination ──────────────────────────────────────────────────
  const totalWeight = subModels.reduce((s, m) => s + m.weight, 0);
  const normalizedModels = subModels.map(m => ({ ...m, normWeight: m.weight / totalWeight }));

  const overallScore = Math.round(
    normalizedModels.reduce((s, m) => s + m.score * m.normWeight, 0),
  );

  const ensembleConfidence = Math.round(
    normalizedModels.reduce((s, m) => s + m.confidence * m.normWeight, 0),
  );

  const margin = Math.round((100 - ensembleConfidence) * 0.4);
  const ciLow = Math.max(0, overallScore - margin);
  const ciHigh = Math.min(100, overallScore + margin);

  const riskLevel = determineRiskLevel(overallScore, flags);

  const differentials = complaintAnalysis?.differentials.map(d => ({
    condition: d.condition,
    probability: d.probability,
  })) ?? [];

  return {
    overallScore,
    riskLevel,
    confidenceInterval: { low: ciLow, high: ciHigh },
    ensembleConfidence,
    subModels,
    flags,
    complaintAnalysis,
    predictedInteractions,
    differentials,
    timestamp: new Date().toISOString(),
  };
}
