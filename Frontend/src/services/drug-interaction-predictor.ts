/**
 * Drug Interaction Prediction ML Service
 * 
 * Uses TensorFlow.js to predict drug interaction severity between drug pairs
 * based on pharmacological property encoding. Works alongside the lookup-table
 * approach to catch interactions not in the database.
 * 
 * Model Architecture:
 *   Input(14) â†’ Dense(48, relu) â†’ Dropout(0.3) â†’ Dense(24, relu) â†’ Dense(4, softmax)
 * 
 * Output classes: none (0), minor (1), moderate (2), major (3)
 */

import * as tf from '@tensorflow/tfjs';

// â”€â”€â”€ Drug Property Encoding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Pharmacological class IDs used for feature encoding */
const DRUG_CLASS_MAP: Record<string, number> = {
  // Cardiovascular
  'ace_inhibitor': 1, 'arb': 2, 'beta_blocker': 3, 'calcium_channel_blocker': 4,
  'diuretic': 5, 'anticoagulant': 6, 'antiplatelet': 7, 'statin': 8,
  // CNS
  'ssri': 9, 'snri': 10, 'tca': 11, 'benzodiazepine': 12, 'opioid': 13,
  'anticonvulsant': 14, 'maoi': 15, 'antipsychotic': 16,
  // Anti-infective
  'fluoroquinolone': 17, 'macrolide': 18, 'penicillin': 19, 'cephalosporin': 20,
  'antifungal_azole': 21,
  // Metabolic / Endocrine
  'metformin': 22, 'sulfonylurea': 23, 'insulin': 24, 'thyroid': 25,
  'corticosteroid': 26,
  // GI
  'ppi': 27, 'h2_blocker': 28, 'nsaid': 29,
  // Other
  'immunosuppressant': 30, 'antihistamine': 31, 'muscle_relaxant': 32,
  'unknown': 0,
};

/** CYP450 metabolism pathway encoding */
const CYP_PATHWAY_MAP: Record<string, number> = {
  'CYP3A4': 1, 'CYP2D6': 2, 'CYP2C9': 3, 'CYP2C19': 4,
  'CYP1A2': 5, 'CYP2B6': 6, 'none': 0,
};

/** Drug property lookup â€“ maps common drug names to feature vectors */
interface DrugProfile {
  drugClass: string;
  cypPathway: string;
  proteinBinding: number; // 0-1
  halfLife: number;       // hours
  hepatotoxicity: number; // 0-1 risk
  nephrotoxicity: number; // 0-1 risk
  qtProlongation: number; // 0-1 risk
}

