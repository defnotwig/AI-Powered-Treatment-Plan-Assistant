/**
 * Comprehensive Patient Seeder
 * Generates 1000+ realistic patient records for testing
 */

import { v4 as uuidv4 } from 'uuid';
import { Patient, MedicalHistory, CurrentMedication, LifestyleFactors, TreatmentPlan } from '../models';
import { testConnection, syncDatabase } from '../config/database';

// ==================== DATA GENERATORS ====================

// Common medical conditions with realistic distributions
const CONDITIONS_POOL = [
    // Cardiovascular (30%)
    { name: 'Hypertension', category: 'Cardiovascular', severity: ['mild', 'moderate', 'severe'], prevalence: 0.32 },
    { name: 'Coronary Artery Disease', category: 'Cardiovascular', severity: ['moderate', 'severe'], prevalence: 0.06 },
    { name: 'Heart Failure', category: 'Cardiovascular', severity: ['moderate', 'severe'], prevalence: 0.03 },
    { name: 'Atrial Fibrillation', category: 'Cardiovascular', severity: ['mild', 'moderate'], prevalence: 0.02 },

    // Endocrine (25%)
    { name: 'Type 2 Diabetes', category: 'Endocrine', severity: ['mild', 'moderate', 'severe'], prevalence: 0.10 },
    { name: 'Hypothyroidism', category: 'Endocrine', severity: ['mild', 'moderate'], prevalence: 0.05 },
    { name: 'Hyperlipidemia', category: 'Metabolic', severity: ['mild', 'moderate'], prevalence: 0.27 },

    // Respiratory (10%)
    { name: 'Asthma', category: 'Respiratory', severity: ['mild', 'moderate', 'severe'], prevalence: 0.08 },
    { name: 'COPD', category: 'Respiratory', severity: ['moderate', 'severe'], prevalence: 0.06 },

    // Renal (8%)
    { name: 'Chronic Kidney Disease Stage 2', category: 'Renal', severity: ['mild'], prevalence: 0.04 },
    { name: 'Chronic Kidney Disease Stage 3', category: 'Renal', severity: ['moderate'], prevalence: 0.03 },
    { name: 'Chronic Kidney Disease Stage 4', category: 'Renal', severity: ['severe'], prevalence: 0.01 },

    // GI (7%)
    { name: 'GERD', category: 'Gastrointestinal', severity: ['mild', 'moderate'], prevalence: 0.20 },
    { name: 'Peptic Ulcer Disease', category: 'Gastrointestinal', severity: ['mild', 'moderate'], prevalence: 0.04 },

    // Psychiatric (15%)
    { name: 'Major Depressive Disorder', category: 'Psychiatric', severity: ['mild', 'moderate', 'severe'], prevalence: 0.07 },
    { name: 'Generalized Anxiety Disorder', category: 'Psychiatric', severity: ['mild', 'moderate'], prevalence: 0.06 },
    { name: 'Insomnia', category: 'Psychiatric', severity: ['mild', 'moderate'], prevalence: 0.10 },

    // Musculoskeletal (10%)
    { name: 'Osteoarthritis', category: 'Musculoskeletal', severity: ['mild', 'moderate', 'severe'], prevalence: 0.10 },
    { name: 'Rheumatoid Arthritis', category: 'Musculoskeletal', severity: ['moderate', 'severe'], prevalence: 0.01 },
    { name: 'Osteoporosis', category: 'Musculoskeletal', severity: ['mild', 'moderate'], prevalence: 0.05 },

    // Neurological (5%)
    { name: 'Migraine', category: 'Neurological', severity: ['mild', 'moderate'], prevalence: 0.12 },
    { name: 'Peripheral Neuropathy', category: 'Neurological', severity: ['mild', 'moderate'], prevalence: 0.02 },

    // Urological
    { name: 'Benign Prostatic Hyperplasia', category: 'Urological', severity: ['mild', 'moderate'], prevalence: 0.15 },
    { name: 'Erectile Dysfunction', category: 'Urological', severity: ['mild', 'moderate', 'severe'], prevalence: 0.18 },
];

