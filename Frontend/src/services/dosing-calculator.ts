/**
 * Clinical Dosing Calculator Service
 * 
 * Provides evidence-based dosing calculations including:
 * - Creatinine Clearance (CrCl) using Cockcroft-Gault equation
 * - eGFR using CKD-EPI equation
 * - Body Surface Area (BSA)
 * - Ideal Body Weight (IBW)
 * - Renal-adjusted dosing recommendations
 * - Hepatic-adjusted dosing recommendations
 */

// Types
export interface PatientParameters {
    age: number; // years
    weight: number; // kg
    height: number; // cm
    sex: 'male' | 'female' | 'other';
    serumCreatinine?: number; // mg/dL
    bilirubin?: number; // mg/dL
    inr?: number;
    albumin?: number; // g/dL
}

export interface RenalFunction {
    creatinineClearance: number; // mL/min
    eGFR: number; // mL/min/1.73m²
    ckdStage: 1 | 2 | 3 | 4 | 5;
    ckdDescription: string;
    renalAdjustmentRequired: boolean;
}

export interface HepaticFunction {
    childPughScore: number;
    childPughClass: 'A' | 'B' | 'C';
    hepaticAdjustmentRequired: boolean;
}

export interface DosingRecommendation {
    drug: string;
    standardDose: string;
    adjustedDose: string;
    frequency: string;
    adjustmentReason: string;
    monitoringRequired: string[];
    warnings: string[];
}

// Drug-specific renal dosing guidelines
const RENAL_DOSING_GUIDELINES: Record<string, {
    normalDose: string;
    mildImpairment: string; // CrCl 50-80
    moderateImpairment: string; // CrCl 30-50
    severeImpairment: string; // CrCl 15-30
    esrd: string; // CrCl <15
    dialysis: string;
}> = {
    metformin: {
        normalDose: '500-1000mg BID',
        mildImpairment: '500-1000mg BID',
        moderateImpairment: '500mg BID (max 1000mg/day)',
        severeImpairment: 'CONTRAINDICATED',
        esrd: 'CONTRAINDICATED',
        dialysis: 'CONTRAINDICATED',
    },
    gabapentin: {
        normalDose: '300-600mg TID',
        mildImpairment: '200-400mg TID',
        moderateImpairment: '200-300mg BID',
        severeImpairment: '100-200mg daily',
        esrd: '100-200mg every other day',
        dialysis: '125-350mg post-dialysis',
    },
    lisinopril: {
        normalDose: '10-40mg daily',
        mildImpairment: '10-40mg daily',
        moderateImpairment: '5-20mg daily',
        severeImpairment: '2.5-10mg daily',
        esrd: '2.5-5mg daily',
        dialysis: '2.5mg daily',
    },
    ciprofloxacin: {
        normalDose: '500-750mg BID',
        mildImpairment: '250-500mg BID',
        moderateImpairment: '250-500mg Q12-18h',
        severeImpairment: '250-500mg Q24h',
        esrd: '250-500mg Q24h',
        dialysis: '250-500mg post-dialysis',
    },
    enoxaparin: {
        normalDose: '1mg/kg Q12h',
        mildImpairment: '1mg/kg Q12h',
        moderateImpairment: '1mg/kg Q12h (monitor anti-Xa)',
        severeImpairment: '1mg/kg Q24h',
        esrd: 'USE UNFRACTIONATED HEPARIN',
        dialysis: 'USE UNFRACTIONATED HEPARIN',
    },
    sildenafil: {
        normalDose: '50mg PRN',
        mildImpairment: '50mg PRN',
        moderateImpairment: '25mg PRN',
        severeImpairment: '25mg PRN',
        esrd: '25mg PRN',
        dialysis: '25mg PRN',
    },
    amoxicillin: {
        normalDose: '500mg TID',
        mildImpairment: '500mg TID',
        moderateImpairment: '500mg BID',
        severeImpairment: '500mg daily',
        esrd: '500mg daily',
        dialysis: '500mg post-dialysis',
    },
    atorvastatin: {
        normalDose: '10-80mg daily',
        mildImpairment: '10-80mg daily',
        moderateImpairment: '10-80mg daily',
        severeImpairment: '10-80mg daily',
        esrd: '10-80mg daily',
        dialysis: '10-80mg daily',
    },
};

/**
 * Calculate Creatinine Clearance using Cockcroft-Gault equation
 * CrCl = ((140 - age) × weight × (0.85 if female)) / (72 × SCr)
 */
export function calculateCrCl(params: PatientParameters): number {
    const { age, weight, sex, serumCreatinine = 1.0 } = params;

    let crCl = ((140 - age) * weight) / (72 * serumCreatinine);

    if (sex === 'female') {
        crCl *= 0.85;
    }

    return Math.round(crCl * 10) / 10;
}

/**
 * Calculate eGFR using CKD-EPI equation (2021 update - race-free)
 */