const DRUG_PROFILES: Record<string, DrugProfile> = {
  // ACE inhibitors
  lisinopril:    { drugClass: 'ace_inhibitor', cypPathway: 'none', proteinBinding: 0.25, halfLife: 12, hepatotoxicity: 0.1, nephrotoxicity: 0.3, qtProlongation: 0 },
  enalapril:     { drugClass: 'ace_inhibitor', cypPathway: 'none', proteinBinding: 0.5, halfLife: 11, hepatotoxicity: 0.15, nephrotoxicity: 0.3, qtProlongation: 0 },
  ramipril:      { drugClass: 'ace_inhibitor', cypPathway: 'none', proteinBinding: 0.56, halfLife: 13, hepatotoxicity: 0.1, nephrotoxicity: 0.3, qtProlongation: 0 },
  // ARBs
  losartan:      { drugClass: 'arb', cypPathway: 'CYP2C9', proteinBinding: 0.99, halfLife: 6, hepatotoxicity: 0.1, nephrotoxicity: 0.2, qtProlongation: 0 },
  valsartan:     { drugClass: 'arb', cypPathway: 'none', proteinBinding: 0.95, halfLife: 9, hepatotoxicity: 0.1, nephrotoxicity: 0.2, qtProlongation: 0 },
  // Beta blockers
  metoprolol:    { drugClass: 'beta_blocker', cypPathway: 'CYP2D6', proteinBinding: 0.12, halfLife: 5, hepatotoxicity: 0.1, nephrotoxicity: 0.1, qtProlongation: 0.1 },
  atenolol:      { drugClass: 'beta_blocker', cypPathway: 'none', proteinBinding: 0.05, halfLife: 7, hepatotoxicity: 0.05, nephrotoxicity: 0.15, qtProlongation: 0.1 },
  carvedilol:    { drugClass: 'beta_blocker', cypPathway: 'CYP2D6', proteinBinding: 0.98, halfLife: 7, hepatotoxicity: 0.1, nephrotoxicity: 0.1, qtProlongation: 0.1 },
  propranolol:   { drugClass: 'beta_blocker', cypPathway: 'CYP2D6', proteinBinding: 0.9, halfLife: 4, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.15 },
  // CCBs
  amlodipine:    { drugClass: 'calcium_channel_blocker', cypPathway: 'CYP3A4', proteinBinding: 0.93, halfLife: 40, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.05 },
  diltiazem:     { drugClass: 'calcium_channel_blocker', cypPathway: 'CYP3A4', proteinBinding: 0.8, halfLife: 5, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.15 },
  verapamil:     { drugClass: 'calcium_channel_blocker', cypPathway: 'CYP3A4', proteinBinding: 0.9, halfLife: 8, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.2 },
  // Diuretics
  furosemide:    { drugClass: 'diuretic', cypPathway: 'none', proteinBinding: 0.95, halfLife: 2, hepatotoxicity: 0.1, nephrotoxicity: 0.4, qtProlongation: 0.15 },
  hydrochlorothiazide: { drugClass: 'diuretic', cypPathway: 'none', proteinBinding: 0.67, halfLife: 10, hepatotoxicity: 0.05, nephrotoxicity: 0.3, qtProlongation: 0.1 },
  spironolactone:{ drugClass: 'diuretic', cypPathway: 'none', proteinBinding: 0.9, halfLife: 15, hepatotoxicity: 0.1, nephrotoxicity: 0.2, qtProlongation: 0.05 },
  // Anticoagulants / Antiplatelets
  warfarin:      { drugClass: 'anticoagulant', cypPathway: 'CYP2C9', proteinBinding: 0.99, halfLife: 40, hepatotoxicity: 0.2, nephrotoxicity: 0.05, qtProlongation: 0 },
  apixaban:      { drugClass: 'anticoagulant', cypPathway: 'CYP3A4', proteinBinding: 0.87, halfLife: 12, hepatotoxicity: 0.1, nephrotoxicity: 0.1, qtProlongation: 0 },
  rivaroxaban:   { drugClass: 'anticoagulant', cypPathway: 'CYP3A4', proteinBinding: 0.95, halfLife: 9, hepatotoxicity: 0.15, nephrotoxicity: 0.15, qtProlongation: 0 },
  clopidogrel:   { drugClass: 'antiplatelet', cypPathway: 'CYP2C19', proteinBinding: 0.98, halfLife: 6, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0 },
  aspirin:       { drugClass: 'antiplatelet', cypPathway: 'none', proteinBinding: 0.8, halfLife: 4, hepatotoxicity: 0.1, nephrotoxicity: 0.15, qtProlongation: 0 },
  // Statins
  atorvastatin:  { drugClass: 'statin', cypPathway: 'CYP3A4', proteinBinding: 0.98, halfLife: 14, hepatotoxicity: 0.3, nephrotoxicity: 0.1, qtProlongation: 0 },
  simvastatin:   { drugClass: 'statin', cypPathway: 'CYP3A4', proteinBinding: 0.95, halfLife: 3, hepatotoxicity: 0.35, nephrotoxicity: 0.1, qtProlongation: 0 },
  rosuvastatin:  { drugClass: 'statin', cypPathway: 'CYP2C9', proteinBinding: 0.9, halfLife: 19, hepatotoxicity: 0.25, nephrotoxicity: 0.1, qtProlongation: 0 },
  pravastatin:   { drugClass: 'statin', cypPathway: 'none', proteinBinding: 0.5, halfLife: 2, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0 },
  // SSRIs/SNRIs
  sertraline:    { drugClass: 'ssri', cypPathway: 'CYP2D6', proteinBinding: 0.98, halfLife: 26, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0.15 },
  fluoxetine:    { drugClass: 'ssri', cypPathway: 'CYP2D6', proteinBinding: 0.94, halfLife: 72, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0.1 },
  citalopram:    { drugClass: 'ssri', cypPathway: 'CYP2C19', proteinBinding: 0.8, halfLife: 35, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.3 },
  escitalopram:  { drugClass: 'ssri', cypPathway: 'CYP2C19', proteinBinding: 0.56, halfLife: 30, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.25 },
  paroxetine:    { drugClass: 'ssri', cypPathway: 'CYP2D6', proteinBinding: 0.95, halfLife: 21, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0.1 },
  venlafaxine:   { drugClass: 'snri', cypPathway: 'CYP2D6', proteinBinding: 0.27, halfLife: 5, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0.15 },
  duloxetine:    { drugClass: 'snri', cypPathway: 'CYP1A2', proteinBinding: 0.96, halfLife: 12, hepatotoxicity: 0.25, nephrotoxicity: 0.05, qtProlongation: 0.1 },
  // TCAs
  amitriptyline: { drugClass: 'tca', cypPathway: 'CYP2D6', proteinBinding: 0.96, halfLife: 25, hepatotoxicity: 0.2, nephrotoxicity: 0.05, qtProlongation: 0.4 },
  nortriptyline: { drugClass: 'tca', cypPathway: 'CYP2D6', proteinBinding: 0.93, halfLife: 30, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0.35 },
  // Opioids
  tramadol:      { drugClass: 'opioid', cypPathway: 'CYP2D6', proteinBinding: 0.2, halfLife: 6, hepatotoxicity: 0.1, nephrotoxicity: 0.1, qtProlongation: 0.1 },
  codeine:       { drugClass: 'opioid', cypPathway: 'CYP2D6', proteinBinding: 0.25, halfLife: 3, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.05 },
  oxycodone:     { drugClass: 'opioid', cypPathway: 'CYP3A4', proteinBinding: 0.45, halfLife: 4, hepatotoxicity: 0.15, nephrotoxicity: 0.1, qtProlongation: 0.05 },
  morphine:      { drugClass: 'opioid', cypPathway: 'none', proteinBinding: 0.35, halfLife: 3, hepatotoxicity: 0.2, nephrotoxicity: 0.15, qtProlongation: 0.1 },
  // Benzodiazepines
  diazepam:      { drugClass: 'benzodiazepine', cypPathway: 'CYP3A4', proteinBinding: 0.98, halfLife: 48, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.05 },
  alprazolam:    { drugClass: 'benzodiazepine', cypPathway: 'CYP3A4', proteinBinding: 0.8, halfLife: 11, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.05 },
  lorazepam:     { drugClass: 'benzodiazepine', cypPathway: 'none', proteinBinding: 0.85, halfLife: 14, hepatotoxicity: 0.05, nephrotoxicity: 0.05, qtProlongation: 0.05 },
  // Anticonvulsants
  carbamazepine: { drugClass: 'anticonvulsant', cypPathway: 'CYP3A4', proteinBinding: 0.76, halfLife: 20, hepatotoxicity: 0.3, nephrotoxicity: 0.1, qtProlongation: 0.1 },
  phenytoin:     { drugClass: 'anticonvulsant', cypPathway: 'CYP2C9', proteinBinding: 0.9, halfLife: 22, hepatotoxicity: 0.25, nephrotoxicity: 0.1, qtProlongation: 0.1 },
  valproate:     { drugClass: 'anticonvulsant', cypPathway: 'CYP2C9', proteinBinding: 0.9, halfLife: 12, hepatotoxicity: 0.35, nephrotoxicity: 0.1, qtProlongation: 0.05 },
  gabapentin:    { drugClass: 'anticonvulsant', cypPathway: 'none', proteinBinding: 0.03, halfLife: 7, hepatotoxicity: 0.05, nephrotoxicity: 0.15, qtProlongation: 0 },
  // NSAIDs
  ibuprofen:     { drugClass: 'nsaid', cypPathway: 'CYP2C9', proteinBinding: 0.99, halfLife: 2, hepatotoxicity: 0.15, nephrotoxicity: 0.35, qtProlongation: 0 },
  naproxen:      { drugClass: 'nsaid', cypPathway: 'CYP2C9', proteinBinding: 0.99, halfLife: 14, hepatotoxicity: 0.15, nephrotoxicity: 0.35, qtProlongation: 0 },
  celecoxib:     { drugClass: 'nsaid', cypPathway: 'CYP2C9', proteinBinding: 0.97, halfLife: 11, hepatotoxicity: 0.15, nephrotoxicity: 0.25, qtProlongation: 0 },
  // PPI
  omeprazole:    { drugClass: 'ppi', cypPathway: 'CYP2C19', proteinBinding: 0.95, halfLife: 1, hepatotoxicity: 0.05, nephrotoxicity: 0.1, qtProlongation: 0.05 },
  pantoprazole:  { drugClass: 'ppi', cypPathway: 'CYP2C19', proteinBinding: 0.98, halfLife: 1, hepatotoxicity: 0.05, nephrotoxicity: 0.1, qtProlongation: 0.05 },
  // Anti-diabetic
  metformin:     { drugClass: 'metformin', cypPathway: 'none', proteinBinding: 0.01, halfLife: 5, hepatotoxicity: 0.05, nephrotoxicity: 0.3, qtProlongation: 0 },
  glipizide:     { drugClass: 'sulfonylurea', cypPathway: 'CYP2C9', proteinBinding: 0.99, halfLife: 4, hepatotoxicity: 0.1, nephrotoxicity: 0.1, qtProlongation: 0 },
  // Antibiotics
  ciprofloxacin: { drugClass: 'fluoroquinolone', cypPathway: 'CYP1A2', proteinBinding: 0.3, halfLife: 4, hepatotoxicity: 0.15, nephrotoxicity: 0.2, qtProlongation: 0.25 },
  levofloxacin:  { drugClass: 'fluoroquinolone', cypPathway: 'none', proteinBinding: 0.3, halfLife: 7, hepatotoxicity: 0.1, nephrotoxicity: 0.15, qtProlongation: 0.3 },
  azithromycin:  { drugClass: 'macrolide', cypPathway: 'CYP3A4', proteinBinding: 0.5, halfLife: 68, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0.3 },
  erythromycin:  { drugClass: 'macrolide', cypPathway: 'CYP3A4', proteinBinding: 0.8, halfLife: 2, hepatotoxicity: 0.2, nephrotoxicity: 0.05, qtProlongation: 0.35 },
  clarithromycin:{ drugClass: 'macrolide', cypPathway: 'CYP3A4', proteinBinding: 0.7, halfLife: 4, hepatotoxicity: 0.2, nephrotoxicity: 0.1, qtProlongation: 0.25 },
  amoxicillin:   { drugClass: 'penicillin', cypPathway: 'none', proteinBinding: 0.2, halfLife: 1, hepatotoxicity: 0.05, nephrotoxicity: 0.05, qtProlongation: 0 },
  // Antifungals
  fluconazole:   { drugClass: 'antifungal_azole', cypPathway: 'CYP2C9', proteinBinding: 0.12, halfLife: 30, hepatotoxicity: 0.25, nephrotoxicity: 0.1, qtProlongation: 0.2 },
  ketoconazole:  { drugClass: 'antifungal_azole', cypPathway: 'CYP3A4', proteinBinding: 0.99, halfLife: 8, hepatotoxicity: 0.4, nephrotoxicity: 0.1, qtProlongation: 0.2 },
  // Corticosteroids
  prednisone:    { drugClass: 'corticosteroid', cypPathway: 'CYP3A4', proteinBinding: 0.7, halfLife: 3, hepatotoxicity: 0.1, nephrotoxicity: 0.1, qtProlongation: 0.05 },
  // Thyroid
  levothyroxine: { drugClass: 'thyroid', cypPathway: 'none', proteinBinding: 0.99, halfLife: 168, hepatotoxicity: 0.05, nephrotoxicity: 0.05, qtProlongation: 0.1 },
  // Muscle relaxants
  cyclobenzaprine: { drugClass: 'muscle_relaxant', cypPathway: 'CYP1A2', proteinBinding: 0.93, halfLife: 18, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.15 },
  // Antihistamines
  diphenhydramine: { drugClass: 'antihistamine', cypPathway: 'CYP2D6', proteinBinding: 0.98, halfLife: 8, hepatotoxicity: 0.05, nephrotoxicity: 0.05, qtProlongation: 0.1 },
  cetirizine:    { drugClass: 'antihistamine', cypPathway: 'none', proteinBinding: 0.93, halfLife: 8, hepatotoxicity: 0.05, nephrotoxicity: 0.05, qtProlongation: 0.05 },
  // Antipsychotics
  quetiapine:    { drugClass: 'antipsychotic', cypPathway: 'CYP3A4', proteinBinding: 0.83, halfLife: 7, hepatotoxicity: 0.15, nephrotoxicity: 0.05, qtProlongation: 0.2 },
  risperidone:   { drugClass: 'antipsychotic', cypPathway: 'CYP2D6', proteinBinding: 0.9, halfLife: 20, hepatotoxicity: 0.1, nephrotoxicity: 0.05, qtProlongation: 0.25 },
  // MAOI
  phenelzine:    { drugClass: 'maoi', cypPathway: 'none', proteinBinding: 0.5, halfLife: 12, hepatotoxicity: 0.3, nephrotoxicity: 0.1, qtProlongation: 0.15 },
  // Immunosuppressants
  cyclosporine:  { drugClass: 'immunosuppressant', cypPathway: 'CYP3A4', proteinBinding: 0.95, halfLife: 19, hepatotoxicity: 0.3, nephrotoxicity: 0.5, qtProlongation: 0.05 },
  tacrolimus:    { drugClass: 'immunosuppressant', cypPathway: 'CYP3A4', proteinBinding: 0.99, halfLife: 12, hepatotoxicity: 0.3, nephrotoxicity: 0.45, qtProlongation: 0.1 },
};

