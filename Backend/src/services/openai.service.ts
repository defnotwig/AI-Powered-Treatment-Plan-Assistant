import OpenAI from 'openai';
import { config } from '../config';
import logger from '../config/logger';
import { CompletePatientData, TreatmentPlanResponse, FlaggedIssue, IssueType, IssueSeverity, RawConditionInput, RawMedicationInput } from '../types';
import { buildRealtimeClinicalContext, type ClinicalContextSnapshot } from './ai-context.service';

// Debug: Log OpenAI configuration status
const apiKeyConfigured = config.openai.apiKey && 
  config.openai.apiKey !== 'your_openai_api_key_here' &&
  config.openai.apiKey.startsWith('sk-');

logger.info('OpenAI configuration', { configured: apiKeyConfigured, model: apiKeyConfigured ? config.openai.model : 'N/A' });

// Initialize OpenAI client only if API key is configured
const openai = apiKeyConfigured
  ? new OpenAI({ apiKey: config.openai.apiKey })
  : null;

// Static drug interaction database for demo/fallback mode
const DRUG_INTERACTION_DB = [
  { drug1: 'warfarin', drug2: 'aspirin', severity: 'major', effect: 'Increased bleeding risk', management: 'Avoid combination or monitor INR closely' },
  { drug1: 'sildenafil', drug2: 'nitroglycerin', severity: 'major', effect: 'Severe hypotension', management: 'Absolute contraindication - do not combine' },
  { drug1: 'metformin', drug2: 'contrast_dye', severity: 'major', effect: 'Lactic acidosis risk', management: 'Hold metformin 48h before contrast' },
  { drug1: 'lisinopril', drug2: 'potassium', severity: 'moderate', effect: 'Hyperkalemia risk', management: 'Monitor potassium levels' },
  { drug1: 'simvastatin', drug2: 'grapefruit', severity: 'moderate', effect: 'Increased statin levels', management: 'Avoid grapefruit consumption' },
  { drug1: 'metformin', drug2: 'alcohol', severity: 'moderate', effect: 'Increased lactic acidosis risk', management: 'Limit alcohol consumption' },
  { drug1: 'aspirin', drug2: 'ibuprofen', severity: 'moderate', effect: 'Reduced cardioprotective effect', management: 'Take aspirin 30min before ibuprofen' },
];

const CONTRAINDICATION_RULES = [
  { drug: 'beta-blockers', condition: 'severe asthma', type: 'absolute', reason: 'Risk of bronchospasm', alternatives: ['calcium channel blockers'] },
  { drug: 'NSAIDs', condition: 'chronic kidney disease', type: 'absolute', reason: 'Risk of acute kidney injury', alternatives: ['acetaminophen'] },
  { drug: 'metformin', condition: 'eGFR <30', type: 'absolute', reason: 'Risk of lactic acidosis', alternatives: ['insulin', 'sulfonylureas'] },
  { drug: 'sildenafil', condition: 'nitrate use', type: 'absolute', reason: 'Severe hypotension', alternatives: ['vacuum devices', 'alprostadil'] },
  { drug: 'ACE inhibitors', condition: 'bilateral renal artery stenosis', type: 'absolute', reason: 'Risk of acute renal failure', alternatives: ['calcium channel blockers'] },
];

const DOSAGE_GUIDELINES = [
  { drug: 'sildenafil', indication: 'erectile dysfunction', standardDose: '50mg PRN', maxDose: '100mg/24h', geriatricAdjustment: 'Start 25mg', renalAdjustment: 'CrCl<30: 25mg max' },
  { drug: 'metformin', indication: 'type 2 diabetes', standardDose: '500mg BID', maxDose: '2550mg/day', geriatricAdjustment: 'Start 500mg daily', renalAdjustment: 'CrCl<30: Contraindicated' },
  { drug: 'lisinopril', indication: 'hypertension', standardDose: '10-20mg daily', maxDose: '80mg/day', geriatricAdjustment: 'Start 5mg', renalAdjustment: 'Reduce dose 50% if CrCl<30' },
  { drug: 'atorvastatin', indication: 'hyperlipidemia', standardDose: '10-20mg daily', maxDose: '80mg/day', geriatricAdjustment: 'No adjustment needed', renalAdjustment: 'No adjustment needed' },
];

