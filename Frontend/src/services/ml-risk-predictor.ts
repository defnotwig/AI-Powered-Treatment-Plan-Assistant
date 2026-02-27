/**
 * TensorFlow.js Machine Learning Risk Prediction Service
 * 
 * This module provides a neural network-based risk prediction model
 * that analyzes patient data to predict treatment risk scores.
 * 
 * The model considers:
 * - Demographics (age, BMI)
 * - Vital signs (BP, heart rate)
 * - Medical history (number of conditions, allergies)
 * - Medication burden (polypharmacy score)
 * - Lifestyle factors (smoking, alcohol, exercise)
 */

import * as tf from '@tensorflow/tfjs';
import { COMPREHENSIVE_TRAINING_DATA } from '../data/ml-training-data';
import { API_BASE } from '../config/api';

// Set up TensorFlow.js to use CPU backend as fallback if WebGL is not available
const setupTensorFlowBackend = async (): Promise<void> => {
    try {
        // Try WebGL first for better performance
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('✅ TensorFlow.js using WebGL backend');
    } catch (webglError) {
        console.warn('⚠️ WebGL not available, falling back to CPU backend:', webglError);
        try {
            await tf.setBackend('cpu');
            await tf.ready();
            console.log('✅ TensorFlow.js using CPU backend');
        } catch (cpuError) {
            console.error('❌ TensorFlow.js backend initialization failed:', cpuError);
            throw new Error('Failed to initialize TensorFlow.js backend');
        }
    }
};

// Initialize backend on module load
let backendInitialized = false;
const ensureBackendReady = async (): Promise<void> => {
    if (!backendInitialized) {
        await setupTensorFlowBackend();
        backendInitialized = true;
    }
};

// Risk level type alias for reuse
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Risk level thresholds
export const RISK_THRESHOLDS = {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
    CRITICAL: 90,
};

// Feature normalization parameters (based on typical ranges)
const NORMALIZATION_PARAMS = {
    age: { min: 0, max: 120 },
    bmi: { min: 10, max: 50 },
    systolicBP: { min: 70, max: 220 },
    diastolicBP: { min: 40, max: 140 },
    heartRate: { min: 30, max: 200 },
    numConditions: { min: 0, max: 20 },
    numAllergies: { min: 0, max: 15 },
    numMedications: { min: 0, max: 30 },
    smokingScore: { min: 0, max: 100 },
    alcoholScore: { min: 0, max: 100 },
    exerciseScore: { min: 0, max: 100 },
};

interface RuntimeTrainingData {
    inputs: number[][];
    outputs: number[][];
}

// Training data for the risk prediction model
// Uses comprehensive clinically-informed training dataset (200+ samples)
const TRAINING_DATA: RuntimeTrainingData = COMPREHENSIVE_TRAINING_DATA;

const ADAPTIVE_DATASET_ENDPOINT = `${API_BASE}/ml/training-data?limit=1500`;
const ADAPTIVE_FETCH_TIMEOUT_MS = 1500;

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeInputRow(row: unknown): number[] | null {
    if (!Array.isArray(row) || row.length < 11) {
        return null;
    }

    const values = row.slice(0, 11).map(Number);
    if (values.some((value) => !Number.isFinite(value))) {
        return null;
    }

    return values;
}

function sanitizeOutputRow(row: unknown): number[] | null {
    if (Array.isArray(row) && isFiniteNumber(row[0])) {
        return [Math.max(0, Math.min(100, row[0]))];
    }

    if (isFiniteNumber(row)) {
        return [Math.max(0, Math.min(100, row))];
    }

    return null;
}

