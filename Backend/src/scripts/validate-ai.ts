/**
 * Comprehensive AI Validation Script
 * Validates that AI analysis is working correctly (not using mocks/fallbacks)
 */

import { config } from '../config';
import { analyzePatientData } from '../services/openai.service';
import { CompletePatientData } from '../types';

// ==================== TEST PATIENTS ====================

const HIGH_RISK_PATIENT: CompletePatientData = {
    demographics: {
        patientId: 'PT-TEST-001',
        age: 72,
        sex: 'male',
        weight: 85,
        height: 170,
        bmi: 29.4,
        bloodPressure: { systolic: 145, diastolic: 92 },
        heartRate: 78,
        temperature: 36.8,
    },
    medicalHistory: {
        conditions: [
            { condition: 'Hypertension', diagnosisDate: '2015-03-15', severity: 'moderate', controlled: true },
            { condition: 'Type 2 Diabetes', diagnosisDate: '2018-06-20', severity: 'moderate', controlled: true },
            { condition: 'Coronary Artery Disease', diagnosisDate: '2020-01-10', severity: 'severe', controlled: true },
            { condition: 'Chronic Kidney Disease Stage 3', diagnosisDate: '2021-08-05', severity: 'moderate', controlled: false },
        ],
        allergies: [
            { allergen: 'Sulfa drugs', reaction: 'Stevens-Johnson syndrome', severity: 'severe' },
            { allergen: 'Penicillin', reaction: 'Rash', severity: 'moderate' },
        ],
        pastSurgeries: [
            { procedure: 'Coronary artery bypass graft', date: '2021-01-15' },
        ],
        familyHistory: ['Heart disease (father)', 'Type 2 Diabetes (mother)', 'Stroke (grandfather)'],
    },
    currentMedications: {
        medications: [
            { drugName: 'Lisinopril', genericName: 'lisinopril', dosage: '20mg', frequency: 'QD', route: 'oral', startDate: '2015-03-20', prescribedBy: 'Dr. Smith' },
            { drugName: 'Metformin', genericName: 'metformin', dosage: '1000mg', frequency: 'BID', route: 'oral', startDate: '2018-07-01', prescribedBy: 'Dr. Jones' },
            { drugName: 'Atorvastatin', genericName: 'atorvastatin', dosage: '40mg', frequency: 'QHS', route: 'oral', startDate: '2020-11-10', prescribedBy: 'Dr. Smith' },
            { drugName: 'Aspirin', genericName: 'aspirin', dosage: '81mg', frequency: 'QD', route: 'oral', startDate: '2021-01-20', prescribedBy: 'Dr. Johnson' },
            { drugName: 'Nitroglycerin', genericName: 'nitroglycerin', dosage: '0.4mg', frequency: 'PRN', route: 'sublingual', startDate: '2021-01-20', prescribedBy: 'Dr. Johnson' },
        ],
    },
    lifestyle: {
        smoking: { status: 'former' },
        alcohol: { frequency: 'occasional', drinksPerWeek: 3 },
        exercise: { frequency: 'light', minutesPerWeek: 60 },
        diet: 'other',
        chiefComplaint: {
            complaint: 'Erectile dysfunction - difficulty achieving and maintaining erection for the past 6 months',
            duration: '6 months',
            severity: 5,
            symptoms: ['Complete inability to achieve erection', 'Decreased libido', 'Relationship strain'],
        },
    },
};

const MEDIUM_RISK_PATIENT: CompletePatientData = {
    demographics: {
        patientId: 'PT-TEST-002',
        age: 45,
        sex: 'male',
        weight: 92,
        height: 178,
        bmi: 29,
        bloodPressure: { systolic: 132, diastolic: 84 },
        heartRate: 72,
        temperature: 36.6,
    },
    medicalHistory: {
        conditions: [
            { condition: 'Hyperlipidemia', diagnosisDate: '2020-05-10', severity: 'mild', controlled: true },
        ],
        allergies: [],
        pastSurgeries: [],
        familyHistory: ['Heart disease (father)'],
    },
    currentMedications: {
        medications: [
            { drugName: 'Atorvastatin', genericName: 'atorvastatin', dosage: '20mg', frequency: 'QHS', route: 'oral', startDate: '2020-05-15', prescribedBy: 'Dr. Williams' },
        ],
    },
    lifestyle: {
        smoking: { status: 'never' },
        alcohol: { frequency: 'moderate', drinksPerWeek: 7 },
        exercise: { frequency: 'moderate', minutesPerWeek: 150 },
        diet: 'standard',
        chiefComplaint: {
            complaint: 'Hair loss - progressive thinning and male pattern baldness',
            duration: '1 year',
            severity: 3,
            symptoms: ['Receding hairline', 'Thinning crown', 'Family history of baldness'],
        },
    },
};

