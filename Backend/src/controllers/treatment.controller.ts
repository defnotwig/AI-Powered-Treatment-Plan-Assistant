import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import logger from '../config/logger';
import {
  Patient,
  MedicalHistory,
  CurrentMedication,
  LifestyleFactors,
  TreatmentPlan,
  AuditLog,
} from '../models';
import { analyzeWithRetry } from '../services/openai.service';
import { validateTreatmentPlan } from '../services/validation.service';
import { crossValidateWithLocalDB } from '../services/cross-validation.service';
import {
  CompletePatientData,
  TreatmentPlanResponse,
  TreatmentRecommendation,
  ContraindicationResult,
  FlaggedIssue,
  RawDemographicsInput,
  RawMedicalHistoryInput,
  RawCurrentMedicationsInput,
  RawLifestyleInput,
  RawConditionInput,
  RawAllergyInput,
  RawSurgeryInput,
  RawMedicationInput,
  RawBloodPressureInput,
  FrontendTreatmentResponse,
} from '../types';
import { sequelize } from '../config/database';
import { config } from '../config';
import { demoStorage } from '../services/demo-storage.service';
import { adaptiveLearningService } from '../services/adaptive-learning.service';
import { invalidateCacheTags } from '../middleware/cache.middleware';

const WRITE_CACHE_TAGS = ['patients', 'analytics', 'treatment-plans'];

function invalidateWriteCaches(): void {
  invalidateCacheTags(WRITE_CACHE_TAGS);
}

async function rollbackIfActive(transaction: { rollback: () => Promise<void> }): Promise<void> {
  try {
    await transaction.rollback();
  } catch {
    // No-op: transaction is already finished.
  }
}

function ingestAdaptiveLearningSample(
  completePatientData: CompletePatientData,
  riskScore: number,
  source: string,
): void {
  try {
    adaptiveLearningService.ingestFromPatient({
      patientId: completePatientData.demographics.patientId,
      source,
      riskScore,
      demographics: completePatientData.demographics,
      medicalHistory: completePatientData.medicalHistory,
      currentMedications: completePatientData.currentMedications,
      lifestyle: completePatientData.lifestyle,
    });
  } catch (adaptiveError) {
    logger.warn('Adaptive learning ingest failed', { error: (adaptiveError as Error).message });
  }
}

// Helper to build family history array from non-array value
function buildFamilyHistoryArray(value: unknown): string[] {
  if (value) return [value as string];
  return [];
}

type PatientSex = 'male' | 'female' | 'other';
type MedicationRoute = 'oral' | 'IV' | 'topical' | 'injection' | 'sublingual';
type SmokingStatus = 'never' | 'former' | 'current';
type AlcoholFrequency = 'none' | 'occasional' | 'moderate' | 'heavy';
type ExerciseFrequency = 'sedentary' | 'light' | 'moderate' | 'active';
type DietType = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'other';
type ConditionSeverity = 'mild' | 'moderate' | 'severe';
type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'anaphylaxis';

function normalizeSex(value?: string): PatientSex {
  if (value === 'male' || value === 'female') return value;
  return 'other';
}

function normalizeRoute(value?: string): MedicationRoute {
  if (value === 'IV' || value === 'topical' || value === 'injection' || value === 'sublingual') {
    return value;
  }
  return 'oral';
}

function normalizeSmokingStatus(value?: string): SmokingStatus {
  if (value === 'former' || value === 'current') return value;
  return 'never';
}

function normalizeAlcoholFrequency(value?: string): AlcoholFrequency {
  if (value === 'occasional' || value === 'moderate' || value === 'heavy') return value;
  return 'none';
}

function normalizeExerciseFrequency(value?: string): ExerciseFrequency {
  if (value === 'light' || value === 'moderate' || value === 'active') return value;
  return 'sedentary';
}

function normalizeDiet(value?: string): DietType {
  if (value === 'vegetarian' || value === 'vegan' || value === 'keto' || value === 'other') return value;
  return 'standard';
}

function normalizeConditionSeverity(value?: string): ConditionSeverity {
  if (value === 'mild' || value === 'severe') return value;
  return 'moderate';
}

function normalizeAllergySeverity(value?: string): AllergySeverity {
  if (value === 'mild' || value === 'severe' || value === 'anaphylaxis') return value;
  return 'moderate';
}

function normalizeConditions(medicalHistory?: RawMedicalHistoryInput) {
  return (medicalHistory?.conditions || []).map((condition: RawConditionInput | string) => ({
    condition: typeof condition === 'string' ? condition : (condition.name || condition.condition || ''),
    diagnosisDate: typeof condition === 'string' ? '' : (condition.diagnosisDate || ''),
    severity: normalizeConditionSeverity(typeof condition === 'string' ? undefined : condition.severity),
    controlled: typeof condition === 'string' ? false : (condition.isControlled ?? condition.controlled ?? false),
  }));
}

function normalizeAllergies(medicalHistory?: RawMedicalHistoryInput) {
  return (medicalHistory?.allergies || []).map((allergy: RawAllergyInput | string) => ({
    allergen: typeof allergy === 'string' ? allergy : allergy.allergen,
    reaction: typeof allergy === 'string' ? '' : (allergy.reaction || ''),
    severity: normalizeAllergySeverity(typeof allergy === 'string' ? undefined : allergy.severity),
  }));
}

function normalizeSurgeries(medicalHistory?: RawMedicalHistoryInput) {
  return (medicalHistory?.surgeries || medicalHistory?.pastSurgeries || []).map((surgery: RawSurgeryInput | string) => ({
    procedure: typeof surgery === 'string' ? surgery : surgery.procedure,
    date: typeof surgery === 'string' ? '' : (surgery.date || ''),
  }));
}

function normalizeFamilyHistory(medicalHistory?: RawMedicalHistoryInput): string[] {
  return Array.isArray(medicalHistory?.familyHistory)
    ? medicalHistory.familyHistory
    : buildFamilyHistoryArray(medicalHistory?.familyHistory);
}

function normalizeCurrentMedications(currentMedications?: RawCurrentMedicationsInput) {
  return (currentMedications?.medications || []).map((medication: RawMedicationInput) => ({
    drugName: medication.drugName,
    genericName: medication.genericName || medication.drugName.toLowerCase(),
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: normalizeRoute(medication.route),
    startDate: medication.startDate || '',
    prescribedBy: medication.prescribedBy || '',
  }));
}

// Helper to determine severity from issue description
function getSeverityFromDescription(issue: string): string {
  if (issue.toUpperCase().includes('MODERATE')) return 'moderate';
  return 'low';
}

