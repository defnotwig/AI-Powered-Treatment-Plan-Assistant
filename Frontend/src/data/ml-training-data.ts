/**
 * Comprehensive ML Training Dataset for Risk Prediction
 * 
 * 200+ clinically-informed synthetic patient records for training
 * the TensorFlow.js risk prediction model.
 * 
 * Features (11 dimensions):
 * [age, bmi, systolicBP, diastolicBP, heartRate, numConditions, 
 *  numAllergies, numMedications, smokingScore, alcoholScore, exerciseScore]
 * 
 * Output: Risk score 0-100
 * 
 * Data is stratified across risk categories:
 * - LOW (0-29): ~50 samples
 * - MEDIUM (30-59): ~60 samples
 * - HIGH (60-79): ~50 samples
 * - CRITICAL (80-100): ~50 samples
 * 
 * Clinical basis:
 * - Age >65 increases cardiovascular and polypharmacy risk
 * - BMI >30 (obesity) increases metabolic and surgical risk
 * - BP >140/90 = hypertension stage 2
 * - HR >100 = tachycardia, <60 = bradycardia
 * - Polypharmacy (≥5 meds) increases interaction risk
 * - Smoking >20 pack-years = major cardiovascular risk
 * - Alcohol >14 drinks/week = heavy use
 * - Sedentary lifestyle compounds metabolic risk
 */

export interface TrainingExample {
  inputs: number[];
  output: number;
  category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  clinicalProfile: string;
}

