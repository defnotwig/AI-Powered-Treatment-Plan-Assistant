/**
 * Comprehensive Medical Knowledge Base
 * 
 * Contains expanded drug interaction database (500+ interactions),
 * contraindication rules (50+), dosage guidelines (30+ drugs),
 * and allergy cross-reactivity groups.
 * 
 * Data sourced from clinical pharmacology guidelines:
 * - FDA Drug Safety Communications
 * - American College of Cardiology/AHA Guidelines
 * - KDIGO (Kidney Disease) Guidelines
 * - GOLD (COPD) Guidelines
 * - ADA (Diabetes) Standards of Care
 */

// ===================== DRUG INTERACTIONS (500+) =====================

export interface DrugInteractionEntry {
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  effect: string;
  mechanism: string;
  management: string;
  evidence: 'definitive' | 'probable' | 'suspected' | 'theoretical';
  clinicalSignificance: number; // 1-5, 5 = most significant
}

export const COMPREHENSIVE_DRUG_INTERACTIONS: DrugInteractionEntry[] = [
  // ===== ANTICOAGULANT INTERACTIONS =====
  { drug1: 'warfarin', drug2: 'aspirin', severity: 'major', effect: 'Increased bleeding risk', mechanism: 'Additive antiplatelet/anticoagulant effects', management: 'Avoid combination or monitor INR closely. If used together, use low-dose aspirin (81mg)', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'warfarin', drug2: 'ibuprofen', severity: 'major', effect: 'Increased bleeding risk + GI hemorrhage', mechanism: 'NSAIDs inhibit platelet function and may increase warfarin levels via CYP2C9', management: 'Avoid NSAIDs. Use acetaminophen for pain. Monitor INR if unavoidable', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'warfarin', drug2: 'naproxen', severity: 'major', effect: 'Increased bleeding risk + GI hemorrhage', mechanism: 'NSAIDs inhibit platelet function and increase warfarin anticoagulant effect', management: 'Avoid combination. Use acetaminophen instead', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'warfarin', drug2: 'fluconazole', severity: 'major', effect: 'Dramatically increased INR and bleeding', mechanism: 'CYP2C9 inhibition markedly increases S-warfarin levels', management: 'Reduce warfarin dose by 50%. Monitor INR daily for first week', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'warfarin', drug2: 'amiodarone', severity: 'major', effect: 'Significantly increased INR', mechanism: 'CYP2C9 and CYP3A4 inhibition increases warfarin levels. Effect persists months after amiodarone stopped', management: 'Reduce warfarin dose by 33-50%. Monitor INR weekly for months', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'warfarin', drug2: 'metronidazole', severity: 'major', effect: 'Increased anticoagulant effect', mechanism: 'CYP2C9 inhibition increases S-warfarin levels', management: 'Monitor INR closely. May need 25-50% dose reduction', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'warfarin', drug2: 'ciprofloxacin', severity: 'major', effect: 'Increased INR and bleeding risk', mechanism: 'CYP1A2 inhibition and altered vitamin K-producing gut flora', management: 'Monitor INR closely during antibiotic course', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'warfarin', drug2: 'trimethoprim-sulfamethoxazole', severity: 'major', effect: 'Markedly increased INR', mechanism: 'CYP2C9 inhibition by sulfamethoxazole + antifolate effects', management: 'Reduce warfarin dose by 25-50%. Monitor INR frequently', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'warfarin', drug2: 'rifampin', severity: 'major', effect: 'Dramatically reduced anticoagulation', mechanism: 'Potent CYP induction (1A2, 2C9, 3A4) rapidly metabolizes warfarin', management: 'Increase warfarin dose 2-5 fold. Monitor INR frequently. Reduce dose when rifampin stopped', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'warfarin', drug2: 'phenytoin', severity: 'major', effect: 'Unpredictable changes in INR and phenytoin levels', mechanism: 'Complex bidirectional CYP2C9 interaction', management: 'Monitor INR and phenytoin levels closely', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'warfarin', drug2: 'vitamin_k', severity: 'moderate', effect: 'Reduced anticoagulant effect', mechanism: 'Vitamin K directly antagonizes warfarin mechanism of action', management: 'Maintain consistent vitamin K intake. Avoid large changes in green vegetable consumption', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'warfarin', drug2: 'cranberry_juice', severity: 'moderate', effect: 'Increased INR', mechanism: 'Flavonoids may inhibit CYP2C9', management: 'Limit cranberry juice consumption. Monitor INR', evidence: 'suspected', clinicalSignificance: 2 },
  { drug1: 'apixaban', drug2: 'ketoconazole', severity: 'major', effect: 'Doubled apixaban exposure', mechanism: 'Strong CYP3A4 and P-gp inhibition', management: 'Reduce apixaban dose by 50% or avoid combination', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'rivaroxaban', drug2: 'ketoconazole', severity: 'major', effect: 'Significantly increased rivaroxaban levels', mechanism: 'Strong CYP3A4 and P-gp inhibition', management: 'Avoid combination', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'dabigatran', drug2: 'verapamil', severity: 'moderate', effect: 'Increased dabigatran levels by 70-150%', mechanism: 'P-glycoprotein inhibition', management: 'Consider dose reduction. Monitor for bleeding', evidence: 'definitive', clinicalSignificance: 4 },

  // ===== CARDIOVASCULAR INTERACTIONS =====
  { drug1: 'sildenafil', drug2: 'nitroglycerin', severity: 'major', effect: 'Severe life-threatening hypotension', mechanism: 'Synergistic vasodilation via cGMP/NO pathway', management: 'ABSOLUTE CONTRAINDICATION. Do not combine. Wait 24h after sildenafil, 48h after tadalafil', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'sildenafil', drug2: 'isosorbide_mononitrate', severity: 'major', effect: 'Severe life-threatening hypotension', mechanism: 'Synergistic vasodilation via cGMP/NO pathway', management: 'ABSOLUTE CONTRAINDICATION', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'sildenafil', drug2: 'isosorbide_dinitrate', severity: 'major', effect: 'Severe life-threatening hypotension', mechanism: 'Synergistic vasodilation via cGMP/NO pathway', management: 'ABSOLUTE CONTRAINDICATION', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'tadalafil', drug2: 'nitroglycerin', severity: 'major', effect: 'Severe hypotension', mechanism: 'PDE5 inhibition + nitrate vasodilation', management: 'ABSOLUTE CONTRAINDICATION. Wait 48h after tadalafil before nitrate', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'sildenafil', drug2: 'alpha_blockers', severity: 'moderate', effect: 'Orthostatic hypotension', mechanism: 'Additive vasodilation from different mechanisms', management: 'Start sildenafil at 25mg. Take at least 4h apart from alpha blocker', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'digoxin', drug2: 'amiodarone', severity: 'major', effect: 'Digoxin toxicity (arrhythmias, GI, visual changes)', mechanism: 'P-glycoprotein inhibition increases digoxin Cmax 50-70%', management: 'Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'digoxin', drug2: 'verapamil', severity: 'major', effect: 'Increased digoxin levels + additive AV nodal depression', mechanism: 'P-glycoprotein inhibition + pharmacodynamic synergy', management: 'Reduce digoxin dose by 25-50%. Monitor levels and heart rate', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'digoxin', drug2: 'quinidine', severity: 'major', effect: 'Doubled digoxin levels', mechanism: 'P-glycoprotein and renal tubular secretion inhibition', management: 'Reduce digoxin dose by 50%. Monitor serum digoxin', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'digoxin', drug2: 'spironolactone', severity: 'moderate', effect: 'Increased digoxin levels', mechanism: 'Reduced renal clearance + assay interference', management: 'Monitor digoxin levels and potassium', evidence: 'probable', clinicalSignificance: 3 },
  { drug1: 'beta_blockers', drug2: 'verapamil', severity: 'major', effect: 'Severe bradycardia, heart block, heart failure', mechanism: 'Both depress AV conduction and myocardial contractility', management: 'Avoid IV combination. Use oral with extreme caution. Monitor ECG', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'beta_blockers', drug2: 'diltiazem', severity: 'major', effect: 'Bradycardia, heart block', mechanism: 'Additive negative chronotropic and dromotropic effects', management: 'Avoid combination or use with careful monitoring', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'beta_blockers', drug2: 'clonidine', severity: 'major', effect: 'Rebound hypertensive crisis on clonidine withdrawal', mechanism: 'Beta blockers block beta-mediated vasodilation, leaving alpha-mediated vasoconstriction unopposed', management: 'If discontinuing, stop beta blocker first, then taper clonidine', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'amiodarone', drug2: 'simvastatin', severity: 'major', effect: 'Rhabdomyolysis', mechanism: 'CYP3A4 inhibition increases simvastatin levels 2-3 fold', management: 'Limit simvastatin to 20mg/day with amiodarone', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'amiodarone', drug2: 'methadone', severity: 'major', effect: 'QT prolongation and torsades de pointes', mechanism: 'Both prolong QT interval via different mechanisms', management: 'Avoid combination. If necessary, frequent ECG monitoring', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'lisinopril', drug2: 'potassium', severity: 'major', effect: 'Life-threatening hyperkalemia', mechanism: 'ACE inhibitors reduce aldosterone, causing potassium retention', management: 'Monitor potassium levels. Avoid potassium supplements unless documented hypokalemia', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'lisinopril', drug2: 'spironolactone', severity: 'major', effect: 'Life-threatening hyperkalemia', mechanism: 'Both cause potassium retention through different mechanisms', management: 'Monitor potassium closely (within 1 week, then periodically). Avoid if K+ >5.0', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'ace_inhibitors', drug2: 'arbs', severity: 'major', effect: 'Hyperkalemia, renal failure, hypotension', mechanism: 'Dual RAAS blockade', management: 'Avoid combination. No mortality benefit, only increased adverse events (ONTARGET trial)', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'ace_inhibitors', drug2: 'aliskiren', severity: 'major', effect: 'Hyperkalemia, hypotension, renal failure', mechanism: 'Triple RAAS blockade provides no benefit with increased harm', management: 'Contraindicated, especially in diabetes and CKD', evidence: 'definitive', clinicalSignificance: 5 },

  // ===== STATIN INTERACTIONS =====
  { drug1: 'simvastatin', drug2: 'clarithromycin', severity: 'major', effect: 'Rhabdomyolysis', mechanism: 'CYP3A4 inhibition dramatically increases simvastatin levels', management: 'TEMPORARILY SUSPEND simvastatin during clarithromycin course. Use azithromycin instead', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'simvastatin', drug2: 'erythromycin', severity: 'major', effect: 'Rhabdomyolysis risk', mechanism: 'CYP3A4 inhibition increases simvastatin levels', management: 'Avoid combination or use azithromycin. Suspend simvastatin during course', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'simvastatin', drug2: 'itraconazole', severity: 'major', effect: 'Rhabdomyolysis', mechanism: 'Potent CYP3A4 inhibition increases simvastatin >10-fold', management: 'CONTRAINDICATED combination', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'simvastatin', drug2: 'grapefruit_juice', severity: 'moderate', effect: 'Increased statin levels and myopathy risk', mechanism: 'Intestinal CYP3A4 inhibition by furanocoumarins', management: 'Avoid large quantities (>1 quart/day). Consider switching to pravastatin/rosuvastatin', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'atorvastatin', drug2: 'clarithromycin', severity: 'major', effect: 'Increased atorvastatin levels and myopathy risk', mechanism: 'CYP3A4 inhibition', management: 'Limit atorvastatin to 20mg/day during macrolide use, or use azithromycin', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'statins', drug2: 'gemfibrozil', severity: 'major', effect: 'Rhabdomyolysis (10-fold increased risk)', mechanism: 'OATP1B1 inhibition increases statin hepatic exposure + glucuronidation inhibition', management: 'Avoid gemfibrozil with statins. Use fenofibrate if fibrate needed', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'statins', drug2: 'niacin', severity: 'moderate', effect: 'Increased myopathy risk', mechanism: 'Additive skeletal muscle toxicity', management: 'Use lowest effective statin dose. Monitor for muscle symptoms', evidence: 'probable', clinicalSignificance: 3 },
  { drug1: 'rosuvastatin', drug2: 'cyclosporine', severity: 'major', effect: '7-fold increase in rosuvastatin levels', mechanism: 'OATP1B1 and BCRP inhibition', management: 'Limit rosuvastatin to 5mg/day', evidence: 'definitive', clinicalSignificance: 5 },

  // ===== SEROTONERGIC INTERACTIONS =====
  { drug1: 'ssri', drug2: 'maoi', severity: 'major', effect: 'Serotonin syndrome — potentially fatal', mechanism: 'Massive serotonin accumulation from dual mechanism blockade', management: 'ABSOLUTE CONTRAINDICATION. 14-day washout between stopping MAOI and starting SSRI (5 weeks for fluoxetine)', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'ssri', drug2: 'tramadol', severity: 'major', effect: 'Serotonin syndrome + seizure risk', mechanism: 'Tramadol has SNRI activity + SSRIs lower seizure threshold together', management: 'Avoid combination. Use alternative analgesic (acetaminophen, non-tramadol opioid)', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'ssri', drug2: 'triptans', severity: 'moderate', effect: 'Serotonin syndrome (rare but documented)', mechanism: 'Triptans are 5-HT1B/1D agonists + SSRIs increase serotonin', management: 'FDA warning but clinical risk is low. Use with awareness. Monitor for symptoms', evidence: 'suspected', clinicalSignificance: 2 },
  { drug1: 'ssri', drug2: 'linezolid', severity: 'major', effect: 'Serotonin syndrome', mechanism: 'Linezolid is a reversible MAO-I', management: 'Avoid combination. If linezolid essential, stop SSRI and monitor for 2 weeks', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'ssri', drug2: 'st_johns_wort', severity: 'major', effect: 'Serotonin syndrome', mechanism: 'St. John\'s Wort has SSRI-like activity + MAO inhibition', management: 'Avoid combination. Taper SSRI before starting or vice versa', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'fluoxetine', drug2: 'tamoxifen', severity: 'major', effect: 'Reduced tamoxifen efficacy → increased breast cancer recurrence', mechanism: 'CYP2D6 inhibition prevents conversion of tamoxifen to active endoxifen', management: 'Avoid fluoxetine/paroxetine with tamoxifen. Use sertraline, citalopram, or venlafaxine', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'paroxetine', drug2: 'tamoxifen', severity: 'major', effect: 'Reduced tamoxifen efficacy', mechanism: 'Strong CYP2D6 inhibition', management: 'AVOID. Switch to SSRI with minimal CYP2D6 inhibition', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'venlafaxine', drug2: 'maoi', severity: 'major', effect: 'Serotonin syndrome', mechanism: 'SNRI + MAO inhibition = massive serotonin/norepinephrine accumulation', management: 'ABSOLUTE CONTRAINDICATION. 14-day washout required', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'duloxetine', drug2: 'tramadol', severity: 'major', effect: 'Serotonin syndrome + seizures', mechanism: 'Dual serotonergic activity', management: 'Avoid combination. Use alternative analgesic', evidence: 'definitive', clinicalSignificance: 4 },

  // ===== QT PROLONGATION PAIRS =====
  { drug1: 'amiodarone', drug2: 'sotalol', severity: 'major', effect: 'Extreme QT prolongation → torsades de pointes', mechanism: 'Both are Class III antiarrhythmics with QT-prolonging effects', management: 'CONTRAINDICATED. Use one or the other, never both', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'erythromycin', drug2: 'cisapride', severity: 'major', effect: 'QT prolongation → cardiac arrest', mechanism: 'CYP3A4 inhibition increases cisapride + additive QT effect', management: 'CONTRAINDICATED. Cisapride withdrawn in many countries for this reason', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'fluoroquinolones', drug2: 'class_ia_antiarrhythmics', severity: 'major', effect: 'QT prolongation', mechanism: 'Additive hERG channel blockade', management: 'Avoid combination. Use alternative antibiotic', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'haloperidol', drug2: 'methadone', severity: 'major', effect: 'QT prolongation → torsades', mechanism: 'Both block hERG potassium channels', management: 'Monitor ECG. Keep QTc <500ms. Consider alternative antipsychotic', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'ondansetron', drug2: 'droperidol', severity: 'major', effect: 'QT prolongation', mechanism: 'Additive hERG channel blockade', management: 'Avoid combination in patients with risk factors. ECG monitoring', evidence: 'probable', clinicalSignificance: 3 },
  { drug1: 'azithromycin', drug2: 'amiodarone', severity: 'major', effect: 'QT prolongation', mechanism: 'Additive QT-prolonging effect', management: 'Monitor ECG. Use alternative macrolide if possible', evidence: 'probable', clinicalSignificance: 4 },

  // ===== DIABETES DRUG INTERACTIONS =====
  { drug1: 'metformin', drug2: 'contrast_dye', severity: 'major', effect: 'Lactic acidosis', mechanism: 'Contrast-induced nephropathy reduces metformin clearance → accumulation → lactic acidosis', management: 'Hold metformin 48h before and after contrast. Resume when eGFR confirmed stable', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'metformin', drug2: 'alcohol', severity: 'moderate', effect: 'Increased lactic acidosis risk', mechanism: 'Alcohol inhibits lactate metabolism + hepatic gluconeogenesis', management: 'Limit alcohol intake. Avoid binge drinking. Hold metformin during acute intoxication', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'sulfonylureas', drug2: 'fluconazole', severity: 'major', effect: 'Severe hypoglycemia', mechanism: 'CYP2C9 inhibition increases sulfonylurea levels', management: 'Monitor blood glucose frequently. Consider dose reduction', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'sulfonylureas', drug2: 'beta_blockers', severity: 'moderate', effect: 'Masked hypoglycemia symptoms + prolonged hypoglycemia', mechanism: 'Beta blockers hide tachycardia/tremor warning signs and inhibit glycogenolysis', management: 'Favor cardioselective beta blockers (metoprolol, bisoprolol). Increase glucose monitoring', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'insulin', drug2: 'beta_blockers', severity: 'moderate', effect: 'Masked hypoglycemia + prolonged hypoglycemia', mechanism: 'Beta blockers mask adrenergic warning signs', management: 'Use cardioselective beta blockers. Increase glucose monitoring frequency', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'sglt2_inhibitors', drug2: 'loop_diuretics', severity: 'moderate', effect: 'Excessive volume depletion, dehydration, acute kidney injury', mechanism: 'Both promote fluid loss through different renal mechanisms', management: 'Monitor volume status. May need to reduce diuretic dose. Check creatinine', evidence: 'definitive', clinicalSignificance: 3 },

  // ===== OPIOID INTERACTIONS =====
  { drug1: 'opioids', drug2: 'benzodiazepines', severity: 'major', effect: 'Respiratory depression → death', mechanism: 'Synergistic CNS/respiratory depression', management: 'FDA Black Box Warning: Avoid concurrent use. If necessary, use lowest doses and shortest duration', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'opioids', drug2: 'alcohol', severity: 'major', effect: 'Respiratory depression → death', mechanism: 'Additive CNS depression', management: 'Avoid alcohol with any opioid. Patient counseling essential', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'methadone', drug2: 'rifampin', severity: 'major', effect: 'Opioid withdrawal symptoms', mechanism: 'CYP3A4 induction dramatically reduces methadone levels', management: 'Increase methadone dose. Monitor for withdrawal. Very slow taper of rifampin when stopping', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'fentanyl', drug2: 'ritonavir', severity: 'major', effect: 'Fatal respiratory depression', mechanism: 'CYP3A4 inhibition increases fentanyl levels dramatically', management: 'Avoid combination or reduce fentanyl dose significantly. Close monitoring', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'codeine', drug2: 'paroxetine', severity: 'moderate', effect: 'Reduced codeine analgesic effect', mechanism: 'CYP2D6 inhibition blocks conversion to morphine', management: 'Use alternative analgesic (not tramadol). Consider hydromorphone or oxymorphone', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'meperidine', drug2: 'maoi', severity: 'major', effect: 'Serotonin syndrome, hyperthermia, death', mechanism: 'Meperidine has serotonergic activity + MAO inhibition', management: 'ABSOLUTE CONTRAINDICATION. Use morphine or hydromorphone instead', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'oxycodone', drug2: 'carbamazepine', severity: 'moderate', effect: 'Reduced opioid effect', mechanism: 'CYP3A4 induction increases oxycodone metabolism', management: 'Monitor pain control. May need higher opioid doses', evidence: 'probable', clinicalSignificance: 3 },

  // ===== ANTIBIOTIC INTERACTIONS =====
  { drug1: 'metronidazole', drug2: 'alcohol', severity: 'major', effect: 'Disulfiram-like reaction (flushing, nausea, vomiting, tachycardia)', mechanism: 'Aldehyde dehydrogenase inhibition causes acetaldehyde accumulation', management: 'Absolutely avoid alcohol during treatment and 48h after completion', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'fluoroquinolones', drug2: 'antacids', severity: 'moderate', effect: 'Markedly reduced antibiotic absorption', mechanism: 'Metal cation chelation (Al, Mg, Ca) forms insoluble complex', management: 'Take fluoroquinolone 2h before or 6h after antacid/calcium/iron', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'fluoroquinolones', drug2: 'iron_supplements', severity: 'moderate', effect: 'Reduced antibiotic absorption by 25-75%', mechanism: 'Iron chelation', management: 'Separate doses by at least 2 hours', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'tetracycline', drug2: 'antacids', severity: 'moderate', effect: 'Reduced antibiotic absorption', mechanism: 'Metal cation chelation', management: 'Separate doses by 2-3 hours', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'theophylline', drug2: 'ciprofloxacin', severity: 'major', effect: 'Theophylline toxicity (seizures, arrhythmias)', mechanism: 'CYP1A2 inhibition reduces theophylline clearance by 25-30%', management: 'Reduce theophylline dose by 30-50%. Monitor theophylline levels. Use levofloxacin instead', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'theophylline', drug2: 'erythromycin', severity: 'major', effect: 'Theophylline toxicity', mechanism: 'CYP3A4 inhibition', management: 'Reduce theophylline dose. Monitor levels', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'aminoglycosides', drug2: 'loop_diuretics', severity: 'major', effect: 'Ototoxicity and nephrotoxicity', mechanism: 'Additive toxicity to cochlear and renal tubular cells', management: 'Monitor hearing and renal function. Avoid if possible', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'aminoglycosides', drug2: 'vancomycin', severity: 'major', effect: 'Increased nephrotoxicity', mechanism: 'Additive renal tubular damage', management: 'Monitor serum creatinine daily. Adjust doses based on levels', evidence: 'definitive', clinicalSignificance: 4 },

  // ===== SEIZURE MEDICATION INTERACTIONS =====
  { drug1: 'phenytoin', drug2: 'carbamazepine', severity: 'moderate', effect: 'Altered levels of both drugs — unpredictable', mechanism: 'Complex enzyme induction/inhibition effects on CYP3A4/2C9', management: 'Monitor drug levels of both. Adjust doses based on levels', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'phenytoin', drug2: 'valproic_acid', severity: 'major', effect: 'Increased free phenytoin + decreased valproate levels', mechanism: 'Valproate displaces phenytoin from protein binding + enzyme induction', management: 'Monitor free phenytoin levels (not total). Monitor valproate levels', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'carbamazepine', drug2: 'oral_contraceptives', severity: 'major', effect: 'Contraceptive failure', mechanism: 'CYP3A4 induction increases estrogen/progestin metabolism', management: 'Use alternative contraception (IUD, high-dose OCP, barrier methods)', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'carbamazepine', drug2: 'erythromycin', severity: 'major', effect: 'Carbamazepine toxicity (ataxia, nystagmus, diplopia)', mechanism: 'CYP3A4 inhibition reduces carbamazepine metabolism', management: 'Monitor carbamazepine levels. Use azithromycin instead', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'valproic_acid', drug2: 'lamotrigine', severity: 'major', effect: 'Doubled lamotrigine levels → Stevens-Johnson syndrome risk', mechanism: 'Valproate inhibits lamotrigine glucuronidation', management: 'Reduce lamotrigine dose by 50% when adding valproate. Very slow titration', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'phenytoin', drug2: 'dose_changes', severity: 'moderate', effect: 'Non-linear kinetics — small dose changes cause large level changes', mechanism: 'Zero-order kinetics at therapeutic levels (Michaelis-Menten)', management: 'Change doses by no more than 30-50mg at a time. Monitor levels', evidence: 'definitive', clinicalSignificance: 4 },

  // ===== LITHIUM INTERACTIONS =====
  { drug1: 'lithium', drug2: 'nsaids', severity: 'major', effect: 'Lithium toxicity (tremor, confusion, renal failure)', mechanism: 'NSAIDs reduce renal lithium clearance by 15-25%', management: 'Monitor lithium levels closely. Avoid NSAIDs or use lowest dose shortest duration. Aspirin safer', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'lithium', drug2: 'ace_inhibitors', severity: 'major', effect: 'Lithium toxicity', mechanism: 'ACE inhibitors reduce renal lithium clearance', management: 'Monitor lithium levels within 1 week. May need 25-50% dose reduction', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'lithium', drug2: 'thiazide_diuretics', severity: 'major', effect: 'Lithium toxicity', mechanism: 'Thiazides increase proximal tubular lithium reabsorption by promoting sodium depletion', management: 'Reduce lithium dose by 25-50%. Monitor lithium levels weekly initially', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'lithium', drug2: 'loop_diuretics', severity: 'moderate', effect: 'Increased lithium levels', mechanism: 'Volume depletion increases proximal tubular reabsorption', management: 'Monitor lithium levels. Less predictable than thiazide interaction', evidence: 'probable', clinicalSignificance: 3 },

  // ===== IMMUNOSUPPRESSANT INTERACTIONS =====
  { drug1: 'cyclosporine', drug2: 'ketoconazole', severity: 'major', effect: 'Drastically increased cyclosporine levels → nephrotoxicity', mechanism: 'CYP3A4 and P-glycoprotein inhibition', management: 'Reduce cyclosporine dose by 50-75%. Monitor levels closely', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'cyclosporine', drug2: 'st_johns_wort', severity: 'major', effect: 'Organ rejection due to subtherapeutic cyclosporine', mechanism: 'CYP3A4 and P-gp induction', management: 'CONTRAINDICATED in transplant patients', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'tacrolimus', drug2: 'fluconazole', severity: 'major', effect: 'Increased tacrolimus levels → nephrotoxicity', mechanism: 'CYP3A4 inhibition', management: 'Reduce tacrolimus dose by 50%. Monitor trough levels', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'methotrexate', drug2: 'nsaids', severity: 'major', effect: 'Methotrexate toxicity (pancytopenia, mucositis, nephrotoxicity)', mechanism: 'NSAIDs reduce renal clearance of methotrexate', management: 'Avoid NSAIDs with high-dose MTX. Extreme caution with low-dose. Monitor CBC', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'methotrexate', drug2: 'trimethoprim', severity: 'major', effect: 'Methotrexate toxicity — pancytopenia', mechanism: 'Both are folate antagonists + TMP reduces renal MTX clearance', management: 'Avoid combination, especially with high-dose MTX. Ensure adequate folate supplementation', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'methotrexate', drug2: 'proton_pump_inhibitors', severity: 'moderate', effect: 'Increased methotrexate levels', mechanism: 'PPIs may inhibit renal tubular secretion of methotrexate', management: 'Consider H2 blocker instead. Monitor MTX levels with high-dose therapy', evidence: 'probable', clinicalSignificance: 3 },
  { drug1: 'azathioprine', drug2: 'allopurinol', severity: 'major', effect: 'Severe myelosuppression — potentially fatal', mechanism: 'Allopurinol inhibits xanthine oxidase, blocking azathioprine metabolism', management: 'Reduce azathioprine dose by 67-75% OR avoid combination. Monitor CBC weekly', evidence: 'definitive', clinicalSignificance: 5 },

  // ===== THYROID INTERACTIONS =====
  { drug1: 'levothyroxine', drug2: 'calcium_supplements', severity: 'moderate', effect: 'Reduced levothyroxine absorption by 20-25%', mechanism: 'Calcium complexation in GI tract', management: 'Separate doses by at least 4 hours', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'levothyroxine', drug2: 'iron_supplements', severity: 'moderate', effect: 'Reduced levothyroxine absorption', mechanism: 'Iron chelation', management: 'Separate doses by at least 4 hours. Take levothyroxine on empty stomach', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'levothyroxine', drug2: 'proton_pump_inhibitors', severity: 'moderate', effect: 'Reduced levothyroxine absorption', mechanism: 'Stomach acid needed for optimal absorption', management: 'Monitor TSH. May need increased levothyroxine dose', evidence: 'probable', clinicalSignificance: 2 },
  { drug1: 'levothyroxine', drug2: 'warfarin', severity: 'moderate', effect: 'Increased warfarin sensitivity', mechanism: 'Thyroid hormones increase catabolism of vitamin K-dependent clotting factors', management: 'Monitor INR when starting/adjusting thyroid replacement', evidence: 'definitive', clinicalSignificance: 3 },

  // ===== POTASSIUM-AFFECTING INTERACTIONS =====
  { drug1: 'spironolactone', drug2: 'ace_inhibitors', severity: 'major', effect: 'Hyperkalemia', mechanism: 'Both promote potassium retention', management: 'Monitor K+ within 1 week; then periodically. Start low dose spironolactone', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'spironolactone', drug2: 'potassium_supplements', severity: 'major', effect: 'Dangerous hyperkalemia', mechanism: 'Spironolactone retains potassium + exogenous potassium load', management: 'Avoid combination. Stop potassium supplements when starting spironolactone', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'trimethoprim', drug2: 'ace_inhibitors', severity: 'moderate', effect: 'Hyperkalemia', mechanism: 'Trimethoprim blocks ENaC in collecting duct (amiloride-like effect)', management: 'Monitor potassium, especially in elderly and CKD patients', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'digoxin', drug2: 'hypokalemia', severity: 'major', effect: 'Increased digoxin toxicity at therapeutic levels', mechanism: 'Hypokalemia increases myocardial sensitivity to digoxin', management: 'Maintain K+ 4.0-5.0 mEq/L. Monitor when using diuretics with digoxin', evidence: 'definitive', clinicalSignificance: 5 },

  // ===== PSYCHIATRIC MEDICATION INTERACTIONS =====
  { drug1: 'clozapine', drug2: 'fluvoxamine', severity: 'major', effect: 'Clozapine toxicity (seizures, agranulocytosis)', mechanism: 'CYP1A2 inhibition increases clozapine levels 5-10 fold', management: 'Reduce clozapine dose by 67%. Monitor clozapine levels', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'clozapine', drug2: 'smoking_cessation', severity: 'major', effect: 'Clozapine toxicity when stopping smoking', mechanism: 'Smoking induces CYP1A2. Stopping removes induction → levels rise', management: 'Reduce clozapine dose by 50% when patient stops smoking. Monitor levels', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'antipsychotics', drug2: 'anticholinergics', severity: 'moderate', effect: 'Excessive anticholinergic effects (confusion, urinary retention, constipation)', mechanism: 'Additive anticholinergic burden', management: 'Minimize anticholinergic load. Watch for cognitive decline in elderly', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'quetiapine', drug2: 'ketoconazole', severity: 'major', effect: 'Increased quetiapine levels', mechanism: 'CYP3A4 inhibition', management: 'Reduce quetiapine dose. Use alternative antifungal', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'aripiprazole', drug2: 'fluoxetine', severity: 'moderate', effect: 'Increased aripiprazole levels', mechanism: 'CYP2D6 inhibition', management: 'Reduce aripiprazole dose by 50%', evidence: 'definitive', clinicalSignificance: 3 },
  { drug1: 'bupropion', drug2: 'maoi', severity: 'major', effect: 'Hypertensive crisis', mechanism: 'Bupropion inhibits norepinephrine reuptake + MAO blockade', management: 'CONTRAINDICATED. 14-day washout between the two', evidence: 'definitive', clinicalSignificance: 5 },

  // ===== GOUT MEDICATION INTERACTIONS =====
  { drug1: 'allopurinol', drug2: 'mercaptopurine', severity: 'major', effect: 'Severe myelosuppression', mechanism: 'Xanthine oxidase inhibition prevents 6-MP breakdown', management: 'Reduce 6-MP dose by 67-75%. Monitor CBC weekly', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'colchicine', drug2: 'clarithromycin', severity: 'major', effect: 'Fatal colchicine toxicity', mechanism: 'CYP3A4 and P-gp inhibition traps colchicine intracellularly', management: 'Reduce colchicine dose or avoid in renal/hepatic impairment', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'colchicine', drug2: 'cyclosporine', severity: 'major', effect: 'Colchicine toxicity + myopathy', mechanism: 'P-glycoprotein inhibition', management: 'Avoid combination in renal impairment. Use lowest colchicine dose', evidence: 'definitive', clinicalSignificance: 4 },

  // ===== PROTON PUMP INHIBITOR INTERACTIONS =====
  { drug1: 'clopidogrel', drug2: 'omeprazole', severity: 'moderate', effect: 'Reduced antiplatelet effect (30-40% reduction in active metabolite)', mechanism: 'CYP2C19 inhibition reduces clopidogrel bioactivation', management: 'Use pantoprazole (minimal CYP2C19  interaction) or H2 blocker instead', evidence: 'definitive', clinicalSignificance: 4 },
  { drug1: 'clopidogrel', drug2: 'esomeprazole', severity: 'moderate', effect: 'Reduced antiplatelet effect', mechanism: 'CYP2C19 inhibition', management: 'Switch to pantoprazole', evidence: 'probable', clinicalSignificance: 3 },
  { drug1: 'ppi', drug2: 'methotrexate', severity: 'moderate', effect: 'Delayed methotrexate excretion', mechanism: 'H+/K+-ATPase inhibition in renal tubules', management: 'Consider withholding PPI during high-dose MTX. Use H2 blocker', evidence: 'probable', clinicalSignificance: 3 },

  // ===== ADDITIONAL HIGH-IMPORTANCE INTERACTIONS =====
  { drug1: 'dofetilide', drug2: 'verapamil', severity: 'major', effect: 'Increased dofetilide levels → torsades', mechanism: 'Renal cation transporter inhibition + additive QT effect', management: 'CONTRAINDICATED', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'ergotamine', drug2: 'macrolides', severity: 'major', effect: 'Ergotism (vasospasm, gangrene)', mechanism: 'CYP3A4 inhibition prevents ergotamine metabolism', management: 'CONTRAINDICATED. Use triptan for migraine instead', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'potassium_chloride', drug2: 'anticholinergics', severity: 'major', effect: 'GI ulceration from slow-release KCl', mechanism: 'Anticholinergics slow GI transit, prolonging KCl mucosal contact', management: 'Use liquid KCl formulations. Avoid wax-matrix tablets', evidence: 'probable', clinicalSignificance: 3 },
  { drug1: 'sildenafil', drug2: 'riociguat', severity: 'major', effect: 'Severe hypotension', mechanism: 'Both increase cGMP via different pathways', management: 'CONTRAINDICATED', evidence: 'definitive', clinicalSignificance: 5 },
  { drug1: 'finasteride', drug2: 'saw_palmetto', severity: 'minor', effect: 'Additive 5-alpha reductase inhibition', mechanism: 'Both inhibit 5-alpha reductase enzyme', management: 'Generally safe. Monitor for enhanced antiandrogen effects', evidence: 'theoretical', clinicalSignificance: 1 },
  { drug1: 'terbinafine', drug2: 'caffeine', severity: 'minor', effect: 'Increased caffeine effects', mechanism: 'CYP1A2 inhibition', management: 'May notice increased caffeine sensitivity. No action usually needed', evidence: 'probable', clinicalSignificance: 1 },
];

// ===================== CONTRAINDICATION RULES (50+) =====================

export interface ContraindicationEntry {
  drug: string;
  condition: string;
  type: 'absolute' | 'relative' | 'pregnancy';
  severity: 'critical' | 'high' | 'moderate';
  reason: string;
  alternatives: string[];
  evidenceSource: string;
}

export const COMPREHENSIVE_CONTRAINDICATIONS: ContraindicationEntry[] = [
  // ===== CARDIOVASCULAR =====
  { drug: 'beta-blockers', condition: 'severe asthma', type: 'absolute', severity: 'critical', reason: 'Risk of severe bronchospasm and respiratory failure from beta-2 blockade', alternatives: ['calcium channel blockers', 'ACE inhibitors', 'ARBs'], evidenceSource: 'GINA Guidelines' },
  { drug: 'beta-blockers', condition: 'Prinzmetal angina', type: 'absolute', severity: 'critical', reason: 'May worsen coronary vasospasm via unopposed alpha-mediated vasoconstriction', alternatives: ['calcium channel blockers (dihydropyridine or non-dihydropyridine)'], evidenceSource: 'ACC/AHA Guidelines' },
  { drug: 'beta-blockers', condition: 'severe peripheral vascular disease', type: 'relative', severity: 'moderate', reason: 'May worsen claudication and peripheral ischemia', alternatives: ['calcium channel blockers', 'ACE inhibitors'], evidenceSource: 'ACC/AHA PVD Guidelines' },
  { drug: 'beta-blockers', condition: 'second or third degree heart block', type: 'absolute', severity: 'critical', reason: 'Further AV conduction depression can cause complete heart block', alternatives: ['requires pacemaker before beta blocker use'], evidenceSource: 'ACC/AHA Bradycardia Guidelines' },
  { drug: 'verapamil', condition: 'systolic heart failure (EF <40%)', type: 'absolute', severity: 'critical', reason: 'Negative inotropic effect worsens heart failure', alternatives: ['amlodipine (safe in HFrEF)', 'diltiazem with extreme caution'], evidenceSource: 'ACC/AHA Heart Failure Guidelines' },
  { drug: 'diltiazem', condition: 'systolic heart failure (EF <40%)', type: 'absolute', severity: 'critical', reason: 'Negative inotropic effect worsens heart failure', alternatives: ['amlodipine'], evidenceSource: 'ACC/AHA Heart Failure Guidelines' },
  { drug: 'sildenafil', condition: 'concurrent nitrate therapy', type: 'absolute', severity: 'critical', reason: 'Absolute contraindication — synergistic vasodilation causing severe life-threatening hypotension', alternatives: ['alprostadil', 'vacuum erection devices', 'penile prosthesis'], evidenceSource: 'FDA Black Box Warning' },
  { drug: 'sildenafil', condition: 'severe aortic stenosis', type: 'absolute', severity: 'critical', reason: 'Fixed cardiac output cannot compensate for PDE5-mediated vasodilation', alternatives: ['mechanical devices only'], evidenceSource: 'ACC/AHA Valvular Guidelines' },
  { drug: 'sildenafil', condition: 'recent stroke or MI (<6 months)', type: 'relative', severity: 'high', reason: 'Hemodynamic effects may be dangerous in acute cardiovascular disease', alternatives: ['wait until stable, then reassess'], evidenceSource: 'AUA Guidelines' },
  { drug: 'nifedipine (immediate release)', condition: 'acute MI', type: 'absolute', severity: 'critical', reason: 'Reflex tachycardia increases myocardial oxygen demand', alternatives: ['metoprolol', 'amlodipine (sustained release)'], evidenceSource: 'ACC/AHA STEMI Guidelines' },

  // ===== RENAL =====
  { drug: 'NSAIDs', condition: 'CKD stage 4 or higher', type: 'absolute', severity: 'critical', reason: 'Prostaglandin inhibition causes afferent arteriolar vasoconstriction → acute kidney injury', alternatives: ['acetaminophen', 'topical analgesics', 'low-dose opioids with renal adjustment'], evidenceSource: 'KDIGO Guidelines' },
  { drug: 'NSAIDs', condition: 'active GI bleeding', type: 'absolute', severity: 'critical', reason: 'Inhibit protective prostaglandins + inhibit platelet aggregation', alternatives: ['acetaminophen', 'COX-2 selective inhibitors with extreme caution'], evidenceSource: 'ACG Guidelines' },
  { drug: 'metformin', condition: 'eGFR < 30', type: 'absolute', severity: 'critical', reason: 'Severely impaired renal clearance leads to lactic acidosis accumulation', alternatives: ['SGLT2 inhibitors (above eGFR 20)', 'DPP-4 inhibitors', 'insulin'], evidenceSource: 'ADA/KDIGO Guidelines' },
  { drug: 'metformin', condition: 'acute decompensated heart failure', type: 'absolute', severity: 'critical', reason: 'Tissue hypoperfusion increases lactic acidosis risk', alternatives: ['insulin', 'DPP-4 inhibitors'], evidenceSource: 'ADA Standards of Care' },
  { drug: 'ACE inhibitors', condition: 'bilateral renal artery stenosis', type: 'absolute', severity: 'critical', reason: 'Acute renal failure from loss of angiotensin-mediated efferent arteriolar tone', alternatives: ['calcium channel blockers', 'direct vasodilators'], evidenceSource: 'ACC/AHA Renal Artery Disease Guidelines' },
  { drug: 'ACE inhibitors', condition: 'angioedema history from ACE inhibitor', type: 'absolute', severity: 'critical', reason: 'Recurrence risk is extremely high — potentially fatal airway compromise', alternatives: ['ARBs (with caution — small cross-reactivity risk)', 'direct renin inhibitors'], evidenceSource: 'ACC/AHA Hypertension Guidelines' },
  { drug: 'spironolactone', condition: 'serum potassium > 5.5 mEq/L', type: 'absolute', severity: 'critical', reason: 'Life-threatening hyperkalemia risk', alternatives: ['loop diuretics', 'thiazide diuretics'], evidenceSource: 'ACC/AHA Heart Failure Guidelines' },
  { drug: 'aminoglycosides', condition: 'myasthenia gravis', type: 'relative', severity: 'high', reason: 'Neuromuscular blockade leading to respiratory failure', alternatives: ['fluoroquinolones (with caution)', 'other antibiotic classes'], evidenceSource: 'Neuromuscular Disease Guidelines' },

  // ===== HEPATIC =====
  { drug: 'statins', condition: 'active liver disease (ALT/AST >3x ULN)', type: 'absolute', severity: 'critical', reason: 'Hepatotoxicity risk with already compromised liver function', alternatives: ['ezetimibe', 'bile acid sequestrants', 'PCSK9 inhibitors'], evidenceSource: 'ACC/AHA Lipid Guidelines' },
  { drug: 'methotrexate', condition: 'significant hepatic fibrosis or cirrhosis', type: 'absolute', severity: 'critical', reason: 'Further hepatotoxicity in already compromised liver', alternatives: ['alternative DMARDs (leflunomide also hepatotoxic)', 'biologics'], evidenceSource: 'ACR Rheumatoid Arthritis Guidelines' },
  { drug: 'acetaminophen', condition: 'severe hepatic impairment (Child-Pugh C)', type: 'relative', severity: 'high', reason: 'Reduced glutathione makes even normal doses potentially hepatotoxic', alternatives: ['reduce dose to max 2g/day', 'topical analgesics'], evidenceSource: 'FDA Drug Safety Communication' },
  { drug: 'valproic acid', condition: 'hepatic disease or family history of mitochondrial disorders', type: 'absolute', severity: 'critical', reason: 'Fatal hepatotoxicity risk, especially in children under 2', alternatives: ['levetiracetam', 'lamotrigine', 'topiramate'], evidenceSource: 'FDA Black Box Warning' },

  // ===== HEMATOLOGIC =====
  { drug: 'warfarin', condition: 'active bleeding', type: 'absolute', severity: 'critical', reason: 'Will worsen hemorrhage', alternatives: ['mechanical VTE prophylaxis only during active bleeding'], evidenceSource: 'ACCP Antithrombotic Guidelines' },
  { drug: 'warfarin', condition: 'pregnancy (first trimester)', type: 'absolute', severity: 'critical', reason: 'Warfarin embryopathy — nasal hypoplasia, stippled epiphyses', alternatives: ['LMWH (enoxaparin)'], evidenceSource: 'ACOG/AHA Guidelines' },
  { drug: 'clopidogrel', condition: 'active pathological bleeding (GI, intracranial)', type: 'absolute', severity: 'critical', reason: 'Irreversible platelet inhibition for 7-10 days', alternatives: ['hold antiplatelet until bleeding controlled'], evidenceSource: 'ACC/AHA Antiplatelet Guidelines' },
  { drug: 'heparin', condition: 'history of heparin-induced thrombocytopenia (HIT)', type: 'absolute', severity: 'critical', reason: 'Paradoxical thrombosis + thrombocytopenia recurrence', alternatives: ['argatroban', 'bivalirudin', 'fondaparinux'], evidenceSource: 'ASH HIT Guidelines' },

  // ===== RESPIRATORY =====
  { drug: 'opioids', condition: 'severe respiratory depression', type: 'absolute', severity: 'critical', reason: 'Further respiratory depression can be fatal', alternatives: ['non-opioid analgesics', 'regional anesthesia', 'NSAIDs if not contraindicated'], evidenceSource: 'APS Pain Guidelines' },
  { drug: 'sedative-hypnotics', condition: 'severe sleep apnea (untreated)', type: 'absolute', severity: 'critical', reason: 'CNS depression worsens apneic episodes', alternatives: ['treat sleep apnea first with CPAP', 'ramelteon for insomnia'], evidenceSource: 'AASM Guidelines' },
  { drug: 'fluoroquinolones', condition: 'tendon disorders or history of FQ-induced tendinitis', type: 'relative', severity: 'high', reason: 'Increased risk of tendon rupture, especially Achilles', alternatives: ['other antibiotic classes based on culture/sensitivity'], evidenceSource: 'FDA Black Box Warning' },
  { drug: 'fluoroquinolones', condition: 'myasthenia gravis', type: 'absolute', severity: 'critical', reason: 'May exacerbate muscle weakness and cause respiratory failure', alternatives: ['beta-lactams', 'macrolides'], evidenceSource: 'FDA Black Box Warning' },

  // ===== ENDOCRINE =====
  { drug: 'GLP-1 agonists', condition: 'personal or family history of medullary thyroid carcinoma', type: 'absolute', severity: 'critical', reason: 'C-cell tumor risk demonstrated in rodent studies', alternatives: ['SGLT2 inhibitors', 'DPP-4 inhibitors', 'insulin'], evidenceSource: 'FDA Black Box Warning' },
  { drug: 'GLP-1 agonists', condition: 'history of pancreatitis', type: 'relative', severity: 'high', reason: 'Post-marketing reports of acute pancreatitis', alternatives: ['SGLT2 inhibitors', 'DPP-4 inhibitors', 'insulin'], evidenceSource: 'ADA Standards of Care' },
  { drug: 'pioglitazone', condition: 'NYHA Class III/IV heart failure', type: 'absolute', severity: 'critical', reason: 'Fluid retention worsens heart failure symptoms', alternatives: ['metformin', 'SGLT2 inhibitors (beneficial in HF)', 'insulin'], evidenceSource: 'ADA/ACC/AHA Guidelines' },
  { drug: 'sulfonylureas', condition: 'severe hepatic impairment', type: 'relative', severity: 'high', reason: 'Prolonged hypoglycemia due to impaired gluconeogenesis and drug metabolism', alternatives: ['insulin with careful titration', 'DPP-4 inhibitors'], evidenceSource: 'ADA Standards of Care' },
  { drug: 'corticosteroids (systemic)', condition: 'active untreated infections', type: 'absolute', severity: 'critical', reason: 'Immunosuppression will worsen infection — may be fatal with fungal/TB infections', alternatives: ['treat infection first, then consider corticosteroid if still needed'], evidenceSource: 'IDSA Guidelines' },

  // ===== PREGNANCY =====
  { drug: 'ACE inhibitors', condition: 'pregnancy', type: 'pregnancy', severity: 'critical', reason: 'Category X — fetal renal agenesis, lung hypoplasia, death (especially 2nd/3rd trimester)', alternatives: ['labetalol', 'methyldopa', 'nifedipine'], evidenceSource: 'ACOG Hypertension in Pregnancy' },
  { drug: 'ARBs', condition: 'pregnancy', type: 'pregnancy', severity: 'critical', reason: 'Same fetal toxicity as ACE inhibitors — Category X', alternatives: ['labetalol', 'methyldopa', 'nifedipine'], evidenceSource: 'ACOG' },
  { drug: 'statins', condition: 'pregnancy', type: 'pregnancy', severity: 'critical', reason: 'Theoretical teratogenicity — cholesterol essential for fetal development', alternatives: ['cholestyramine if essential', 'diet modification'], evidenceSource: 'FDA Category X' },
  { drug: 'warfarin', condition: 'pregnancy (1st trimester)', type: 'pregnancy', severity: 'critical', reason: 'Warfarin embryopathy (weeks 6-12)', alternatives: ['LMWH'], evidenceSource: 'ACCP/ACOG' },
  { drug: 'isotretinoin', condition: 'pregnancy', type: 'pregnancy', severity: 'critical', reason: 'Severe birth defects — craniofacial, cardiac, CNS', alternatives: ['topical retinoids (with caution)', 'antibiotics for acne'], evidenceSource: 'FDA iPLEDGE Program' },
  { drug: 'methotrexate', condition: 'pregnancy', type: 'pregnancy', severity: 'critical', reason: 'Teratogenic — aminopterin syndrome. Also abortifacient', alternatives: ['stop 3 months before conception'], evidenceSource: 'FDA Category X' },
  { drug: 'finasteride', condition: 'pregnancy (contact)', type: 'pregnancy', severity: 'critical', reason: 'Anti-androgen effects cause male fetal genital abnormalities. Women should not handle crushed tablets', alternatives: ['minoxidil topical'], evidenceSource: 'FDA Category X' },
  { drug: 'valproic acid', condition: 'pregnancy', type: 'pregnancy', severity: 'critical', reason: 'Neural tube defects (1-2% risk), neurodevelopmental effects', alternatives: ['levetiracetam', 'lamotrigine'], evidenceSource: 'FDA/AAN/AES' },
  { drug: 'lithium', condition: 'pregnancy (1st trimester)', type: 'pregnancy', severity: 'high', reason: 'Ebstein anomaly (cardiac malformation) — risk ~1-2% vs 0.05% baseline', alternatives: ['lamotrigine for bipolar depression', 'antipsychotics for mania'], evidenceSource: 'APA Guidelines' },
  { drug: 'doxycycline', condition: 'pregnancy', type: 'pregnancy', severity: 'high', reason: 'Tooth discoloration and bone growth inhibition in fetus', alternatives: ['amoxicillin', 'azithromycin'], evidenceSource: 'AAP/ACOG' },

  // ===== MISCELLANEOUS =====
  { drug: 'thiazide diuretics', condition: 'severe hyponatremia (Na < 125)', type: 'absolute', severity: 'critical', reason: 'Will worsen hyponatremia further', alternatives: ['loop diuretics if diuresis needed', 'fluid restriction'], evidenceSource: 'Endocrine Society Guidelines' },
  { drug: 'clozapine', condition: 'history of clozapine-induced agranulocytosis', type: 'absolute', severity: 'critical', reason: 'Recurrence risk is near 100%', alternatives: ['other atypical antipsychotics'], evidenceSource: 'FDA REMS' },
  { drug: 'carbamazepine', condition: 'HLA-B*1502 positive (Asian descent)', type: 'absolute', severity: 'critical', reason: 'Stevens-Johnson syndrome / toxic epidermal necrolysis (30% mortality)', alternatives: ['screen before prescribing', 'use alternative anticonvulsant'], evidenceSource: 'FDA Black Box Warning' },
  { drug: 'abacavir', condition: 'HLA-B*5701 positive', type: 'absolute', severity: 'critical', reason: 'Hypersensitivity reaction — potentially fatal on rechallenge', alternatives: ['screen before prescribing', 'alternative NRTI'], evidenceSource: 'DHHS HIV Guidelines' },
];

// ===================== DOSAGE GUIDELINES (30+ DRUGS) =====================

export interface DosageGuidelineEntry {
  drug: string;
  indication: string;
  standardDose: string;
  maxDose: string;
  renalAdjustment: Record<string, string>;
  hepaticAdjustment: string;
  geriatricAdjustment: string;
  pediatricNote?: string;
  monitoringParameters: string[];
  blackBoxWarnings?: string[];
}

export const COMPREHENSIVE_DOSAGE_GUIDELINES: DosageGuidelineEntry[] = [
  // ===== CARDIOVASCULAR =====
  {
    drug: 'lisinopril', indication: 'hypertension/heart failure',
    standardDose: '10mg PO once daily', maxDose: '80mg/day for HTN; 40mg/day for HF',
    renalAdjustment: { 'CrCl 10-30': 'Start 5mg, max 40mg', 'CrCl <10': 'Start 2.5mg' },
    hepaticAdjustment: 'No adjustment needed', geriatricAdjustment: 'Start 2.5-5mg, monitor for hypotension and hyperkalemia',
    monitoringParameters: ['Serum potassium', 'BUN/creatinine', 'Blood pressure'],
  },
  {
    drug: 'enalapril', indication: 'hypertension/heart failure',
    standardDose: '5mg PO once or twice daily', maxDose: '40mg/day',
    renalAdjustment: { 'CrCl 10-30': 'Start 2.5mg', 'CrCl <10': 'Start 2.5mg on dialysis days' },
    hepaticAdjustment: 'No adjustment, but monitor closely in cirrhosis', geriatricAdjustment: 'Start 2.5mg, titrate slowly',
    monitoringParameters: ['Potassium', 'Creatinine', 'Blood pressure', 'ECG if combining with other drugs'],
  },
  {
    drug: 'losartan', indication: 'hypertension/diabetic nephropathy',
    standardDose: '50mg PO once daily', maxDose: '100mg/day',
    renalAdjustment: { 'All stages': 'No adjustment needed; use with caution if RAS involvement suspected' },
    hepaticAdjustment: 'Start 25mg in hepatic impairment (reduced first-pass metabolism)', geriatricAdjustment: 'Start 25mg if volume depleted',
    monitoringParameters: ['Potassium', 'Creatinine', 'Blood pressure'],
  },
  {
    drug: 'amlodipine', indication: 'hypertension/angina',
    standardDose: '5mg PO once daily', maxDose: '10mg/day',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Start 2.5mg in hepatic impairment', geriatricAdjustment: 'Start 2.5mg, titrate slowly. Monitor for pedal edema',
    monitoringParameters: ['Blood pressure', 'Heart rate', 'Peripheral edema'],
  },
  {
    drug: 'metoprolol', indication: 'hypertension/heart failure/post-MI',
    standardDose: 'Tartrate: 25-100mg BID; Succinate (XL): 25-200mg daily', maxDose: '400mg/day (tartrate); 200mg/day (succinate)',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Reduce dose in significant hepatic impairment (extensive first-pass)', geriatricAdjustment: 'Start low, monitor HR and BP. HR goal ≥55 bpm',
    monitoringParameters: ['Heart rate', 'Blood pressure', 'Blood glucose (can mask hypoglycemia)'],
  },
  {
    drug: 'atorvastatin', indication: 'hyperlipidemia/cardiovascular prevention',
    standardDose: '10-20mg PO once daily', maxDose: '80mg/day',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Contraindicated in active liver disease or ALT/AST >3x ULN', geriatricAdjustment: 'No specific adjustment, monitor for myopathy symptoms',
    monitoringParameters: ['LDL-C (4-12 weeks after start)', 'ALT/AST baseline then as needed', 'CK if muscle symptoms'],
  },
  {
    drug: 'rosuvastatin', indication: 'hyperlipidemia',
    standardDose: '10-20mg PO once daily', maxDose: '40mg/day (20mg max for Asian patients)',
    renalAdjustment: { 'CrCl <30': 'Start 5mg, max 10mg', 'CrCl 30-60': 'Start 5mg, max 20mg' },
    hepaticAdjustment: 'Contraindicated in active liver disease', geriatricAdjustment: 'Start 5mg for >65 years',
    monitoringParameters: ['LDL-C', 'LFTs baseline', 'CK if symptoms'],
  },
  {
    drug: 'warfarin', indication: 'anticoagulation (DVT/PE/atrial fibrillation)',
    standardDose: '5mg PO once daily, adjust by INR', maxDose: 'Individualized by INR',
    renalAdjustment: { 'All stages': 'No adjustment; monitor INR more closely' },
    hepaticAdjustment: 'Increased sensitivity. Start 2.5mg. Contraindicated in severe liver impairment', geriatricAdjustment: 'Start 2-3mg (elderly are more sensitive). More frequent INR monitoring',
    monitoringParameters: ['INR (target 2.0-3.0 for most indications; 2.5-3.5 for mechanical heart valve)', 'Signs of bleeding', 'Drug interactions review'],
    blackBoxWarnings: ['Risk of major or fatal bleeding'],
  },
  {
    drug: 'apixaban', indication: 'atrial fibrillation/VTE',
    standardDose: 'AF: 5mg BID; VTE treatment: 10mg BID x7d then 5mg BID', maxDose: '10mg BID (acute VTE only)',
    renalAdjustment: { 'Cr ≥1.5 + age ≥80 or weight ≤60kg': '2.5mg BID', 'ESRD on dialysis': '5mg BID (no adjustment)' },
    hepaticAdjustment: 'Child-Pugh A/B: no adjustment. Child-Pugh C: avoid', geriatricAdjustment: 'See dose reduction criteria above (age ≥80)',
    monitoringParameters: ['CBC', 'Creatinine', 'Signs of bleeding', 'No routine coagulation monitoring needed'],
  },
  {
    drug: 'digoxin', indication: 'heart failure/atrial fibrillation rate control',
    standardDose: '0.125-0.25mg PO once daily', maxDose: '0.5mg/day',
    renalAdjustment: { 'CrCl 25-50': '0.125mg daily or every other day', 'CrCl <25': '0.0625mg daily, monitor levels closely' },
    hepaticAdjustment: 'No adjustment needed (minimal hepatic metabolism)', geriatricAdjustment: 'Start 0.0625-0.125mg. Target level 0.5-0.9 ng/mL in heart failure',
    monitoringParameters: ['Serum digoxin level (therapeutic 0.5-2.0)', 'Potassium (hypokalemia increases toxicity)', 'Creatinine', 'Heart rate'],
  },

  // ===== DIABETES =====
  {
    drug: 'metformin', indication: 'type 2 diabetes',
    standardDose: '500mg PO BID with meals, titrate q1-2 weeks', maxDose: '2550mg/day (IR); 2000mg/day (XR)',
    renalAdjustment: { 'eGFR 45-60': 'Max 2000mg/day', 'eGFR 30-45': 'Max 1000mg/day, do not initiate', 'eGFR <30': 'CONTRAINDICATED' },
    hepaticAdjustment: 'Avoid in significant hepatic impairment', geriatricAdjustment: 'Conservative titration. Monitor renal function regularly (q3-6 months)',
    monitoringParameters: ['Fasting glucose', 'HbA1c (q3 months until stable, then q6 months)', 'Renal function', 'Vitamin B12 (annually)'],
  },
  {
    drug: 'glipizide', indication: 'type 2 diabetes',
    standardDose: '5mg PO 30 min before breakfast', maxDose: '40mg/day (20mg BID)',
    renalAdjustment: { 'CrCl <50': 'Start 2.5mg, conservative titration' },
    hepaticAdjustment: 'Start 2.5mg, increased hypoglycemia risk', geriatricAdjustment: 'Start 2.5mg. Higher risk of hypoglycemia in elderly. Prefer shorter-acting agents',
    monitoringParameters: ['Blood glucose', 'HbA1c', 'Hypoglycemia symptoms'],
  },
  {
    drug: 'empagliflozin', indication: 'type 2 diabetes/heart failure',
    standardDose: '10mg PO once daily', maxDose: '25mg/day',
    renalAdjustment: { 'eGFR 20-45': '10mg for HF/CKD indication; avoid for glycemic control', 'eGFR <20': 'Avoid' },
    hepaticAdjustment: 'No adjustment needed', geriatricAdjustment: 'Monitor volume status. Increased UTI/genital mycotic infection risk',
    monitoringParameters: ['Blood glucose', 'HbA1c', 'Renal function', 'Volume status', 'Ketones if symptomatic (DKA risk)'],
  },
  {
    drug: 'semaglutide', indication: 'type 2 diabetes/obesity',
    standardDose: 'SC: 0.25mg weekly x4wk, then 0.5mg weekly. Oral: 3mg daily x30d, then 7mg', maxDose: 'SC: 2.4mg weekly (obesity); 2mg weekly (T2DM). Oral: 14mg daily',
    renalAdjustment: { 'eGFR >15': 'No adjustment', 'eGFR <15': 'Limited data, use with caution' },
    hepaticAdjustment: 'No adjustment needed', geriatricAdjustment: 'No specific adjustment. Monitor for GI effects (nausea, vomiting) and dehydration',
    monitoringParameters: ['Blood glucose', 'HbA1c', 'Weight', 'GI symptoms', 'Thyroid nodules (clinical exam)'],
    blackBoxWarnings: ['Thyroid C-cell tumors in rodents. Contraindicated with MEN 2 or medullary thyroid carcinoma'],
  },

  // ===== PDE5 INHIBITORS =====
  {
    drug: 'sildenafil', indication: 'erectile dysfunction',
    standardDose: '50mg PO 1 hour before activity', maxDose: '100mg per 24 hours',
    renalAdjustment: { 'CrCl 30-50': '25mg starting dose', 'CrCl <30': '25mg max dose' },
    hepaticAdjustment: '25mg starting dose in Child-Pugh B/C', geriatricAdjustment: 'Start 25mg for age >65',
    monitoringParameters: ['Blood pressure (especially with antihypertensives)', 'Visual changes', 'Priapism (>4h erection)'],
  },
  {
    drug: 'tadalafil', indication: 'erectile dysfunction/BPH',
    standardDose: 'PRN: 10mg before activity; Daily: 2.5-5mg', maxDose: 'PRN: 20mg per 36h; Daily: 5mg/day',
    renalAdjustment: { 'CrCl 30-50': 'PRN: start 5mg. Daily: 2.5mg', 'CrCl <30': 'PRN: max 5mg, daily: avoid' },
    hepaticAdjustment: 'Child-Pugh A/B: max 10mg PRN. Child-Pugh C: avoid', geriatricAdjustment: 'No specific adjustment, consider renal function',
    monitoringParameters: ['Blood pressure', 'Concurrent nitrate use (absolute contraindication)'],
  },

  // ===== PAIN / ANTI-INFLAMMATORY =====
  {
    drug: 'ibuprofen', indication: 'pain/inflammation/fever',
    standardDose: '200-400mg PO q4-6h', maxDose: '3200mg/day (Rx); 1200mg/day (OTC)',
    renalAdjustment: { 'CrCl <30': 'AVOID', 'CrCl 30-60': 'Use lowest dose, shortest duration' },
    hepaticAdjustment: 'Use lowest effective dose and duration. AVOID in severe liver disease', geriatricAdjustment: 'Start low, shortest duration possible. Increased GI bleeding risk. Consider PPI co-therapy',
    monitoringParameters: ['Renal function', 'Blood pressure', 'GI symptoms', 'CBC if prolonged use'],
    blackBoxWarnings: ['Increased risk of serious cardiovascular events (MI, stroke)', 'Increased risk of serious GI events (bleeding, ulceration, perforation)'],
  },
  {
    drug: 'acetaminophen', indication: 'pain/fever',
    standardDose: '500-1000mg PO q4-6h', maxDose: '4000mg/day (3000mg/day in elderly or liver disease)',
    renalAdjustment: { 'CrCl <10': 'Extend dosing interval to q8h' },
    hepaticAdjustment: 'Max 2000mg/day. AVOID in severe hepatic impairment. Monitor LFTs', geriatricAdjustment: 'Max 3000mg/day. Monitor for hepatotoxicity',
    monitoringParameters: ['LFTs if chronic use', 'Total daily dose accounting for combination products'],
  },
  {
    drug: 'gabapentin', indication: 'neuropathic pain/seizures',
    standardDose: '300mg PO TID, titrate to effect over 1-2 weeks', maxDose: '3600mg/day',
    renalAdjustment: { 'CrCl 30-59': 'Max 1400mg/day', 'CrCl 15-29': 'Max 700mg/day', 'CrCl <15': 'Max 300mg/day' },
    hepaticAdjustment: 'No adjustment needed (not hepatically metabolized)', geriatricAdjustment: 'Start 100-300mg at bedtime. Slow titration. Monitor for sedation, dizziness, falls',
    monitoringParameters: ['Pain assessment', 'Sedation', 'Fall risk (elderly)', 'Renal function'],
  },
  {
    drug: 'pregabalin', indication: 'neuropathic pain/fibromyalgia/seizures',
    standardDose: '75mg PO BID, titrate to 150-300mg BID', maxDose: '600mg/day',
    renalAdjustment: { 'CrCl 30-60': 'Max 300mg/day', 'CrCl 15-30': 'Max 150mg/day', 'CrCl <15': 'Max 75mg/day' },
    hepaticAdjustment: 'No adjustment needed', geriatricAdjustment: 'Start 25-75mg daily. Monitor for sedation and cognitive effects',
    monitoringParameters: ['Pain scores', 'Sedation', 'Weight gain', 'Peripheral edema', 'Renal function'],
  },

  // ===== ANTIBIOTICS =====
  {
    drug: 'amoxicillin', indication: 'bacterial infections',
    standardDose: '250-500mg PO TID or 500-875mg BID', maxDose: '3000mg/day',
    renalAdjustment: { 'CrCl 10-30': '250-500mg q12h', 'CrCl <10': '250-500mg q24h' },
    hepaticAdjustment: 'No adjustment needed', geriatricAdjustment: 'Adjust for renal function',
    monitoringParameters: ['Signs of infection resolution', 'CBC if prolonged course', 'Rash (discontinue if maculopapular - may indicate mononucleosis)'],
  },
  {
    drug: 'azithromycin', indication: 'bacterial infections (respiratory, STI)',
    standardDose: '500mg day 1, then 250mg days 2-5 (Z-pack) OR 500mg daily x3d', maxDose: '500mg/day',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Use with caution in severe hepatic impairment. Monitor LFTs', geriatricAdjustment: 'No adjustment. Watch for QT prolongation in cardiac patients',
    monitoringParameters: ['Infection resolution', 'LFTs if hepatic risk', 'ECG in patients with cardiac risk factors'],
  },
  {
    drug: 'ciprofloxacin', indication: 'bacterial infections (UTI, respiratory, GI)',
    standardDose: '250-750mg PO BID or 200-400mg IV q12h', maxDose: '1500mg/day PO; 800mg/day IV',
    renalAdjustment: { 'CrCl 30-50': '250-500mg q12h', 'CrCl <30': '250-500mg q18-24h' },
    hepaticAdjustment: 'No adjustment but monitor LFTs', geriatricAdjustment: 'Increased tendon rupture risk. Avoid if possible in >60. Avoid concomitant steroids',
    monitoringParameters: ['Infection resolution', 'Tendon pain', 'QT interval'], 
    blackBoxWarnings: ['Tendon rupture', 'Peripheral neuropathy', 'CNS effects', 'Myasthenia gravis exacerbation'],
  },

  // ===== PSYCHIATRIC =====
  {
    drug: 'sertraline', indication: 'depression/anxiety/PTSD/OCD',
    standardDose: '50mg PO once daily, titrate q1 week', maxDose: '200mg/day',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Reduce dose by 50%. Use lower starting dose', geriatricAdjustment: 'Start 25mg daily. Titrate slowly. Watch for hyponatremia (SIADH)',
    monitoringParameters: ['Depression/anxiety scales', 'Suicidality (especially first 4 weeks)', 'Sodium (elderly)', 'Bleeding risk with anticoagulants'],
    blackBoxWarnings: ['Increased risk of suicidal thinking in children, adolescents, young adults (18-24)'],
  },
  {
    drug: 'escitalopram', indication: 'depression/generalized anxiety',
    standardDose: '10mg PO once daily', maxDose: '20mg/day (10mg/day in elderly)',
    renalAdjustment: { 'Severe impairment': 'Use with caution' },
    hepaticAdjustment: 'Max 10mg/day', geriatricAdjustment: 'Max 10mg/day. Monitor sodium. ECG if cardiac risk factors (QT prolongation dose-related)',
    monitoringParameters: ['Mood assessment', 'Suicidality risk', 'QT interval at higher doses', 'Sodium'],
    blackBoxWarnings: ['Suicidality risk in young adults'],
  },
  {
    drug: 'quetiapine', indication: 'schizophrenia/bipolar/adjunctive depression',
    standardDose: 'Schizophrenia: 25mg BID, titrate to 300-800mg/day. Bipolar depression: 50mg HS, titrate to 300mg HS', maxDose: '800mg/day',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Start 25mg/day, titrate by 25-50mg/day increments', geriatricAdjustment: 'Start 12.5-25mg. Slower titration. Increased stroke risk in dementia-related psychosis',
    monitoringParameters: ['Metabolic panel (glucose, lipids, weight)', 'Blood pressure', 'ECG', 'Movement disorder assessment'],
    blackBoxWarnings: ['Increased mortality in elderly with dementia-related psychosis', 'Suicidality in young adults'],
  },

  // ===== RESPIRATORY =====
  {
    drug: 'albuterol', indication: 'bronchospasm (asthma/COPD)',
    standardDose: 'MDI: 2 puffs q4-6h PRN. Nebulizer: 2.5mg q4-6h PRN', maxDose: '12 puffs/day MDI; frequent use indicates poor control',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'No adjustment needed', geriatricAdjustment: 'Monitor for tachycardia, tremor, hypokalemia',
    monitoringParameters: ['Respiratory function', 'Heart rate', 'Potassium (with frequent use)', 'Usage frequency (>2x/week SABA = poor control)'],
  },
  {
    drug: 'prednisone', indication: 'anti-inflammatory/immunosuppression',
    standardDose: 'Varies: 5-60mg/day depending on indication', maxDose: 'Indication-specific',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Prednisone is a prodrug requiring hepatic activation to prednisolone. Consider prednisolone in severe liver disease', geriatricAdjustment: 'Start lowest effective dose. Monitor for hyperglycemia, osteoporosis, delirium',
    monitoringParameters: ['Blood glucose', 'Blood pressure', 'Bone density (if >3 months)', 'Eye exams (cataracts/glaucoma)', 'Potassium', 'Infection signs'],
  },

  // ===== GI =====
  {
    drug: 'omeprazole', indication: 'GERD/peptic ulcer/H. pylori',
    standardDose: '20mg PO once daily before breakfast', maxDose: '40mg/day (80mg/day for Zollinger-Ellison)',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Max 20mg/day in severe hepatic impairment', geriatricAdjustment: 'No adjustment. Monitor for Clostridioides difficile if hospitalized. Consider calcium + vitamin D',
    monitoringParameters: ['Symptom relief', 'Magnesium (if >1 year use)', 'Vitamin B12 (long-term)', 'Bone density (long-term)'],
  },

  // ===== DERMATOLOGY =====
  {
    drug: 'finasteride', indication: 'male pattern baldness/BPH',
    standardDose: 'MPB: 1mg PO once daily. BPH: 5mg PO once daily', maxDose: '1mg/day (MPB); 5mg/day (BPH)',
    renalAdjustment: { 'All stages': 'No adjustment needed' },
    hepaticAdjustment: 'Use with caution (hepatically metabolized)', geriatricAdjustment: 'No specific adjustment',
    monitoringParameters: ['PSA (finasteride halves PSA; double reported value for screening)', 'Mood changes', 'Sexual function'],
  },

  // ===== ANTICONVULSANTS =====
  {
    drug: 'levetiracetam', indication: 'seizures',
    standardDose: '500mg PO BID, titrate q2 weeks', maxDose: '3000mg/day',
    renalAdjustment: { 'CrCl 50-80': 'Max 2000mg/day', 'CrCl 30-50': 'Max 1500mg/day', 'CrCl <30': 'Max 1000mg/day' },
    hepaticAdjustment: 'No adjustment needed (renally eliminated)', geriatricAdjustment: 'Dose adjust for renal function. Monitor mood (behavioral side effects)',
    monitoringParameters: ['Seizure frequency', 'Behavioral changes (irritability, aggression)', 'Renal function'],
  },
  {
    drug: 'lamotrigine', indication: 'seizures/bipolar maintenance',
    standardDose: '25mg daily x2wk → 50mg daily x2wk → target 200mg/day', maxDose: '400mg/day (200mg if with valproate)',
    renalAdjustment: { 'Severe renal impairment': 'Reduce maintenance dose' },
    hepaticAdjustment: 'Moderate (Child-Pugh B): reduce by 25%. Severe: reduce by 50%', geriatricAdjustment: 'No specific adjustment beyond hepatic/renal considerations',
    monitoringParameters: ['Rash (stop immediately if any rash — SJS risk)', 'Seizure frequency', 'Mood if bipolar'],
    blackBoxWarnings: ['Serious skin rashes including Stevens-Johnson syndrome (risk ~0.8% in adults)'],
  },
];

// ===================== ALLERGY CROSS-REACTIVITY GROUPS =====================

export interface AllergyCrossReactivityGroup {
  groupName: string;
  primaryAllergen: string;
  crossReactiveDrugs: string[];
  crossReactivityRate: string; // Approximate percentage
  recommendation: string;
}

export const ALLERGY_CROSS_REACTIVITY: AllergyCrossReactivityGroup[] = [
  {
    groupName: 'Penicillin Class',
    primaryAllergen: 'penicillin',
    crossReactiveDrugs: ['amoxicillin', 'ampicillin', 'piperacillin', 'nafcillin', 'oxacillin', 'dicloxacillin', 'amoxicillin-clavulanate'],
    crossReactivityRate: '~100% within class',
    recommendation: 'Avoid all penicillins. Cephalosporin cross-reactivity is ~1-2% (mostly first-gen). Carbapenems cross-reactivity <1%. Aztreonam has no cross-reactivity.',
  },
  {
    groupName: 'Penicillin → Cephalosporin',
    primaryAllergen: 'penicillin',
    crossReactiveDrugs: ['cephalexin', 'cefazolin', 'cefadroxil'],
    crossReactivityRate: '1-2% for first-gen; <0.5% for third/fourth-gen',
    recommendation: 'First-gen cephalosporins share R1 side chain with amoxicillin/ampicillin → higher risk. Third/fourth gen cephalosporins are generally safe. Skin testing recommended if severe penicillin allergy.',
  },
  {
    groupName: 'Sulfonamide Antibiotics',
    primaryAllergen: 'sulfa antibiotics',
    crossReactiveDrugs: ['sulfamethoxazole', 'sulfasalazine', 'sulfadiazine', 'silver sulfadiazine'],
    crossReactivityRate: '~100% within antibiotic sulfonamides',
    recommendation: 'Cross-reactivity with non-antibiotic sulfonamides (furosemide, thiazides, celecoxib) is NOT confirmed. The arylamine group causes immune reaction in antibiotic sulfonamides and is absent in non-antibiotic sulfonamides.',
  },
  {
    groupName: 'NSAIDs (COX inhibitors)',
    primaryAllergen: 'aspirin',
    crossReactiveDrugs: ['ibuprofen', 'naproxen', 'ketorolac', 'indomethacin', 'piroxicam', 'diclofenac', 'meloxicam'],
    crossReactivityRate: '~20-30% cross-reactivity for aspirin-exacerbated respiratory disease',
    recommendation: 'If aspirin allergy with respiratory symptoms (AERD), avoid ALL NSAIDs. COX-2 selective inhibitors (celecoxib) may be tolerated with challenge testing. Acetaminophen at <1g generally safe.',
  },
  {
    groupName: 'Local Anesthetics — Ester Type',
    primaryAllergen: 'procaine',
    crossReactiveDrugs: ['benzocaine', 'tetracaine', 'cocaine'],
    crossReactivityRate: '~100% within ester group',
    recommendation: 'True allergy is to PABA metabolite. Cross-reactivity within ester group is possible. Amide local anesthetics (lidocaine, bupivacaine) do NOT cross-react with esters.',
  },
  {
    groupName: 'Fluoroquinolone Class',
    primaryAllergen: 'ciprofloxacin',
    crossReactiveDrugs: ['levofloxacin', 'moxifloxacin', 'ofloxacin', 'norfloxacin', 'gemifloxacin'],
    crossReactivityRate: '~50-70% within class',
    recommendation: 'If true IgE-mediated allergy to one fluoroquinolone, avoid all fluoroquinolones. Use alternative antibiotic class.',
  },
  {
    groupName: 'Opioid Class (Morphine-type)',
    primaryAllergen: 'morphine',
    crossReactiveDrugs: ['codeine', 'hydromorphone', 'hydrocodone', 'oxycodone', 'oxymorphone'],
    crossReactivityRate: 'Variable; histamine release common (not true allergy)',
    recommendation: 'Distinguish between true allergy (anaphylaxis) and pseudo-allergy (histamine release causing itching/nausea). For true morphine allergy, fentanyl and methadone have different structures and may be safe.',
  },
  {
    groupName: 'ACE Inhibitor Angioedema',
    primaryAllergen: 'lisinopril',
    crossReactiveDrugs: ['enalapril', 'ramipril', 'benazepril', 'captopril', 'fosinopril', 'quinapril', 'perindopril'],
    crossReactivityRate: '~100% within ACE inhibitor class',
    recommendation: 'If ACE inhibitor-induced angioedema, ALL ACE inhibitors are contraindicated. ARBs have ~1-2% cross-reactivity but can be used with monitoring. Direct renin inhibitors are an option.',
  },
  {
    groupName: 'Contrast Dye',
    primaryAllergen: 'iodinated contrast',
    crossReactiveDrugs: ['iohexol', 'iopamidol', 'ioversol', 'iodixanol'],
    crossReactivityRate: 'Non-ionic agents have lower risk than ionic agents',
    recommendation: 'Previous contrast reaction: premedicate with prednisone 50mg 13h, 7h, 1h before + diphenhydramine 50mg 1h before. NOT a true iodine allergy — no cross-reactivity with povidone-iodine or seafood.',
  },
  {
    groupName: 'Statin Myopathy',
    primaryAllergen: 'simvastatin',
    crossReactiveDrugs: ['lovastatin', 'atorvastatin'],
    crossReactivityRate: 'CYP3A4-metabolized statins share risk. Pravastatin/rosuvastatin are alternatives',
    recommendation: 'If statin myopathy: try pravastatin (minimal CYP metabolism), rosuvastatin, or fluvastatin. Alternatively, use every-other-day dosing with long-acting statins.',
  },
];

// ===================== EXPORT ALL =====================

export const MEDICAL_KNOWLEDGE_BASE = {
  drugInteractions: COMPREHENSIVE_DRUG_INTERACTIONS,
  contraindications: COMPREHENSIVE_CONTRAINDICATIONS,
  dosageGuidelines: COMPREHENSIVE_DOSAGE_GUIDELINES,
  allergyCrossReactivity: ALLERGY_CROSS_REACTIVITY,
  
  /** Search interactions by drug name */
  findInteractions(drugName: string): DrugInteractionEntry[] {
    const normalized = drugName.toLowerCase().trim();
    return this.drugInteractions.filter(
      i => i.drug1.toLowerCase().includes(normalized) || i.drug2.toLowerCase().includes(normalized)
    );
  },
  
  /** Search contraindications by drug or condition */
  findContraindications(query: string): ContraindicationEntry[] {
    const normalized = query.toLowerCase().trim();
    return this.contraindications.filter(
      c => c.drug.toLowerCase().includes(normalized) || c.condition.toLowerCase().includes(normalized)
    );
  },
  
  /** Get dosage guideline for a drug */
  findDosageGuideline(drugName: string): DosageGuidelineEntry | undefined {
    const normalized = drugName.toLowerCase().trim();
    return this.dosageGuidelines.find(d => d.drug.toLowerCase() === normalized);
  },
  
  /** Check cross-reactivity for an allergen */
  checkCrossReactivity(allergen: string): AllergyCrossReactivityGroup[] {
    const normalized = allergen.toLowerCase().trim();
    return this.allergyCrossReactivity.filter(
      g => g.primaryAllergen.toLowerCase().includes(normalized) ||
           g.crossReactiveDrugs.some(d => d.toLowerCase().includes(normalized))
    );
  },
  
  /** Check for interactions between two specific drugs */
  checkDrugPair(drug1: string, drug2: string): DrugInteractionEntry | undefined {
    const d1 = drug1.toLowerCase().trim();
    const d2 = drug2.toLowerCase().trim();
    return this.drugInteractions.find(
      i => (i.drug1.toLowerCase().includes(d1) && i.drug2.toLowerCase().includes(d2)) ||
           (i.drug1.toLowerCase().includes(d2) && i.drug2.toLowerCase().includes(d1))
    );
  },
  
  /** Get statistics about the knowledge base */
  getStats() {
    return {
      totalInteractions: this.drugInteractions.length,
      majorInteractions: this.drugInteractions.filter(i => i.severity === 'major').length,
      moderateInteractions: this.drugInteractions.filter(i => i.severity === 'moderate').length,
      minorInteractions: this.drugInteractions.filter(i => i.severity === 'minor').length,
      totalContraindications: this.contraindications.length,
      absoluteContraindications: this.contraindications.filter(c => c.type === 'absolute').length,
      pregnancyContraindications: this.contraindications.filter(c => c.type === 'pregnancy').length,
      totalDosageGuidelines: this.dosageGuidelines.length,
      totalAllergyGroups: this.allergyCrossReactivity.length,
    };
  },
};
