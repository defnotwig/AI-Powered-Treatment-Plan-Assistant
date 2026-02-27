/**
 * Allergy Cross-Reactivity Engine (Frontend)
 * 
 * Client-side allergy validation that detects:
 *   - Direct allergy matches
 *   - Cross-reactivity between drug classes
 *   - Excipient / inactive ingredient allergies
 *   - Class-level alerts (e.g. penicillin → cephalosporin)
 * 
 * Works entirely offline — no API calls required.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AllergyAlert {
  allergen: string;
  drug: string;
  alertType: 'direct' | 'cross-reactive' | 'class-based' | 'excipient';
  severity: 'high' | 'moderate' | 'low';
  crossReactivityRate: string;
  message: string;
  recommendation: string;
}

export interface AllergyCheckResult {
  safe: boolean;
  alerts: AllergyAlert[];
  checkedDrugs: string[];
  checkedAllergens: string[];
}

// ─── Cross-reactivity Groups ─────────────────────────────────────────────────

interface CrossReactivityGroup {
  groupName: string;
  primaryAllergens: string[];
  crossReactiveDrugs: string[];
  crossReactivityRate: string;
  severity: 'high' | 'moderate' | 'low';
  recommendation: string;
}

const CROSS_REACTIVITY_GROUPS: CrossReactivityGroup[] = [
  {
    groupName: 'Penicillin / Beta-Lactam',
    primaryAllergens: ['penicillin', 'amoxicillin', 'ampicillin', 'piperacillin', 'nafcillin', 'oxacillin', 'dicloxacillin'],
    crossReactiveDrugs: ['cephalexin', 'cefazolin', 'ceftriaxone', 'cefepime', 'cefuroxime', 'cefdinir', 'cefpodoxime', 'imipenem', 'meropenem', 'ertapenem'],
    crossReactivityRate: '1-10%',
    severity: 'high',
    recommendation: 'Cephalosporin use requires careful risk-benefit analysis. Graded challenge or skin testing recommended. Carbapenems generally safe (<1% cross-reactivity).',
  },
  {
    groupName: 'Sulfonamide Antibiotics',
    primaryAllergens: ['sulfa', 'sulfamethoxazole', 'trimethoprim-sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine'],
    crossReactiveDrugs: ['sulfadiazine', 'dapsone', 'sulfacetamide'],
    crossReactivityRate: '10-15%',
    severity: 'moderate',
    recommendation: 'Non-antibiotic sulfonamides (furosemide, thiazides, celecoxib) have very low cross-reactivity. Antibiotic sulfonamides should be avoided.',
  },
  {
    groupName: 'Sulfonamide → Non-Antibiotic Sulfonamides',
    primaryAllergens: ['sulfa', 'sulfamethoxazole', 'bactrim'],
    crossReactiveDrugs: ['furosemide', 'hydrochlorothiazide', 'celecoxib', 'sumatriptan', 'glipizide', 'glyburide'],
    crossReactivityRate: '<2%',
    severity: 'low',
    recommendation: 'Very low cross-reactivity. Generally safe to use with monitoring. True sulfonamide allergy is to the arylamine group absent in these drugs.',
  },
  {
    groupName: 'NSAID',
    primaryAllergens: ['aspirin', 'ibuprofen', 'naproxen', 'nsaid', 'ketorolac', 'indomethacin', 'piroxicam'],
    crossReactiveDrugs: ['diclofenac', 'meloxicam', 'ketoprofen', 'flurbiprofen', 'etodolac', 'nabumetone'],
    crossReactivityRate: '20-30% (COX-1 mediated)',
    severity: 'high',
    recommendation: 'COX-2 selective NSAIDs (celecoxib) have low cross-reactivity (~4%). Acetaminophen is generally safe at standard doses.',
  },
  {
    groupName: 'Opioid',
    primaryAllergens: ['morphine', 'codeine', 'hydrocodone', 'oxycodone'],
    crossReactiveDrugs: ['hydromorphone', 'oxymorphone', 'tramadol', 'fentanyl', 'methadone', 'meperidine', 'tapentadol'],
    crossReactivityRate: 'Variable (structural similarity)',
    severity: 'moderate',
    recommendation: 'True opioid allergy is rare; most reactions are pseudo-allergic (histamine release). Fentanyl and methadone are structurally dissimilar and may be tolerated.',
  },
  {
    groupName: 'ACE Inhibitor Angioedema',
    primaryAllergens: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'benazepril', 'fosinopril', 'quinapril'],
    crossReactiveDrugs: ['other ace inhibitors'],
    crossReactivityRate: 'Class-wide (~100%)',
    severity: 'high',
    recommendation: 'All ACE inhibitors are contraindicated after angioedema. ARBs have ~10% cross-reactivity for angioedema. Use with extreme caution or avoid.',
  },
  {
    groupName: 'Fluoroquinolone',
    primaryAllergens: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'ofloxacin'],
    crossReactiveDrugs: ['gemifloxacin', 'delafloxacin', 'norfloxacin'],
    crossReactivityRate: '~10%',
    severity: 'moderate',
    recommendation: 'Cross-reactivity within fluoroquinolones is possible. True IgE-mediated allergy is uncommon. Alternatives: azithromycin, doxycycline, or amoxicillin depending on indication.',
  },
  {
    groupName: 'Local Anesthetics (Amide)',
    primaryAllergens: ['lidocaine', 'bupivacaine', 'mepivacaine', 'prilocaine', 'ropivacaine'],
    crossReactiveDrugs: ['articaine', 'etidocaine'],
    crossReactivityRate: '<1% (usually preservative allergy)',
    severity: 'low',
    recommendation: 'True allergy to amide local anesthetics is extremely rare. Reactions are usually vasovagal or due to epinephrine/preservatives. Ester class (procaine) can be substituted.',
  },
  {
    groupName: 'Statin',
    primaryAllergens: ['atorvastatin', 'simvastatin', 'lovastatin', 'rosuvastatin', 'pravastatin', 'fluvastatin'],
    crossReactiveDrugs: ['pitavastatin'],
    crossReactivityRate: 'Variable (myopathy risk)',
    severity: 'moderate',
    recommendation: 'Statin intolerance (myopathy) varies by agent. Try a different statin (pravastatin/fluvastatin have lower myopathy risk), lower dose, or alternate-day dosing.',
  },
  {
    groupName: 'Iodinated Contrast Media',
    primaryAllergens: ['contrast dye', 'iodine contrast', 'iodinated contrast', 'ct contrast', 'iv contrast'],
    crossReactiveDrugs: ['iopamidol', 'iohexol', 'iodixanol', 'ioversol'],
    crossReactivityRate: '~10-35% re-reaction',
    severity: 'high',
    recommendation: 'Premedicate with corticosteroids and antihistamines (Lasser protocol). Use non-ionic, low/iso-osmolar contrast. Iodine allergy ≠ shellfish allergy — this is a myth.',
  },
];

// ─── Excipient Allergies ─────────────────────────────────────────────────────

interface ExcipientMapping {
  allergen: string;
  drugsContaining: string[];
  message: string;
}

const EXCIPIENT_MAPPINGS: ExcipientMapping[] = [
  {
    allergen: 'lactose',
    drugsContaining: ['many oral tablets', 'dry powder inhalers'],
    message: 'Lactose is a common excipient in tablets and DPIs. Check inactive ingredients.',
  },
  {
    allergen: 'gelatin',
    drugsContaining: ['capsules', 'vaccines'],
    message: 'Gelatin is found in many capsule shells and some vaccines (MMR, varicella, zoster).',
  },
  {
    allergen: 'egg',
    drugsContaining: ['propofol', 'influenza vaccine (some)', 'yellow fever vaccine'],
    message: 'Egg protein may be present in certain vaccines and propofol (contains egg lecithin).',
  },
  {
    allergen: 'soy',
    drugsContaining: ['propofol', 'some parenteral nutrition'],
    message: 'Soy lecithin is in propofol and some IV lipid emulsions.',
  },
  {
    allergen: 'peanut',
    drugsContaining: ['progesterone (some formulations)', 'some compounded medications'],
    message: 'Peanut oil is rarely used as an excipient but check compounded formulations.',
  },
];

// ─── Core Engine ─────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replaceAll(/[^a-z0-9]/g, '');
}

function fuzzyMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  return na.includes(nb) || nb.includes(na);
}

/** Check direct allergen ↔ drug matches */
function checkDirectMatches(allergen: string, normalizedDrugs: string[]): AllergyAlert[] {
  const results: AllergyAlert[] = [];
  for (const drug of normalizedDrugs) {
    if (fuzzyMatch(allergen, drug)) {
      results.push({
        allergen,
        drug,
        alertType: 'direct',
        severity: 'high',
        crossReactivityRate: '100%',
        message: `DIRECT ALLERGY: Patient is allergic to ${allergen}; ${drug} is the same or closely related.`,
        recommendation: 'Do NOT prescribe. Select an alternative from a different drug class.',
      });
    }
  }
  return results;
}