// Medications with typical dosages
const MEDICATIONS_POOL = [
    // Cardiovascular
    { name: 'Lisinopril', genericName: 'lisinopril', category: 'ACE Inhibitor', dosages: ['5mg', '10mg', '20mg', '40mg'], frequencies: ['QD'] },
    { name: 'Metoprolol', genericName: 'metoprolol', category: 'Beta Blocker', dosages: ['25mg', '50mg', '100mg'], frequencies: ['QD', 'BID'] },
    { name: 'Amlodipine', genericName: 'amlodipine', category: 'CCB', dosages: ['2.5mg', '5mg', '10mg'], frequencies: ['QD'] },
    { name: 'Atorvastatin', genericName: 'atorvastatin', category: 'Statin', dosages: ['10mg', '20mg', '40mg', '80mg'], frequencies: ['QD'] },
    { name: 'Aspirin', genericName: 'aspirin', category: 'Antiplatelet', dosages: ['81mg', '325mg'], frequencies: ['QD'] },
    { name: 'Warfarin', genericName: 'warfarin', category: 'Anticoagulant', dosages: ['2mg', '5mg', '7.5mg'], frequencies: ['QD'] },
    { name: 'Nitroglycerin', genericName: 'nitroglycerin', category: 'Nitrate', dosages: ['0.4mg'], frequencies: ['PRN'] },

    // Diabetes
    { name: 'Metformin', genericName: 'metformin', category: 'Biguanide', dosages: ['500mg', '850mg', '1000mg'], frequencies: ['QD', 'BID'] },
    { name: 'Glipizide', genericName: 'glipizide', category: 'Sulfonylurea', dosages: ['5mg', '10mg'], frequencies: ['QD', 'BID'] },
    { name: 'Jardiance', genericName: 'empagliflozin', category: 'SGLT2 Inhibitor', dosages: ['10mg', '25mg'], frequencies: ['QD'] },

    // GI
    { name: 'Omeprazole', genericName: 'omeprazole', category: 'PPI', dosages: ['20mg', '40mg'], frequencies: ['QD', 'BID'] },
    { name: 'Pantoprazole', genericName: 'pantoprazole', category: 'PPI', dosages: ['20mg', '40mg'], frequencies: ['QD'] },

    // Psychiatric
    { name: 'Sertraline', genericName: 'sertraline', category: 'SSRI', dosages: ['25mg', '50mg', '100mg', '150mg'], frequencies: ['QD'] },
    { name: 'Escitalopram', genericName: 'escitalopram', category: 'SSRI', dosages: ['5mg', '10mg', '20mg'], frequencies: ['QD'] },
    { name: 'Trazodone', genericName: 'trazodone', category: 'Antidepressant', dosages: ['50mg', '100mg', '150mg'], frequencies: ['QHS'] },
    { name: 'Alprazolam', genericName: 'alprazolam', category: 'Benzodiazepine', dosages: ['0.25mg', '0.5mg', '1mg'], frequencies: ['PRN', 'TID'] },

    // Pain
    { name: 'Gabapentin', genericName: 'gabapentin', category: 'Anticonvulsant', dosages: ['100mg', '300mg', '400mg', '600mg'], frequencies: ['TID'] },
    { name: 'Tramadol', genericName: 'tramadol', category: 'Opioid', dosages: ['50mg', '100mg'], frequencies: ['Q6H PRN'] },
    { name: 'Meloxicam', genericName: 'meloxicam', category: 'NSAID', dosages: ['7.5mg', '15mg'], frequencies: ['QD'] },

    // Respiratory
    { name: 'Albuterol', genericName: 'albuterol', category: 'Bronchodilator', dosages: ['90mcg'], frequencies: ['PRN'] },
    { name: 'Montelukast', genericName: 'montelukast', category: 'LTRA', dosages: ['10mg'], frequencies: ['QD'] },

    // Thyroid
    { name: 'Levothyroxine', genericName: 'levothyroxine', category: 'Thyroid', dosages: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg'], frequencies: ['QD'] },

    // Urological
    { name: 'Tamsulosin', genericName: 'tamsulosin', category: 'Alpha Blocker', dosages: ['0.4mg'], frequencies: ['QD'] },
    { name: 'Finasteride', genericName: 'finasteride', category: '5ARI', dosages: ['5mg'], frequencies: ['QD'] },
];

// Allergens
const ALLERGENS_POOL = [
    { name: 'Penicillin', category: 'Antibiotic', severity: ['mild', 'severe', 'anaphylaxis'], reactions: ['Rash', 'Hives', 'Anaphylaxis'] },
    { name: 'Sulfa drugs', category: 'Antibiotic', severity: ['mild', 'severe'], reactions: ['Rash', 'Stevens-Johnson syndrome'] },
    { name: 'NSAIDs', category: 'NSAID', severity: ['mild', 'severe'], reactions: ['GI bleeding', 'Bronchospasm'] },
    { name: 'Aspirin', category: 'NSAID', severity: ['mild', 'moderate'], reactions: ['GI upset', 'Asthma exacerbation'] },
    { name: 'Codeine', category: 'Opioid', severity: ['mild', 'severe'], reactions: ['Nausea', 'Respiratory depression'] },
    { name: 'Shellfish', category: 'Food', severity: ['mild', 'severe', 'anaphylaxis'], reactions: ['Hives', 'Anaphylaxis'] },
    { name: 'Peanuts', category: 'Food', severity: ['moderate', 'severe', 'anaphylaxis'], reactions: ['Swelling', 'Anaphylaxis'] },
    { name: 'Latex', category: 'Environmental', severity: ['mild', 'severe'], reactions: ['Contact dermatitis', 'Anaphylaxis'] },
    { name: 'Contrast dye', category: 'Diagnostic', severity: ['mild', 'severe'], reactions: ['Flushing', 'Anaphylaxis'] },
];

// Chief complaints
const CHIEF_COMPLAINTS = [
    { complaint: 'Erectile dysfunction - difficulty achieving and maintaining erection', duration: ['3 months', '6 months', '1 year', '2 years'], severity: [3, 5, 7, 8] },
    { complaint: 'Hair loss - progressive thinning and male pattern baldness', duration: ['6 months', '1 year', '2 years', '5 years'], severity: [4, 5, 6] },
    { complaint: 'Weight gain - difficulty losing weight despite diet changes', duration: ['6 months', '1 year', '2 years'], severity: [5, 6, 7] },
    { complaint: 'Chest pain - intermittent discomfort with exertion', duration: ['1 week', '1 month', '3 months'], severity: [6, 7, 8, 9] },
    { complaint: 'Shortness of breath with minimal activity', duration: ['1 week', '1 month', '3 months'], severity: [5, 6, 7, 8] },
    { complaint: 'Joint pain and stiffness in multiple joints', duration: ['1 month', '3 months', '6 months', '1 year'], severity: [4, 5, 6, 7] },
    { complaint: 'Chronic fatigue and lack of energy', duration: ['1 month', '3 months', '6 months'], severity: [4, 5, 6] },
    { complaint: 'Difficulty sleeping and frequent waking', duration: ['1 month', '3 months', '6 months', '1 year'], severity: [4, 5, 6, 7] },
    { complaint: 'Frequent headaches interfering with daily activities', duration: ['1 week', '1 month', '3 months'], severity: [5, 6, 7, 8] },
    { complaint: 'Anxiety and excessive worry affecting daily life', duration: ['1 month', '3 months', '6 months'], severity: [5, 6, 7] },
    { complaint: 'Depression with low mood and loss of interest', duration: ['1 month', '3 months', '6 months', '1 year'], severity: [5, 6, 7, 8] },
    { complaint: 'Urinary frequency and urgency', duration: ['1 month', '3 months', '6 months'], severity: [4, 5, 6] },
];

// Surgeries
const SURGERIES_POOL = [
    { name: 'Appendectomy', year_range: [1980, 2020] },
    { name: 'Cholecystectomy', year_range: [1990, 2023] },
    { name: 'Coronary artery bypass graft', year_range: [2000, 2023] },
    { name: 'Total knee replacement', year_range: [2005, 2023] },
    { name: 'Total hip replacement', year_range: [2005, 2023] },
    { name: 'Hysterectomy', year_range: [1990, 2020] },
    { name: 'Cataract surgery', year_range: [2000, 2023] },
    { name: 'Hernia repair', year_range: [1990, 2023] },
    { name: 'Tonsillectomy', year_range: [1970, 2010] },
    { name: 'Prostatectomy', year_range: [2000, 2023] },
];

// Family history conditions
const FAMILY_CONDITIONS = [
    'Heart disease (father)',
    'Heart disease (mother)',
    'Type 2 Diabetes (father)',
    'Type 2 Diabetes (mother)',
    'Breast cancer (mother)',
    'Colon cancer (father)',
    'Stroke (grandfather)',
    'Hypertension (multiple family members)',
    'Alzheimer\'s disease (grandmother)',
    'Prostate cancer (father)',
];

// ==================== UTILITY FUNCTIONS ====================

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
}