export function calculateEGFR(params: PatientParameters): number {
    const { age, sex, serumCreatinine = 1.0 } = params;

    let kappa: number;
    let alpha: number;

    if (sex === 'female') {
        kappa = 0.7;
        alpha = -0.241;
    } else {
        kappa = 0.9;
        alpha = -0.302;
    }

    const scrKappaRatio = serumCreatinine / kappa;
    const minTerm = Math.min(scrKappaRatio, 1);
    const maxTerm = Math.max(scrKappaRatio, 1);

    let eGFR = 142 * Math.pow(minTerm, alpha) * Math.pow(maxTerm, -1.200) * Math.pow(0.9938, age);

    if (sex === 'female') {
        eGFR *= 1.012;
    }

    return Math.round(eGFR * 10) / 10;
}

/**
 * Calculate Body Surface Area using Mosteller formula
 * BSA = √((height × weight) / 3600)
 */
export function calculateBSA(params: PatientParameters): number {
    const { weight, height } = params;
    const bsa = Math.sqrt((height * weight) / 3600);
    return Math.round(bsa * 100) / 100;
}

/**
 * Calculate Ideal Body Weight
 * Male: 50 + 2.3 × (height in inches - 60)
 * Female: 45.5 + 2.3 × (height in inches - 60)
 */
export function calculateIBW(params: PatientParameters): number {
    const { height, sex } = params;
    const heightInches = height / 2.54;

    let ibw: number;
    if (sex === 'female') {
        ibw = 45.5 + 2.3 * (heightInches - 60);
    } else {
        ibw = 50 + 2.3 * (heightInches - 60);
    }

    return Math.round(Math.max(ibw, 0) * 10) / 10;
}

/**
 * Calculate Adjusted Body Weight (for obese patients)
 * ABW = IBW + 0.4 × (actual weight - IBW)
 */
export function calculateABW(params: PatientParameters): number {
    const { weight } = params;
    const ibw = calculateIBW(params);

    if (weight > ibw * 1.2) {
        // Patient is >20% above IBW
        const abw = ibw + 0.4 * (weight - ibw);
        return Math.round(abw * 10) / 10;
    }

    return weight;
}

/**
 * Determine CKD stage based on eGFR
 */
export function getCKDStage(eGFR: number): { stage: 1 | 2 | 3 | 4 | 5; description: string } {
    if (eGFR >= 90) {
        return { stage: 1, description: 'Normal or high kidney function' };
    } else if (eGFR >= 60) {
        return { stage: 2, description: 'Mild decrease in kidney function' };
    } else if (eGFR >= 30) {
        return { stage: 3, description: 'Moderate decrease in kidney function' };
    } else if (eGFR >= 15) {
        return { stage: 4, description: 'Severe decrease in kidney function' };
    } else {
        return { stage: 5, description: 'Kidney failure (ESRD)' };
    }
}

/**
 * Calculate comprehensive renal function assessment
 */
export function assessRenalFunction(params: PatientParameters): RenalFunction {
    const crCl = calculateCrCl(params);
    const eGFR = calculateEGFR(params);
    const { stage, description } = getCKDStage(eGFR);

    return {
        creatinineClearance: crCl,
        eGFR,
        ckdStage: stage,
        ckdDescription: description,
        renalAdjustmentRequired: crCl < 50 || eGFR < 60,
    };
}

/**
 * Calculate Child-Pugh score for hepatic function
 */
export function calculateChildPugh(params: {
    bilirubin: number; // mg/dL
    albumin: number; // g/dL
    inr: number;
    ascites: 'none' | 'mild' | 'moderate';
    encephalopathy: 'none' | 'grade1-2' | 'grade3-4';
}): HepaticFunction {
    let score = 0;

    // Bilirubin scoring
    if (params.bilirubin < 2) score += 1;
    else if (params.bilirubin <= 3) score += 2;
    else score += 3;

    // Albumin scoring
    if (params.albumin > 3.5) score += 1;
    else if (params.albumin >= 2.8) score += 2;
    else score += 3;

    // INR scoring
    if (params.inr < 1.7) score += 1;
    else if (params.inr <= 2.3) score += 2;
    else score += 3;

    // Ascites scoring
    if (params.ascites === 'none') score += 1;
    else if (params.ascites === 'mild') score += 2;
    else score += 3;

    // Encephalopathy scoring
    if (params.encephalopathy === 'none') score += 1;
    else if (params.encephalopathy === 'grade1-2') score += 2;
    else score += 3;

    let childPughClass: 'A' | 'B' | 'C';
    if (score <= 6) childPughClass = 'A';
    else if (score <= 9) childPughClass = 'B';
    else childPughClass = 'C';

    return {
        childPughScore: score,
        childPughClass,
        hepaticAdjustmentRequired: childPughClass !== 'A',
    };
}

/**
 * Get renal-adjusted dosing recommendation for a drug
 */