// Helper function to build complete patient data from request
function buildCompletePatientData(
  patientId: string,
  demographics: RawDemographicsInput,
  medicalHistory: RawMedicalHistoryInput | undefined,
  currentMedications: RawCurrentMedicationsInput | undefined,
  lifestyleFactors: RawLifestyleInput
): CompletePatientData {
  const conditions = normalizeConditions(medicalHistory);
  const allergies = normalizeAllergies(medicalHistory);
  const pastSurgeries = normalizeSurgeries(medicalHistory);
  const familyHistory = normalizeFamilyHistory(medicalHistory);
  const medications = normalizeCurrentMedications(currentMedications);

  return {
    demographics: {
      patientId,
      age: demographics.age,
      sex: normalizeSex(demographics.sex),
      weight: demographics.weight,
      height: demographics.height,
      bmi: demographics.bmi || (demographics.weight / Math.pow(demographics.height / 100, 2)),
      bloodPressure: {
        systolic: demographics.bloodPressure?.systolic ?? 120,
        diastolic: demographics.bloodPressure?.diastolic ?? 80,
      },
      heartRate: demographics.heartRate || 72,
      temperature: demographics.temperature || 98.6,
    },
    medicalHistory: {
      conditions,
      allergies,
      pastSurgeries,
      familyHistory,
    },
    currentMedications: {
      medications,
    },
    lifestyle: {
      smoking: {
        status: normalizeSmokingStatus(lifestyleFactors.smokingStatus),
        packsPerDay: lifestyleFactors.packsPerDay,
        years: lifestyleFactors.packYears,
      },
      alcohol: {
        frequency: normalizeAlcoholFrequency(lifestyleFactors.alcoholUse),
        drinksPerWeek: lifestyleFactors.drinksPerWeek,
      },
      exercise: {
        frequency: normalizeExerciseFrequency(lifestyleFactors.exerciseLevel),
        minutesPerWeek: lifestyleFactors.exerciseMinutesPerWeek,
      },
      diet: normalizeDiet(lifestyleFactors.dietType),
      chiefComplaint: {
        complaint: lifestyleFactors.chiefComplaint || '',
        duration: lifestyleFactors.symptomDuration || '',
        severity: (lifestyleFactors.severity || 3) as 1 | 2 | 3 | 4 | 5,
        symptoms: lifestyleFactors.symptoms || [],
      },
    },
  };
}

// Helper function to transform AI response to frontend format
function transformToFrontendResponse(aiResponse: TreatmentPlanResponse) {
  // First, parse and normalize flagged issues
  const rawIssues = (aiResponse.flaggedIssues || []) as (FlaggedIssue | string)[];
  const flaggedIssues = rawIssues.map((issue) => {
    // Handle both string and object formats from AI
    if (typeof issue === 'string') {
      // Parse string format like "HIGH RISK: Description..."
      const isCritical = issue.toUpperCase().includes('CRITICAL') ||
        issue.toUpperCase().includes('ABSOLUTE') ||
        issue.toUpperCase().includes('CONTRAINDICATED') ||
        (issue.toUpperCase().includes('NITROGLYCERIN') && issue.toUpperCase().includes('SILDENAFIL'));
      const isHighRisk = issue.toUpperCase().includes('HIGH RISK') ||
        issue.toUpperCase().includes('MAJOR');

      let severity: string;
      if (isCritical) {
        severity = 'critical';
      } else if (isHighRisk) {
        severity = 'high';
      } else {
        severity = getSeverityFromDescription(issue);
      }

      return {
        type: 'contraindication' as const,
        severity: severity,
        title: isCritical ? '⚠️ CRITICAL Drug Safety Alert' : 'Drug Safety Alert',
        description: issue,
        recommendation: isCritical ?
          'DO NOT PROCEED - Consult healthcare provider immediately. This combination can be life-threatening.' :
          'Consult healthcare provider',
        affectedDrugs: [] as string[],
        clinicalEvidence: 'Based on clinical guidelines and drug interaction database',
      };
    }

    const issueType = issue.type || 'general';
    const isCriticalIssue = issue.severity === 'critical' ||
      issue.description?.toUpperCase().includes('CONTRAINDICATED');
    return {
      type: issueType === 'interaction' ? 'drug-interaction' as const : issueType,
      severity: isCriticalIssue ? 'critical' : (issue.severity || 'moderate'),
      title: isCriticalIssue ?
        `⚠️ CRITICAL ${issueType.charAt(0).toUpperCase() + issueType.slice(1)} Alert` :
        `${issueType.charAt(0).toUpperCase() + issueType.slice(1)} Alert`,
      description: issue.description || 'No description available',
      recommendation: issue.recommendation || 'Consult healthcare provider',
      affectedDrugs: issue.affectedDrugs || [],
      clinicalEvidence: 'Based on clinical guidelines and drug interaction database',
    };
  });

  // SAFETY CHECK: Determine if there are any critical issues
  const hasCriticalIssue = flaggedIssues.some(issue =>
    issue.severity === 'critical' ||
    (issue.description && (
      issue.description.toUpperCase().includes('CONTRAINDICATED') ||
      issue.description.toUpperCase().includes('ABSOLUTE') ||
      issue.description.toUpperCase().includes('LIFE-THREATENING') ||
      (issue.description.toUpperCase().includes('NITROGLYCERIN') &&
        issue.description.toUpperCase().includes('SILDENAFIL'))
    ))
  );

  const hasHighRiskIssue = flaggedIssues.some(issue =>
    issue.severity === 'high' || issue.severity === 'major'
  );

  // Override AI risk assessment if critical safety issues are detected
  let finalRiskLevel = (aiResponse.riskAssessment?.overallRisk || 'low').toLowerCase();
  let finalRiskScore = aiResponse.riskAssessment?.riskScore || 0;

  if (hasCriticalIssue && finalRiskLevel !== 'critical') {
    logger.warn('SAFETY OVERRIDE: Critical issue detected, upgrading risk level to CRITICAL');
    finalRiskLevel = 'critical';
    finalRiskScore = Math.max(finalRiskScore, 90);
  } else if (hasHighRiskIssue && (finalRiskLevel === 'low' || finalRiskLevel === 'moderate')) {
    logger.warn('SAFETY OVERRIDE: High risk issue detected, upgrading risk level to HIGH');
    finalRiskLevel = 'high';
    finalRiskScore = Math.max(finalRiskScore, 70);
  }

  return {
    recommendations: aiResponse.treatmentPlan?.primaryTreatment
      ? [{
        drugName: aiResponse.treatmentPlan.primaryTreatment.medication,
        genericName: aiResponse.treatmentPlan.primaryTreatment.genericName,
        dosage: aiResponse.treatmentPlan.primaryTreatment.dosage,
        frequency: aiResponse.treatmentPlan.primaryTreatment.frequency,
        duration: aiResponse.treatmentPlan.primaryTreatment.duration,
        route: aiResponse.treatmentPlan.primaryTreatment.route,
        instructions: aiResponse.treatmentPlan.primaryTreatment.instructions,
        priority: 'high',
        requiresMonitoring: true,
      }, ...(aiResponse.treatmentPlan.alternativeTreatments || []).map((alt: TreatmentRecommendation) => ({
        drugName: alt.medication,
        genericName: alt.genericName,
        dosage: alt.dosage,
        frequency: alt.frequency,
        duration: alt.duration,
        route: alt.route,
        instructions: alt.instructions,
        priority: 'medium',
        requiresMonitoring: false,
      }))]
      : [],
    alternatives: (aiResponse.treatmentPlan?.alternativeTreatments || []).map((alt: TreatmentRecommendation) => ({
      drugName: alt.medication,
      dosage: alt.dosage,
      frequency: alt.frequency,
      reason: alt.reason || 'Alternative option based on patient profile',
      benefits: alt.benefits || ['May have fewer side effects'],
      drawbacks: alt.drawbacks || ['May require more monitoring'],
      evidenceLevel: alt.evidenceLevel || 'Moderate',
    })),
    riskAssessment: {
      overallRisk: finalRiskLevel as 'low' | 'moderate' | 'high' | 'critical',
      riskScore: finalRiskScore,
      confidence: aiResponse.riskAssessment?.confidenceScore || 80,
      riskFactors: aiResponse.riskAssessment?.riskFactors || [],
    },
    flaggedIssues,
    // Also add contraindications from the AI response
    contraindications: (aiResponse.contraindications || []).map((c: ContraindicationResult) => ({
      drug: c.drug || '',
      condition: c.condition || '',
      type: c.type || 'relative',
      reason: c.reason || '',
      alternatives: c.alternatives || [],
    })),
    rationale: aiResponse.rationale?.primaryChoice || 'Treatment plan generated based on patient assessment',
    clinicalGuidelines: [
      aiResponse.rationale?.monitoringPlan || 'Follow standard monitoring protocols',
      aiResponse.rationale?.patientEducation || 'Provide patient education materials',
    ],
    evidenceSources: aiResponse.evidenceSources && aiResponse.evidenceSources.length > 0
      ? aiResponse.evidenceSources
      : ['FDA Drug Database', 'Clinical Practice Guidelines'],
    status: 'pending',
  };
}