function shouldOccur(probability: number): boolean {
    return Math.random() < probability;
}

// ==================== PATIENT GENERATOR ====================

interface GeneratedPatient {
    id: string;
    demographics: {
        patientId: string;
        age: number;
        sex: 'male' | 'female' | 'other';
        weight: number;
        height: number;
        bmi: number;
        systolicBp: number;
        diastolicBp: number;
        heartRate: number;
        temperature: number;
    };
    medicalHistory: {
        conditions: Array<{ condition: string; diagnosisDate: string; severity: string; controlled: boolean }>;
        allergies: Array<{ allergen: string; reaction: string; severity: string }>;
        surgeries: Array<{ procedure: string; date: string }>;
        familyHistory: string[];
    };
    medications: Array<{
        drugName: string;
        genericName: string;
        dosage: string;
        frequency: string;
        route: string;
        startDate: string;
        prescribedBy: string;
    }>;
    lifestyle: {
        smoking: { status: string; packsPerDay?: number; years?: number; quitDate?: string };
        alcohol: { frequency: string; drinksPerWeek?: number };
        exercise: { frequency: string; minutesPerWeek?: number };
        diet: string;
        occupation: string;
        chiefComplaint: { complaint: string; duration: string; severity: number };
    };
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

function calculateRiskLevel(patient: GeneratedPatient): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let riskScore = 0;

