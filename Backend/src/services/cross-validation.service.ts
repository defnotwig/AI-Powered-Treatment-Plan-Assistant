import { DrugInteraction, Contraindication, DosageGuideline } from '../models';
import { 
  TreatmentPlanResponse, 
  CompletePatientData, 
  ValidationReport, 
  ValidationIssue,
  IssueSeverity,
  DBDrugInteraction,
  DBContraindication,
  DBDosageGuideline,
} from '../types';
import {
  MEDICAL_KNOWLEDGE_BASE,
} from '../data/medical-knowledge-base';

// Parse dosage string to extract numeric value in mg
const parseDosage = (dosageStr: string): number => {
  const regex = /(\d+(?:\.\d+)?)\s*mg/i;
  const match = regex.exec(dosageStr);
  return match ? Number.parseFloat(match[1]) : 0;
};

// Helper to determine contraindication severity
function getContraSeverity(contra: { severity?: string; type?: string }): IssueSeverity {
  if (contra.severity === 'critical') return 'critical';
  if (contra.type === 'absolute') return 'critical';
  return 'high';
}

/** Gather all proposed + current drugs (unique, lowercased) */
function gatherUniqueDrugs(
  aiResponse: TreatmentPlanResponse,
  patientData: CompletePatientData,
): string[] {
  const proposedDrugs = [
    aiResponse.treatmentPlan.primaryTreatment.medication.toLowerCase(),
    aiResponse.treatmentPlan.primaryTreatment.genericName?.toLowerCase() || '',
    ...aiResponse.treatmentPlan.alternativeTreatments.map(t => t.medication.toLowerCase()),
    ...aiResponse.treatmentPlan.alternativeTreatments.map(t => t.genericName?.toLowerCase() || ''),
    ...patientData.currentMedications.medications.map(m => m.drugName.toLowerCase()),
    ...patientData.currentMedications.medications.map(m => m.genericName.toLowerCase()),
  ].filter(Boolean);
  return [...new Set(proposedDrugs)];
}

/** Check for missed drug-drug interactions from the DB */
function checkMissedInteractions(
  uniqueDrugs: string[],
  dbInteractions: DBDrugInteraction[],
  aiResponse: TreatmentPlanResponse,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < uniqueDrugs.length; i++) {
    for (let j = i + 1; j < uniqueDrugs.length; j++) {
      const drug1 = uniqueDrugs[i];
      const drug2 = uniqueDrugs[j];

      const interaction = dbInteractions.find(
        db =>
          (db.drug1.toLowerCase() === drug1 && db.drug2.toLowerCase() === drug2) ||
          (db.drug1.toLowerCase() === drug2 && db.drug2.toLowerCase() === drug1),
      );

      if (!interaction) continue;

      const aiFoundIt = aiResponse.drugInteractions?.some(
        ai =>
          (ai.drug1.toLowerCase() === drug1 && ai.drug2.toLowerCase() === drug2) ||
          (ai.drug1.toLowerCase() === drug2 && ai.drug2.toLowerCase() === drug1),
      );

      if (!aiFoundIt) {
        issues.push({
          type: 'missed_interaction',
          severity: interaction.severity as IssueSeverity,
          description: `AI missed interaction: ${interaction.drug1} + ${interaction.drug2} - ${interaction.effect}`,
          localDbEntry: interaction.toJSON(),
        });
      }
    }
  }
  return issues;
}

/** Check for missed contraindications from the DB */
function checkMissedContraindications(
  patientConditions: string[],
  primaryDrug: string,
  dbContraindications: DBContraindication[],
  aiResponse: TreatmentPlanResponse,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const condition of patientConditions) {
    const contra = dbContraindications.find(
      c =>
        c.condition.toLowerCase().includes(condition) &&
        (c.drug.toLowerCase() === primaryDrug ||
          c.drug.toLowerCase().includes(primaryDrug) ||
          primaryDrug.includes(c.drug.toLowerCase())),
    );

    if (!contra) continue;

    const aiFoundIt = aiResponse.contraindications?.some(
      ai =>
        ai.condition.toLowerCase().includes(condition) &&
        ai.drug.toLowerCase().includes(contra.drug.toLowerCase()),
    );

    if (!aiFoundIt) {
      issues.push({
        type: 'missed_contraindication',
        severity: contra.type === 'absolute' ? 'critical' : 'high',
        description: `AI missed contraindication: ${contra.drug} in ${contra.condition} - ${contra.reason}`,
        localDbEntry: contra.toJSON(),
      });
    }
  }
  return issues;
}