export function getRenalAdjustedDose(
    drugName: string,
    renalFunction: RenalFunction,
    onDialysis = false
): DosingRecommendation | null {
    const drugKey = drugName.toLowerCase().replace(/\s+/g, '');
    const guidelines = RENAL_DOSING_GUIDELINES[drugKey];

    if (!guidelines) {
        return null;
    }

    let adjustedDose: string;
    let adjustmentReason: string;
    const warnings: string[] = [];
    const monitoringRequired: string[] = [];

    if (onDialysis) {
        adjustedDose = guidelines.dialysis;
        adjustmentReason = 'Patient on dialysis - dose adjusted per dialysis guidelines';
        monitoringRequired.push('Time dose around dialysis sessions');
    } else if (renalFunction.creatinineClearance < 15) {
        adjustedDose = guidelines.esrd;
        adjustmentReason = `CrCl ${renalFunction.creatinineClearance} mL/min - ESRD dosing`;
        monitoringRequired.push('Close monitoring of renal function');
    } else if (renalFunction.creatinineClearance < 30) {
        adjustedDose = guidelines.severeImpairment;
        adjustmentReason = `CrCl ${renalFunction.creatinineClearance} mL/min - severe renal impairment`;
        monitoringRequired.push('Monitor for drug accumulation');
    } else if (renalFunction.creatinineClearance < 50) {
        adjustedDose = guidelines.moderateImpairment;
        adjustmentReason = `CrCl ${renalFunction.creatinineClearance} mL/min - moderate renal impairment`;
        monitoringRequired.push('Monitor renal function every 3-6 months');
    } else if (renalFunction.creatinineClearance < 80) {
        adjustedDose = guidelines.mildImpairment;
        adjustmentReason = `CrCl ${renalFunction.creatinineClearance} mL/min - mild renal impairment`;
    } else {
        adjustedDose = guidelines.normalDose;
        adjustmentReason = 'Normal renal function - standard dosing';
    }

    if (adjustedDose === 'CONTRAINDICATED') {
        warnings.push(`⚠️ ${drugName} is CONTRAINDICATED in this patient due to renal impairment`);
    }

    return {
        drug: drugName,
        standardDose: guidelines.normalDose,
        adjustedDose,
        frequency: adjustedDose.includes('BID') ? 'Twice daily' :
            adjustedDose.includes('TID') ? 'Three times daily' :
                adjustedDose.includes('Q12') ? 'Every 12 hours' :
                    adjustedDose.includes('Q24') ? 'Every 24 hours' : 'Daily',
        adjustmentReason,
        monitoringRequired,
        warnings,
    };
}

/**
 * Calculate weight-based dosing
 */
export function calculateWeightBasedDose(
    dosePerKg: number,
    params: PatientParameters,
    useABW = false
): number {
    const weight = useABW ? calculateABW(params) : params.weight;
    return Math.round(dosePerKg * weight * 10) / 10;
}

/**
 * Calculate BSA-based dosing (common for chemotherapy)
 */
export function calculateBSABasedDose(dosePerM2: number, params: PatientParameters): number {
    const bsa = calculateBSA(params);
    return Math.round(dosePerM2 * bsa * 10) / 10;
}

/**
 * Generate comprehensive dosing report
 */
export function generateDosingReport(
    params: PatientParameters,
    medications: string[]
): {
    patientParameters: {
        creatinineClearance: number;
        eGFR: number;
        ckdStage: number;
        bsa: number;
        ibw: number;
        abw: number;
    };
    renalFunction: RenalFunction;
    dosingRecommendations: DosingRecommendation[];
    generalWarnings: string[];
} {
    const renalFunction = assessRenalFunction(params);
    const dosingRecommendations: DosingRecommendation[] = [];
    const generalWarnings: string[] = [];

    // Age-related warnings
    if (params.age >= 65) {
        generalWarnings.push('Geriatric patient - consider lower starting doses and slower titration');
    }
    if (params.age >= 80) {
        generalWarnings.push('Very elderly patient - heightened risk of adverse drug reactions');
    }

    // Weight-related warnings
    const ibw = calculateIBW(params);
    if (params.weight > ibw * 1.3) {
        generalWarnings.push('Obese patient - consider using adjusted body weight for dosing');
    }
    if (params.weight < ibw * 0.8) {
        generalWarnings.push('Underweight patient - consider lower doses');
    }

    // Renal warnings
    if (renalFunction.ckdStage >= 4) {
        generalWarnings.push('⚠️ Severe renal impairment - avoid nephrotoxic medications');
        generalWarnings.push('Consider nephrology consultation');
    }

    // Get dosing for each medication
    for (const med of medications) {
        const recommendation = getRenalAdjustedDose(med, renalFunction);
        if (recommendation) {
            dosingRecommendations.push(recommendation);
        }
    }

    return {
        patientParameters: {
            creatinineClearance: renalFunction.creatinineClearance,
            eGFR: renalFunction.eGFR,
            ckdStage: renalFunction.ckdStage,
            bsa: calculateBSA(params),
            ibw: calculateIBW(params),
            abw: calculateABW(params),
        },
        renalFunction,
        dosingRecommendations,
        generalWarnings,
    };
}