    // Age risk
    if (patient.demographics.age > 75) riskScore += 25;
    else if (patient.demographics.age > 65) riskScore += 15;
    else if (patient.demographics.age > 55) riskScore += 10;

    // Condition count
    const conditionCount = patient.medicalHistory.conditions.length;
    if (conditionCount >= 5) riskScore += 30;
    else if (conditionCount >= 3) riskScore += 20;
    else if (conditionCount >= 1) riskScore += 10;

    // Medication count (polypharmacy)
    const medCount = patient.medications.length;
    if (medCount >= 8) riskScore += 25;
    else if (medCount >= 5) riskScore += 15;
    else if (medCount >= 3) riskScore += 10;

    // Critical conditions
    const criticalConditions = ['Coronary Artery Disease', 'Heart Failure', 'Chronic Kidney Disease Stage 4', 'COPD'];
    const hasCritical = patient.medicalHistory.conditions.some(c =>
        criticalConditions.some(cc => c.condition.includes(cc))
    );
    if (hasCritical) riskScore += 25;

    // Drug interactions (simplified check)
    const hasNitrate = patient.medications.some(m => m.genericName === 'nitroglycerin');
    const chiefComplaint = patient.lifestyle.chiefComplaint.complaint.toLowerCase();
    if (hasNitrate && (chiefComplaint.includes('erectile') || chiefComplaint.includes('ed '))) {
        riskScore += 40; // Critical contraindication
    }

    // BP risk
    if (patient.demographics.systolicBp >= 180 || patient.demographics.diastolicBp >= 120) riskScore += 20;
    else if (patient.demographics.systolicBp >= 140 || patient.demographics.diastolicBp >= 90) riskScore += 10;

    // Smoking
    if (patient.lifestyle.smoking.status === 'current') riskScore += 15;

    if (riskScore >= 70) return 'CRITICAL';
    if (riskScore >= 50) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';
}