// ===== Helper types for mock response generation =====
interface RiskAccumulator {
  score: number;
  factors: string[];
}

interface DrugInteractionRecord {
  drug1: string;
  drug2: string;
  severity: string;
  effect: string;
  management: string;
}

interface TreatmentOption {
  medication: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  alternatives: Array<{
    medication: string;
    genericName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    instructions: string;
    reason: string;
  }>;
}

// ===== Extracted helper functions (reduces cognitive complexity) =====

function calculateBaseRisk(
  age: number,
  conditionCount: number,
  medicationCount: number,
  allergyCount: number,
): RiskAccumulator {
  const risk: RiskAccumulator = { score: 20, factors: [] };
  if (age > 65) { risk.score += 20; risk.factors.push('Age >65 years - geriatric dosing considerations'); }
  if (conditionCount >= 3) { risk.score += 15; risk.factors.push('Multiple comorbidities present'); }
  if (medicationCount >= 5) { risk.score += 20; risk.factors.push('Polypharmacy (5+ medications)'); }
  if (allergyCount > 0) { risk.score += 10; risk.factors.push(`${allergyCount} known allergies`); }
  return risk;
}

function findCurrentMedInteractions(drugNames: Set<string>): DrugInteractionRecord[] {
  return DRUG_INTERACTION_DB.filter(
    i => drugNames.has(i.drug1.toLowerCase()) && drugNames.has(i.drug2.toLowerCase()),
  );
}

function getProposedDrugs(complaintLower: string): string[] {
  const proposed: string[] = [];
  if (complaintLower.includes('erectile') || complaintLower.includes('ed ')) {
    proposed.push('sildenafil', 'tadalafil', 'vardenafil');
  }
  if (complaintLower.includes('hair') || complaintLower.includes('baldness')) {
    proposed.push('finasteride', 'minoxidil');
  }
  return proposed;
}

function findCriticalInteractions(
  proposedDrugs: string[],
  drugNames: Set<string>,
  risk: RiskAccumulator,
): FlaggedIssue[] {
  const criticals: FlaggedIssue[] = [];
  for (const proposedDrug of proposedDrugs) {
    for (const interaction of DRUG_INTERACTION_DB) {
      const matchesDrug1 = interaction.drug1.toLowerCase() === proposedDrug && drugNames.has(interaction.drug2.toLowerCase());
      const matchesDrug2 = interaction.drug2.toLowerCase() === proposedDrug && drugNames.has(interaction.drug1.toLowerCase());
      if (!matchesDrug1 && !matchesDrug2) continue;
      const existingDrug = drugNames.has(interaction.drug1.toLowerCase()) ? interaction.drug1 : interaction.drug2;
      criticals.push({
        type: 'interaction' as IssueType,
        severity: 'critical' as IssueSeverity,
        description: `⚠️ CRITICAL: ${proposedDrug.toUpperCase()} CONTRAINDICATED with ${existingDrug.toUpperCase()} - ${interaction.effect}`,
        recommendation: interaction.management,
        affectedDrugs: [proposedDrug, existingDrug],
      });
      risk.score += 30;
      risk.factors.push(`CRITICAL: ${proposedDrug} + ${existingDrug} interaction - ${interaction.effect}`);
    }
  }
  return criticals;
}

function extractConditionNames(conditions: Array<RawConditionInput | string>): string[] {
  return conditions.map((c: RawConditionInput | string) => {
    if (typeof c === 'string') return c.toLowerCase();
    return (c.condition || c.name || '').toLowerCase();
  }).filter(Boolean);
}