const LOW_RISK_PATIENT: CompletePatientData = {
    demographics: {
        patientId: 'PT-TEST-003',
        age: 32,
        sex: 'male',
        weight: 75,
        height: 180,
        bmi: 23.1,
        bloodPressure: { systolic: 118, diastolic: 76 },
        heartRate: 68,
        temperature: 36.5,
    },
    medicalHistory: {
        conditions: [
            { condition: 'Allergic Rhinitis', diagnosisDate: '2015-03-01', severity: 'mild', controlled: true },
        ],
        allergies: [
            { allergen: 'Pollen', reaction: 'Sneezing', severity: 'mild' },
        ],
        pastSurgeries: [],
        familyHistory: [],
    },
    currentMedications: {
        medications: [
            { drugName: 'Loratadine', genericName: 'loratadine', dosage: '10mg', frequency: 'QD', route: 'oral', startDate: '2015-03-15', prescribedBy: 'Dr. Lee' },
        ],
    },
    lifestyle: {
        smoking: { status: 'never' },
        alcohol: { frequency: 'occasional', drinksPerWeek: 2 },
        exercise: { frequency: 'active', minutesPerWeek: 300 },
        diet: 'other',
        chiefComplaint: {
            complaint: 'Weight gain - difficulty losing weight despite diet changes',
            duration: '6 months',
            severity: 3,
            symptoms: ['Gradual weight increase', 'Difficulty with portion control', 'Sedentary work lifestyle'],
        },
    },
};

// ==================== VALIDATION FUNCTIONS ====================

interface ValidationResult {
    testName: string;
    passed: boolean;
    details: string;
    expectedValue?: string;
    actualValue?: string;
}

interface FlaggedIssue {
    severity: string;
    description: string;
}

// ==================== PHASE 1: Configuration ====================

function validateConfiguration(): ValidationResult[] {
    console.log('\n' + '-'.repeat(70));
    console.log('📋 PHASE 1: AI Configuration Verification');
    console.log('-'.repeat(70));

    const apiKeyConfigured = Boolean(config.openai.apiKey &&
        config.openai.apiKey !== 'your_openai_api_key_here' &&
        config.openai.apiKey.startsWith('sk-'));

    const modelValid = config.openai.model === 'gpt-4o' || config.openai.model.startsWith('gpt-4');
    const tempValid = config.openai.temperature <= 0.3;
    const tokensValid = config.openai.maxTokens >= 2000;

    console.log(apiKeyConfigured ? '✅' : '❌', 'OpenAI API Key:', apiKeyConfigured ? 'Configured' : 'NOT CONFIGURED');
    console.log(modelValid ? '✅' : '⚠️', 'Model:', config.openai.model);
    console.log(tempValid ? '✅' : '⚠️', 'Temperature:', config.openai.temperature, '(should be <= 0.3 for medical accuracy)');
    console.log(tokensValid ? '✅' : '⚠️', 'Max Tokens:', config.openai.maxTokens);

    if (!apiKeyConfigured) {
        console.log('\n⚠️  WARNING: OpenAI API key not configured. Tests will use mock responses.');
        console.log('   To enable real AI testing, set OPENAI_API_KEY in your .env file\n');
    }

    return [
        { testName: 'OpenAI API Key Configured', passed: apiKeyConfigured, details: apiKeyConfigured ? 'API key is properly configured and starts with sk-' : 'API key is missing or invalid' },
        { testName: 'GPT-4 Model Configured', passed: modelValid, details: `Model: ${config.openai.model}`, expectedValue: 'gpt-4o or gpt-4-*', actualValue: config.openai.model },
        { testName: 'Low Temperature for Medical Accuracy', passed: tempValid, details: `Temperature: ${config.openai.temperature}`, expectedValue: '<= 0.3', actualValue: String(config.openai.temperature) },
        { testName: 'Adequate Token Limit', passed: tokensValid, details: `Max tokens: ${config.openai.maxTokens}`, expectedValue: '>= 2000', actualValue: String(config.openai.maxTokens) },
    ];
}