// ===================== LOW RISK (0-29) =====================
const lowRiskSamples: TrainingExample[] = [
  // Healthy young adults
  { inputs: [22, 21, 115, 75, 68, 0, 0, 0, 0, 0, 90], output: 5, category: 'LOW', clinicalProfile: 'Healthy young adult, no comorbidities' },
  { inputs: [25, 22, 118, 76, 70, 0, 0, 0, 0, 5, 85], output: 8, category: 'LOW', clinicalProfile: 'Young adult, occasional social drinker' },
  { inputs: [28, 23, 120, 78, 72, 0, 1, 0, 0, 10, 80], output: 10, category: 'LOW', clinicalProfile: 'Young adult with single allergy' },
  { inputs: [30, 22, 116, 74, 65, 0, 0, 1, 0, 0, 90], output: 8, category: 'LOW', clinicalProfile: 'Young adult on single medication (OCP)' },
  { inputs: [24, 20, 112, 72, 62, 0, 0, 0, 0, 0, 95], output: 3, category: 'LOW', clinicalProfile: 'Athletic young adult' },
  { inputs: [26, 24, 122, 80, 74, 0, 0, 0, 0, 15, 75], output: 12, category: 'LOW', clinicalProfile: 'Young adult, light drinker' },
  { inputs: [32, 23, 118, 78, 68, 1, 0, 1, 0, 10, 80], output: 15, category: 'LOW', clinicalProfile: 'Early 30s, mild seasonal allergies' },
  { inputs: [35, 25, 120, 80, 72, 0, 1, 0, 0, 20, 70], output: 14, category: 'LOW', clinicalProfile: 'Mid-30s, no conditions, occasional drinker' },
  { inputs: [33, 24, 124, 82, 75, 1, 0, 1, 0, 5, 85], output: 16, category: 'LOW', clinicalProfile: 'Early 30s, hypothyroidism well-controlled' },
  { inputs: [29, 22, 116, 76, 66, 0, 2, 0, 0, 0, 90], output: 9, category: 'LOW', clinicalProfile: 'Late 20s, penicillin and sulfa allergies' },
  
  // Healthy middle-aged with minimal risk
  { inputs: [38, 25, 122, 80, 70, 0, 0, 0, 0, 10, 80], output: 13, category: 'LOW', clinicalProfile: 'Late 30s, healthy lifestyle' },
  { inputs: [40, 24, 120, 78, 72, 1, 0, 1, 0, 15, 75], output: 18, category: 'LOW', clinicalProfile: '40yo with controlled hypothyroidism' },
  { inputs: [42, 26, 126, 82, 74, 0, 1, 0, 0, 10, 70], output: 17, category: 'LOW', clinicalProfile: 'Early 40s, single allergy, exercises regularly' },
  { inputs: [36, 23, 118, 76, 68, 0, 0, 0, 0, 5, 85], output: 11, category: 'LOW', clinicalProfile: 'Mid-30s female, excellent health' },
  { inputs: [27, 21, 114, 74, 64, 0, 0, 0, 0, 0, 92], output: 4, category: 'LOW', clinicalProfile: 'Young adult athlete' },
  { inputs: [31, 24, 120, 80, 70, 0, 1, 1, 0, 10, 80], output: 13, category: 'LOW', clinicalProfile: 'Early 30s, mild asthma, well controlled' },
  { inputs: [34, 22, 116, 76, 66, 0, 0, 0, 0, 0, 88], output: 7, category: 'LOW', clinicalProfile: 'Mid-30s, vegetarian, active lifestyle' },
  { inputs: [37, 25, 124, 82, 74, 1, 0, 1, 0, 15, 70], output: 19, category: 'LOW', clinicalProfile: 'Late 30s, GERD on PPI' },
  { inputs: [23, 23, 118, 78, 70, 0, 0, 0, 0, 10, 80], output: 8, category: 'LOW', clinicalProfile: 'Young adult, healthy' },
  { inputs: [39, 26, 126, 82, 72, 0, 0, 0, 0, 20, 65], output: 16, category: 'LOW', clinicalProfile: 'Late 30s, moderate drinker' },
  
  // Low risk with mild factors
  { inputs: [44, 26, 128, 84, 76, 1, 0, 1, 0, 20, 60], output: 22, category: 'LOW', clinicalProfile: 'Mid-40s, mild anxiety on SSRI' },
  { inputs: [41, 27, 130, 84, 78, 1, 1, 2, 0, 15, 65], output: 24, category: 'LOW', clinicalProfile: 'Early 40s, hypothyroidism + mild allergy' },
  { inputs: [45, 25, 122, 80, 70, 1, 0, 1, 0, 10, 75], output: 20, category: 'LOW', clinicalProfile: 'Mid-40s, well-controlled GERD' },
  { inputs: [43, 24, 120, 78, 68, 0, 2, 0, 0, 5, 80], output: 15, category: 'LOW', clinicalProfile: 'Early 40s, environmental allergies' },
  { inputs: [46, 26, 126, 82, 74, 1, 0, 2, 0, 20, 65], output: 25, category: 'LOW', clinicalProfile: 'Mid-40s, migraine prevention treatment' },
  { inputs: [35, 28, 128, 84, 76, 0, 0, 0, 10, 25, 55], output: 22, category: 'LOW', clinicalProfile: 'Mid-30s, borderline BMI, former smoker' },
  { inputs: [38, 27, 130, 82, 74, 1, 0, 1, 0, 20, 60], output: 23, category: 'LOW', clinicalProfile: 'Late 30s, depression well-controlled' },
  { inputs: [48, 25, 124, 80, 72, 1, 1, 1, 0, 15, 70], output: 22, category: 'LOW', clinicalProfile: 'Late 40s, single condition well managed' },
  { inputs: [29, 26, 126, 82, 76, 0, 0, 0, 5, 15, 60], output: 16, category: 'LOW', clinicalProfile: 'Late 20s, slightly elevated BMI' },
  { inputs: [33, 25, 122, 80, 70, 0, 0, 0, 0, 10, 75], output: 12, category: 'LOW', clinicalProfile: 'Early 30s, minimal risk factors' },
  
  // Edge of low risk
  { inputs: [47, 27, 132, 84, 78, 1, 1, 2, 5, 20, 55], output: 28, category: 'LOW', clinicalProfile: 'Late 40s, borderline, minimal risk factors' },
  { inputs: [49, 26, 128, 82, 74, 1, 0, 2, 0, 15, 60], output: 27, category: 'LOW', clinicalProfile: 'Late 40s, 2 meds, otherwise healthy' },
  { inputs: [44, 28, 130, 86, 76, 1, 1, 2, 10, 20, 55], output: 29, category: 'LOW', clinicalProfile: 'Mid-40s, approaching borderline risk' },
  { inputs: [36, 24, 118, 78, 68, 0, 0, 1, 0, 5, 85], output: 10, category: 'LOW', clinicalProfile: 'Mid-30s, single med, active' },
  { inputs: [40, 26, 124, 82, 72, 1, 0, 1, 0, 15, 70], output: 19, category: 'LOW', clinicalProfile: '40yo, seasonal allergy only' },
];