function checkNitrateContraindications(
  proposedDrugs: string[],
  drugNames: Set<string>,
  rule: typeof CONTRAINDICATION_RULES[number],
  risk: RiskAccumulator,
): FlaggedIssue[] {
  if (rule.condition !== 'nitrate use' || !drugNames.has('nitroglycerin')) return [];
  const PDE5_DRUGS = new Set(['sildenafil', 'tadalafil', 'vardenafil']);
  const results: FlaggedIssue[] = [];
  for (const proposedDrug of proposedDrugs) {
    if (!PDE5_DRUGS.has(proposedDrug)) continue;
    results.push({
      type: 'contraindication' as IssueType,
      severity: 'critical' as IssueSeverity,
      description: `⚠️ ABSOLUTE CONTRAINDICATION: ${proposedDrug.toUpperCase()} with nitrate therapy (nitroglycerin) - ${rule.reason}`,
      recommendation: `Consider non-PDE5 alternatives: ${rule.alternatives?.join(', ') ?? 'Consult cardiology'}`,
      affectedDrugs: [proposedDrug, 'nitroglycerin'],
    });
    risk.score += 40;
    risk.factors.push('ABSOLUTE CONTRAINDICATION: PDE5 inhibitors with nitrate therapy');
  }
  return results;
}

function checkConditionContraindications(
  conditionNames: string[],
  medications: Array<RawMedicationInput>,
  rule: typeof CONTRAINDICATION_RULES[number],
): FlaggedIssue[] {
  const results: FlaggedIssue[] = [];
  for (const cond of conditionNames) {
    if (!cond.includes(rule.condition.toLowerCase())) continue;
    for (const med of medications) {
      const medName = med.drugName || med.name || '';
      if (!medName.toLowerCase().includes(rule.drug.toLowerCase())) continue;
      results.push({
        type: 'contraindication' as IssueType,
        severity: (rule.type === 'absolute' ? 'critical' : 'high') as IssueSeverity,
        description: `${rule.type.toUpperCase()} contraindication: ${medName} with ${cond} - ${rule.reason}`,
        recommendation: `Consider alternatives: ${rule.alternatives?.join(', ') ?? 'Consult specialist'}`,
        affectedDrugs: [medName],
      });
    }
  }
  return results;
}

function checkAllContraindications(
  conditionNames: string[],
  drugNames: Set<string>,
  proposedDrugs: string[],
  medications: Array<RawMedicationInput>,
  risk: RiskAccumulator,
): FlaggedIssue[] {
  const results: FlaggedIssue[] = [];
  for (const rule of CONTRAINDICATION_RULES) {
    results.push(
      ...checkNitrateContraindications(proposedDrugs, drugNames, rule, risk),
      ...checkConditionContraindications(conditionNames, medications, rule),
    );
  }
  return results;
}

function buildAllFlaggedIssues(
  criticalInteractions: FlaggedIssue[],
  contraindications: FlaggedIssue[],
  drugInteractions: DrugInteractionRecord[],
): FlaggedIssue[] {
  const issues: FlaggedIssue[] = [...criticalInteractions, ...contraindications];
  for (const interaction of drugInteractions) {
    issues.push({
      type: 'interaction' as IssueType,
      severity: (interaction.severity === 'major' ? 'high' : 'medium') as IssueSeverity,
      description: `${interaction.drug1} + ${interaction.drug2}: ${interaction.effect}`,
      recommendation: interaction.management,
      affectedDrugs: [interaction.drug1, interaction.drug2],
    });
  }
  return issues;
}