// CRITICAL SAFETY CHECK: Pre-analysis validation for known dangerous drug combinations
// This runs BEFORE AI analysis to ensure absolute contraindications are flagged
interface PreAnalysisSafetyResult {
  hasCriticalIssue: boolean;
  criticalIssues: Array<{
    type: string;
    severity: 'critical';
    title: string;
    description: string;
    recommendation: string;
    affectedDrugs: string[];
    clinicalEvidence: string;
  }>;
  recommendedAlternatives: string[];
}

const CRITICAL_DRUG_INTERACTIONS = [
  {
    drug1: ['sildenafil', 'tadalafil', 'vardenafil', 'avanafil'],
    drug2: ['nitroglycerin', 'isosorbide', 'nitrate', 'nitroprusside'],
    effect: 'LIFE-THREATENING HYPOTENSION',
    reason: 'PDE5 inhibitors combined with nitrates cause profound hypotension that can be fatal',
    alternatives: ['Vacuum erection devices', 'Alprostadil injection', 'Penile implant consultation']
  },
  {
    drug1: ['warfarin'],
    drug2: ['aspirin', 'ibuprofen', 'naproxen'],
    effect: 'SEVERE BLEEDING RISK',
    reason: 'Combined anticoagulant and antiplatelet effects dramatically increase bleeding risk',
    alternatives: ['Acetaminophen for pain', 'Consult anticoagulation clinic']
  },
  {
    drug1: ['methotrexate'],
    drug2: ['trimethoprim', 'bactrim'],
    effect: 'BONE MARROW SUPPRESSION',
    reason: 'Both drugs inhibit folate metabolism, leading to severe myelosuppression',
    alternatives: ['Alternative antibiotics', 'Hold methotrexate during infection']
  }
];

function performPreAnalysisSafetyCheck(
  currentMedications: RawMedicationInput[],
  chiefComplaint: string
): PreAnalysisSafetyResult {
  const result: PreAnalysisSafetyResult = {
    hasCriticalIssue: false,
    criticalIssues: [],
    recommendedAlternatives: []
  };

  // Normalize medication names
  const currentDrugNames = currentMedications.map((m: RawMedicationInput) =>
    (m.drugName || m.name || '').toLowerCase()
  );
  const complaintLower = (chiefComplaint || '').toLowerCase();

  // Check for ED treatment request with nitrate use
  const isEDRequest = complaintLower.includes('erectile') ||
    complaintLower.includes('ed ') ||
    complaintLower.includes('sexual dysfunction') ||
    complaintLower.includes('impotence');

  const hasNitrate = currentDrugNames.some(drug =>
    drug.includes('nitroglycerin') ||
    drug.includes('isosorbide') ||
    drug.includes('nitrate')
  );

  if (isEDRequest && hasNitrate) {
    result.hasCriticalIssue = true;
    result.criticalIssues.push({
      type: 'contraindication',
      severity: 'critical',
      title: '⛔ ABSOLUTE CONTRAINDICATION - PDE5 Inhibitors with Nitrates',
      description: 'Patient is requesting ED treatment but is currently on nitrate therapy (nitroglycerin). ALL PDE5 inhibitors (Sildenafil/Viagra, Tadalafil/Cialis, Vardenafil/Levitra) are ABSOLUTELY CONTRAINDICATED. This combination can cause life-threatening hypotension and cardiovascular collapse.',
      recommendation: 'DO NOT prescribe any PDE5 inhibitor. Consider non-pharmacological alternatives: Vacuum Erection Devices, Alprostadil (intracavernosal injection), or referral to urology for penile prosthesis evaluation. Cardiology consultation recommended for managing concurrent cardiac disease and ED.',
      affectedDrugs: ['sildenafil', 'tadalafil', 'vardenafil', 'nitroglycerin'],
      clinicalEvidence: 'FDA Black Box Warning. Cheitlin MD, et al. Circulation. 1999. ACC/AHA Guidelines on PDE5 inhibitor contraindications with nitrates.'
    });
    result.recommendedAlternatives = [
      'Vacuum Erection Device (VED)',
      'Alprostadil (Caverject/Muse)',
      'Urology referral for prosthesis'
    ];
  }

  // Check for other critical interactions in current medications
  for (const interaction of CRITICAL_DRUG_INTERACTIONS) {
    const hasDrug1 = currentDrugNames.some(drug =>
      interaction.drug1.some(d => drug.includes(d))
    );
    const hasDrug2 = currentDrugNames.some(drug =>
      interaction.drug2.some(d => drug.includes(d))
    );

    if (hasDrug1 && hasDrug2) {
      result.hasCriticalIssue = true;
      const drug1Match = currentDrugNames.find(drug =>
        interaction.drug1.some(d => drug.includes(d))
      ) || interaction.drug1[0];
      const drug2Match = currentDrugNames.find(drug =>
        interaction.drug2.some(d => drug.includes(d))
      ) || interaction.drug2[0];

      result.criticalIssues.push({
        type: 'drug-interaction',
        severity: 'critical',
        title: `⚠️ CRITICAL DRUG INTERACTION: ${interaction.effect}`,
        description: `Patient is currently taking ${drug1Match} and ${drug2Match}. ${interaction.reason}`,
        recommendation: `Consider alternatives: ${interaction.alternatives.join(', ')}`,
        affectedDrugs: [drug1Match, drug2Match],
        clinicalEvidence: 'Based on FDA drug interaction database and clinical guidelines'
      });
    }
  }

  return result;
}