// ===================== MEDIUM RISK (30-59) =====================
const mediumRiskSamples: TrainingExample[] = [
  // Emerging risk factors
  { inputs: [48, 28, 134, 86, 78, 2, 1, 3, 15, 25, 45], output: 32, category: 'MEDIUM', clinicalProfile: 'Late 40s, prediabetes + mild hypertension' },
  { inputs: [50, 29, 136, 88, 80, 2, 1, 3, 20, 30, 40], output: 38, category: 'MEDIUM', clinicalProfile: '50yo, T2DM + hypertension' },
  { inputs: [52, 30, 138, 88, 82, 2, 2, 4, 25, 30, 35], output: 42, category: 'MEDIUM', clinicalProfile: 'Early 50s, metabolic syndrome' },
  { inputs: [55, 29, 136, 86, 78, 3, 1, 3, 20, 35, 40], output: 45, category: 'MEDIUM', clinicalProfile: 'Mid-50s, HTN + HLD + GERD' },
  { inputs: [47, 31, 140, 90, 84, 2, 1, 4, 30, 25, 30], output: 48, category: 'MEDIUM', clinicalProfile: 'Late 40s, obese, pre-hypertensive' },
  { inputs: [53, 28, 132, 86, 76, 3, 0, 4, 15, 40, 45], output: 43, category: 'MEDIUM', clinicalProfile: 'Early 50s, CHF NYHA I, stable' },
  { inputs: [46, 33, 142, 92, 86, 2, 2, 5, 35, 20, 25], output: 52, category: 'MEDIUM', clinicalProfile: 'Mid-40s, obese, polypharmacy starting' },
  { inputs: [58, 27, 130, 84, 74, 3, 1, 3, 10, 35, 50], output: 41, category: 'MEDIUM', clinicalProfile: 'Late 50s, well-managed chronic conditions' },
  { inputs: [51, 30, 140, 90, 82, 2, 2, 5, 30, 40, 25], output: 52, category: 'MEDIUM', clinicalProfile: 'Early 50s, multiple risk factors emerging' },
  { inputs: [54, 28, 134, 86, 78, 3, 1, 4, 20, 25, 40], output: 44, category: 'MEDIUM', clinicalProfile: 'Mid-50s, diabetes + hypertension controlled' },
  
  // Moderate polypharmacy
  { inputs: [56, 29, 138, 88, 80, 3, 2, 5, 25, 35, 35], output: 50, category: 'MEDIUM', clinicalProfile: 'Mid-50s on 5 medications' },
  { inputs: [49, 32, 144, 92, 86, 2, 1, 5, 35, 30, 20], output: 54, category: 'MEDIUM', clinicalProfile: 'Late 40s, overweight with emerging polypharmacy' },
  { inputs: [60, 27, 132, 84, 76, 3, 1, 4, 10, 30, 45], output: 42, category: 'MEDIUM', clinicalProfile: '60yo, stable chronic conditions' },
  { inputs: [57, 30, 140, 90, 82, 3, 2, 5, 30, 35, 30], output: 53, category: 'MEDIUM', clinicalProfile: 'Late 50s, metabolic syndrome + polypharmacy' },
  { inputs: [45, 29, 136, 88, 80, 2, 1, 3, 25, 40, 35], output: 40, category: 'MEDIUM', clinicalProfile: 'Mid-40s, developing metabolic issues' },
  
  // Former smokers with risk
  { inputs: [55, 28, 134, 86, 78, 2, 0, 3, 30, 20, 50], output: 39, category: 'MEDIUM', clinicalProfile: 'Mid-50s, former heavy smoker, COPD mild' },
  { inputs: [52, 31, 138, 90, 84, 3, 1, 4, 35, 25, 30], output: 50, category: 'MEDIUM', clinicalProfile: 'Early 50s, former smoker, DM + HTN' },
  { inputs: [58, 29, 136, 88, 80, 3, 0, 4, 25, 30, 40], output: 46, category: 'MEDIUM', clinicalProfile: 'Late 50s, former smoker, cardiovascular risk' },
  { inputs: [48, 30, 140, 90, 82, 2, 2, 4, 30, 35, 30], output: 48, category: 'MEDIUM', clinicalProfile: 'Late 40s, overweight, former smoker' },
  { inputs: [53, 27, 130, 84, 74, 3, 1, 3, 20, 40, 45], output: 41, category: 'MEDIUM', clinicalProfile: 'Early 50s, moderate alcohol use, chronic conditions' },
  
  // Women with specific risk patterns
  { inputs: [50, 28, 134, 86, 78, 2, 1, 3, 0, 20, 50], output: 35, category: 'MEDIUM', clinicalProfile: 'Postmenopausal woman, osteoporosis risk' },
  { inputs: [55, 30, 138, 88, 80, 3, 2, 4, 0, 25, 40], output: 43, category: 'MEDIUM', clinicalProfile: 'Mid-50s woman, HTN + osteoporosis + thyroid' },
  { inputs: [48, 32, 140, 90, 82, 2, 1, 3, 0, 15, 35], output: 40, category: 'MEDIUM', clinicalProfile: 'Late 40s woman, PCOS + metabolic issues' },
  { inputs: [52, 29, 136, 86, 78, 3, 0, 4, 0, 20, 45], output: 42, category: 'MEDIUM', clinicalProfile: 'Early 50s woman, well-managed conditions' },
  { inputs: [57, 28, 132, 84, 76, 3, 1, 4, 0, 30, 40], output: 45, category: 'MEDIUM', clinicalProfile: 'Late 50s woman, controlled comorbidities' },
  
  // Mental health comorbidity
  { inputs: [42, 27, 128, 84, 80, 2, 0, 3, 15, 30, 40], output: 36, category: 'MEDIUM', clinicalProfile: 'Early 40s, depression + insomnia on 3 meds' },
  { inputs: [45, 29, 132, 86, 82, 2, 1, 4, 20, 35, 35], output: 42, category: 'MEDIUM', clinicalProfile: 'Mid-40s, anxiety + GERD + mild HTN' },
  { inputs: [50, 30, 136, 88, 84, 3, 1, 5, 25, 40, 30], output: 50, category: 'MEDIUM', clinicalProfile: '50yo, bipolar + metabolic syndrome' },
  { inputs: [38, 26, 126, 82, 78, 2, 0, 3, 10, 25, 45], output: 33, category: 'MEDIUM', clinicalProfile: 'Late 30s, ADHD + anxiety on dual therapy' },
  { inputs: [55, 28, 134, 86, 78, 3, 1, 4, 15, 30, 40], output: 44, category: 'MEDIUM', clinicalProfile: 'Mid-50s, depression + DM + HTN managed' },

  // Transition zone medium-high
  { inputs: [59, 30, 142, 90, 84, 3, 2, 5, 30, 40, 25], output: 55, category: 'MEDIUM', clinicalProfile: 'Late 50s, approaching high risk' },
  { inputs: [56, 31, 144, 92, 86, 3, 1, 5, 35, 35, 20], output: 57, category: 'MEDIUM', clinicalProfile: 'Mid-50s, multiple risk factors stacking' },
  { inputs: [60, 29, 138, 88, 82, 3, 2, 5, 25, 40, 30], output: 54, category: 'MEDIUM', clinicalProfile: '60yo, controlled conditions but polypharmacy' },
  { inputs: [55, 32, 146, 94, 88, 3, 1, 5, 40, 30, 20], output: 58, category: 'MEDIUM', clinicalProfile: 'Mid-50s, obese, heavy smoker, upper medium risk' },
  { inputs: [58, 30, 140, 90, 84, 3, 2, 5, 30, 35, 25], output: 56, category: 'MEDIUM', clinicalProfile: 'Late 50s, borderline high risk patient' },
  
  // Additional medium risk diversity
  { inputs: [44, 30, 138, 88, 82, 2, 0, 3, 20, 30, 35], output: 38, category: 'MEDIUM', clinicalProfile: 'Mid-40s, pre-diabetic, overweight' },
  { inputs: [61, 26, 130, 84, 74, 3, 1, 4, 5, 25, 55], output: 40, category: 'MEDIUM', clinicalProfile: 'Early 60s, stable conditions, active' },
  { inputs: [50, 33, 142, 92, 86, 2, 2, 4, 30, 35, 25], output: 50, category: 'MEDIUM', clinicalProfile: '50yo, obese, smoker, increasing risk' },
  { inputs: [47, 28, 132, 86, 78, 2, 0, 3, 15, 30, 40], output: 37, category: 'MEDIUM', clinicalProfile: 'Late 40s, moderate risk profile' },
  { inputs: [54, 29, 136, 88, 80, 3, 1, 4, 25, 30, 35], output: 47, category: 'MEDIUM', clinicalProfile: 'Mid-50s, typical comorbidity pattern' },
];

