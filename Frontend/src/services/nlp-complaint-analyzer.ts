/**
 * NLP Chief Complaint Analyzer
 * 
 * Extracts structured clinical information from free-text chief complaints.
 * Uses keyword/pattern matching, negation detection, and TF-IDF–style
 * scoring to identify:
 *   - body systems affected
 *   - symptom severity/acuity
 *   - duration indicators
 *   - red-flag symptoms (emergency detection)
 *   - suggested ICD-10 category mapping
 *   - differential diagnoses ranked by probability
 * 
 * All processing is local (no network), privacy-safe, and fast (<50ms).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type AcuityLevel = 'emergent' | 'urgent' | 'semi-urgent' | 'routine';
export type BodySystem =
  | 'cardiovascular' | 'respiratory' | 'neurological' | 'gastrointestinal'
  | 'musculoskeletal' | 'endocrine' | 'renal' | 'dermatological'
  | 'psychiatric' | 'infectious' | 'hematological' | 'ophthalmological'
  | 'ent' | 'reproductive' | 'general';

export interface SymptomEntity {
  term: string;
  bodySystem: BodySystem;
  severity: number;       // 0-10
  isNegated: boolean;
  isRedFlag: boolean;
}

export interface DurationInfo {
  raw: string;
  estimatedDays: number;
  acuteVsChronic: 'acute' | 'subacute' | 'chronic' | 'unknown';
}

export interface DifferentialEntry {
  condition: string;
  probability: number;   // 0-1
  icd10Category: string;
  relatedSymptoms: string[];
}

export interface ChiefComplaintAnalysis {
  originalText: string;
  normalizedText: string;
  symptoms: SymptomEntity[];
  bodySystems: BodySystem[];
  duration: DurationInfo | null;
  acuity: AcuityLevel;
  redFlags: string[];
  differentials: DifferentialEntry[];
  suggestedQuestions: string[];
  confidence: number;    // 0-100
}

// ─── Symptom Lexicon ──────────────────────────────────────────────────────────

interface LexiconEntry {
  terms: string[];
  bodySystem: BodySystem;
  baseSeverity: number;
  redFlag: boolean;
  icd10: string;
}

const SYMPTOM_LEXICON: LexiconEntry[] = [
  // Cardiovascular
  { terms: ['chest pain', 'chest tightness', 'angina', 'chest pressure'], bodySystem: 'cardiovascular', baseSeverity: 8, redFlag: true, icd10: 'I20-I25' },
  { terms: ['palpitations', 'heart racing', 'irregular heartbeat', 'arrhythmia'], bodySystem: 'cardiovascular', baseSeverity: 6, redFlag: false, icd10: 'R00' },
  { terms: ['shortness of breath', 'dyspnea', 'difficulty breathing', 'breathlessness', 'sob'], bodySystem: 'cardiovascular', baseSeverity: 7, redFlag: true, icd10: 'R06.0' },
  { terms: ['swollen legs', 'leg edema', 'ankle swelling', 'pedal edema'], bodySystem: 'cardiovascular', baseSeverity: 5, redFlag: false, icd10: 'R60' },
  { terms: ['syncope', 'fainting', 'passed out', 'lost consciousness'], bodySystem: 'cardiovascular', baseSeverity: 8, redFlag: true, icd10: 'R55' },
  { terms: ['hypertension', 'high blood pressure', 'elevated bp'], bodySystem: 'cardiovascular', baseSeverity: 5, redFlag: false, icd10: 'I10' },

  // Respiratory
  { terms: ['cough', 'coughing', 'persistent cough'], bodySystem: 'respiratory', baseSeverity: 3, redFlag: false, icd10: 'R05' },
  { terms: ['wheezing', 'wheeze'], bodySystem: 'respiratory', baseSeverity: 5, redFlag: false, icd10: 'R06.2' },
  { terms: ['hemoptysis', 'coughing blood', 'blood in sputum'], bodySystem: 'respiratory', baseSeverity: 8, redFlag: true, icd10: 'R04.2' },
  { terms: ['asthma', 'asthma attack', 'bronchospasm'], bodySystem: 'respiratory', baseSeverity: 6, redFlag: false, icd10: 'J45' },
  { terms: ['pneumonia', 'lung infection'], bodySystem: 'respiratory', baseSeverity: 7, redFlag: false, icd10: 'J18' },
  { terms: ['pleurisy', 'pleuritic pain'], bodySystem: 'respiratory', baseSeverity: 6, redFlag: false, icd10: 'R09.1' },

  // Neurological
  { terms: ['headache', 'head pain', 'migraine', 'cephalalgia'], bodySystem: 'neurological', baseSeverity: 4, redFlag: false, icd10: 'R51' },
  { terms: ['thunderclap headache', 'worst headache', 'sudden severe headache'], bodySystem: 'neurological', baseSeverity: 10, redFlag: true, icd10: 'G44' },
  { terms: ['seizure', 'convulsion', 'fitting', 'epilepsy'], bodySystem: 'neurological', baseSeverity: 8, redFlag: true, icd10: 'R56' },
  { terms: ['numbness', 'tingling', 'paresthesia', 'pins and needles'], bodySystem: 'neurological', baseSeverity: 4, redFlag: false, icd10: 'R20' },
  { terms: ['weakness', 'muscle weakness', 'hemiparesis', 'paralysis'], bodySystem: 'neurological', baseSeverity: 7, redFlag: true, icd10: 'R29.8' },
  { terms: ['dizziness', 'vertigo', 'lightheaded', 'light headed'], bodySystem: 'neurological', baseSeverity: 4, redFlag: false, icd10: 'R42' },
  { terms: ['confusion', 'altered mental status', 'disorientation', 'ams'], bodySystem: 'neurological', baseSeverity: 8, redFlag: true, icd10: 'R41' },
  { terms: ['stroke symptoms', 'facial droop', 'slurred speech'], bodySystem: 'neurological', baseSeverity: 10, redFlag: true, icd10: 'I63' },
  { terms: ['memory loss', 'forgetfulness', 'cognitive decline'], bodySystem: 'neurological', baseSeverity: 5, redFlag: false, icd10: 'R41.3' },
  { terms: ['tremor', 'shaking', 'trembling'], bodySystem: 'neurological', baseSeverity: 4, redFlag: false, icd10: 'R25.1' },

  // Gastrointestinal
  { terms: ['abdominal pain', 'stomach pain', 'belly pain', 'epigastric pain'], bodySystem: 'gastrointestinal', baseSeverity: 5, redFlag: false, icd10: 'R10' },
  { terms: ['nausea', 'vomiting', 'emesis', 'feeling sick'], bodySystem: 'gastrointestinal', baseSeverity: 3, redFlag: false, icd10: 'R11' },
  { terms: ['diarrhea', 'loose stools', 'watery stool'], bodySystem: 'gastrointestinal', baseSeverity: 3, redFlag: false, icd10: 'R19.7' },
  { terms: ['constipation', 'difficulty passing stool'], bodySystem: 'gastrointestinal', baseSeverity: 2, redFlag: false, icd10: 'K59.0' },
  { terms: ['bloody stool', 'melena', 'rectal bleeding', 'hematochezia', 'blood in stool'], bodySystem: 'gastrointestinal', baseSeverity: 8, redFlag: true, icd10: 'K92.1' },
  { terms: ['jaundice', 'yellowing skin', 'yellow eyes', 'icterus'], bodySystem: 'gastrointestinal', baseSeverity: 7, redFlag: true, icd10: 'R17' },
  { terms: ['heartburn', 'acid reflux', 'gerd'], bodySystem: 'gastrointestinal', baseSeverity: 3, redFlag: false, icd10: 'K21' },
  { terms: ['dysphagia', 'difficulty swallowing', 'trouble swallowing'], bodySystem: 'gastrointestinal', baseSeverity: 5, redFlag: false, icd10: 'R13' },

  // Musculoskeletal
  { terms: ['back pain', 'low back pain', 'lumbago', 'lumbar pain'], bodySystem: 'musculoskeletal', baseSeverity: 4, redFlag: false, icd10: 'M54' },
  { terms: ['joint pain', 'arthralgia', 'joint swelling'], bodySystem: 'musculoskeletal', baseSeverity: 4, redFlag: false, icd10: 'M25' },
  { terms: ['knee pain', 'hip pain', 'shoulder pain', 'elbow pain'], bodySystem: 'musculoskeletal', baseSeverity: 4, redFlag: false, icd10: 'M79' },
  { terms: ['fracture', 'broken bone'], bodySystem: 'musculoskeletal', baseSeverity: 7, redFlag: false, icd10: 'S72' },
  { terms: ['neck pain', 'cervicalgia'], bodySystem: 'musculoskeletal', baseSeverity: 4, redFlag: false, icd10: 'M54.2' },
  { terms: ['muscle cramp', 'spasm', 'muscle spasm'], bodySystem: 'musculoskeletal', baseSeverity: 3, redFlag: false, icd10: 'R25.2' },

  // Endocrine
  { terms: ['diabetes', 'high blood sugar', 'hyperglycemia'], bodySystem: 'endocrine', baseSeverity: 5, redFlag: false, icd10: 'E11' },
  { terms: ['diabetic ketoacidosis', 'dka'], bodySystem: 'endocrine', baseSeverity: 9, redFlag: true, icd10: 'E10.1' },
  { terms: ['hypoglycemia', 'low blood sugar', 'sugar crash'], bodySystem: 'endocrine', baseSeverity: 7, redFlag: true, icd10: 'E16.2' },
  { terms: ['thyroid', 'hypothyroid', 'hyperthyroid', 'thyroid problem'], bodySystem: 'endocrine', baseSeverity: 4, redFlag: false, icd10: 'E03' },
  { terms: ['weight loss unexplained', 'unintentional weight loss'], bodySystem: 'endocrine', baseSeverity: 6, redFlag: true, icd10: 'R63.4' },
  { terms: ['excessive thirst', 'polydipsia'], bodySystem: 'endocrine', baseSeverity: 4, redFlag: false, icd10: 'R63.1' },

  // Renal
  { terms: ['painful urination', 'dysuria', 'burning urination'], bodySystem: 'renal', baseSeverity: 4, redFlag: false, icd10: 'R30' },
  { terms: ['hematuria', 'blood in urine', 'pink urine'], bodySystem: 'renal', baseSeverity: 6, redFlag: true, icd10: 'R31' },
  { terms: ['kidney stone', 'renal colic', 'flank pain'], bodySystem: 'renal', baseSeverity: 7, redFlag: false, icd10: 'N20' },
  { terms: ['urinary frequency', 'frequent urination', 'polyuria'], bodySystem: 'renal', baseSeverity: 3, redFlag: false, icd10: 'R35' },

  // Dermatological
  { terms: ['rash', 'skin rash', 'eruption'], bodySystem: 'dermatological', baseSeverity: 3, redFlag: false, icd10: 'R21' },
  { terms: ['itching', 'pruritus', 'itchy skin'], bodySystem: 'dermatological', baseSeverity: 2, redFlag: false, icd10: 'L29' },
  { terms: ['swelling', 'angioedema', 'facial swelling'], bodySystem: 'dermatological', baseSeverity: 7, redFlag: true, icd10: 'T78.3' },

  // Psychiatric
  { terms: ['anxiety', 'anxious', 'panic', 'panic attack'], bodySystem: 'psychiatric', baseSeverity: 4, redFlag: false, icd10: 'F41' },
  { terms: ['depression', 'depressed', 'low mood', 'feeling hopeless'], bodySystem: 'psychiatric', baseSeverity: 5, redFlag: false, icd10: 'F32' },
  { terms: ['suicidal', 'self harm', 'suicidal ideation', 'suicide'], bodySystem: 'psychiatric', baseSeverity: 10, redFlag: true, icd10: 'R45.851' },
  { terms: ['insomnia', 'can\'t sleep', 'sleep disturbance', 'difficulty sleeping'], bodySystem: 'psychiatric', baseSeverity: 3, redFlag: false, icd10: 'G47' },

  // Infectious
  { terms: ['fever', 'high temperature', 'pyrexia', 'febrile'], bodySystem: 'infectious', baseSeverity: 4, redFlag: false, icd10: 'R50' },
  { terms: ['chills', 'rigors', 'shivering'], bodySystem: 'infectious', baseSeverity: 4, redFlag: false, icd10: 'R68.83' },
  { terms: ['sore throat', 'pharyngitis', 'throat pain'], bodySystem: 'ent', baseSeverity: 3, redFlag: false, icd10: 'J02' },
  { terms: ['ear pain', 'otalgia', 'earache'], bodySystem: 'ent', baseSeverity: 3, redFlag: false, icd10: 'H92' },

  // General / Constitutional
  { terms: ['fatigue', 'tired', 'exhaustion', 'lethargy', 'malaise'], bodySystem: 'general', baseSeverity: 3, redFlag: false, icd10: 'R53' },
  { terms: ['night sweats'], bodySystem: 'general', baseSeverity: 5, redFlag: true, icd10: 'R61' },
  { terms: ['anaphylaxis', 'allergic reaction', 'severe allergy'], bodySystem: 'general', baseSeverity: 10, redFlag: true, icd10: 'T78.2' },
];

// ─── Differential Diagnosis Rules ─────────────────────────────────────────────

interface DiffRule {
  condition: string;
  icd10: string;
  requiredSymptoms: string[];   // at least one must match
  supportingSymptoms: string[]; // raise probability if present
  baseProbability: number;
  boost: number;
}

const DIFFERENTIAL_RULES: DiffRule[] = [
  {
    condition: 'Acute Coronary Syndrome (ACS)',
    icd10: 'I21',
    requiredSymptoms: ['chest pain', 'chest tightness', 'angina', 'chest pressure'],
    supportingSymptoms: ['shortness of breath', 'diaphoresis', 'nausea', 'jaw pain', 'arm pain', 'palpitations'],
    baseProbability: 0.3,
    boost: 0.12,
  },
  {
    condition: 'Pulmonary Embolism',
    icd10: 'I26',
    requiredSymptoms: ['shortness of breath', 'dyspnea', 'chest pain', 'pleuritic pain'],
    supportingSymptoms: ['leg swelling', 'tachycardia', 'hemoptysis', 'cough'],
    baseProbability: 0.15,
    boost: 0.1,
  },
  {
    condition: 'Stroke / TIA',
    icd10: 'I63',
    requiredSymptoms: ['weakness', 'numbness', 'slurred speech', 'facial droop', 'stroke symptoms'],
    supportingSymptoms: ['confusion', 'headache', 'vision changes', 'dizziness'],
    baseProbability: 0.25,
    boost: 0.12,
  },
  {
    condition: 'Pneumonia',
    icd10: 'J18',
    requiredSymptoms: ['cough', 'fever', 'shortness of breath'],
    supportingSymptoms: ['chills', 'chest pain', 'fatigue', 'sputum'],
    baseProbability: 0.2,
    boost: 0.1,
  },
  {
    condition: 'COPD Exacerbation',
    icd10: 'J44.1',
    requiredSymptoms: ['shortness of breath', 'wheezing', 'cough'],
    supportingSymptoms: ['sputum', 'chest tightness', 'fatigue'],
    baseProbability: 0.15,
    boost: 0.08,
  },
  {
    condition: 'Diabetic Emergency (DKA/HHS)',
    icd10: 'E10.1',
    requiredSymptoms: ['diabetic ketoacidosis', 'dka', 'high blood sugar', 'hyperglycemia'],
    supportingSymptoms: ['nausea', 'vomiting', 'abdominal pain', 'confusion', 'excessive thirst', 'fatigue'],
    baseProbability: 0.2,
    boost: 0.1,
  },
  {
    condition: 'Acute Appendicitis',
    icd10: 'K35',
    requiredSymptoms: ['abdominal pain', 'stomach pain'],
    supportingSymptoms: ['nausea', 'vomiting', 'fever', 'loss of appetite'],
    baseProbability: 0.15,
    boost: 0.08,
  },
  {
    condition: 'Urinary Tract Infection',
    icd10: 'N39.0',
    requiredSymptoms: ['painful urination', 'dysuria', 'urinary frequency'],
    supportingSymptoms: ['fever', 'hematuria', 'flank pain', 'abdominal pain'],
    baseProbability: 0.25,
    boost: 0.1,
  },
  {
    condition: 'Migraine',
    icd10: 'G43',
    requiredSymptoms: ['headache', 'migraine'],
    supportingSymptoms: ['nausea', 'vomiting', 'vision changes', 'light sensitivity', 'aura'],
    baseProbability: 0.3,
    boost: 0.08,
  },
  {
    condition: 'Hypertensive Crisis',
    icd10: 'I16',
    requiredSymptoms: ['high blood pressure', 'hypertension', 'headache'],
    supportingSymptoms: ['chest pain', 'shortness of breath', 'vision changes', 'confusion', 'nosebleed'],
    baseProbability: 0.15,
    boost: 0.1,
  },
  {
    condition: 'Major Depressive Episode',
    icd10: 'F32',
    requiredSymptoms: ['depression', 'depressed', 'low mood', 'feeling hopeless'],
    supportingSymptoms: ['insomnia', 'fatigue', 'weight loss unexplained', 'anxiety', 'suicidal'],
    baseProbability: 0.35,
    boost: 0.1,
  },
  {
    condition: 'Anaphylaxis',
    icd10: 'T78.2',
    requiredSymptoms: ['anaphylaxis', 'allergic reaction', 'severe allergy', 'swelling'],
    supportingSymptoms: ['rash', 'shortness of breath', 'throat tightness', 'itching'],
    baseProbability: 0.2,
    boost: 0.15,
  },
  {
    condition: 'Acute Kidney Injury',
    icd10: 'N17',
    requiredSymptoms: ['decreased urine output', 'hematuria', 'flank pain'],
    supportingSymptoms: ['swollen legs', 'fatigue', 'nausea', 'confusion'],
    baseProbability: 0.15,
    boost: 0.1,
  },
  {
    condition: 'GERD / Peptic Ulcer',
    icd10: 'K21',
    requiredSymptoms: ['heartburn', 'acid reflux', 'epigastric pain'],
    supportingSymptoms: ['nausea', 'dysphagia', 'abdominal pain', 'bloody stool'],
    baseProbability: 0.25,
    boost: 0.08,
  },
  {
    condition: 'Osteoarthritis',
    icd10: 'M15-M19',
    requiredSymptoms: ['joint pain', 'knee pain', 'hip pain'],
    supportingSymptoms: ['joint swelling', 'stiffness', 'decreased range of motion'],
    baseProbability: 0.3,
    boost: 0.08,
  },
];

// ─── Negation Detection ──────────────────────────────────────────────────────

const NEGATION_CUES = [
  'no ', 'not ', 'without ', 'denies ', 'deny ', 'absent ', 'negative for ',
  'does not have ', 'doesn\'t have ', 'no evidence of ', 'ruled out ',
  'free of ', 'lacks ', 'never had ',
];

function isNegated(text: string, termStart: number): boolean {
  // Look at the 40 characters before the term for negation cues
  const window = text.substring(Math.max(0, termStart - 40), termStart).toLowerCase();
  return NEGATION_CUES.some(cue => window.includes(cue));
}

// ─── Severity Modifiers ──────────────────────────────────────────────────────

const SEVERITY_BOOSTERS: [string, number][] = [
  ['severe', 3], ['intense', 3], ['excruciating', 4], ['worst', 4],
  ['acute', 2], ['sudden', 2], ['worsening', 2], ['progressive', 1],
  ['uncontrolled', 2], ['debilitating', 3], ['crushing', 3],
  ['10/10', 4], ['9/10', 3], ['8/10', 2], ['7/10', 1],
];

const SEVERITY_REDUCERS: [string, number][] = [
  ['mild', -2], ['slight', -2], ['minor', -2], ['occasional', -1],
  ['intermittent', -1], ['improving', -1], ['resolving', -2],
  ['1/10', -3], ['2/10', -2], ['3/10', -1],
];

function calcSeverityModifier(text: string): number {
  const lower = text.toLowerCase();
  let mod = 0;
  for (const [word, delta] of SEVERITY_BOOSTERS) {
    if (lower.includes(word)) mod += delta;
  }
  for (const [word, delta] of SEVERITY_REDUCERS) {
    if (lower.includes(word)) mod += delta;
  }
  return mod;
}

// ─── Duration Extraction ─────────────────────────────────────────────────────

const DURATION_PATTERNS: [RegExp, (m: RegExpMatchArray) => number][] = [
  [/(\d+)\s*(?:minute|min)s?\b/i, m => Number.parseFloat(m[1]) / 1440],
  [/(\d+)\s*hours?\b/i, m => Number.parseFloat(m[1]) / 24],
  [/(\d+)\s*days?\b/i, m => Number.parseFloat(m[1])],
  [/(\d+)\s*weeks?\b/i, m => Number.parseFloat(m[1]) * 7],
  [/(\d+)\s*months?\b/i, m => Number.parseFloat(m[1]) * 30],
  [/(\d+)\s*years?\b/i, m => Number.parseFloat(m[1]) * 365],
  [/(?:since|for the past|over the last)\s+(\d+)\s*(day|week|month|year)s?/i, m => {
    const n = Number.parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    if (unit === 'day') return n;
    if (unit === 'week') return n * 7;
    if (unit === 'month') return n * 30;
    return n * 365;
  }],
  [/(?:today|just now|just started|onset today)/i, () => 0.5],
  [/(?:yesterday)/i, () => 1],
  [/(?:this morning|this evening|last night|tonight)/i, () => 0.5],
  [/(?:a few days|couple of days)/i, () => 3],
  [/(?:a week|past week)/i, () => 7],
  [/(?:several weeks|few weeks)/i, () => 21],
  [/(?:chronic|long.?standing|for years)/i, () => 365],
];

function classifyAcuteVsChronic(days: number): 'acute' | 'subacute' | 'chronic' {
  if (days < 14) return 'acute';
  if (days < 90) return 'subacute';
  return 'chronic';
}

function extractDuration(text: string): DurationInfo | null {
  for (const [pattern, extractDays] of DURATION_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      const days = extractDays(match);
      return {
        raw: match[0],
        estimatedDays: Math.round(days * 10) / 10,
        acuteVsChronic: classifyAcuteVsChronic(days),
      };
    }
  }
  return null;
}

// ─── Suggested Follow-up Questions ────────────────────────────────────────────

const SYSTEM_QUESTIONS: Record<BodySystem, string[]> = {
  cardiovascular: [
    'Does the pain radiate to arm, jaw, or back?',
    'Any history of heart disease or prior MI?',
    'Are you currently taking any blood thinners?',
  ],
  respiratory: [
    'Are you producing sputum? What color?',
    'Any history of asthma or COPD?',
    'Have you been exposed to anyone who is sick?',
  ],
  neurological: [
    'When did the symptoms first start?',
    'Any recent head injury or trauma?',
    'Is there any vision change, speech difficulty, or weakness?',
  ],
  gastrointestinal: [
    'Any blood in stool or vomit?',
    'When was your last bowel movement?',
    'Any recent travel or food changes?',
  ],
  musculoskeletal: [
    'Was there a specific injury or event that triggered the pain?',
    'Does the pain worsen with movement or at rest?',
    'Any morning stiffness?',
  ],
  endocrine: [
    'Have you checked your blood sugar recently?',
    'Any recent weight changes?',
    'Are you experiencing excessive thirst or urination?',
  ],
  renal: [
    'Have you noticed any changes in urine color or volume?',
    'Any history of kidney stones or UTIs?',
    'Are you drinking enough fluids?',
  ],
  dermatological: [
    'When did the rash first appear?',
    'Have you started any new medications recently?',
    'Any known allergies?',
  ],
  psychiatric: [
    'Have you had any thoughts of self-harm?',
    'How long have you been feeling this way?',
    'Are you currently seeing a mental health professional?',
  ],
  infectious: [
    'Have you traveled recently?',
    'Any known exposure to infectious diseases?',
    'Are your vaccinations up to date?',
  ],
  hematological: [
    'Have you noticed any easy bruising or bleeding?',
    'Any family history of blood disorders?',
    'Are you taking anticoagulants?',
  ],
  ophthalmological: [
    'Is the vision loss sudden or gradual?',
    'Any eye pain or redness?',
    'When was your last eye exam?',
  ],
  ent: [
    'Any ear discharge or hearing changes?',
    'Is the sore throat accompanied by difficulty swallowing?',
    'Any nasal congestion or sinus pressure?',
  ],
  reproductive: [
    'Any chance of pregnancy?',
    'Any abnormal bleeding?',
    'When was your last menstrual period?',
  ],
  general: [
    'How long have you been feeling this way?',
    'Have you had any unintentional weight changes?',
    'Are you currently taking any medications?',
  ],
};

// ─── Extracted Helpers for analyzeChiefComplaint ─────────────────────────────

function extractSymptoms(
  normalizedText: string,
  severityMod: number,
): { symptoms: SymptomEntity[]; matchedSystems: Set<BodySystem> } {
  const symptoms: SymptomEntity[] = [];
  const matchedSystems = new Set<BodySystem>();

  for (const entry of SYMPTOM_LEXICON) {
    for (const term of entry.terms) {
      const idx = normalizedText.indexOf(term);
      if (idx === -1) continue;

      const negated = isNegated(normalizedText, idx);
      const adjSeverity = Math.max(0, Math.min(10, entry.baseSeverity + (negated ? 0 : severityMod)));

      symptoms.push({
        term,
        bodySystem: entry.bodySystem,
        severity: adjSeverity,
        isNegated: negated,
        isRedFlag: entry.redFlag && !negated,
      });

      if (!negated) {
        matchedSystems.add(entry.bodySystem);
      }
      break; // one match per lexicon entry is enough
    }
  }

  return { symptoms, matchedSystems };
}

function determineAcuity(
  symptoms: SymptomEntity[],
  redFlags: string[],
  duration: ReturnType<typeof extractDuration>,
): AcuityLevel {
  const maxSeverity = symptoms.reduce((mx, s) => (s.isNegated ? mx : Math.max(mx, s.severity)), 0);

  let acuity: AcuityLevel = 'routine';
  if (maxSeverity >= 9 || redFlags.length >= 2) {
    acuity = 'emergent';
  } else if (maxSeverity >= 7 || redFlags.length >= 1) {
    acuity = 'urgent';
  } else if (maxSeverity >= 5) {
    acuity = 'semi-urgent';
  }

  // Acute onset boosts acuity
  if (duration && duration.estimatedDays < 1 && acuity !== 'emergent') {
    const acuityOrder: AcuityLevel[] = ['routine', 'semi-urgent', 'urgent', 'emergent'];
    const idx = acuityOrder.indexOf(acuity);
    if (idx < 3) acuity = acuityOrder[idx + 1];
  }

  return acuity;
}

function matchDifferentials(positiveTerms: string[]): DifferentialEntry[] {
  const differentials: DifferentialEntry[] = [];

  for (const rule of DIFFERENTIAL_RULES) {
    const hasRequired = rule.requiredSymptoms.some(rs =>
      positiveTerms.some(pt => pt.includes(rs) || rs.includes(pt)),
    );
    if (!hasRequired) continue;

    let prob = rule.baseProbability;
    const matched: string[] = [];

    for (const sup of rule.supportingSymptoms) {
      if (positiveTerms.some(pt => pt.includes(sup) || sup.includes(pt))) {
        prob += rule.boost;
        matched.push(sup);
      }
    }

    differentials.push({
      condition: rule.condition,
      probability: Math.round(Math.min(0.95, prob) * 100) / 100,
      icd10Category: rule.icd10,
      relatedSymptoms: matched,
    });
  }

  differentials.sort((a, b) => b.probability - a.probability);
  return differentials;
}

function buildSuggestedQuestions(systems: BodySystem[]): string[] {
  const questions: string[] = [];
  for (const sys of systems) {
    const sysQs = SYSTEM_QUESTIONS[sys];
    if (sysQs) {
      questions.push(...sysQs.slice(0, 2));
    }
  }
  if (questions.length === 0) {
    questions.push(...SYSTEM_QUESTIONS.general);
  }
  return [...new Set(questions)].slice(0, 5);
}

function calculateConfidence(
  symptoms: SymptomEntity[],
  duration: ReturnType<typeof extractDuration>,
  differentials: DifferentialEntry[],
  systems: BodySystem[],
): number {
  let confidence = 30;
  confidence += Math.min(30, symptoms.length * 8);
  if (duration) confidence += 10;
  if (differentials.length > 0) confidence += 15;
  if (systems.length > 0) confidence += 15;
  return Math.min(95, confidence);
}

// ─── Main Analysis Function ──────────────────────────────────────────────────

export function analyzeChiefComplaint(text: string): ChiefComplaintAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      originalText: text,
      normalizedText: '',
      symptoms: [],
      bodySystems: [],
      duration: null,
      acuity: 'routine',
      redFlags: [],
      differentials: [],
      suggestedQuestions: ['Could you describe your main symptoms?'],
      confidence: 0,
    };
  }

  const normalizedText = text.toLowerCase().replaceAll(/[^\w\s'/.-]/g, '').replaceAll(/\s+/g, ' ').trim();
  const severityMod = calcSeverityModifier(normalizedText);

  const { symptoms, matchedSystems } = extractSymptoms(normalizedText, severityMod);
  const duration = extractDuration(normalizedText);
  const redFlags = symptoms.filter(s => s.isRedFlag).map(s => s.term);
  const acuity = determineAcuity(symptoms, redFlags, duration);
  const positiveTerms = symptoms.filter(s => !s.isNegated).map(s => s.term);
  const differentials = matchDifferentials(positiveTerms);
  const systems = [...matchedSystems];
  const suggestedQuestions = buildSuggestedQuestions(systems);
  const confidence = calculateConfidence(symptoms, duration, differentials, systems);

  return {
    originalText: text,
    normalizedText,
    symptoms,
    bodySystems: systems.length > 0 ? systems : ['general'],
    duration,
    acuity,
    redFlags,
    differentials: differentials.slice(0, 5),
    suggestedQuestions,
    confidence,
  };
}

// ─── Batch Analysis Utility ──────────────────────────────────────────────────

/**
 * Analyze multiple complaints (e.g. from a form with separate fields)
 * and merge results.
 */
export function analyzeMultipleComplaints(texts: string[]): ChiefComplaintAnalysis {
  const combined = texts.filter(Boolean).join('. ');
  return analyzeChiefComplaint(combined);
}