function generatePatient(index: number): GeneratedPatient {
    const id = uuidv4();
    const patientId = `PT-${String(index + 1).padStart(5, '0')}`;

    // Demographics
    const age = randomInt(18, 95);
    const sex = randomChoice(['male', 'female', 'male', 'male', 'female'] as const); // Slight male bias for ED/BPH complaints
    const height = sex === 'male' ? randomInt(160, 195) : randomInt(150, 180);
    const weight = randomFloat(45, 150, 1);
    const bmi = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));

    // Blood pressure (age-correlated)
    const baseSystolic = 100 + (age * 0.5);
    const systolicBp = Math.min(200, Math.max(90, randomInt(Math.floor(baseSystolic - 10), Math.floor(baseSystolic + 30))));
    const diastolicBp = Math.min(120, Math.max(50, randomInt(60, 95)));

    const heartRate = randomInt(55, 100);
    const temperature = randomFloat(36.0, 37.5, 1);

    // Medical conditions (age and BMI correlated)
    const conditions: GeneratedPatient['medicalHistory']['conditions'] = [];
    const conditionProbabilityMultiplier = 1 + (age - 40) / 100 + (bmi - 25) / 50;

    for (const condition of CONDITIONS_POOL) {
        const adjustedProbability = Math.min(0.9, condition.prevalence * conditionProbabilityMultiplier);
        if (shouldOccur(adjustedProbability)) {
            const yearsAgo = randomInt(1, Math.min(20, age - 18));
            conditions.push({
                condition: condition.name,
                diagnosisDate: formatDateISO(new Date(Date.now() - yearsAgo * 365 * 24 * 60 * 60 * 1000)),
                severity: randomChoice(condition.severity),
                controlled: shouldOccur(0.7),
            });
        }
    }

    // Allergies (10-30% of patients have at least one)
    const allergies: GeneratedPatient['medicalHistory']['allergies'] = [];
    if (shouldOccur(0.25)) {
        const allergyCount = randomInt(1, 3);
        const shuffledAllergens = [...ALLERGENS_POOL].sort(() => Math.random() - 0.5);
        for (let i = 0; i < allergyCount && i < shuffledAllergens.length; i++) {
            const allergen = shuffledAllergens[i];
            allergies.push({
                allergen: allergen.name,
                reaction: randomChoice(allergen.reactions),
                severity: randomChoice(allergen.severity),
            });
        }
    }

    // Surgeries (20-50% of older patients)
    const surgeries: GeneratedPatient['medicalHistory']['surgeries'] = [];
    const surgeryProbability = 0.2 + (age - 30) / 200;
    if (shouldOccur(surgeryProbability)) {
        const surgeryCount = randomInt(1, 3);
        const shuffledSurgeries = [...SURGERIES_POOL].sort(() => Math.random() - 0.5);
        for (let i = 0; i < surgeryCount && i < shuffledSurgeries.length; i++) {
            const surgery = shuffledSurgeries[i];
            const surgeryYear = randomInt(Math.max(surgery.year_range[0], 2023 - age + 18), surgery.year_range[1]);
            surgeries.push({
                procedure: surgery.name,
                date: formatDateISO(new Date(surgeryYear, randomInt(0, 11), randomInt(1, 28))),
            });
        }
    }

    // Family history
    const familyHistory: string[] = [];
    if (shouldOccur(0.6)) {
        const historyCount = randomInt(1, 3);
        const shuffledHistory = [...FAMILY_CONDITIONS].sort(() => Math.random() - 0.5);
        for (let i = 0; i < historyCount && i < shuffledHistory.length; i++) {
            familyHistory.push(shuffledHistory[i]);
        }
    }

    // Medications (correlated with conditions)
    const medications: GeneratedPatient['medications'] = [];
    const conditionNames = conditions.map(c => c.condition.toLowerCase());

    // Add medications based on conditions
    if (conditionNames.some(c => c.includes('hypertension'))) {
        if (shouldOccur(0.8)) medications.push(generateMedicationEntry('Lisinopril'));
        if (shouldOccur(0.5)) medications.push(generateMedicationEntry('Amlodipine'));
        if (shouldOccur(0.4)) medications.push(generateMedicationEntry('Metoprolol'));
    }

    if (conditionNames.some(c => c.includes('diabetes'))) {
        if (shouldOccur(0.9)) medications.push(generateMedicationEntry('Metformin'));
        if (shouldOccur(0.3)) medications.push(generateMedicationEntry('Glipizide'));
        if (shouldOccur(0.2)) medications.push(generateMedicationEntry('Jardiance'));
    }

    if (conditionNames.some(c => c.includes('coronary') || c.includes('heart'))) {
        if (shouldOccur(0.9)) medications.push(generateMedicationEntry('Aspirin'));
        if (shouldOccur(0.7)) medications.push(generateMedicationEntry('Atorvastatin'));
        if (shouldOccur(0.4)) medications.push(generateMedicationEntry('Metoprolol'));
        if (shouldOccur(0.3)) medications.push(generateMedicationEntry('Nitroglycerin'));
    }

    if (conditionNames.some(c => c.includes('hyperlipidemia'))) {
        if (shouldOccur(0.9)) medications.push(generateMedicationEntry('Atorvastatin'));
    }

    if (conditionNames.some(c => c.includes('depression') || c.includes('anxiety'))) {
        if (shouldOccur(0.7)) medications.push(generateMedicationEntry(randomChoice(['Sertraline', 'Escitalopram'])));
    }

    if (conditionNames.some(c => c.includes('gerd'))) {
        if (shouldOccur(0.8)) medications.push(generateMedicationEntry('Omeprazole'));
    }

    if (conditionNames.some(c => c.includes('hypothyroid'))) {
        if (shouldOccur(0.95)) medications.push(generateMedicationEntry('Levothyroxine'));
    }

    if (conditionNames.some(c => c.includes('prostatic'))) {
        if (shouldOccur(0.8)) medications.push(generateMedicationEntry('Tamsulosin'));
        if (shouldOccur(0.4)) medications.push(generateMedicationEntry('Finasteride'));
    }

    // Lifestyle
    const smokingStatus = randomChoice(['never', 'never', 'never', 'former', 'former', 'current']);
    const alcoholFrequency = randomChoice(['never', 'rarely', 'occasionally', 'moderate', 'heavy']);
    const exerciseFrequency = randomChoice(['sedentary', 'light', 'moderate', 'active']);

    const lifestyle: GeneratedPatient['lifestyle'] = {
        smoking: {
            status: smokingStatus,
            ...(smokingStatus === 'current' && { packsPerDay: randomFloat(0.5, 2, 1), years: randomInt(5, 40) }),
            ...(smokingStatus === 'former' && { quitDate: formatDateISO(randomDate(new Date(2010, 0, 1), new Date())) }),
        },
        alcohol: {
            frequency: alcoholFrequency,
            ...(alcoholFrequency !== 'never' && { drinksPerWeek: randomInt(1, alcoholFrequency === 'heavy' ? 28 : 14) }),
        },
        exercise: {
            frequency: exerciseFrequency,
            minutesPerWeek: exerciseFrequency === 'sedentary' ? 0 : randomInt(30, 300),
        },
        diet: randomChoice(['standard', 'low_sodium', 'diabetic', 'mediterranean', 'vegetarian', 'low_carb']),
        occupation: randomChoice(['office_worker', 'healthcare', 'manual_labor', 'retired', 'sales', 'education', 'technology']),
        chiefComplaint: generateChiefComplaint(age, sex, conditionNames),
    };

    const patient: GeneratedPatient = {
        id,
        demographics: {
            patientId,
            age,
            sex,
            weight,
            height,
            bmi,
            systolicBp,
            diastolicBp,
            heartRate,
            temperature,
        },
        medicalHistory: {
            conditions,
            allergies,
            surgeries,
            familyHistory,
        },
        medications,
        lifestyle,
        riskLevel: 'LOW', // Will be calculated
    };

    patient.riskLevel = calculateRiskLevel(patient);

    return patient;
}