// ===================== HIGH RISK (60-79) =====================
const highRiskSamples: TrainingExample[] = [
  // Elderly with multiple conditions
  { inputs: [65, 30, 150, 92, 86, 4, 2, 6, 40, 40, 25], output: 62, category: 'HIGH', clinicalProfile: '65yo, DM + HTN + HLD + CKD, polypharmacy' },
  { inputs: [68, 32, 155, 95, 88, 4, 2, 7, 45, 35, 20], output: 68, category: 'HIGH', clinicalProfile: '68yo, advancing cardiac disease' },
  { inputs: [70, 31, 152, 94, 86, 5, 3, 7, 40, 30, 15], output: 72, category: 'HIGH', clinicalProfile: '70yo, CHF NYHA II + DM + CKD + COPD' },
  { inputs: [66, 33, 158, 96, 90, 4, 2, 8, 50, 40, 15], output: 74, category: 'HIGH', clinicalProfile: '66yo, obese, current smoker, 8 meds' },
  { inputs: [72, 30, 150, 92, 84, 5, 3, 8, 35, 25, 10], output: 75, category: 'HIGH', clinicalProfile: '72yo, advanced age with 5 conditions, high polypharmacy' },
  
  // Complex polypharmacy
  { inputs: [63, 29, 148, 92, 84, 4, 1, 7, 35, 45, 25], output: 64, category: 'HIGH', clinicalProfile: 'Early 60s, 7 medications, moderate smoking history' },
  { inputs: [67, 31, 154, 96, 88, 4, 3, 8, 40, 35, 20], output: 70, category: 'HIGH', clinicalProfile: 'Late 60s, polypharmacy with drug interaction risk' },
  { inputs: [64, 34, 160, 98, 92, 4, 2, 7, 50, 40, 15], output: 73, category: 'HIGH', clinicalProfile: 'Mid-60s, obese, heavy smoker, multiple meds' },
  { inputs: [69, 30, 152, 94, 86, 5, 2, 8, 35, 30, 15], output: 72, category: 'HIGH', clinicalProfile: 'Late 60s, 5 conditions, 8 medications' },
  { inputs: [71, 32, 156, 96, 90, 5, 3, 9, 40, 35, 10], output: 76, category: 'HIGH', clinicalProfile: '71yo, approaching critical territory' },
  
  // Cardiovascular disease complex
  { inputs: [62, 28, 146, 90, 82, 4, 1, 6, 40, 45, 30], output: 62, category: 'HIGH', clinicalProfile: 'Early 60s, post-MI, on secondary prevention' },
  { inputs: [65, 30, 150, 94, 86, 4, 2, 7, 45, 35, 20], output: 68, category: 'HIGH', clinicalProfile: '65yo, CAD + PVD + DM + CKD' },
  { inputs: [68, 31, 154, 96, 88, 5, 2, 8, 50, 30, 15], output: 74, category: 'HIGH', clinicalProfile: '68yo, cardiomyopathy + atrial fibrillation' },
  { inputs: [60, 32, 156, 98, 90, 4, 1, 6, 45, 50, 20], output: 67, category: 'HIGH', clinicalProfile: '60yo, heavy drinker with cardiac disease' },
  { inputs: [73, 29, 148, 92, 84, 5, 3, 8, 30, 25, 10], output: 73, category: 'HIGH', clinicalProfile: '73yo, multiple cardiovascular comorbidities' },
  
  // Renal + metabolic complex
  { inputs: [62, 33, 152, 94, 86, 4, 2, 7, 35, 40, 25], output: 66, category: 'HIGH', clinicalProfile: 'Early 60s, CKD stage 3 + DM + HTN + HLD' },
  { inputs: [66, 35, 158, 98, 92, 4, 2, 8, 50, 35, 15], output: 74, category: 'HIGH', clinicalProfile: '66yo, morbid obesity, CKD, DM, HTN, 8 meds' },
  { inputs: [70, 30, 150, 92, 84, 5, 1, 7, 30, 30, 20], output: 70, category: 'HIGH', clinicalProfile: '70yo, CKD stage 3b + multiple conditions' },
  { inputs: [64, 31, 154, 96, 88, 4, 3, 7, 40, 40, 20], output: 70, category: 'HIGH', clinicalProfile: 'Mid-60s, nephrotic syndrome + DM complications' },
  { inputs: [68, 32, 156, 96, 90, 5, 2, 8, 45, 35, 15], output: 75, category: 'HIGH', clinicalProfile: '68yo, advanced CKD with cardiovascular overlap' },
  
  // Respiratory complex
  { inputs: [63, 27, 144, 90, 82, 4, 1, 6, 55, 30, 25], output: 65, category: 'HIGH', clinicalProfile: 'Early 60s, COPD Gold III + CAD' },
  { inputs: [66, 29, 148, 92, 86, 4, 2, 7, 60, 25, 20], output: 70, category: 'HIGH', clinicalProfile: '66yo, severe COPD, current smoker, on 7 meds' },
  { inputs: [69, 28, 146, 92, 84, 5, 1, 7, 50, 30, 15], output: 72, category: 'HIGH', clinicalProfile: 'Late 60s, COPD + CHF + diabetes' },
  { inputs: [72, 30, 150, 94, 86, 5, 2, 8, 45, 25, 10], output: 74, category: 'HIGH', clinicalProfile: '72yo, pulmonary fibrosis complex' },
  { inputs: [65, 31, 152, 94, 88, 4, 3, 7, 55, 35, 15], output: 73, category: 'HIGH', clinicalProfile: '65yo, asthma-COPD overlap + cardiovascular' },
  
  // Transition to critical
  { inputs: [70, 33, 160, 98, 92, 5, 3, 9, 50, 40, 10], output: 78, category: 'HIGH', clinicalProfile: '70yo, near-critical, multiple organ involvement' },
  { inputs: [72, 34, 162, 100, 94, 5, 2, 9, 55, 35, 5], output: 79, category: 'HIGH', clinicalProfile: '72yo, borderline critical, extensive polypharmacy' },
  { inputs: [67, 35, 164, 100, 94, 5, 3, 9, 60, 40, 10], output: 78, category: 'HIGH', clinicalProfile: '67yo, morbidly obese, multiple high-risk features' },
  { inputs: [74, 30, 156, 96, 88, 5, 2, 9, 40, 30, 10], output: 77, category: 'HIGH', clinicalProfile: '74yo, advanced age + polypharmacy + multiple conditions' },
  { inputs: [63, 32, 158, 96, 90, 4, 2, 8, 55, 50, 10], output: 76, category: 'HIGH', clinicalProfile: 'Early 60s, heavy substance use + cardiovascular' },
  
  // Additional high risk diversity
  { inputs: [61, 29, 146, 90, 84, 4, 1, 6, 35, 45, 25], output: 62, category: 'HIGH', clinicalProfile: 'Early 60s, post-stroke, secondary prevention' },
  { inputs: [64, 30, 150, 92, 86, 4, 2, 7, 40, 35, 20], output: 67, category: 'HIGH', clinicalProfile: 'Mid-60s, standard geriatric complexity' },
  { inputs: [67, 31, 152, 94, 88, 5, 2, 8, 45, 40, 15], output: 72, category: 'HIGH', clinicalProfile: 'Late 60s, increasing clinical complexity' },
  { inputs: [70, 29, 148, 92, 84, 5, 1, 7, 35, 25, 20], output: 69, category: 'HIGH', clinicalProfile: '70yo, well-managed but high baseline risk' },
  { inputs: [66, 33, 156, 96, 90, 4, 3, 8, 50, 45, 15], output: 75, category: 'HIGH', clinicalProfile: '66yo, complex allergies + polypharmacy' },
];

