// Treatment Recommendation
export interface TreatmentRecommendation {
  medication: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  // Optional fields that may be included in AI alternative treatment responses
  reason?: string;
  benefits?: string[];
  drawbacks?: string[];
  evidenceLevel?: string;
}

// Treatment Plan
export interface TreatmentPlan {
  primaryTreatment: TreatmentRecommendation;
  alternativeTreatments: TreatmentRecommendation[];
  supportiveCare: string[];
}

// Risk Assessment
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskScore: number; // 0-100
  confidenceScore: number; // 0-100
  riskFactors: string[];
}

// Flagged Issues
export type IssueType = 'interaction' | 'contraindication' | 'dosage' | 'allergy' | 'monitoring';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface FlaggedIssue {
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  recommendation: string;
  affectedDrugs: string[];
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
  alternatives?: string[];
}

// Rationale
export interface Rationale {
  primaryChoice: string;
  riskBenefit: string;
  alternativeRationale: string;
  monitoringPlan: string;
  patientEducation: string;
}

// Complete Treatment Plan Response
export interface TreatmentPlanResponse {
  treatmentPlan: TreatmentPlan;
  riskAssessment: RiskAssessment;
  flaggedIssues: FlaggedIssue[];
  drugInteractions: DrugInteractionResult[];
  contraindications: ContraindicationResult[];
  rationale: Rationale;
  evidenceSources?: string[];
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Validation Issue
export interface ValidationIssue {
  type: 'missed_interaction' | 'missed_contraindication' | 'dosage_exceeds_max';
  severity: IssueSeverity | 'major' | 'moderate' | 'minor';
  description: string;
  localDbEntry?: object;
}

// Validation Report
export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
  recommendation: 'SAFE_TO_PROCEED' | 'REVIEW_REQUIRED';
}