// â”€â”€â”€ Feature Extraction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEFAULT_PROFILE: DrugProfile = {
  drugClass: 'unknown', cypPathway: 'none',
  proteinBinding: 0.5, halfLife: 8,
  hepatotoxicity: 0.1, nephrotoxicity: 0.1, qtProlongation: 0.1,
};

function lookupProfile(drugName: string): DrugProfile {
  const key = drugName.toLowerCase().replaceAll(/[^a-z]/g, '');
  return DRUG_PROFILES[key] ?? DEFAULT_PROFILE;
}

/**
 * Encode a pair of drugs into a 14-element feature vector
 *   [classA, classB, cypA, cypB, protBindA, protBindB,
 *    halfLifeA(norm), halfLifeB(norm), hepatoA, hepatoB,
 *    nephroA, nephroB, qtA, qtB]
 */
function encodeDrugPair(drugA: string, drugB: string): number[] {
  const a = lookupProfile(drugA);
  const b = lookupProfile(drugB);

  const classA = (DRUG_CLASS_MAP[a.drugClass] ?? 0) / 32;
  const classB = (DRUG_CLASS_MAP[b.drugClass] ?? 0) / 32;
  const cypA = (CYP_PATHWAY_MAP[a.cypPathway] ?? 0) / 6;
  const cypB = (CYP_PATHWAY_MAP[b.cypPathway] ?? 0) / 6;

  return [
    classA, classB,
    cypA, cypB,
    a.proteinBinding, b.proteinBinding,
    Math.min(a.halfLife / 168, 1), Math.min(b.halfLife / 168, 1),
    a.hepatotoxicity, b.hepatotoxicity,
    a.nephrotoxicity, b.nephrotoxicity,
    a.qtProlongation, b.qtProlongation,
  ];
}

