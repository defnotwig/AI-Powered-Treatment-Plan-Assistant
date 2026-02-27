/**
 * Backend Request Input Types
 *
 * These types represent the raw data shapes received from the frontend.
 * They intentionally use optional fields and union types to handle
 * both wizard-entered data and sample-loaded data formats.
 */
import { TreatmentPlanResponse } from './treatment-plan';

// ── Raw Demographics Input ──────────────────────────────────────────────────

export interface RawDemographicsInput {
  patientId?: string;
  age: number;
  sex?: string;
  weight: number;
  height: number;
  bmi?: number;
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
  };
  heartRate?: number;
  temperature?: number;
  serumCreatinine?: number;
}

// ── Raw Medical History Input ───────────────────────────────────────────────

export interface RawConditionInput {
  condition?: string;
  name?: string;
  diagnosisDate?: string;
  severity?: string;
  controlled?: boolean;
  isControlled?: boolean;
}

export interface RawAllergyInput {
  allergen: string;
  reaction?: string;
  severity?: string;
}

export interface RawSurgeryInput {
  procedure: string;
  date?: string;
  notes?: string;
}

export interface RawMedicalHistoryInput {
  conditions?: (RawConditionInput | string)[];
  allergies?: (RawAllergyInput | string)[];
  surgeries?: RawSurgeryInput[];
  pastSurgeries?: RawSurgeryInput[];
  familyHistory?: string[] | string;
}

// ── Raw Medications Input ───────────────────────────────────────────────────

export interface RawMedicationInput {
  drugName: string;
  name?: string;          // alternate field name from some data sources
  genericName?: string;
  dosage: string;
  frequency: string;
  route?: string;
  startDate?: string;
  prescribedBy?: string;
}

export interface RawCurrentMedicationsInput {
  medications?: RawMedicationInput[];
}

// ── Raw Lifestyle Input ─────────────────────────────────────────────────────

export interface RawLifestyleInput {
  chiefComplaint: string;
  symptomDuration?: string;
  severity?: number;
  symptoms?: string[];
  smokingStatus?: string;
  packsPerDay?: number;
  packYears?: number;
  alcoholUse?: string;
  drinksPerWeek?: number;
  exerciseLevel?: string;
  exerciseMinutesPerWeek?: number;
  dietType?: string;
  stressLevel?: string;
  sleepHours?: number;
  additionalNotes?: string;
}

// ── Raw Blood Pressure Input ────────────────────────────────────────────────

export interface RawBloodPressureInput {
  systolic?: number;
  diastolic?: number;
}

// ── Frontend Response Types (what the backend sends back) ───────────────────

export interface FrontendFlaggedIssue {
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  affectedDrugs: string[];
  clinicalEvidence: string;
}

export interface FrontendRiskAssessment {
  overallRisk: string;
  riskScore: number;
  confidence: number;
  riskFactors: string[];
}

export interface FrontendRecommendation {
  drugName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  priority: string;
  requiresMonitoring: boolean;
}

export interface FrontendAlternative {
  drugName: string;
  dosage: string;
  frequency: string;
  reason: string;
  benefits: string[];
  drawbacks: string[];
  evidenceLevel: string;
}

export interface FrontendContraindication {
  drug: string;
  condition: string;
  type: string;
  reason: string;
  alternatives: string[];
}

export interface FrontendTreatmentResponse {
  recommendations: FrontendRecommendation[];
  alternatives: FrontendAlternative[];
  riskAssessment: FrontendRiskAssessment;
  flaggedIssues: FrontendFlaggedIssue[];
  contraindications: FrontendContraindication[];
  rationale: string;
  clinicalGuidelines: string[];
  evidenceSources: string[];
  status: string;
}

// ── Demo Storage Types ──────────────────────────────────────────────────────

export interface DemoCompletePatientData {
  id: string;
  patientId: string;
  age: number;
  sex: string;
  weight: number;
  height: number;
  bmi: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperature: number;
  createdAt: Date;
  medicalHistory?: {
    conditions: RawConditionInput[];
    allergies: RawAllergyInput[];
    pastSurgeries: RawSurgeryInput[];
    familyHistory: string[];
  };
  currentMedications: RawMedicationInput[];
  lifestyleFactors?: {
    smokingStatus: string;
    alcoholFrequency: string;
    exerciseFrequency: string;
    diet: string;
    chiefComplaint: string;
  };
  treatmentPlans: DemoTreatmentPlanData[];
}

export interface DemoTreatmentPlanData {
  id: string;
  patientId: string;
  treatmentData: FrontendTreatmentResponse | TreatmentPlanResponse;
  overallRisk: string;
  riskScore: number;
  confidenceScore: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoPatientSummary {
  id: string;
  patientId: string;
  age: number;
  sex: string;
  weight: number;
  height: number;
  bmi: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperature: number;
  createdAt: Date;
  medicalHistory?: {
    conditions: RawConditionInput[];
    allergies: RawAllergyInput[];
    pastSurgeries: RawSurgeryInput[];
    familyHistory: string[];
  };
  lifestyleFactors?: {
    smokingStatus: string;
    alcoholFrequency: string;
    exerciseFrequency: string;
    diet: string;
    chiefComplaint: string;
  };
  medicationCount: number;
  treatmentPlanCount: number;
}

// ── DB Record Types (for cross-validation service) ──────────────────────────

export interface DBDrugInteraction {
  drug1: string;
  drug2: string;
  severity: string;
  effect: string;
  management: string;
  toJSON: () => Record<string, unknown>;
}

export interface DBContraindication {
  drug: string;
  condition: string;
  type: string;
  reason: string;
  alternatives?: string[];
  toJSON: () => Record<string, unknown>;
}

export interface DBDosageGuideline {
  drug: string;
  maxDose: string;
  standardDose: string;
  geriatricAdjustment?: string;
  renalAdjustment?: object | string;
  toJSON: () => Record<string, unknown>;
}

// ── Safety Check Types ──────────────────────────────────────────────────────

export interface PreAnalysisSafetyResult {
  hasCriticalIssue: boolean;
  criticalIssues: FrontendFlaggedIssue[];
  recommendedAlternatives: string[];
}