// Helper function for input validation and sanitization
function validateBloodPressure(bp: RawBloodPressureInput | undefined): string[] {
  const errors: string[] = [];
  if (!bp) return errors;
  const { systolic, diastolic } = bp;
  if (systolic !== undefined && (systolic < 50 || systolic > 300)) {
    errors.push('Systolic blood pressure must be between 50 and 300 mmHg');
  }
  if (diastolic !== undefined && (diastolic < 30 || diastolic > 200)) {
    errors.push('Diastolic blood pressure must be between 30 and 200 mmHg');
  }
  if (systolic !== undefined && diastolic !== undefined && diastolic >= systolic) {
    errors.push('Diastolic blood pressure must be less than systolic');
  }
  return errors;
}

function validateTemperature(temp: number | undefined): string[] {
  if (temp === undefined) return [];
  const isValidCelsius = temp >= 30 && temp <= 45;
  const isValidFahrenheit = temp >= 86 && temp <= 113;
  if (!isValidCelsius && !isValidFahrenheit) {
    return ['Temperature must be between 30-45°C or 86-113°F'];
  }
  return [];
}

function validateDemographics(demographics: RawDemographicsInput): string[] {
  const errors: string[] = [];

  if (demographics.age === undefined || demographics.age === null) {
    errors.push('Age is required');
  } else if (typeof demographics.age !== 'number' || demographics.age < 0 || demographics.age > 150) {
    errors.push('Age must be a number between 0 and 150');
  }

  if (demographics.weight === undefined || demographics.weight === null) {
    errors.push('Weight is required');
  } else if (typeof demographics.weight !== 'number' || demographics.weight <= 0 || demographics.weight > 700) {
    errors.push('Weight must be a positive number (max 700 kg)');
  }

  if (demographics.height === undefined || demographics.height === null) {
    errors.push('Height is required');
  } else if (typeof demographics.height !== 'number' || demographics.height <= 0 || demographics.height > 300) {
    errors.push('Height must be a positive number (max 300 cm)');
  }

  errors.push(...validateBloodPressure(demographics.bloodPressure));

  if (demographics.heartRate !== undefined && (demographics.heartRate < 20 || demographics.heartRate > 300)) {
    errors.push('Heart rate must be between 20 and 300 bpm');
  }

  errors.push(...validateTemperature(demographics.temperature));

  return errors;
}

function validateLifestyle(lifestyleFactors: RawLifestyleInput): string[] {
  const errors: string[] = [];
  if (!lifestyleFactors.chiefComplaint || typeof lifestyleFactors.chiefComplaint !== 'string') {
    errors.push('Chief complaint is required');
  } else if (lifestyleFactors.chiefComplaint.length > 5000) {
    errors.push('Chief complaint must be less than 5000 characters');
  }
  return errors;
}

function validateAndSanitizeInput(demographics: RawDemographicsInput | undefined, lifestyleFactors: RawLifestyleInput | undefined): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (demographics) {
    errors.push(...validateDemographics(demographics));
  } else {
    errors.push('Demographics data is required');
  }

  if (lifestyleFactors) {
    errors.push(...validateLifestyle(lifestyleFactors));
  } else {
    errors.push('Lifestyle factors are required');
  }

  return { isValid: errors.length === 0, errors };
}

// Helper function to sanitize string inputs (XSS prevention)
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;')
    .replaceAll('/', '&#x2F;');
}

/** Merge pre-analysis safety results into the frontend response */
function mergeSafetyIntoResponse(
  response: FrontendTreatmentResponse,
  safety: PreAnalysisSafetyResult,
): void {
  if (!safety.hasCriticalIssue) return;

  response.flaggedIssues = [...safety.criticalIssues, ...response.flaggedIssues];
  response.riskAssessment = {
    ...response.riskAssessment,
    overallRisk: 'critical',
    riskScore: Math.max(response.riskAssessment.riskScore, 95),
    riskFactors: [
      ...safety.criticalIssues.map(i => i.title),
      ...response.riskAssessment.riskFactors,
    ],
  };

  applyNitrateOverride(response, safety);
}

/** Override recommendations if nitrate contraindication is detected */
function applyNitrateOverride(
  response: FrontendTreatmentResponse,
  safety: PreAnalysisSafetyResult,
): void {
  const hasNitrateContraindication = safety.criticalIssues.some(
    i => i.description.includes('nitrate') || i.description.includes('nitroglycerin'),
  );
  if (!hasNitrateContraindication) return;

  response.recommendations = [
    {
      drugName: '⛔ NO PDE5 INHIBITORS - CONTRAINDICATED',
      genericName: 'contraindicated',
      dosage: 'N/A',
      frequency: 'N/A',
      duration: 'N/A',
      route: 'N/A',
      instructions: 'ALL PDE5 inhibitors (sildenafil, tadalafil, vardenafil) are ABSOLUTELY CONTRAINDICATED due to concurrent nitrate therapy. See alternatives below.',
      priority: 'high',
      requiresMonitoring: true,
    },
    {
      drugName: 'Vacuum Erection Device (VED)',
      genericName: 'mechanical device',
      dosage: 'N/A',
      frequency: 'As needed',
      duration: 'Long-term',
      route: 'External',
      instructions: 'Non-pharmacological option safe with nitrate therapy. Use as directed.',
      priority: 'medium',
      requiresMonitoring: false,
    },
    {
      drugName: 'Alprostadil (Caverject)',
      genericName: 'alprostadil',
      dosage: '10-20mcg',
      frequency: 'As needed',
      duration: 'PRN',
      route: 'Intracavernosal injection',
      instructions: 'Alternative for ED that works via different mechanism. Safe with nitrates. Requires training for self-injection.',
      priority: 'medium',
      requiresMonitoring: false,
    },
  ];

  response.alternatives = [
    {
      drugName: 'Vacuum Erection Device',
      dosage: 'N/A',
      frequency: 'As needed',
      reason: 'Safe mechanical alternative for patients on nitrate therapy',
      benefits: ['No drug interactions', 'Reusable', 'Immediate effect'],
      drawbacks: ['Requires manual operation', 'May feel unnatural'],
      evidenceLevel: 'High',
    },
    {
      drugName: 'Alprostadil Injection',
      dosage: '10-20mcg',
      frequency: 'As needed',
      reason: 'Prostaglandin-based ED treatment safe with nitrates',
      benefits: ['Effective', 'Works via different mechanism'],
      drawbacks: ['Requires injection', 'Possible penile pain'],
      evidenceLevel: 'High',
    },
    {
      drugName: 'Urology Referral',
      dosage: 'N/A',
      frequency: 'One-time consultation',
      reason: 'For evaluation of penile prosthesis or other surgical options',
      benefits: ['Permanent solution', 'High satisfaction rates'],
      drawbacks: ['Surgical procedure', 'Irreversible'],
      evidenceLevel: 'Moderate',
    },
  ];

  response.rationale = 'PDE5 inhibitors (Sildenafil, Tadalafil, Vardenafil) are ABSOLUTELY CONTRAINDICATED in this patient due to concurrent nitrate (nitroglycerin) therapy. The combination can cause life-threatening hypotension. Non-pharmacological alternatives (VED) and prostaglandin-based treatments (Alprostadil) are recommended as they work via different mechanisms and are safe with nitrates.';
}