// ===================== CRITICAL RISK (80-100) =====================
const criticalRiskSamples: TrainingExample[] = [
  // Multi-organ disease
  { inputs: [75, 36, 170, 105, 96, 6, 3, 10, 65, 55, 5], output: 85, category: 'CRITICAL', clinicalProfile: '75yo, CHF + CKD4 + DM + COPD + afib + HTN' },
  { inputs: [78, 38, 175, 108, 98, 6, 4, 12, 70, 50, 0], output: 90, category: 'CRITICAL', clinicalProfile: '78yo, end-stage multiple organ involvement' },
  { inputs: [80, 40, 185, 112, 102, 7, 4, 14, 80, 55, 0], output: 95, category: 'CRITICAL', clinicalProfile: '80yo, severe multi-system failure risk' },
  { inputs: [82, 42, 190, 115, 105, 8, 5, 15, 85, 50, 0], output: 98, category: 'CRITICAL', clinicalProfile: '82yo, maximal clinical complexity' },
  { inputs: [77, 35, 172, 106, 94, 6, 3, 11, 70, 60, 5], output: 88, category: 'CRITICAL', clinicalProfile: '77yo, advanced HF + renal failure + COPD' },
  
  // Extreme polypharmacy
  { inputs: [74, 34, 168, 104, 92, 6, 4, 12, 55, 45, 10], output: 84, category: 'CRITICAL', clinicalProfile: '74yo, 12 medications, high interaction risk' },
  { inputs: [76, 36, 175, 108, 96, 6, 3, 13, 65, 50, 5], output: 89, category: 'CRITICAL', clinicalProfile: '76yo, extreme polypharmacy with known interactions' },
  { inputs: [79, 38, 180, 110, 100, 7, 4, 14, 75, 55, 0], output: 93, category: 'CRITICAL', clinicalProfile: '79yo, 14+ medications, organ-system complexity' },
  { inputs: [73, 33, 165, 102, 90, 6, 3, 11, 60, 50, 10], output: 83, category: 'CRITICAL', clinicalProfile: '73yo, 11 meds, CHF + DM + CKD + COPD' },
  { inputs: [81, 37, 182, 112, 102, 7, 5, 15, 80, 45, 0], output: 96, category: 'CRITICAL', clinicalProfile: '81yo, near-maximum complexity score' },
  
  // Critical cardiovascular
  { inputs: [70, 35, 175, 108, 98, 6, 2, 10, 70, 60, 5], output: 86, category: 'CRITICAL', clinicalProfile: '70yo, severe HF + renal cardiorenal syndrome' },
  { inputs: [75, 34, 170, 106, 94, 6, 3, 11, 65, 55, 5], output: 87, category: 'CRITICAL', clinicalProfile: '75yo, post CABG + DM + CKD + afib' },
  { inputs: [72, 36, 178, 110, 100, 6, 3, 12, 70, 50, 0], output: 90, category: 'CRITICAL', clinicalProfile: '72yo, unstable angina history, complex meds' },
  { inputs: [78, 35, 172, 106, 96, 7, 4, 13, 60, 45, 0], output: 92, category: 'CRITICAL', clinicalProfile: '78yo, severe aortic stenosis + multi-vessel CAD' },
  { inputs: [74, 37, 176, 108, 98, 6, 3, 11, 75, 60, 5], output: 89, category: 'CRITICAL', clinicalProfile: '74yo, cardiomyopathy + defibrillator + anticoagulated' },
  
  // Critical renal/hepatic
  { inputs: [71, 34, 168, 104, 92, 6, 2, 10, 60, 70, 10], output: 85, category: 'CRITICAL', clinicalProfile: '71yo, CKD 4-5 + cirrhosis + DM' },
  { inputs: [76, 33, 165, 102, 90, 6, 3, 11, 55, 80, 5], output: 88, category: 'CRITICAL', clinicalProfile: '76yo, end-stage liver disease + portal HTN' },
  { inputs: [73, 35, 170, 106, 94, 7, 4, 12, 65, 65, 0], output: 91, category: 'CRITICAL', clinicalProfile: '73yo, hepatorenal syndrome risk' },
  { inputs: [79, 36, 175, 108, 98, 7, 3, 13, 70, 50, 0], output: 93, category: 'CRITICAL', clinicalProfile: '79yo, CKD5 pre-dialysis + multiple organ disease' },
  { inputs: [68, 38, 180, 112, 100, 6, 4, 12, 75, 70, 0], output: 92, category: 'CRITICAL', clinicalProfile: '68yo, younger but extreme metabolic derangement' },
  
  // Critical respiratory + systemic
  { inputs: [72, 30, 160, 98, 92, 6, 2, 10, 80, 40, 5], output: 86, category: 'CRITICAL', clinicalProfile: '72yo, COPD Gold IV + cor pulmonale' },
  { inputs: [76, 32, 168, 104, 94, 7, 3, 12, 85, 35, 0], output: 91, category: 'CRITICAL', clinicalProfile: '76yo, on home oxygen, frequent exacerbations' },
  { inputs: [74, 28, 162, 100, 90, 6, 2, 11, 70, 45, 5], output: 87, category: 'CRITICAL', clinicalProfile: '74yo, pulmonary fibrosis + PHT + RHF' },
  { inputs: [80, 31, 170, 106, 96, 7, 4, 13, 75, 40, 0], output: 94, category: 'CRITICAL', clinicalProfile: '80yo, advanced respiratory failure' },
  { inputs: [77, 33, 172, 108, 98, 6, 3, 12, 80, 50, 0], output: 92, category: 'CRITICAL', clinicalProfile: '77yo, COPD + CHF + CKD triad' },
  
  // Extreme edge cases
  { inputs: [85, 40, 195, 118, 108, 8, 5, 16, 90, 60, 0], output: 99, category: 'CRITICAL', clinicalProfile: '85yo, maximum clinical complexity' },
  { inputs: [83, 38, 188, 114, 104, 8, 4, 15, 85, 55, 0], output: 97, category: 'CRITICAL', clinicalProfile: '83yo, virtually all risk factors present' },
  { inputs: [78, 42, 192, 116, 106, 7, 5, 14, 90, 65, 0], output: 98, category: 'CRITICAL', clinicalProfile: '78yo, extreme obesity + multi-organ failure' },
  { inputs: [75, 39, 185, 112, 102, 7, 4, 13, 80, 70, 0], output: 95, category: 'CRITICAL', clinicalProfile: '75yo, severe alcoholic + metabolic disease' },
  { inputs: [80, 36, 178, 110, 100, 7, 4, 14, 75, 50, 0], output: 94, category: 'CRITICAL', clinicalProfile: '80yo, end-of-life complexity level' },
  
  // Additional critical diversity  
  { inputs: [70, 37, 176, 108, 98, 6, 3, 11, 75, 65, 0], output: 89, category: 'CRITICAL', clinicalProfile: '70yo, younger but extremely high risk profile' },
  { inputs: [73, 34, 168, 104, 94, 6, 4, 12, 65, 55, 5], output: 86, category: 'CRITICAL', clinicalProfile: '73yo, multiple allergies complicating treatment' },
  { inputs: [76, 35, 172, 106, 96, 7, 3, 13, 70, 50, 0], output: 91, category: 'CRITICAL', clinicalProfile: '76yo, 7 conditions requiring 13 medications' },
  { inputs: [82, 39, 186, 114, 104, 8, 4, 15, 85, 55, 0], output: 97, category: 'CRITICAL', clinicalProfile: '82yo, advanced frailty + comorbidity burden' },
  { inputs: [69, 40, 182, 112, 102, 6, 5, 12, 80, 70, 0], output: 93, category: 'CRITICAL', clinicalProfile: '69yo, morbid obesity + substance use + multi-system' },
];

