// Treatment Recommendation
export interface TreatmentRecommendation {
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  route: string;
  instructions?: string;
  priority: 'high' | 'medium' | 'low';
  rationale?: string;
  requiresMonitoring?: boolean;
}

// Risk Assessment
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

/**
 * Normalize any risk level string to the canonical lowercase format.
 * Handles: 'LOW'→'low', 'MEDIUM'→'moderate', 'MODERATE'→'moderate',
 *          'HIGH'→'high', 'CRITICAL'→'critical', 'medium'→'moderate'
 */
export function normalizeRiskLevel(level: string): RiskLevel {
  const normalized = level.toLowerCase().trim();
  if (normalized === 'medium') return 'moderate';
  if (['low', 'moderate', 'high', 'critical'].includes(normalized)) {
    return normalized as RiskLevel;
  }
  return 'low'; // safe default
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskScore: number;
  confidence: number;
  riskFactors: string[];
}

// Flagged Issues
export type IssueType = 'drug-interaction' | 'contraindication' | 'dosage-issue' | 'allergy' | 'monitoring';
export type IssueSeverity = 'critical' | 'high' | 'major' | 'moderate' | 'low' | 'minor';

export interface FlaggedIssue {
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  recommendation?: string;
  affectedDrugs?: string[];
  clinicalEvidence?: string;
}

// Alternative Treatment
export interface AlternativeTreatment {
  drugName: string;
  dosage: string;
  frequency: string;
  reason: string;
  benefits?: string[];
  drawbacks?: string[];
  evidenceLevel?: string;
}

// Drug Interaction
export interface DrugInteractionResult {
  drug1: string;
  drug2: string;
  severity: string;
  effect: string;
  management: string;
}

// Contraindication
export interface ContraindicationResult {
  drug: string;
  condition: string;
  type: string;
  reason: string;
}

// Complete Treatment Plan Response
export interface TreatmentPlanResponse {
  recommendations: TreatmentRecommendation[];
  alternatives: AlternativeTreatment[];
  riskAssessment: RiskAssessment;
  flaggedIssues: FlaggedIssue[];
  drugInteractions?: DrugInteractionResult[];
  contraindications?: ContraindicationResult[];
  rationale: string;
  clinicalGuidelines?: string[];
  evidenceSources?: string[];
  status?: 'pending' | 'approved' | 'rejected' | 'modified';
}

// Validation Types
export interface ValidationIssue {
  type: 'missed_interaction' | 'missed_contraindication' | 'dosage_exceeds_max';
  severity: IssueSeverity;
  description: string;
  localDbEntry?: object;
}

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
  recommendation: 'SAFE_TO_PROCEED' | 'REVIEW_REQUIRED';
}

// API Response Types
export interface AnalysisResponse {
  success: boolean;
  message: string;
  data: {
    treatmentPlanId: string;
    treatmentPlan: TreatmentPlanResponse;
    crossValidation: ValidationReport;
  };
}

// Medication type for compatibility
export interface Medication {
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'IV' | 'topical' | 'injection' | 'sublingual';
  startDate?: string;
  prescribedBy?: string;
}

// Complete Patient Data for API requests
export interface CompletePatientData {
  demographics: {
    patientId?: string;
    age: number;
    sex?: 'male' | 'female' | 'other';
    weight: number;
    height: number;
    bmi: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    temperature: number;
  };
  medicalHistory: {
    conditions: Array<{ name: string; diagnosisDate?: string; status: 'active' | 'resolved' | 'managed' }>;
    allergies: Array<{ allergen: string; reaction: string; severity: 'mild' | 'moderate' | 'severe' }>;
    surgeries: Array<{ name: string; date?: string; notes?: string }>;
    familyHistory: string;
  };
  currentMedications: {
    medications: Medication[];
  };
  lifestyleFactors: {
    smokingStatus: 'never' | 'former' | 'current';
    packYears?: number;
    alcoholUse: 'none' | 'occasional' | 'moderate' | 'heavy';
    drinksPerWeek?: number;
    exerciseLevel: 'sedentary' | 'light' | 'moderate' | 'active';
    dietType: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'other';
    chiefComplaint: string;
    symptomDuration?: string;
  };
}