function generateMedicationEntry(drugName: string): GeneratedPatient['medications'][0] {
    const med = MEDICATIONS_POOL.find(m => m.name === drugName);
    if (!med) {
        return {
            drugName,
            genericName: drugName.toLowerCase(),
            dosage: '50mg',
            frequency: 'QD',
            route: 'oral',
            startDate: formatDateISO(randomDate(new Date(2020, 0, 1), new Date())),
            prescribedBy: randomChoice(['Primary Care Physician', 'Cardiologist', 'Endocrinologist', 'Internist']),
        };
    }

    return {
        drugName: med.name,
        genericName: med.genericName,
        dosage: randomChoice(med.dosages),
        frequency: randomChoice(med.frequencies),
        route: 'oral',
        startDate: formatDateISO(randomDate(new Date(2020, 0, 1), new Date())),
        prescribedBy: randomChoice(['Primary Care Physician', 'Cardiologist', 'Endocrinologist', 'Internist']),
    };
}

function generateChiefComplaint(age: number, sex: string, conditions: string[]): GeneratedPatient['lifestyle']['chiefComplaint'] {
    // Weight complaints based on probability
    const weightedComplaints = CHIEF_COMPLAINTS.map(c => {
        let weight = 1;

        // ED more likely in older males with cardiovascular conditions
        if (c.complaint.includes('Erectile') || c.complaint.includes('erectile')) {
            if (sex === 'male' && age > 40) weight = 3;
            if (conditions.some(cond => cond.includes('diabetes') || cond.includes('coronary'))) weight *= 2;
            if (sex === 'female') weight = 0;
        }

        // Hair loss more likely in males 30+
        if (c.complaint.includes('Hair') || c.complaint.includes('baldness')) {
            if (sex === 'male' && age > 30) weight = 2;
            if (sex === 'female') weight = 0.3;
        }

        // Weight complaints for obese patients
        if (c.complaint.includes('Weight')) {
            weight = 1.5;
        }

        // Chest pain for cardiovascular patients
        if (c.complaint.includes('Chest')) {
            if (conditions.some(cond => cond.includes('coronary') || cond.includes('heart'))) weight = 3;
        }

        // Urinary for older males
        if (c.complaint.includes('Urinary')) {
            if (sex === 'male' && age > 50) weight = 2;
            if (sex === 'female') weight = 0.5;
        }

        return { ...c, weight };
    });

    // Weighted random selection
    const totalWeight = weightedComplaints.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;

    for (const complaint of weightedComplaints) {
        random -= complaint.weight;
        if (random <= 0) {
            return {
                complaint: complaint.complaint,
                duration: randomChoice(complaint.duration),
                severity: randomChoice(complaint.severity),
            };
        }
    }

    // Fallback
    const fallback = randomChoice(CHIEF_COMPLAINTS);
    return {
        complaint: fallback.complaint,
        duration: randomChoice(fallback.duration),
        severity: randomChoice(fallback.severity),
    };
}