// â”€â”€â”€ Training Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Training entries: [drugA, drugB, severityClass]
 * 0 = none, 1 = minor, 2 = moderate, 3 = major
 */
const INTERACTION_TRAINING_DATA: [string, string, number][] = [
  // Major interactions (class 3)
  ['warfarin', 'aspirin', 3],
  ['warfarin', 'ibuprofen', 3],
  ['warfarin', 'naproxen', 3],
  ['warfarin', 'fluconazole', 3],
  ['warfarin', 'erythromycin', 3],
  ['warfarin', 'ciprofloxacin', 3],
  ['clopidogrel', 'omeprazole', 3],
  ['simvastatin', 'erythromycin', 3],
  ['simvastatin', 'clarithromycin', 3],
  ['simvastatin', 'ketoconazole', 3],
  ['atorvastatin', 'clarithromycin', 3],
  ['cyclosporine', 'simvastatin', 3],
  ['metoprolol', 'verapamil', 3],
  ['diltiazem', 'metoprolol', 3],
  ['phenelzine', 'sertraline', 3],
  ['phenelzine', 'fluoxetine', 3],
  ['phenelzine', 'venlafaxine', 3],
  ['phenelzine', 'tramadol', 3],
  ['tramadol', 'sertraline', 3],
  ['tramadol', 'fluoxetine', 3],
  ['oxycodone', 'diazepam', 3],
  ['morphine', 'alprazolam', 3],
  ['morphine', 'diazepam', 3],
  ['lisinopril', 'spironolactone', 3],
  ['enalapril', 'spironolactone', 3],
  ['carbamazepine', 'erythromycin', 3],
  ['phenytoin', 'fluconazole', 3],
  ['cyclosporine', 'ketoconazole', 3],
  ['tacrolimus', 'ketoconazole', 3],
  ['tacrolimus', 'clarithromycin', 3],
  ['fluoxetine', 'amitriptyline', 3],
  ['paroxetine', 'tramadol', 3],
  ['citalopram', 'erythromycin', 3],

  // Moderate interactions (class 2)
  ['lisinopril', 'ibuprofen', 2],
  ['lisinopril', 'naproxen', 2],
  ['losartan', 'ibuprofen', 2],
  ['enalapril', 'naproxen', 2],
  ['metformin', 'furosemide', 2],
  ['metformin', 'ciprofloxacin', 2],
  ['warfarin', 'omeprazole', 2],
  ['warfarin', 'atorvastatin', 2],
  ['sertraline', 'ibuprofen', 2],
  ['fluoxetine', 'ibuprofen', 2],
  ['citalopram', 'omeprazole', 2],
  ['prednisone', 'ibuprofen', 2],
  ['prednisone', 'naproxen', 2],
  ['prednisone', 'aspirin', 2],
  ['furosemide', 'lisinopril', 2],
  ['hydrochlorothiazide', 'lisinopril', 2],
  ['amlodipine', 'simvastatin', 2],
  ['levothyroxine', 'omeprazole', 2],
  ['levothyroxine', 'pantoprazole', 2],
  ['gabapentin', 'morphine', 2],
  ['gabapentin', 'oxycodone', 2],
  ['glipizide', 'fluconazole', 2],
  ['quetiapine', 'carbamazepine', 2],
  ['risperidone', 'fluoxetine', 2],
  ['risperidone', 'paroxetine', 2],
  ['diphenhydramine', 'oxycodone', 2],
  ['cyclobenzaprine', 'tramadol', 2],

  // Minor interactions (class 1)
  ['metformin', 'atorvastatin', 1],
  ['lisinopril', 'metformin', 1],
  ['amlodipine', 'atorvastatin', 1],
  ['omeprazole', 'metformin', 1],
  ['losartan', 'hydrochlorothiazide', 1],
  ['atenolol', 'amlodipine', 1],
  ['sertraline', 'omeprazole', 1],
  ['gabapentin', 'cetirizine', 1],
  ['lorazepam', 'cetirizine', 1],
  ['pravastatin', 'amlodipine', 1],
  ['amoxicillin', 'metformin', 1],
  ['pantoprazole', 'atorvastatin', 1],
  ['cetirizine', 'lorazepam', 1],

  // No interaction (class 0)
  ['lisinopril', 'atorvastatin', 0],
  ['metformin', 'levothyroxine', 0],
  ['amlodipine', 'metformin', 0],
  ['sertraline', 'metformin', 0],
  ['gabapentin', 'metformin', 0],
  ['amoxicillin', 'sertraline', 0],
  ['cetirizine', 'metformin', 0],
  ['pantoprazole', 'gabapentin', 0],
  ['aspirin', 'metformin', 0],
  ['atenolol', 'gabapentin', 0],
  ['losartan', 'atorvastatin', 0],
  ['pravastatin', 'lisinopril', 0],
  ['amoxicillin', 'cetirizine', 0],
  ['levothyroxine', 'amlodipine', 0],
  ['ramipril', 'rosuvastatin', 0],
];