function getTreatmentMap(age: number): Record<string, TreatmentOption> {
  return {
    'erectile': {
      medication: 'Sildenafil', genericName: 'sildenafil', dosage: age > 65 ? '25mg' : '50mg',
      frequency: 'As needed', duration: 'PRN', route: 'oral',
      instructions: 'Take 30-60 minutes before sexual activity. Do not take more than once daily.',
      alternatives: [
        { medication: 'Tadalafil', genericName: 'tadalafil', dosage: '10mg', frequency: 'As needed', duration: 'PRN', route: 'oral', instructions: 'Take 30 minutes before activity', reason: 'Longer duration of action (up to 36 hours)' },
        { medication: 'Vardenafil', genericName: 'vardenafil', dosage: '10mg', frequency: 'As needed', duration: 'PRN', route: 'oral', instructions: 'Take 60 minutes before activity', reason: 'Similar efficacy with different pharmacokinetics' },
      ],
    },
    'hair': {
      medication: 'Finasteride', genericName: 'finasteride', dosage: '1mg',
      frequency: 'Once daily', duration: '6-12 months initial', route: 'oral',
      instructions: 'Take at the same time each day. Results may take 3-6 months to be visible.',
      alternatives: [
        { medication: 'Minoxidil 5%', genericName: 'minoxidil', dosage: '1mL', frequency: 'Twice daily', duration: 'Ongoing', route: 'topical', instructions: 'Apply to dry scalp', reason: 'Non-systemic option with proven efficacy' },
        { medication: 'Dutasteride', genericName: 'dutasteride', dosage: '0.5mg', frequency: 'Once daily', duration: 'Ongoing', route: 'oral', instructions: 'Off-label use for hair loss', reason: 'More potent 5-alpha reductase inhibition' },
      ],
    },
    'weight': {
      medication: 'Semaglutide', genericName: 'semaglutide', dosage: '0.25mg weekly, titrate to 2.4mg',
      frequency: 'Once weekly', duration: 'Long-term', route: 'subcutaneous injection',
      instructions: 'Start at 0.25mg and increase every 4 weeks. Inject in abdomen, thigh, or upper arm.',
      alternatives: [
        { medication: 'Tirzepatide', genericName: 'tirzepatide', dosage: '2.5mg weekly, titrate to 15mg', frequency: 'Once weekly', duration: 'Long-term', route: 'subcutaneous injection', instructions: 'Start at 2.5mg, titrate monthly', reason: 'Dual GIP/GLP-1 agonist with potentially greater efficacy' },
        { medication: 'Orlistat', genericName: 'orlistat', dosage: '120mg', frequency: 'Three times daily with meals', duration: 'Long-term', route: 'oral', instructions: 'Take with each main meal containing fat', reason: 'Non-hormonal option that reduces fat absorption' },
      ],
    },
    'chest': {
      medication: 'Nitroglycerin', genericName: 'nitroglycerin', dosage: '0.4mg',
      frequency: 'As needed for chest pain', duration: 'PRN', route: 'sublingual',
      instructions: 'Place under tongue at onset of chest pain. May repeat every 5 minutes up to 3 doses.',
      alternatives: [
        { medication: 'Isosorbide Mononitrate', genericName: 'isosorbide mononitrate', dosage: '30mg', frequency: 'Once daily', duration: 'Long-term', route: 'oral', instructions: 'Take in the morning', reason: 'Scheduled prevention of angina' },
        { medication: 'Ranolazine', genericName: 'ranolazine', dosage: '500mg', frequency: 'Twice daily', duration: 'Long-term', route: 'oral', instructions: 'May increase to 1000mg BID', reason: 'Alternative mechanism for refractory angina' },
      ],
    },
  };
}

function selectTreatment(complaintLower: string, age: number): TreatmentOption {
  const map = getTreatmentMap(age);
  for (const [key, treatment] of Object.entries(map)) {
    if (complaintLower.includes(key)) return treatment;
  }
  return map['weight']; // Default
}

function calculateOverallRisk(riskScore: number, hasNitrateContraindication: boolean): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (riskScore >= 70 || hasNitrateContraindication) return 'CRITICAL';
  if (riskScore >= 50) return 'HIGH';
  if (riskScore >= 30) return 'MEDIUM';
  return 'LOW';
}