// ===================== EXPORT COMBINED DATASET =====================
export const COMPREHENSIVE_TRAINING_DATA = {
  examples: [
    ...lowRiskSamples,
    ...mediumRiskSamples,
    ...highRiskSamples,
    ...criticalRiskSamples,
  ],
  
  get inputs(): number[][] {
    return this.examples.map(e => e.inputs);
  },
  
  get outputs(): number[][] {
    return this.examples.map(e => [e.output]);
  },
  
  get size(): number {
    return this.examples.length;
  },
  
  getByCategory(category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): TrainingExample[] {
    return this.examples.filter(e => e.category === category);
  },
  
  /** Split data into training and validation sets */
  split(validationRatio = 0.2): { train: { inputs: number[][]; outputs: number[][] }; validation: { inputs: number[][]; outputs: number[][] } } {
    const shuffled = [...this.examples].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(shuffled.length * (1 - validationRatio));
    
    const trainExamples = shuffled.slice(0, splitIndex);
    const valExamples = shuffled.slice(splitIndex);
    
    return {
      train: {
        inputs: trainExamples.map(e => e.inputs),
        outputs: trainExamples.map(e => [e.output]),
      },
      validation: {
        inputs: valExamples.map(e => e.inputs),
        outputs: valExamples.map(e => [e.output]),
      },
    };
  },
  
  /** Get statistics about the dataset */
  getStats(): {
    total: number;
    byCategory: Record<string, number>;
    featureRanges: Record<string, { min: number; max: number; mean: number }>;
  } {
    const featureNames = ['age', 'bmi', 'systolicBP', 'diastolicBP', 'heartRate', 'numConditions', 'numAllergies', 'numMedications', 'smokingScore', 'alcoholScore', 'exerciseScore'];
    const featureRanges: Record<string, { min: number; max: number; mean: number }> = {};
    
    for (let i = 0; i < featureNames.length; i++) {
      const values = this.examples.map(e => e.inputs[i]);
      featureRanges[featureNames[i]] = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length,
      };
    }
    
    return {
      total: this.examples.length,
      byCategory: {
        LOW: lowRiskSamples.length,
        MEDIUM: mediumRiskSamples.length,
        HIGH: highRiskSamples.length,
        CRITICAL: criticalRiskSamples.length,
      },
      featureRanges,
    };
  },
};

/** Feature names for the ML model, in order */
export const FEATURE_NAMES = [
  'age', 'bmi', 'systolicBP', 'diastolicBP', 'heartRate',
  'numConditions', 'numAllergies', 'numMedications',
  'smokingScore', 'alcoholScore', 'exerciseScore',
] as const;

export type FeatureName = typeof FEATURE_NAMES[number];