/** Check cross-reactivity group matches for a single allergen */
function checkCrossReactivityMatches(allergen: string, normalizedDrugs: string[]): AllergyAlert[] {
  const results: AllergyAlert[] = [];
  for (const group of CROSS_REACTIVITY_GROUPS) {
    const isAllergenInGroup = group.primaryAllergens.some(pa => fuzzyMatch(pa, allergen));
    if (!isAllergenInGroup) continue;

    for (const drug of normalizedDrugs) {
      const isCrossReactive = group.crossReactiveDrugs.some(crd => fuzzyMatch(crd, drug));
      const isClassBased = group.primaryAllergens.some(pa => fuzzyMatch(pa, drug) && !fuzzyMatch(pa, allergen));

      if (isCrossReactive) {
        results.push({
          allergen,
          drug,
          alertType: 'cross-reactive',
          severity: group.severity,
          crossReactivityRate: group.crossReactivityRate,
          message: `CROSS-REACTIVITY (${group.groupName}): Patient allergic to ${allergen}. ${drug} has ${group.crossReactivityRate} cross-reactivity risk.`,
          recommendation: group.recommendation,
        });
      }

      if (isClassBased) {
        results.push({
          allergen,
          drug,
          alertType: 'class-based',
          severity: 'high',
          crossReactivityRate: 'Same class',
          message: `CLASS ALERT (${group.groupName}): Patient allergic to ${allergen}. ${drug} is in the same pharmacological class.`,
          recommendation: `Avoid all drugs in the ${group.groupName} class. ${group.recommendation}`,
        });
      }
    }
  }
  return results;
}