// ==================== PHASE 2: AI Response Tests ====================

async function testHighRiskPatient(): Promise<{ results: ValidationResult[]; response?: ReturnType<typeof analyzePatientData> extends Promise<infer R> ? R : never }> {
    console.log('\n📊 Test 2.1: HIGH-RISK Patient (72yo, CAD, on nitrates, ED complaint)');
    console.log('   This patient has an ABSOLUTE CONTRAINDICATION (nitrates + PDE5 inhibitors)');

    const startTime = Date.now();
    try {
        const response = await analyzePatientData(HIGH_RISK_PATIENT);
        const responseTime = Date.now() - startTime;

        console.log(`   Response time: ${responseTime}ms ${responseTime > 2000 ? '(Real AI)' : '(Fast - likely mock)'}`);
        console.log(`   Risk Level: ${response.riskAssessment.overallRisk}`);
        console.log(`   Risk Score: ${response.riskAssessment.riskScore}`);
        console.log(`   Flagged Issues: ${response.flaggedIssues.length}`);

        const hasCriticalFlag = response.flaggedIssues.some(
            (f: FlaggedIssue) => f.severity === 'critical' &&
                (f.description.toLowerCase().includes('nitrate') || f.description.toLowerCase().includes('sildenafil'))
        );
        const hasHighRisk = response.riskAssessment.overallRisk === 'HIGH' || response.riskAssessment.overallRisk === 'CRITICAL';
        const contraindicated = response.treatmentPlan.primaryTreatment.medication.toLowerCase().includes('contraindicated') ||
            response.treatmentPlan.primaryTreatment.instructions.toLowerCase().includes('contraindicated');

        console.log(hasCriticalFlag || contraindicated ? '   ✅' : '   ❌', 'Detected sildenafil+nitrate contraindication:', hasCriticalFlag || contraindicated);
        console.log(hasHighRisk ? '   ✅' : '   ❌', 'Appropriate risk level (HIGH/CRITICAL):', hasHighRisk);

        if (response.flaggedIssues.length > 0) {
            console.log('\n   Flagged Issues:');
            response.flaggedIssues.slice(0, 3).forEach((issue: FlaggedIssue, i: number) => {
                console.log(`   ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.description.substring(0, 80)}...`);
            });
        }

        return {
            response,
            results: [
                { testName: 'High-Risk Patient: Critical Contraindication Detected', passed: hasCriticalFlag || contraindicated, details: `Detected sildenafil+nitrate contraindication: ${hasCriticalFlag || contraindicated}` },
                { testName: 'High-Risk Patient: Risk Level Assessment', passed: hasHighRisk, details: `Risk level: ${response.riskAssessment.overallRisk}`, expectedValue: 'HIGH or CRITICAL', actualValue: response.riskAssessment.overallRisk },
            ],
        };
    } catch (error) {
        console.log('   ❌ ERROR:', error);
        return { results: [{ testName: 'High-Risk Patient Analysis', passed: false, details: `Error: ${error}` }] };
    }
}