// ==================== SEEDER FUNCTION ====================

export async function seedPatients(count = 1000): Promise<void> {
    console.log(`\n🏥 Starting Patient Database Seeder`);
    console.log(`📊 Generating ${count} realistic patient records...\n`);

    const startTime = Date.now();
    const patients: GeneratedPatient[] = [];
    const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

    // Generate all patients
    for (let i = 0; i < count; i++) {
        const patient = generatePatient(i);
        patients.push(patient);
        riskDistribution[patient.riskLevel]++;

        if ((i + 1) % 100 === 0) {
            console.log(`   Generated ${i + 1}/${count} patients...`);
        }
    }

    console.log(`\n✅ Generated ${count} patients in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(`\n📊 Risk Distribution:`);
    console.log(`   LOW:      ${riskDistribution.LOW} (${((riskDistribution.LOW / count) * 100).toFixed(1)}%)`);
    console.log(`   MEDIUM:   ${riskDistribution.MEDIUM} (${((riskDistribution.MEDIUM / count) * 100).toFixed(1)}%)`);
    console.log(`   HIGH:     ${riskDistribution.HIGH} (${((riskDistribution.HIGH / count) * 100).toFixed(1)}%)`);
    console.log(`   CRITICAL: ${riskDistribution.CRITICAL} (${((riskDistribution.CRITICAL / count) * 100).toFixed(1)}%)`);

    // Save to JSON file for reference
    const fs = await import('fs').then(m => m.promises);
    const outputPath = require('path').join(__dirname, '..', '..', 'data', 'generated-patients.json');

    try {
        await fs.mkdir(require('path').dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(patients, null, 2));
        console.log(`\n💾 Saved patient data to: ${outputPath}`);
    } catch (error) {
        console.warn(`⚠️ Could not save to file: ${error}`);
    }

    console.log(`\n🎉 Patient seeder completed!`);
    console.log(`   Total patients: ${patients.length}`);
    console.log(`   Average conditions per patient: ${(patients.reduce((sum, p) => sum + p.medicalHistory.conditions.length, 0) / count).toFixed(1)}`);
    console.log(`   Average medications per patient: ${(patients.reduce((sum, p) => sum + p.medications.length, 0) / count).toFixed(1)}`);

    return;
}

// Export patients for use in tests
export { GeneratedPatient, generatePatient };

// Run if executed directly
if (require.main === module) {
    seedPatients(1000)
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('Seeding failed:', err);
            process.exit(1);
        });
}