// â”€â”€â”€ Model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SEVERITY_LABELS = ['none', 'minor', 'moderate', 'major'] as const;
export type InteractionSeverity = (typeof SEVERITY_LABELS)[number];

export interface InteractionPrediction {
  drug1: string;
  drug2: string;
  predictedSeverity: InteractionSeverity;
  probabilities: Record<InteractionSeverity, number>;
  confidence: number;
  knownInteraction: boolean;
}


/** Calculate interaction score between two drug profiles */
function calculateInteractionScore(a: DrugProfile, b: DrugProfile): number {
  let score = 0;
  if (a.cypPathway !== 'none' && a.cypPathway === b.cypPathway) score += 2;
  if (a.proteinBinding > 0.9 && b.proteinBinding > 0.9) score += 1;
  if (a.hepatotoxicity + b.hepatotoxicity > 0.5) score += 1;
  if (a.nephrotoxicity + b.nephrotoxicity > 0.5) score += 1;
  if (a.qtProlongation + b.qtProlongation > 0.4) score += 2;
  score += calculateClassComboScore(a.drugClass, b.drugClass);
  return score;
}

/** Score dangerous drug class combinations */
function calculateClassComboScore(classA: string, classB: string): number {
  const classes = new Set([classA, classB]);
  let score = 0;
  if (classes.has('maoi') && (classes.has('ssri') || classes.has('snri') || classes.has('opioid'))) score += 4;
  if (classes.has('opioid') && classes.has('benzodiazepine')) score += 3;
  if (classes.has('anticoagulant') && classes.has('nsaid')) score += 3;
  if (classes.has('anticoagulant') && classes.has('antiplatelet')) score += 2;
  return score;
}