function buildMockTreatmentPlan(selected: TreatmentOption, nitrateContra: boolean, complaintLower: string) {
  const NITRATE_ALTERNATIVES = [
    { medication: 'Vacuum Erection Device', genericName: 'VED', dosage: 'N/A', frequency: 'As needed', duration: 'Long-term', route: 'external', instructions: 'Non-pharmacological option safe with nitrates', reason: 'Safe alternative for patients on nitrate therapy' },
    { medication: 'Alprostadil (Caverject)', genericName: 'alprostadil', dosage: '10-20mcg', frequency: 'As needed', duration: 'PRN', route: 'intracavernosal', instructions: 'Direct injection therapy - requires training', reason: 'Works via different mechanism, safe with nitrates' },
  ];

  const primaryInstructions = (nitrateContra && complaintLower.includes('erectile'))
    ? '⚠️ CONTRAINDICATED - Patient on nitrate therapy. DO NOT USE PDE5 inhibitors. Consider non-pharmacological alternatives or specialist referral.'
    : selected.instructions;

  return {
    primaryTreatment: {
      medication: nitrateContra ? '⚠️ NO PDE5 INHIBITORS - CONTRAINDICATED' : selected.medication,
      genericName: nitrateContra ? 'contraindicated' : selected.genericName,
      dosage: nitrateContra ? 'N/A' : selected.dosage,
      frequency: nitrateContra ? 'N/A' : selected.frequency,
      duration: nitrateContra ? 'N/A' : selected.duration,
      route: nitrateContra ? 'N/A' : selected.route,
      instructions: primaryInstructions,
    },
    alternativeTreatments: nitrateContra ? NITRATE_ALTERNATIVES : selected.alternatives,
    supportiveCare: [
      nitrateContra ? 'CRITICAL: Do NOT prescribe PDE5 inhibitors (sildenafil, tadalafil, vardenafil)' : 'Maintain healthy diet and regular exercise',
      'Monitor for side effects and report any concerns',
      'Follow up in 4-6 weeks to assess treatment efficacy',
      nitrateContra ? 'Refer to urology/cardiology for specialized ED management with nitrate therapy' : 'Stay hydrated and maintain regular sleep schedule',
    ],
  };
}

function buildMockRationale(nitrateContra: boolean, selected: TreatmentOption, riskFactors: string[]) {
  const riskDetail = riskFactors.length > 0
    ? 'Key considerations: ' + riskFactors.join(', ')
    : 'No significant risk factors identified';

  return {
    primaryChoice: nitrateContra
      ? '⚠️ CRITICAL SAFETY ALERT: PDE5 inhibitors (Sildenafil, Tadalafil, Vardenafil) are ABSOLUTELY CONTRAINDICATED in this patient due to concurrent nitrate (nitroglycerin) use. The combination can cause life-threatening hypotension. Non-pharmacological alternatives recommended.'
      : `${selected.medication} was selected as first-line therapy based on clinical guidelines, patient profile, and evidence-based medicine. The dosage has been adjusted for patient age and comorbidities.`,
    riskBenefit: nitrateContra
      ? 'RISK ASSESSMENT: Any PDE5 inhibitor use would pose an unacceptable risk of severe hypotension and potential cardiovascular collapse. The patient must NOT receive these medications.'
      : `The benefits of treatment outweigh the risks when properly monitored. ${riskDetail}.`,
    alternativeRationale: nitrateContra
      ? 'Alternative non-PDE5 options (vacuum devices, alprostadil injection) are provided as they work via different mechanisms and are safe with nitrate therapy.'
      : 'Alternative treatments are provided in case of intolerance, contraindications, or treatment failure with the primary option.',
    monitoringPlan: 'Follow-up visit in 4-6 weeks to assess efficacy and tolerability. Monitor for adverse effects and adjust therapy as needed.',
    patientEducation: nitrateContra
      ? 'CRITICAL: Patient must be educated that they should NEVER take PDE5 inhibitors (Viagra, Cialis, Levitra) while on nitrate therapy. This includes over-the-counter or online purchases. Doing so could be life-threatening.'
      : 'Patient should be educated on proper medication use, expected timeline for results, potential side effects, and when to seek medical attention.',
  };
}