async function fetchAdaptiveTrainingData(): Promise<RuntimeTrainingData> {
    if (typeof fetch !== 'function') {
        return { inputs: [], outputs: [] };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ADAPTIVE_FETCH_TIMEOUT_MS);

    try {
        const response = await fetch(ADAPTIVE_DATASET_ENDPOINT, { signal: controller.signal });
        if (!response.ok) {
            return { inputs: [], outputs: [] };
        }

        const payload = await response.json() as {
            success?: boolean;
            data?: {
                inputs?: unknown[];
                outputs?: unknown[];
            };
        };

        if (!payload.success || !payload.data) {
            return { inputs: [], outputs: [] };
        }

        const inputRows = Array.isArray(payload.data.inputs) ? payload.data.inputs : [];
        const outputRows = Array.isArray(payload.data.outputs) ? payload.data.outputs : [];
        const pairCount = Math.min(inputRows.length, outputRows.length);

        const safeInputs: number[][] = [];
        const safeOutputs: number[][] = [];

        for (let i = 0; i < pairCount; i++) {
            const safeInput = sanitizeInputRow(inputRows[i]);
            const safeOutput = sanitizeOutputRow(outputRows[i]);

            if (!safeInput || !safeOutput) {
                continue;
            }

            safeInputs.push(safeInput);
            safeOutputs.push(safeOutput);
        }

        return { inputs: safeInputs, outputs: safeOutputs };
    } catch (error) {
        console.warn('Adaptive training data fetch skipped:', error);
        return { inputs: [], outputs: [] };
    } finally {
        clearTimeout(timeout);
    }
}

function mergeTrainingData(base: RuntimeTrainingData, adaptive: RuntimeTrainingData): RuntimeTrainingData {
    if (adaptive.inputs.length === 0 || adaptive.outputs.length === 0) {
        return base;
    }

    return {
        inputs: [...base.inputs, ...adaptive.inputs],
        outputs: [...base.outputs, ...adaptive.outputs],
    };
}

/**
 * Normalize a value to the range [0, 1]
 */
function normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Extract and normalize features from patient data
 */
export function extractFeatures(patientData: {
    demographics: {
        age: number;
        bmi: number;
        bloodPressure: { systolic: number; diastolic: number };
        heartRate: number;
    };
    medicalHistory: {
        conditions: unknown[];
        allergies: unknown[];
    };
    currentMedications: {
        medications: unknown[];
    };
    lifestyleFactors: {
        smokingStatus: string;
        packYears?: number;
        alcoholUse: string;
        drinksPerWeek?: number;
        exerciseLevel: string;
    };
}): number[] {
    const { demographics, medicalHistory, currentMedications, lifestyleFactors } = patientData;

    // Calculate smoking score (0-100)
    let smokingScore = 0;
    if (lifestyleFactors.smokingStatus === 'current') {
        smokingScore = Math.min(100, 50 + (lifestyleFactors.packYears || 10));
    } else if (lifestyleFactors.smokingStatus === 'former') {
        smokingScore = Math.min(50, (lifestyleFactors.packYears || 10) * 0.5);
    }

    // Calculate alcohol score (0-100)
    let alcoholScore = 0;
    const drinksPerWeek = lifestyleFactors.drinksPerWeek || 0;
    if (lifestyleFactors.alcoholUse === 'heavy') {
        alcoholScore = Math.min(100, 60 + drinksPerWeek);
    } else if (lifestyleFactors.alcoholUse === 'moderate') {
        alcoholScore = Math.min(60, 20 + drinksPerWeek);
    } else if (lifestyleFactors.alcoholUse === 'occasional') {
        alcoholScore = Math.min(30, drinksPerWeek * 2);
    }

    // Calculate exercise score (inverse - higher is better)
    let exerciseScore: number;
    if (lifestyleFactors.exerciseLevel === 'active') {
        exerciseScore = 90;
    } else if (lifestyleFactors.exerciseLevel === 'moderate') {
        exerciseScore = 70;
    } else if (lifestyleFactors.exerciseLevel === 'sedentary') {
        exerciseScore = 20;
    } else {
        exerciseScore = 50; // default for 'light' or unknown
    }

    // Extract raw features
    const rawFeatures = [
        demographics.age || 50,
        demographics.bmi || 25,
        demographics.bloodPressure?.systolic || 120,
        demographics.bloodPressure?.diastolic || 80,
        demographics.heartRate || 72,
        medicalHistory.conditions?.length || 0,
        medicalHistory.allergies?.length || 0,
        currentMedications.medications?.length || 0,
        smokingScore,
        alcoholScore,
        100 - exerciseScore, // Invert so higher = worse
    ];

    // Normalize features
    const normalizedFeatures = [
        normalize(rawFeatures[0], NORMALIZATION_PARAMS.age.min, NORMALIZATION_PARAMS.age.max),
        normalize(rawFeatures[1], NORMALIZATION_PARAMS.bmi.min, NORMALIZATION_PARAMS.bmi.max),
        normalize(rawFeatures[2], NORMALIZATION_PARAMS.systolicBP.min, NORMALIZATION_PARAMS.systolicBP.max),
        normalize(rawFeatures[3], NORMALIZATION_PARAMS.diastolicBP.min, NORMALIZATION_PARAMS.diastolicBP.max),
        normalize(rawFeatures[4], NORMALIZATION_PARAMS.heartRate.min, NORMALIZATION_PARAMS.heartRate.max),
        normalize(rawFeatures[5], NORMALIZATION_PARAMS.numConditions.min, NORMALIZATION_PARAMS.numConditions.max),
        normalize(rawFeatures[6], NORMALIZATION_PARAMS.numAllergies.min, NORMALIZATION_PARAMS.numAllergies.max),
        normalize(rawFeatures[7], NORMALIZATION_PARAMS.numMedications.min, NORMALIZATION_PARAMS.numMedications.max),
        normalize(rawFeatures[8], NORMALIZATION_PARAMS.smokingScore.min, NORMALIZATION_PARAMS.smokingScore.max),
        normalize(rawFeatures[9], NORMALIZATION_PARAMS.alcoholScore.min, NORMALIZATION_PARAMS.alcoholScore.max),
        normalize(rawFeatures[10], NORMALIZATION_PARAMS.exerciseScore.min, NORMALIZATION_PARAMS.exerciseScore.max),
    ];

    return normalizedFeatures;
}