/** Check excipient-based allergy matches */
function checkExcipientMatches(allergen: string): AllergyAlert[] {
  const results: AllergyAlert[] = [];
  for (const exc of EXCIPIENT_MAPPINGS) {
    if (fuzzyMatch(exc.allergen, allergen)) {
      results.push({
        allergen,
        drug: exc.drugsContaining.join(', '),
        alertType: 'excipient',
        severity: 'moderate',
        crossReactivityRate: 'Varies',
        message: `EXCIPIENT ALERT: Patient allergic to ${allergen}. ${exc.message}`,
        recommendation: 'Check inactive ingredients of all prescribed medications and verify no cross-contamination.',
      });
    }
  }
  return results;
}

/** Deduplicate alerts by allergen + drug + alertType */
function deduplicateAlerts(alerts: AllergyAlert[]): AllergyAlert[] {
  const seen = new Set<string>();
  return alerts.filter(a => {
    const key = `${a.allergen}|${a.drug}|${a.alertType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Check a list of proposed drugs against a patient's known allergies.
 * Returns all alerts — direct matches, cross-reactive, and excipient-based.
 */
export function checkAllergies(
  allergies: { allergen: string; reaction?: string }[],
  drugs: string[],
): AllergyCheckResult {
  const alerts: AllergyAlert[] = [];
  const normalizedAllergens = allergies.map(a => a.allergen.toLowerCase().trim());
  const normalizedDrugs = drugs.map(d => d.toLowerCase().trim());

  for (const allergen of normalizedAllergens) {
    alerts.push(
      ...checkDirectMatches(allergen, normalizedDrugs),
      ...checkCrossReactivityMatches(allergen, normalizedDrugs),
      ...checkExcipientMatches(allergen),
    );
  }

  const unique = deduplicateAlerts(alerts);
  const hasHigh = unique.some(a => a.severity === 'high');

  return {
    safe: !hasHigh,
    alerts: unique,
    checkedDrugs: drugs,
    checkedAllergens: allergies.map(a => a.allergen),
  };
}

/**
 * Quick check: does this single drug conflict with any allergy?
 */
export function isDrugSafeForPatient(
  drugName: string,
  allergies: { allergen: string; reaction?: string }[],
): { safe: boolean; alerts: AllergyAlert[] } {
  const result = checkAllergies(allergies, [drugName]);
  return { safe: result.safe, alerts: result.alerts };
}

/**
 * Get known cross-reactivity information for a given allergen.
 */
export function getCrossReactivityInfo(allergen: string): CrossReactivityGroup[] {
  const lower = allergen.toLowerCase().trim();
  return CROSS_REACTIVITY_GROUPS.filter(g =>
    g.primaryAllergens.some(pa => fuzzyMatch(pa, lower)),
  );
}