/** Store patient data in demo in-memory storage, returns demo patient ID */
function storeDemoPatientData(
  demographics: RawDemographicsInput,
  medicalHistory: RawMedicalHistoryInput | undefined,
  currentMedications: RawCurrentMedicationsInput | undefined,
  lifestyleFactors: RawLifestyleInput,
): string {
  const patient = demoStorage.createPatient({
    patientId: demographics.patientId || `PT-${Date.now()}`,
    age: demographics.age,
    sex: normalizeSex(demographics.sex),
    weight: demographics.weight,
    height: demographics.height,
    bmi: demographics.bmi || (demographics.weight / Math.pow(demographics.height / 100, 2)),
    systolicBp: demographics.bloodPressure?.systolic || 120,
    diastolicBp: demographics.bloodPressure?.diastolic || 80,
    heartRate: demographics.heartRate || 72,
    temperature: demographics.temperature || 98.6,
  });

  const patientId = patient.id;

  if (medicalHistory) {
    demoStorage.createMedicalHistory({
      patientId,
      conditions: normalizeConditions(medicalHistory),
      allergies: normalizeAllergies(medicalHistory),
      pastSurgeries: normalizeSurgeries(medicalHistory),
      familyHistory: normalizeFamilyHistory(medicalHistory),
    });
  }

  if (currentMedications?.medications) {
    for (const med of normalizeCurrentMedications(currentMedications)) {
      demoStorage.addMedication(patientId, {
        drugName: med.drugName,
        genericName: med.genericName,
        dosage: med.dosage,
        frequency: med.frequency,
        route: med.route,
        startDate: med.startDate,
        prescribedBy: med.prescribedBy,
      });
    }
  }

  if (lifestyleFactors) {
    demoStorage.createLifestyle({
      patientId,
      smokingStatus: normalizeSmokingStatus(lifestyleFactors.smokingStatus),
      smokingPacksPerDay: lifestyleFactors.packYears,
      smokingYears: lifestyleFactors.packYears,
      alcoholFrequency: normalizeAlcoholFrequency(lifestyleFactors.alcoholUse),
      alcoholDrinksPerWeek: lifestyleFactors.drinksPerWeek,
      exerciseFrequency: normalizeExerciseFrequency(lifestyleFactors.exerciseLevel),
      exerciseMinutesPerWeek: lifestyleFactors.exerciseMinutesPerWeek,
      diet: normalizeDiet(lifestyleFactors.dietType),
      chiefComplaint: lifestyleFactors.chiefComplaint || '',
      symptomDuration: lifestyleFactors.symptomDuration,
    });
  }

  return patientId;
}

// Helper: handle production mode analysis with database transaction
async function handleProductionModeAnalysis(
  demographics: RawDemographicsInput,
  medicalHistory: RawMedicalHistoryInput | undefined,
  currentMedications: RawCurrentMedicationsInput | undefined,
  lifestyleFactors: RawLifestyleInput,
  req: Request,
  res: Response,
): Promise<void> {
  const transaction = await sequelize.transaction();

  try {
    const patient = await Patient.create({
      age: demographics.age,
      sex: normalizeSex(demographics.sex),
      weight: demographics.weight,
      height: demographics.height,
      bmi: demographics.bmi || (demographics.weight / Math.pow(demographics.height / 100, 2)),
      systolicBp: demographics.bloodPressure?.systolic || 0,
      diastolicBp: demographics.bloodPressure?.diastolic || 0,
      heartRate: demographics.heartRate || 0,
      temperature: demographics.temperature || 98.6,
    }, { transaction });

    await MedicalHistory.create({
      patientId: patient.id,
      conditions: normalizeConditions(medicalHistory),
      allergies: normalizeAllergies(medicalHistory),
      pastSurgeries: normalizeSurgeries(medicalHistory),
      familyHistory: normalizeFamilyHistory(medicalHistory),
    }, { transaction });

    await createMedicationRecords(patient.id, currentMedications, transaction);

    await LifestyleFactors.create({
      patientId: patient.id,
      smokingStatus: normalizeSmokingStatus(lifestyleFactors.smokingStatus),
      smokingPacksPerDay: lifestyleFactors.packYears ? lifestyleFactors.packYears / 20 : null,
      smokingYears: lifestyleFactors.packYears ? 20 : null,
      alcoholFrequency: normalizeAlcoholFrequency(lifestyleFactors.alcoholUse),
      alcoholDrinksPerWeek: lifestyleFactors.drinksPerWeek || null,
      exerciseFrequency: normalizeExerciseFrequency(lifestyleFactors.exerciseLevel),
      exerciseMinutesPerWeek: null,
      diet: normalizeDiet(lifestyleFactors.dietType),
      chiefComplaint: {
        complaint: lifestyleFactors.chiefComplaint || '',
        duration: lifestyleFactors.symptomDuration || '',
        severity: 3,
        symptoms: [],
      },
    }, { transaction });

    const completePatientData = buildCompletePatientData(
      patient.id, demographics, medicalHistory, currentMedications, lifestyleFactors
    );

    const aiResponse = await analyzeWithRetry(completePatientData);
    await crossValidateWithLocalDB(aiResponse, completePatientData);
    ingestAdaptiveLearningSample(
      completePatientData,
      aiResponse.riskAssessment?.riskScore || 0,
      'analysis-production-new-patient',
    );

    const treatmentPlan = await TreatmentPlan.create({
      patientId: patient.id,
      treatmentData: aiResponse,
      overallRisk: aiResponse.riskAssessment.overallRisk,
      riskScore: aiResponse.riskAssessment.riskScore,
      confidenceScore: aiResponse.riskAssessment.confidenceScore,
      status: 'pending',
    }, { transaction });

    await AuditLog.create({
      timestamp: new Date(),
      userId: 'system',
      userName: 'System',
      action: 'created',
      patientId: patient.id,
      treatmentPlanId: treatmentPlan.id,
      riskLevel: aiResponse.riskAssessment.overallRisk,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
    }, { transaction });

    await transaction.commit();
    invalidateWriteCaches();

    const frontendResponse = transformToFrontendResponse(aiResponse);

    res.json({
      success: true,
      message: 'Treatment plan generated successfully',
      patient: { id: patient.id },
      treatmentPlan: frontendResponse,
    });
  } catch (dbError) {
    await rollbackIfActive(transaction);
    throw dbError;
  }
}