/** Validate proposed dosages against DB guidelines */
function validateDosages(
  primaryDrug: string,
  dbDosageGuidelines: DBDosageGuideline[],
  patientData: CompletePatientData,
  aiResponse: TreatmentPlanResponse,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const dosageGuideline = dbDosageGuidelines.find(
    d =>
      d.drug.toLowerCase() === primaryDrug ||
      d.drug.toLowerCase().includes(primaryDrug) ||
      primaryDrug.includes(d.drug.toLowerCase()),
  );

  if (!dosageGuideline) return issues;

  const proposedDose = parseDosage(aiResponse.treatmentPlan.primaryTreatment.dosage);
  const maxDose = parseDosage(dosageGuideline.maxDose);

  if (proposedDose > 0 && maxDose > 0 && proposedDose > maxDose) {
    issues.push({
      type: 'dosage_exceeds_max',
      severity: 'critical',
      description: `Proposed dose ${proposedDose}mg exceeds max ${maxDose}mg for ${dosageGuideline.drug}`,
      localDbEntry: dosageGuideline.toJSON(),
    });
  }

  if (patientData.demographics.age > 65 && dosageGuideline.geriatricAdjustment) {
    const aiMentionsGeriatric =
      aiResponse.rationale?.monitoringPlan?.toLowerCase().includes('geriatric') ||
      aiResponse.rationale?.primaryChoice?.toLowerCase().includes('elderly') ||
      aiResponse.riskAssessment?.riskFactors?.some(r => r.toLowerCase().includes('age'));

    if (!aiMentionsGeriatric) {
      issues.push({
        type: 'missed_contraindication',
        severity: 'medium',
        description: `Geriatric adjustment may be needed: ${dosageGuideline.geriatricAdjustment}`,
        localDbEntry: dosageGuideline.toJSON(),
      });
    }
  }
  return issues;
}

/** Check for allergy conflicts including cross-reactivity */
function checkAllergyConflicts(
  patientData: CompletePatientData,
  primaryDrug: string,
  uniqueDrugs: string[],
  aiResponse: TreatmentPlanResponse,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allergens = patientData.medicalHistory.allergies.map(a => a.allergen.toLowerCase());

  for (const allergen of allergens) {
    issues.push(
      ...checkDirectAllergyMatch(allergen, primaryDrug, aiResponse),
      ...checkCrossReactivity(allergen, uniqueDrugs, aiResponse),
    );
  }
  return issues;
}

/** Check a single allergen for direct match with primary drug */
function checkDirectAllergyMatch(
  allergen: string,
  primaryDrug: string,
  aiResponse: TreatmentPlanResponse,
): ValidationIssue[] {
  if (!primaryDrug.includes(allergen) && !allergen.includes(primaryDrug)) return [];

  const aiFoundIt = aiResponse.flaggedIssues?.some(
    issue => issue.type === 'allergy' && issue.description.toLowerCase().includes(allergen),
  );

  if (aiFoundIt) return [];

  return [{
    type: 'missed_contraindication',
    severity: 'critical',
    description: `Potential allergy conflict: Patient allergic to ${allergen}, proposed drug is ${primaryDrug}`,
  }];
}

/** Check cross-reactivity for a single allergen */
function checkCrossReactivity(
  allergen: string,
  uniqueDrugs: string[],
  aiResponse: TreatmentPlanResponse,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const crossReactiveGroups = MEDICAL_KNOWLEDGE_BASE.checkCrossReactivity(allergen);

  for (const group of crossReactiveGroups) {
    for (const crossDrug of group.crossReactiveDrugs) {
      const drugMatches = uniqueDrugs.some(d => d.includes(crossDrug.toLowerCase()) || crossDrug.toLowerCase().includes(d));
      if (!drugMatches) continue;

      const aiFoundCross = aiResponse.flaggedIssues?.some(
        issue => issue.description.toLowerCase().includes(crossDrug.toLowerCase()),
      );
      if (!aiFoundCross) {
        issues.push({
          type: 'missed_contraindication',
          severity: 'high',
          description: `Cross-reactivity risk: Patient allergic to ${allergen} (${group.groupName}). Drug ${crossDrug} has ${group.crossReactivityRate} cross-reactivity. ${group.recommendation}`,
        });
      }
    }
  }
  return issues;
}