// Generate mock response for demo mode
const generateMockResponse = (patientData: CompletePatientData): TreatmentPlanResponse => {
  const age = patientData.demographics?.age || 50;
  const conditions = patientData.medicalHistory?.conditions || [];
  const medications = (patientData.currentMedications?.medications || []) as RawMedicationInput[];
  const allergies = patientData.medicalHistory?.allergies || [];

  const patientDataWithLifestyle = patientData as CompletePatientData & { lifestyleFactors?: { chiefComplaint?: string } };
  const chiefComplaint =
    patientData.lifestyle?.chiefComplaint?.complaint ||
    patientDataWithLifestyle.lifestyleFactors?.chiefComplaint ||
    'General consultation';
  const complaintLower = chiefComplaint.toLowerCase();

  const risk = calculateBaseRisk(age, conditions.length, medications.length, allergies.length);
  const drugNames = new Set(medications.map((m: RawMedicationInput) => (m.drugName || m.name || '').toLowerCase()).filter(Boolean));
  const drugInteractions = findCurrentMedInteractions(drugNames);
  const proposedDrugs = getProposedDrugs(complaintLower);
  const criticalInteractions = findCriticalInteractions(proposedDrugs, drugNames, risk);
  const conditionNames = extractConditionNames(conditions as Array<RawConditionInput | string>);
  const contraindications = checkAllContraindications(conditionNames, drugNames, proposedDrugs, medications, risk);
  const flaggedIssues = buildAllFlaggedIssues(criticalInteractions, contraindications, drugInteractions);
  const selectedTreatment = selectTreatment(complaintLower, age);
  const hasNitrateContraindication = drugNames.has('nitroglycerin') && (complaintLower.includes('erectile') || complaintLower.includes('ed '));
  const overallRisk = calculateOverallRisk(risk.score, hasNitrateContraindication);

  return {
    treatmentPlan: buildMockTreatmentPlan(selectedTreatment, hasNitrateContraindication, complaintLower),
    riskAssessment: { overallRisk, riskScore: Math.min(risk.score, 100), confidenceScore: 85, riskFactors: risk.factors },
    flaggedIssues,
    drugInteractions,
    contraindications: contraindications.map(c => ({
      drug: c.affectedDrugs?.[0] || 'Unknown',
      condition: 'See description',
      type: c.severity === 'critical' ? 'absolute' : 'relative',
      reason: c.description,
    })),
    rationale: buildMockRationale(hasNitrateContraindication, selectedTreatment, risk.factors),
    evidenceSources: ['Clinical Guidelines', 'Local Drug Interaction Database'],
  };
};

// Build the medical system prompt
const buildSystemPrompt = (liveClinicalEvidenceSummary?: string): string => {
  return `You are a clinical decision support AI assistant specializing in treatment plan generation with comprehensive safety analysis.

CRITICAL SAFETY RULES:
1. Always flag HIGH RISK for:
   - Any drug-drug interaction with severity ≥ moderate
   - Contraindications marked as absolute
   - Dosages exceeding max safe limits
   - Allergies to proposed medications
   - Multiple risk factors (age >65 + renal impairment + polypharmacy)

2. DRUG INTERACTION SEVERITY:
   - Major: Life-threatening, requires immediate intervention
   - Moderate: Serious consequences possible, monitoring needed
   - Minor: Minimal clinical significance

3. CONTRAINDICATION TYPES:
   - Absolute: Never use (e.g., beta-blockers in severe asthma)
   - Relative: Use with extreme caution and monitoring
   - Pregnancy Category X: Absolutely contraindicated in pregnancy

4. DOSAGE CALCULATION RULES:
   - Renal adjustment: Use CrCl (Cockcroft-Gault) if Cr >1.5
   - Hepatic adjustment: Reduce dose 50% if AST/ALT >3x ULN
   - Geriatric (>65): Start at 50% adult dose, titrate slowly
   - Pediatric: Use mg/kg calculations with max caps

5. OUTPUT FORMAT:
   Return ONLY valid JSON matching this exact schema.

6. LIVE EVIDENCE USAGE RULE:
   - Use the provided real-time evidence snapshot as supplemental context.
   - If it conflicts with static rules, choose the safer recommendation and state the uncertainty.
   - Never downgrade a serious interaction or contraindication based on missing data.

DRUG INTERACTION DATABASE:
${JSON.stringify(DRUG_INTERACTION_DB, null, 2)}

CONTRAINDICATION RULES:
${JSON.stringify(CONTRAINDICATION_RULES, null, 2)}

DOSAGE GUIDELINES:
${JSON.stringify(DOSAGE_GUIDELINES, null, 2)}

REAL-TIME CLINICAL EVIDENCE SNAPSHOT:
${liveClinicalEvidenceSummary || 'No live evidence available for this case.'}
`;
};