/** Map numeric score to severity label */
function scoreToSeverity(score: number): InteractionSeverity {
  if (score >= 5) return 'major';
  if (score >= 3) return 'moderate';
  if (score >= 1) return 'minor';
  return 'none';
}

/** Build probability distribution for rule-based fallback */
function buildFallbackProbabilities(severity: InteractionSeverity): Record<InteractionSeverity, number> {
  return {
    none: severity === 'none' ? 90 : 5,
    minor: severity === 'minor' ? 75 : 10,
    moderate: severity === 'moderate' ? 75 : 5,
    major: severity === 'major' ? 80 : 5,
  };
}

export class DrugInteractionPredictor {
  private model: tf.Sequential | null = null;
  private trained = false;
  private training = false;

  /** Build the classification network */
  private createModel(): tf.Sequential {
    const model = tf.sequential();

    model.add(tf.layers.dense({
      units: 48,
      activation: 'relu',
      inputShape: [14],
      kernelRegularizer: tf.regularizers.l2({ l2: 0.005 }),
    }));
    model.add(tf.layers.dropout({ rate: 0.3 }));

    model.add(tf.layers.dense({
      units: 24,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.005 }),
    }));

    model.add(tf.layers.dense({
      units: 4,
      activation: 'softmax',
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  /**
   * Train the interaction prediction model.
   * Augments the dataset by encoding both (A,B) and (B,A) orderings.
   */
  async train(onProgress?: (epoch: number, loss: number, acc: number) => void): Promise<void> {
    if (this.training) throw new Error('Already training');
    this.training = true;

    try {
      this.model = this.createModel();

      // Build augmented dataset (both orderings)
      const inputs: number[][] = [];
      const labels: number[][] = [];

      for (const [drugA, drugB, severity] of INTERACTION_TRAINING_DATA) {
        const featsAB = encodeDrugPair(drugA, drugB);
        // Data augmentation: reverse order to learn commutative interactions
        const reversedFirst = drugB;
        const reversedSecond = drugA;
        const featsBA = encodeDrugPair(reversedFirst, reversedSecond);
        const oneHot = [0, 0, 0, 0];
        oneHot[severity] = 1;

        inputs.push(featsAB, featsBA);
        labels.push([...oneHot], [...oneHot]);
      }

      const xs = tf.tensor2d(inputs);
      const ys = tf.tensor2d(labels);

      await this.model.fit(xs, ys, {
        epochs: 120,
        batchSize: 16,
        validationSplit: 0.15,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (onProgress && logs) {
              onProgress(epoch + 1, Number(logs.loss), Number(logs.acc));
            }
          },
        },
      });

      xs.dispose();
      ys.dispose();

      this.trained = true;
      console.log('âœ… Drug Interaction Prediction Model trained successfully');
    } finally {
      this.training = false;
    }
  }

  /** Predict interaction severity between two drugs */
  async predict(drug1: string, drug2: string): Promise<InteractionPrediction> {
    if (!this.model || !this.trained) {
      return this.ruleBasedFallback(drug1, drug2);
    }

    const features = encodeDrugPair(drug1, drug2);
    const input = tf.tensor2d([features]);
    const output = this.model.predict(input) as tf.Tensor;
    const probs = await output.data();

    input.dispose();
    output.dispose();

    const maxIdx = probs.indexOf(Math.max(...Array.from(probs)));
    const predictedSeverity = SEVERITY_LABELS[maxIdx];
    const confidence = Math.round(probs[maxIdx] * 1000) / 10;

    // Check if this pair was in the training set
    const knownInteraction = INTERACTION_TRAINING_DATA.some(
      ([a, b]) =>
        (a.toLowerCase() === drug1.toLowerCase() && b.toLowerCase() === drug2.toLowerCase()) ||
        (a.toLowerCase() === drug2.toLowerCase() && b.toLowerCase() === drug1.toLowerCase()),
    );

    return {
      drug1,
      drug2,
      predictedSeverity,
      probabilities: {
        none: Math.round(probs[0] * 1000) / 10,
        minor: Math.round(probs[1] * 1000) / 10,
        moderate: Math.round(probs[2] * 1000) / 10,
        major: Math.round(probs[3] * 1000) / 10,
      },
      confidence,
      knownInteraction,
    };
  }

  /** Predict all pairwise interactions for a medication list */
  async predictMultiple(drugs: string[]): Promise<InteractionPrediction[]> {
    const results: InteractionPrediction[] = [];
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const pred = await this.predict(drugs[i], drugs[j]);
        if (pred.predictedSeverity !== 'none') {
          results.push(pred);
        }
      }
    }
    // Sort by descending severity
    const severityOrder: Record<InteractionSeverity, number> = { major: 3, moderate: 2, minor: 1, none: 0 };
    results.sort((a, b) => severityOrder[b.predictedSeverity] - severityOrder[a.predictedSeverity]);
    return results;
  }

  /** Rule-based fallback when the model isn't trained */
  private ruleBasedFallback(drug1: string, drug2: string): InteractionPrediction {
    const a = lookupProfile(drug1);
    const b = lookupProfile(drug2);
    const score = calculateInteractionScore(a, b);
    const predictedSeverity = scoreToSeverity(score);

    return {
      drug1,
      drug2,
      predictedSeverity,
      probabilities: buildFallbackProbabilities(predictedSeverity),
      confidence: 65,
      knownInteraction: false,
    };
  }
  isTrained(): boolean { return this.trained; }
  isTraining(): boolean { return this.training; }

  dispose(): void {
    this.model?.dispose();
    this.model = null;
    this.trained = false;
  }
}

// â”€â”€â”€ Singleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let instance: DrugInteractionPredictor | null = null;

async function waitForInteractionModelTraining(
  predictor: DrugInteractionPredictor,
  timeoutMs = 180000,
): Promise<void> {
  const start = Date.now();
  while (predictor.isTraining()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for drug interaction model training to finish');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!predictor.isTrained()) {
    throw new Error('Drug interaction model training ended without a trained model');
  }
}

export function getDrugInteractionPredictor(): DrugInteractionPredictor {
  instance ??= new DrugInteractionPredictor();
  return instance;
}

export async function initializeDrugInteractionModel(
  onProgress?: (epoch: number, loss: number, acc: number) => void,
): Promise<DrugInteractionPredictor> {
  const predictor = getDrugInteractionPredictor();

  if (predictor.isTrained()) {
    return predictor;
  }

  if (predictor.isTraining()) {
    await waitForInteractionModelTraining(predictor);
  } else {
    await predictor.train(onProgress);
  }

  if (!predictor.isTrained()) {
    throw new Error('Drug interaction model failed to initialize');
  }

  return predictor;
}