// Helper: create medication records in a transaction
async function createMedicationRecords(
  patientId: string,
  currentMedications: RawCurrentMedicationsInput | undefined,
  transaction: Transaction,
): Promise<void> {
  const meds = normalizeCurrentMedications(currentMedications);
  if (!meds) return;

  for (const med of meds) {
    await CurrentMedication.create({
      patientId,
      drugName: med.drugName,
      genericName: med.genericName,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route,
      startDate: med.startDate,
      prescribedBy: med.prescribedBy,
    }, { transaction });
  }
}

// Analyze new patient (create patient and generate treatment plan)
export const analyzeNewPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.debug('Incoming request body', { bodyPreview: JSON.stringify(req.body).substring(0, 500) });

    const { demographics, medicalHistory, currentMedications, lifestyleFactors } = req.body;

    logger.debug('Parsed fields', {
      demographics: demographics ? 'present' : 'missing',
      medicalHistory: medicalHistory ? 'present' : 'missing',
      currentMedications: currentMedications ? 'present' : 'missing',
      lifestyleFactors: lifestyleFactors ? 'present' : 'missing',
    });

    // Validate required fields
    if (!demographics || !lifestyleFactors) {
      logger.warn('Missing required fields', { demographics: !demographics, lifestyleFactors: !lifestyleFactors });
      res.status(400).json({
        success: false,
        message: 'Missing required patient data',
        debug: { hasDemo: !!demographics, hasLifestyle: !!lifestyleFactors }
      });
      return;
    }

    // CRITICAL: Comprehensive input validation
    const validation = validateAndSanitizeInput(demographics, lifestyleFactors);
    logger.debug('Validation result', { isValid: validation.isValid, errors: validation.errors });

    if (!validation.isValid) {
      logger.warn('Validation failed', { errors: validation.errors });
      res.status(400).json({
        success: false,
        message: 'Invalid patient data',
        errors: validation.errors,
      });
      return;
    }

    // Sanitize text inputs to prevent XSS
    if (lifestyleFactors.chiefComplaint) {
      lifestyleFactors.chiefComplaint = sanitizeString(lifestyleFactors.chiefComplaint);
    }

    // CRITICAL: Perform pre-analysis safety check for known dangerous combinations
    const medications = currentMedications?.medications || [];
    const chiefComplaint = lifestyleFactors?.chiefComplaint || '';
    const preAnalysisSafety = performPreAnalysisSafetyCheck(medications, chiefComplaint);

    if (preAnalysisSafety.hasCriticalIssue) {
      logger.error('PRE-ANALYSIS SAFETY CHECK: Critical issue detected', { criticalIssues: preAnalysisSafety.criticalIssues });
    }

    // DEMO MODE: Skip database operations
    if (config.demoMode) {
      const patientId = storeDemoPatientData(demographics, medicalHistory, currentMedications, lifestyleFactors);

      // Build complete patient data for AI analysis
      const completePatientData = buildCompletePatientData(
        patientId,
        demographics,
        medicalHistory,
        currentMedications,
        lifestyleFactors
      );

      // Call AI for analysis (will use mock if no API key)
      const aiResponse = await analyzeWithRetry(completePatientData);
      ingestAdaptiveLearningSample(
        completePatientData,
        aiResponse.riskAssessment?.riskScore || 0,
        'analysis-demo-new-patient',
      );

      // Store treatment plan in demo storage
      demoStorage.createTreatmentPlan({
        patientId,
        treatmentData: aiResponse,
        overallRisk: aiResponse.riskAssessment?.overallRisk || 'low',
        riskScore: aiResponse.riskAssessment?.riskScore || 0,
        confidenceScore: aiResponse.riskAssessment?.confidenceScore || 80,
        status: 'pending',
      });
      invalidateWriteCaches();

      // Transform and respond
      const frontendResponse = transformToFrontendResponse(aiResponse);

      // CRITICAL: Merge pre-analysis safety issues into the response
      mergeSafetyIntoResponse(frontendResponse, preAnalysisSafety);

      res.json({
        success: true,
        message: preAnalysisSafety.hasCriticalIssue
          ? '⚠️ CRITICAL SAFETY ALERT: Treatment plan generated with critical contraindication warnings'
          : 'Treatment plan generated successfully (Demo Mode - using in-memory storage, AI is active)',
        patient: { id: patientId },
        treatmentPlan: frontendResponse,
        demoMode: true,
        aiEnabled: true,
        criticalSafetyAlert: preAnalysisSafety.hasCriticalIssue,
      });
      return;
    }

    // PRODUCTION MODE: Use database
    await handleProductionModeAnalysis(demographics, medicalHistory, currentMedications, lifestyleFactors, req, res);
  } catch (error) {
    logger.error('Analyze new patient error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze patient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Analyze existing patient and generate treatment plan
export const analyzePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    // DEMO MODE
    if (config.demoMode) {
      const demoPatient = demoStorage.getCompletePatientData(patientId);
      if (!demoPatient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found (Demo Mode)',
        });
        return;
      }

      // Generate treatment plan for demo patient
      const completePatientData = buildCompletePatientData(
        patientId,
        demoPatient,
        demoPatient.medicalHistory || {},
        { medications: demoPatient.currentMedications || [] },
        demoPatient.lifestyleFactors || { chiefComplaint: 'General wellness check' }
      );

      const aiResponse = await analyzeWithRetry(completePatientData);
      ingestAdaptiveLearningSample(
        completePatientData,
        aiResponse.riskAssessment?.riskScore || 0,
        'analysis-demo-existing-patient',
      );
      const storedPlan = demoStorage.createTreatmentPlan({
        patientId,
        treatmentData: aiResponse,
        overallRisk: aiResponse.riskAssessment?.overallRisk || 'low',
        riskScore: aiResponse.riskAssessment?.riskScore || 0,
        confidenceScore: aiResponse.riskAssessment?.confidenceScore || 80,
        status: 'pending',
      });
      invalidateWriteCaches();
      const frontendResponse = transformToFrontendResponse(aiResponse);

      res.json({
        success: true,
        message: 'Treatment plan generated (Demo Mode)',
        data: {
          treatmentPlanId: storedPlan.id,
          treatmentPlan: frontendResponse,
        },
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const transaction = await sequelize.transaction();

    try {
      // Fetch patient with all related data
      const patient = await Patient.findByPk(patientId, {
        include: [
          { model: MedicalHistory, as: 'medicalHistory' },
          { model: CurrentMedication, as: 'currentMedications' },
          { model: LifestyleFactors, as: 'lifestyleFactors' },
        ],
      });

      if (!patient) {
        await transaction.rollback();
        res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
        return;
      }

      // Build complete patient data for AI analysis
      const medicalHistory = await MedicalHistory.findOne({ where: { patientId } });
      const medications = await CurrentMedication.findAll({ where: { patientId } });
      const lifestyle = await LifestyleFactors.findOne({ where: { patientId } });

      if (!medicalHistory || !lifestyle) {
        await transaction.rollback();
        res.status(400).json({
          success: false,
          message: 'Incomplete patient data',
        });
        return;
      }

      const completePatientData: CompletePatientData = {
        demographics: {
          patientId: patient.id,
          age: patient.age,
          weight: patient.weight,
          height: patient.height,
          bmi: patient.bmi,
          bloodPressure: {
            systolic: patient.systolicBp,
            diastolic: patient.diastolicBp,
          },
          heartRate: patient.heartRate,
          temperature: patient.temperature,
        },
        medicalHistory: {
          conditions: medicalHistory.conditions as CompletePatientData['medicalHistory']['conditions'],
          allergies: medicalHistory.allergies as CompletePatientData['medicalHistory']['allergies'],
          pastSurgeries: medicalHistory.pastSurgeries as CompletePatientData['medicalHistory']['pastSurgeries'],
          familyHistory: medicalHistory.familyHistory,
        },
        currentMedications: {
          medications: medications.map(m => ({
            drugName: m.drugName,
            genericName: m.genericName,
            dosage: m.dosage,
            frequency: m.frequency,
            route: m.route,
            startDate: m.startDate,
            prescribedBy: m.prescribedBy,
          })),
        },
        lifestyle: {
          smoking: {
            status: lifestyle.smokingStatus,
            packsPerDay: lifestyle.smokingPacksPerDay || undefined,
            years: lifestyle.smokingYears || undefined,
          },
          alcohol: {
            frequency: lifestyle.alcoholFrequency,
            drinksPerWeek: lifestyle.alcoholDrinksPerWeek || undefined,
          },
          exercise: {
            frequency: lifestyle.exerciseFrequency,
            minutesPerWeek: lifestyle.exerciseMinutesPerWeek || undefined,
          },
          diet: lifestyle.diet,
          chiefComplaint: lifestyle.chiefComplaint as CompletePatientData['lifestyle']['chiefComplaint'],
        },
      };

      // Call OpenAI for analysis
      const aiResponse = await analyzeWithRetry(completePatientData);

      // Validate AI response
      const schemaValidation = validateTreatmentPlan(aiResponse);
      if (!schemaValidation.isValid) {
        await transaction.rollback();
        res.status(500).json({
          success: false,
          message: 'AI response validation failed',
          errors: schemaValidation.errors,
        });
        return;
      }

      // Cross-validate with local database
      const crossValidation = await crossValidateWithLocalDB(aiResponse, completePatientData);
      ingestAdaptiveLearningSample(
        completePatientData,
        aiResponse.riskAssessment?.riskScore || 0,
        'analysis-production-existing-patient',
      );

      // Save treatment plan
      const treatmentPlan = await TreatmentPlan.create({
        patientId: patient.id,
        treatmentData: aiResponse,
        overallRisk: aiResponse.riskAssessment.overallRisk,
        riskScore: aiResponse.riskAssessment.riskScore,
        confidenceScore: aiResponse.riskAssessment.confidenceScore,
        status: 'pending',
      }, { transaction });

      // Create audit log
      await AuditLog.create({
        timestamp: new Date(),
        userId: req.body.userId || 'system',
        userName: req.body.userName || 'System',
        action: 'created',
        patientId: patient.id,
        treatmentPlanId: treatmentPlan.id,
        riskLevel: aiResponse.riskAssessment.overallRisk,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      }, { transaction });

      await transaction.commit();
      invalidateWriteCaches();

      res.json({
        success: true,
        message: 'Treatment plan generated successfully',
        data: {
          treatmentPlanId: treatmentPlan.id,
          treatmentPlan: aiResponse,
          crossValidation,
        },
      });
    } catch (dbError) {
      await rollbackIfActive(transaction);
      throw dbError;
    }
  } catch (error) {
    logger.error('Analyze patient error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to analyze patient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get treatment plan by ID
export const getTreatmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // DEMO MODE
    if (config.demoMode) {
      // Try to find by plan ID first, then by patient ID
      let demoPlan = demoStorage.getTreatmentPlan(id);

      demoPlan ??= demoStorage.getTreatmentPlanByPatientId(id);

      if (!demoPlan) {
        res.status(404).json({
          success: false,
          message: 'Treatment plan not found (Demo Mode)',
        });
        return;
      }

      res.json({
        success: true,
        data: demoPlan,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const treatmentPlan = await TreatmentPlan.findByPk(id, {
      include: [{ model: Patient, as: 'patient' }],
    });

    if (!treatmentPlan) {
      res.status(404).json({
        success: false,
        message: 'Treatment plan not found',
      });
      return;
    }

    res.json({
      success: true,
      data: treatmentPlan,
    });
  } catch (error) {
    logger.error('Get treatment plan error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get treatment plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all treatment plans for a patient
export const getPatientTreatmentPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;

    // DEMO MODE
    if (config.demoMode) {
      const plans = demoStorage.getPatientTreatmentPlans(patientId);

      res.json({
        success: true,
        data: plans,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const treatmentPlans = await TreatmentPlan.findAll({
      where: { patientId },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: treatmentPlans,
    });
  } catch (error) {
    logger.error('Get patient treatment plans error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get treatment plans',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Approve treatment plan
export const approveTreatmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const id = patientId; // Using patientId from route, but treating it as plan ID for demo
    const { userId, userName } = req.body;

    // DEMO MODE
    if (config.demoMode) {
      // Try to find by plan ID first, then by patient ID
      let demoPlan = demoStorage.getTreatmentPlan(id);

      // If not found, search by patient ID
      demoPlan ??= demoStorage.getTreatmentPlanByPatientId(id);

      if (!demoPlan) {
        res.status(404).json({
          success: false,
          message: 'Treatment plan not found (Demo Mode)',
        });
        return;
      }

      // Update the plan
      const updatedPlan = demoStorage.updateTreatmentPlan(demoPlan.id, {
        status: 'approved',
        approvedBy: userName || 'Demo User',
        approvedAt: new Date(),
      });

      // Create audit log
      demoStorage.createAuditLog({
        timestamp: new Date(),
        userId: userId || 'demo-user',
        userName: userName || 'Demo User',
        action: 'approved',
        patientId: demoPlan.patientId,
        treatmentPlanId: demoPlan.id,
        riskLevel: demoPlan.overallRisk,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
      });

      invalidateWriteCaches();
      res.json({
        success: true,
        message: 'Treatment plan approved (Demo Mode)',
        data: updatedPlan,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const transaction = await sequelize.transaction();
    try {
      const treatmentPlan = await TreatmentPlan.findByPk(id);

      if (!treatmentPlan) {
        await transaction.rollback();
        res.status(404).json({
          success: false,
          message: 'Treatment plan not found',
        });
        return;
      }

      // Update treatment plan
      await treatmentPlan.update({
        status: 'approved',
        approvedBy: userName || 'Unknown',
        approvedAt: new Date(),
      }, { transaction });

      // Create audit log
      await AuditLog.create({
        timestamp: new Date(),
        userId: userId || 'system',
        userName: userName || 'System',
        action: 'approved',
        patientId: treatmentPlan.patientId,
        treatmentPlanId: treatmentPlan.id,
        riskLevel: treatmentPlan.overallRisk,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      }, { transaction });

      await transaction.commit();
      invalidateWriteCaches();

      res.json({
        success: true,
        message: 'Treatment plan approved',
        data: treatmentPlan,
      });
    } catch (dbError) {
      await rollbackIfActive(transaction);
      throw dbError;
    }
  } catch (error) {
    logger.error('Approve treatment plan error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to approve treatment plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Modify treatment plan
export const modifyTreatmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const id = patientId; // Using patientId from route, but treating it as plan ID for demo
    const { userId, userName, modifications } = req.body;

    // DEMO MODE
    if (config.demoMode) {
      // Try to find by plan ID first, then by patient ID
      let demoPlan = demoStorage.getTreatmentPlan(id);

      // If not found, search by patient ID
      demoPlan ??= demoStorage.getTreatmentPlanByPatientId(id);

      if (!demoPlan) {
        res.status(404).json({
          success: false,
          message: 'Treatment plan not found (Demo Mode)',
        });
        return;
      }

      // Update the plan
      const updatedPlan = demoStorage.updateTreatmentPlan(demoPlan.id, {
        status: 'modified',
        modifications,
        treatmentData: { ...demoPlan.treatmentData, ...modifications },
      });

      // Create audit log
      demoStorage.createAuditLog({
        timestamp: new Date(),
        userId: userId || 'demo-user',
        userName: userName || 'Demo User',
        action: 'modified',
        patientId: demoPlan.patientId,
        treatmentPlanId: demoPlan.id,
        riskLevel: demoPlan.overallRisk,
        changes: modifications,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
      });

      invalidateWriteCaches();
      res.json({
        success: true,
        message: 'Treatment plan modified (Demo Mode)',
        data: updatedPlan,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const transaction = await sequelize.transaction();

    try {
      const treatmentPlan = await TreatmentPlan.findByPk(id);

      if (!treatmentPlan) {
        await transaction.rollback();
        res.status(404).json({
          success: false,
          message: 'Treatment plan not found',
        });
        return;
      }

      const oldData = treatmentPlan.treatmentData;

      // Update treatment plan
      await treatmentPlan.update({
        status: 'modified',
        modifications,
        treatmentData: {
          ...treatmentPlan.treatmentData,
          ...modifications,
        },
      }, { transaction });

      // Create audit log with changes
      await AuditLog.create({
        timestamp: new Date(),
        userId: userId || 'system',
        userName: userName || 'System',
        action: 'modified',
        patientId: treatmentPlan.patientId,
        treatmentPlanId: treatmentPlan.id,
        changes: {
          before: oldData,
          after: modifications,
        },
        riskLevel: treatmentPlan.overallRisk,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      }, { transaction });

      await transaction.commit();
      invalidateWriteCaches();

      res.json({
        success: true,
        message: 'Treatment plan modified',
        data: treatmentPlan,
      });
    } catch (dbError) {
      await rollbackIfActive(transaction);
      throw dbError;
    }
  } catch (error) {
    logger.error('Modify treatment plan error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to modify treatment plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Reject treatment plan
export const rejectTreatmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const id = patientId; // Using patientId from route, but treating it as plan ID for demo
    const { userId, userName, reason } = req.body;

    // DEMO MODE
    if (config.demoMode) {
      // Try to find by plan ID first, then by patient ID
      let demoPlan = demoStorage.getTreatmentPlan(id);

      // If not found, search by patient ID
      demoPlan ??= demoStorage.getTreatmentPlanByPatientId(id);

      if (!demoPlan) {
        res.status(404).json({
          success: false,
          message: 'Treatment plan not found (Demo Mode)',
        });
        return;
      }

      // Update the plan
      const updatedPlan = demoStorage.updateTreatmentPlan(demoPlan.id, {
        status: 'rejected',
        rejectionReason: reason,
      });

      // Create audit log
      demoStorage.createAuditLog({
        timestamp: new Date(),
        userId: userId || 'demo-user',
        userName: userName || 'Demo User',
        action: 'rejected',
        patientId: demoPlan.patientId,
        treatmentPlanId: demoPlan.id,
        riskLevel: demoPlan.overallRisk,
        reason,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || undefined,
      });

      invalidateWriteCaches();
      res.json({
        success: true,
        message: 'Treatment plan rejected (Demo Mode)',
        data: updatedPlan,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const transaction = await sequelize.transaction();

    try {
      const treatmentPlan = await TreatmentPlan.findByPk(id);

      if (!treatmentPlan) {
        await transaction.rollback();
        res.status(404).json({
          success: false,
          message: 'Treatment plan not found',
        });
        return;
      }

      // Update treatment plan
      await treatmentPlan.update({
        status: 'rejected',
        rejectionReason: reason,
      }, { transaction });

      // Create audit log
      await AuditLog.create({
        timestamp: new Date(),
        userId: userId || 'system',
        userName: userName || 'System',
        action: 'rejected',
        patientId: treatmentPlan.patientId,
        treatmentPlanId: treatmentPlan.id,
        reason,
        riskLevel: treatmentPlan.overallRisk,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      }, { transaction });

      await transaction.commit();
      invalidateWriteCaches();

      res.json({
        success: true,
        message: 'Treatment plan rejected',
        data: treatmentPlan,
      });
    } catch (dbError) {
      await rollbackIfActive(transaction);
      throw dbError;
    }
  } catch (error) {
    logger.error('Reject treatment plan error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to reject treatment plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