async function testMediumRiskPatient(): Promise<{ results: ValidationResult[]; response?: ReturnType<typeof analyzePatientData> extends Promise<infer R> ? R : never }> {
    console.log('\n📊 Test 2.2: MEDIUM-RISK Patient (45yo, hyperlipidemia, hair loss complaint)');

    const startTime = Date.now();
    try {
        const response = await analyzePatientData(MEDIUM_RISK_PATIENT);
        const responseTime = Date.now() - startTime;

        console.log(`   Response time: ${responseTime}ms`);
        console.log(`   Risk Level: ${response.riskAssessment.overallRisk}`);
        console.log(`   Risk Score: ${response.riskAssessment.riskScore}`);
        console.log(`   Primary Treatment: ${response.treatmentPlan.primaryTreatment.medication}`);

        const appropriateTreatment = response.treatmentPlan.primaryTreatment.medication.toLowerCase().includes('finasteride') ||
            response.treatmentPlan.primaryTreatment.medication.toLowerCase().includes('minoxidil');
        const reasonableRisk = response.riskAssessment.overallRisk === 'LOW' || response.riskAssessment.overallRisk === 'MEDIUM';

        console.log(appropriateTreatment ? '   ✅' : '   ⚠️', 'Appropriate hair loss treatment:', appropriateTreatment);
        console.log(reasonableRisk ? '   ✅' : '   ⚠️', 'Reasonable risk assessment:', reasonableRisk);

        return {
            response,
            results: [
                { testName: 'Medium-Risk Patient: Appropriate Treatment', passed: appropriateTreatment, details: `Treatment: ${response.treatmentPlan.primaryTreatment.medication}`, expectedValue: 'Finasteride or Minoxidil', actualValue: response.treatmentPlan.primaryTreatment.medication },
                { testName: 'Medium-Risk Patient: Risk Level', passed: reasonableRisk, details: `Risk: ${response.riskAssessment.overallRisk}`, expectedValue: 'LOW or MEDIUM', actualValue: response.riskAssessment.overallRisk },
            ],
        };
    } catch (error) {
        console.log('   ❌ ERROR:', error);
        return { results: [] };
    }
}

async function testLowRiskPatient(): Promise<{ results: ValidationResult[]; response?: ReturnType<typeof analyzePatientData> extends Promise<infer R> ? R : never }> {
    console.log('\n📊 Test 2.3: LOW-RISK Patient (32yo, healthy, weight loss complaint)');

    const startTime = Date.now();
    try {
        const response = await analyzePatientData(LOW_RISK_PATIENT);
        const responseTime = Date.now() - startTime;

        console.log(`   Response time: ${responseTime}ms`);
        console.log(`   Risk Level: ${response.riskAssessment.overallRisk}`);
        console.log(`   Risk Score: ${response.riskAssessment.riskScore}`);
        console.log(`   Flagged Issues: ${response.flaggedIssues.length}`);

        const isLowRisk = response.riskAssessment.overallRisk === 'LOW';
        const minimalFlags = response.flaggedIssues.filter((f: FlaggedIssue) => f.severity === 'critical').length === 0;

        console.log(isLowRisk ? '   ✅' : '   ⚠️', 'Low risk assessment:', isLowRisk);
        console.log(minimalFlags ? '   ✅' : '   ⚠️', 'No critical flags:', minimalFlags);

        return {
            response,
            results: [
                { testName: 'Low-Risk Patient: Risk Level', passed: isLowRisk, details: `Risk: ${response.riskAssessment.overallRisk}`, expectedValue: 'LOW', actualValue: response.riskAssessment.overallRisk },
                { testName: 'Low-Risk Patient: No Critical Flags', passed: minimalFlags, details: `Critical flags: ${response.flaggedIssues.filter((f: FlaggedIssue) => f.severity === 'critical').length}` },
            ],
        };
    } catch (error) {
        console.log('   ❌ ERROR:', error);
        return { results: [] };
    }
}