// Analyze patient data and generate treatment plan
export const analyzePatientData = async (
  patientData: CompletePatientData
): Promise<TreatmentPlanResponse> => {
  logger.debug('analyzePatientData called', { openaiAvailable: Boolean(openai) });
  
  // Use mock response if OpenAI is not configured
  if (!openai) {
    logger.info('Using mock AI response (OpenAI not configured)');
    return generateMockResponse(patientData);
  }

  logger.debug('OpenAI client available, proceeding with API call');
  let clinicalContext: ClinicalContextSnapshot | null = null;
  try {
    clinicalContext = await buildRealtimeClinicalContext(patientData);
    logger.info('Live clinical context generated', { drugsAnalyzed: clinicalContext.drugsAnalyzed.length });
  } catch (contextError) {
    logger.warn('Live clinical context generation failed', { error: (contextError as Error).message });
  }

  const liveEvidenceSummary = clinicalContext?.summary
    || 'No live evidence available for this case.';
  const liveEvidenceSources = clinicalContext?.sources?.join(', ')
    || 'No external sources resolved';

  const systemPrompt = buildSystemPrompt(liveEvidenceSummary);
  
  const userMessage = `Analyze this patient and generate a treatment plan:

PATIENT DATA:
${JSON.stringify(patientData, null, 2)}

CHIEF COMPLAINT: ${patientData.lifestyle?.chiefComplaint?.complaint || 'General consultation'}

LIVE EVIDENCE SOURCES:
${liveEvidenceSources}

LIVE EVIDENCE SUMMARY:
${liveEvidenceSummary}

ANALYSIS REQUIRED:
1. Check all current medications for interactions
2. Validate against conditions and allergies
3. Calculate appropriate dosages
4. Assess overall risk profile
5. Recommend primary treatment + 2 alternatives
6. Provide detailed rationale for each recommendation
7. Include "evidenceSources" as an array of source names used

Return response as valid JSON with this structure:
{
  "treatmentPlan": {
    "primaryTreatment": { "medication": "", "genericName": "", "dosage": "", "frequency": "", "duration": "", "route": "", "instructions": "" },
    "alternativeTreatments": [],
    "supportiveCare": []
  },
  "riskAssessment": { "overallRisk": "LOW|MEDIUM|HIGH|CRITICAL", "riskScore": 0-100, "confidenceScore": 0-100, "riskFactors": [] },
  "flaggedIssues": [],
  "drugInteractions": [],
  "contraindications": [],
  "rationale": { "primaryChoice": "", "riskBenefit": "", "alternativeRationale": "", "monitoringPlan": "", "patientEducation": "" },
  "evidenceSources": ["OpenFDA", "RxNorm", "DailyMed", "Clinical Guidelines"]
}`;

  try {
    logger.info('Making OpenAI API call', { model: config.openai.model, maxTokens: config.openai.maxTokens });
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      max_tokens: config.openai.maxTokens,
      temperature: config.openai.temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    logger.info('OpenAI API call successful');
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    logger.debug('Parsing OpenAI response');
    const parsedResponse = JSON.parse(content) as TreatmentPlanResponse;
    const mergedEvidenceSources = new Set<string>(parsedResponse.evidenceSources || []);
    if (clinicalContext?.sources) {
      clinicalContext.sources.forEach(source => mergedEvidenceSources.add(source));
    }
    if (mergedEvidenceSources.size === 0) {
      mergedEvidenceSources.add('Clinical Guidelines');
    }
    parsedResponse.evidenceSources = Array.from(mergedEvidenceSources);

    logger.info('Response parsed successfully', {
      riskLevel: parsedResponse.riskAssessment?.overallRisk,
      riskScore: parsedResponse.riskAssessment?.riskScore,
      flaggedIssues: parsedResponse.flaggedIssues?.length,
      contraindications: parsedResponse.contraindications?.length,
    });
    return parsedResponse;
  } catch (error) {
    logger.error('OpenAI API error', { error: (error as Error).message });
    logger.info('Falling back to mock response');
    return generateMockResponse(patientData);
  }
};

// Retry logic with exponential backoff
export const analyzeWithRetry = async (
  patientData: CompletePatientData,
  maxRetries = 3
): Promise<TreatmentPlanResponse> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await analyzePatientData(patientData);
      return result;
    } catch (error) {
      logger.warn(`Retry attempt ${attempt}/${maxRetries} failed`, { error: (error as Error).message });
      if (attempt === maxRetries) {
        logger.info('Max retries exceeded, using mock response');
        return generateMockResponse(patientData);
      }
      
      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  
  return generateMockResponse(patientData);
};