/** Check comprehensive knowledge base drug interactions */
function checkKBInteractions(
  uniqueDrugs: string[],
  aiResponse: TreatmentPlanResponse,
  existingIssues: ValidationIssue[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < uniqueDrugs.length; i++) {
    for (let j = i + 1; j < uniqueDrugs.length; j++) {
      const kbInteraction = MEDICAL_KNOWLEDGE_BASE.checkDrugPair(uniqueDrugs[i], uniqueDrugs[j]);
      if (!kbInteraction || kbInteraction.clinicalSignificance < 4) continue;

      const aiFoundIt = aiResponse.drugInteractions?.some(
        ai =>
          (ai.drug1.toLowerCase().includes(uniqueDrugs[i]) && ai.drug2.toLowerCase().includes(uniqueDrugs[j])) ||
          (ai.drug1.toLowerCase().includes(uniqueDrugs[j]) && ai.drug2.toLowerCase().includes(uniqueDrugs[i])),
      );
      if (aiFoundIt) continue;

      const alreadyAdded = existingIssues.some(
        iss => iss.description.includes(kbInteraction.drug1) && iss.description.includes(kbInteraction.drug2),
      );
      if (!alreadyAdded) {
        issues.push({
          type: 'missed_interaction',
          severity: kbInteraction.severity as IssueSeverity,
          description: `Knowledge base flag: ${kbInteraction.drug1} + ${kbInteraction.drug2} — ${kbInteraction.effect}. Management: ${kbInteraction.management}`,
        });
      }
    }
  }
  return issues;
}

/** Check comprehensive contraindications from knowledge base */
function checkKBContraindications(
  patientConditions: string[],
  uniqueDrugs: string[],
  existingIssues: ValidationIssue[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const condition of patientConditions) {
    const kbContras = MEDICAL_KNOWLEDGE_BASE.findContraindications(condition);
    for (const contra of kbContras) {
      const drugMatches = uniqueDrugs.some(d => contra.drug.toLowerCase().includes(d) || d.includes(contra.drug.toLowerCase()));
      if (!drugMatches) continue;

      const alreadyFlagged = existingIssues.some(
        iss =>
          iss.description.toLowerCase().includes(contra.drug.toLowerCase()) &&
          iss.description.toLowerCase().includes(condition),
      );
      if (!alreadyFlagged) {
        issues.push({
          type: 'missed_contraindication',
          severity: getContraSeverity(contra),
          description: `KB contraindication: ${contra.drug} in ${contra.condition} — ${contra.reason}. Alternatives: ${contra.alternatives.join(', ')}`,
        });
      }
    }
  }
  return issues;
}

// Cross-validate AI response with local database
export const crossValidateWithLocalDB = async (
  aiResponse: TreatmentPlanResponse,
  patientData: CompletePatientData
): Promise<ValidationReport> => {
  const dbInteractions = await DrugInteraction.findAll();
  const dbContraindications = await Contraindication.findAll();
  const dbDosageGuidelines = await DosageGuideline.findAll();

  const uniqueDrugs = gatherUniqueDrugs(aiResponse, patientData);
  const primaryDrug = aiResponse.treatmentPlan.primaryTreatment.medication.toLowerCase();
  const patientConditions = patientData.medicalHistory.conditions.map(c => c.condition.toLowerCase());

  const issues: ValidationIssue[] = [
    ...checkMissedInteractions(uniqueDrugs, dbInteractions, aiResponse),
    ...checkMissedContraindications(patientConditions, primaryDrug, dbContraindications, aiResponse),
    ...validateDosages(primaryDrug, dbDosageGuidelines, patientData, aiResponse),
    ...checkAllergyConflicts(patientData, primaryDrug, uniqueDrugs, aiResponse),
  ];

  // KB checks need existing issues for dedup
  const kbIssues = [
    ...checkKBInteractions(uniqueDrugs, aiResponse, issues),
    ...checkKBContraindications(patientConditions, uniqueDrugs, issues),
  ];
  issues.push(...kbIssues);

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    recommendation: issues.length > 0 ? 'REVIEW_REQUIRED' : 'SAFE_TO_PROCEED',
  };
};