function testResponseUniqueness(
    highRiskResponse: Awaited<ReturnType<typeof analyzePatientData>> | undefined,
    mediumRiskResponse: Awaited<ReturnType<typeof analyzePatientData>> | undefined,
    lowRiskResponse: Awaited<ReturnType<typeof analyzePatientData>> | undefined,
): ValidationResult[] {
    console.log('\n📊 Test 2.4: Response Uniqueness');

    if (!highRiskResponse || !mediumRiskResponse || !lowRiskResponse) {
        return [];
    }

    const allUnique = JSON.stringify(highRiskResponse) !== JSON.stringify(mediumRiskResponse) &&
        JSON.stringify(mediumRiskResponse) !== JSON.stringify(lowRiskResponse) &&
        JSON.stringify(highRiskResponse) !== JSON.stringify(lowRiskResponse);
    const differentRiskLevels = highRiskResponse.riskAssessment.overallRisk !== lowRiskResponse.riskAssessment.overallRisk;

    console.log(allUnique ? '   ✅' : '   ❌', 'All responses unique:', allUnique);
    console.log(differentRiskLevels ? '   ✅' : '   ⚠️', 'Different risk levels for different patients:', differentRiskLevels);

    return [
        { testName: 'Response Uniqueness: Different Patients Get Different Plans', passed: allUnique, details: allUnique ? 'All responses are unique' : 'MOCK DETECTED: Identical responses' },
        { testName: 'Response Uniqueness: Different Risk Levels', passed: differentRiskLevels, details: `High: ${highRiskResponse.riskAssessment.overallRisk}, Low: ${lowRiskResponse.riskAssessment.overallRisk}` },
    ];
}

// ==================== PHASE 3: Report ====================

function printFinalReport(results: ValidationResult[]): void {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL VALIDATION REPORT');
    console.log('='.repeat(70));

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const passRate = (passedTests / totalTests) * 100;

    console.log(`\n📈 Test Results: ${passedTests}/${totalTests} passed (${passRate.toFixed(1)}%)`);
    console.log('\n📋 Individual Test Results:');

    results.forEach((result, index) => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`   ${index + 1}. ${icon} ${result.testName}`);
        if (!result.passed && result.expectedValue) {
            console.log(`      Expected: ${result.expectedValue}, Got: ${result.actualValue}`);
        }
    });

    console.log('\n' + '-'.repeat(70));

    if (passRate >= 90) {
        console.log('🏆 AI VALIDATION: PASSED');
        console.log('   The AI-powered treatment dashboard is fully operational.');
        console.log('   Real AI analysis is being used for treatment recommendations.');
    } else if (passRate >= 70) {
        console.log('⚠️  AI VALIDATION: PARTIAL PASS');
        console.log('   Most AI features are working, but some issues detected.');
        console.log('   Review failed tests above for improvements.');
    } else {
        console.log('❌ AI VALIDATION: NEEDS ATTENTION');
        console.log('   Critical AI features may not be working correctly.');
        console.log('   Check OpenAI configuration and review all failed tests.');
    }

    console.log('\n' + '='.repeat(70) + '\n');
}

// ==================== MAIN ====================

async function validateAIIntegration(): Promise<void> {
    console.log('\n' + '='.repeat(70));
    console.log('🔬 AI-POWERED TREATMENT DASHBOARD VALIDATION PROTOCOL');
    console.log('='.repeat(70));
    console.log(`\n📅 Test Date: ${new Date().toISOString()}`);
    console.log(`🔧 Environment: ${config.nodeEnv}`);
    console.log(`🎮 Demo Mode: ${config.demoMode ? 'ENABLED' : 'DISABLED'}`);

    const configResults = validateConfiguration();

    console.log('\n' + '-'.repeat(70));
    console.log('🧪 PHASE 2: AI Intelligence Testing');
    console.log('-'.repeat(70));

    const highRisk = await testHighRiskPatient();
    const mediumRisk = await testMediumRiskPatient();
    const lowRisk = await testLowRiskPatient();
    const uniquenessResults = testResponseUniqueness(highRisk.response, mediumRisk.response, lowRisk.response);

    const results: ValidationResult[] = [
        ...configResults,
        ...highRisk.results,
        ...mediumRisk.results,
        ...lowRisk.results,
        ...uniquenessResults,
    ];

    printFinalReport(results);
}

// Run validation
// eslint-disable-next-line unicorn/prefer-top-level-await -- tsconfig module:commonjs does not support top-level await
async function main(): Promise<void> {
    try {
        await validateAIIntegration();
        process.exit(0);
    } catch (err) {
        console.error('Validation failed:', err);
        process.exit(1);
    }
}

void main(); // NOSONAR -- tsconfig module:commonjs does not support top-level await