/**
 * Risk Prediction Model Class
 */
export class RiskPredictionModel {
    private model: tf.Sequential | null = null;
    private isTraining = false;
    private isTrained = false;

    /**
     * Create and compile the neural network model
     */
    private createModel(): tf.Sequential {
        const model = tf.sequential();

        // Input layer + first hidden layer
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [11], // 11 input features
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
        }));

        // Dropout for regularization
        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Second hidden layer
        model.add(tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
        }));

        // Dropout for regularization
        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Third hidden layer
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu',
        }));

        // Output layer (risk score 0-100)
        model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid', // Output 0-1, will scale to 0-100
        }));

        // Compile the model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mse'],
        });

        return model;
    }

    /**
     * Train the model on the training data
     */
    async train(onProgress?: (epoch: number, loss: number) => void): Promise<void> {
        if (this.isTraining) {
            throw new Error('Model is already training');
        }

        this.isTraining = true;

        try {
            // Ensure TensorFlow backend is ready before training
            await ensureBackendReady();

            // Create the model
            this.model = this.createModel();
            const adaptiveData = await fetchAdaptiveTrainingData();
            const runtimeTrainingData = mergeTrainingData(TRAINING_DATA, adaptiveData);

            if (adaptiveData.inputs.length > 0) {
                console.log(`Loaded ${adaptiveData.inputs.length} adaptive ML samples for risk model training`);
            }

            // Prepare training data
            const normalizedInputs = runtimeTrainingData.inputs.map(input => [
                normalize(input[0], NORMALIZATION_PARAMS.age.min, NORMALIZATION_PARAMS.age.max),
                normalize(input[1], NORMALIZATION_PARAMS.bmi.min, NORMALIZATION_PARAMS.bmi.max),
                normalize(input[2], NORMALIZATION_PARAMS.systolicBP.min, NORMALIZATION_PARAMS.systolicBP.max),
                normalize(input[3], NORMALIZATION_PARAMS.diastolicBP.min, NORMALIZATION_PARAMS.diastolicBP.max),
                normalize(input[4], NORMALIZATION_PARAMS.heartRate.min, NORMALIZATION_PARAMS.heartRate.max),
                normalize(input[5], NORMALIZATION_PARAMS.numConditions.min, NORMALIZATION_PARAMS.numConditions.max),
                normalize(input[6], NORMALIZATION_PARAMS.numAllergies.min, NORMALIZATION_PARAMS.numAllergies.max),
                normalize(input[7], NORMALIZATION_PARAMS.numMedications.min, NORMALIZATION_PARAMS.numMedications.max),
                normalize(input[8], NORMALIZATION_PARAMS.smokingScore.min, NORMALIZATION_PARAMS.smokingScore.max),
                normalize(input[9], NORMALIZATION_PARAMS.alcoholScore.min, NORMALIZATION_PARAMS.alcoholScore.max),
                normalize(input[10], NORMALIZATION_PARAMS.exerciseScore.min, NORMALIZATION_PARAMS.exerciseScore.max),
            ]);

            const normalizedOutputs = runtimeTrainingData.outputs.map(output => [output[0] / 100]);

            const xs = tf.tensor2d(normalizedInputs);
            const ys = tf.tensor2d(normalizedOutputs);

            // Train the model with optimized hyperparameters for 200+ sample dataset
            await this.model.fit(xs, ys, {
                epochs: 150,
                batchSize: 16,
                validationSplit: 0.15,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (onProgress && logs) {
                            onProgress(epoch + 1, logs.loss);
                        }
                    },
                },
            });

            // Clean up tensors
            xs.dispose();
            ys.dispose();

            this.isTrained = true;
            console.log('✅ ML Risk Prediction Model trained successfully');
        } finally {
            this.isTraining = false;
        }
    }

    /**
     * Predict risk score for a patient
     */
    async predict(patientData: Parameters<typeof extractFeatures>[0]): Promise<{
        riskScore: number;
        riskLevel: RiskLevel;
        confidence: number;
        featureImportance: {
            age: number;
            bmi: number;
            bloodPressure: number;
            heartRate: number;
            conditions: number;
            allergies: number;
            medications: number;
            smoking: number;
            alcohol: number;
            exercise: number;
        };
    }> {
        if (!this.model || !this.isTrained) {
            // If model not trained, use rule-based fallback
            return this.ruleBasedPrediction(patientData);
        }

        const features = extractFeatures(patientData);
        const inputTensor = tf.tensor2d([features]);

        const prediction = this.model.predict(inputTensor) as tf.Tensor;
        const riskScore = Math.round((await prediction.data())[0] * 100);

        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();

        // Determine risk level
        let riskLevel: RiskLevel = 'LOW';
        if (riskScore >= RISK_THRESHOLDS.CRITICAL) {
            riskLevel = 'CRITICAL';
        } else if (riskScore >= RISK_THRESHOLDS.HIGH) {
            riskLevel = 'HIGH';
        } else if (riskScore >= RISK_THRESHOLDS.MEDIUM) {
            riskLevel = 'MEDIUM';
        }

        // Calculate feature importance (simplified gradient-based)
        const featureImportance = this.calculateFeatureImportance(features);

        // Calculate confidence based on prediction certainty (distance from thresholds)
        const distFromThreshold = Math.min(
            Math.abs(riskScore - RISK_THRESHOLDS.LOW),
            Math.abs(riskScore - RISK_THRESHOLDS.MEDIUM),
            Math.abs(riskScore - RISK_THRESHOLDS.HIGH),
            Math.abs(riskScore - RISK_THRESHOLDS.CRITICAL)
        );
        const confidence = Math.min(98, 75 + (distFromThreshold / 100) * 23);

        return {
            riskScore: Math.max(0, Math.min(100, riskScore)),
            riskLevel,
            confidence: Math.round(confidence * 10) / 10,
            featureImportance,
        };
    }

    /**
     * Rule-based prediction fallback
     */
    private ruleBasedPrediction(patientData: Parameters<typeof extractFeatures>[0]) {
        const features = extractFeatures(patientData);

        // Calculate weighted risk score
        const weights = [0.15, 0.08, 0.12, 0.08, 0.05, 0.15, 0.08, 0.12, 0.07, 0.05, 0.05];
        let riskScore = 0;
        for (let i = 0; i < features.length; i++) {
            riskScore += features[i] * weights[i] * 100;
        }

        // Age adjustment
        const age = patientData.demographics.age;
        if (age > 65) riskScore += 10;
        if (age > 75) riskScore += 15;

        // Polypharmacy adjustment
        const numMeds = patientData.currentMedications.medications?.length || 0;
        if (numMeds >= 5) riskScore += 10;
        if (numMeds >= 10) riskScore += 15;

        riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

        let riskLevel: RiskLevel = 'LOW';
        if (riskScore >= RISK_THRESHOLDS.CRITICAL) {
            riskLevel = 'CRITICAL';
        } else if (riskScore >= RISK_THRESHOLDS.HIGH) {
            riskLevel = 'HIGH';
        } else if (riskScore >= RISK_THRESHOLDS.MEDIUM) {
            riskLevel = 'MEDIUM';
        }

        return {
            riskScore,
            riskLevel,
            confidence: 75,
            featureImportance: this.calculateFeatureImportance(features),
        };
    }

    /**
     * Calculate simplified feature importance
     */
    private calculateFeatureImportance(features: number[]) {
        const total = features.reduce((sum, f) => sum + f, 0) || 1;
        return {
            age: Math.round((features[0] / total) * 100),
            bmi: Math.round((features[1] / total) * 100),
            bloodPressure: Math.round(((features[2] + features[3]) / 2 / total) * 100),
            heartRate: Math.round((features[4] / total) * 100),
            conditions: Math.round((features[5] / total) * 100),
            allergies: Math.round((features[6] / total) * 100),
            medications: Math.round((features[7] / total) * 100),
            smoking: Math.round((features[8] / total) * 100),
            alcohol: Math.round((features[9] / total) * 100),
            exercise: Math.round((features[10] / total) * 100),
        };
    }

    /**
     * Check if model is trained
     */
    isModelTrained(): boolean {
        return this.isTrained;
    }

    /**
     * Check if model is currently training
     */
    isModelTraining(): boolean {
        return this.isTraining;
    }

    /**
     * Dispose of the model to free memory
     */
    dispose(): void {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        this.isTrained = false;
    }
}

// Singleton instance
let riskModelInstance: RiskPredictionModel | null = null;

async function waitForRiskModelTraining(
    model: RiskPredictionModel,
    timeoutMs = 180000
): Promise<void> {
    const start = Date.now();
    while (model.isModelTraining()) {
        if (Date.now() - start > timeoutMs) {
            throw new Error('Timed out waiting for risk model training to finish');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!model.isModelTrained()) {
        throw new Error('Risk model training ended without a trained model');
    }
}

/**
 * Get or create the risk prediction model instance
 */
export function getRiskPredictionModel(): RiskPredictionModel {
    riskModelInstance ??= new RiskPredictionModel();
    return riskModelInstance;
}

/**
 * Initialize and train the model
 */
export async function initializeRiskModel(onProgress?: (epoch: number, loss: number) => void): Promise<RiskPredictionModel> {
    const model = getRiskPredictionModel();

    if (model.isModelTrained()) {
        return model;
    }

    if (model.isModelTraining()) {
        await waitForRiskModelTraining(model);
    } else {
        await model.train(onProgress);
    }

    if (!model.isModelTrained()) {
        throw new Error('Risk prediction model failed to initialize');
    }

    return model;
}

