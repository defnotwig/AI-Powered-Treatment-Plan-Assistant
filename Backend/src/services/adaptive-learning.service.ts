export interface AdaptiveTrainingSample {
  id: string;
  inputs: number[];
  output: number;
  category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  timestamp: string;
  patientId?: string;
}

export interface AdaptiveLearningStats {
  sampleCount: number;
  byCategory: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', number>;
  latestTimestamp: string | null;
}

interface IngestFromPatientPayload {
  patientId?: string;
  source: string;
  riskScore: number;
  demographics: {
    age?: number;
    bmi?: number;
    bloodPressure?: { systolic?: number; diastolic?: number };
    heartRate?: number;
  };
  medicalHistory?: {
    conditions?: unknown[];
    allergies?: unknown[];
  };
  currentMedications?: {
    medications?: unknown[];
  };
  lifestyle?: {
    smoking?: { status?: string; years?: number };
    alcohol?: { frequency?: string; drinksPerWeek?: number };
    exercise?: { frequency?: string };
  };
}

function toCategory(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeSmokingScore(status?: string, years?: number): number {
  const safeYears = years || 0;
  if (status === 'current') return clamp(50 + safeYears, 0, 100);
  if (status === 'former') return clamp(safeYears * 0.5, 0, 50);
  return 0;
}

function computeAlcoholScore(frequency?: string, drinksPerWeek?: number): number {
  const drinks = drinksPerWeek || 0;
  if (frequency === 'heavy') return clamp(60 + drinks, 0, 100);
  if (frequency === 'moderate') return clamp(20 + drinks, 0, 60);
  if (frequency === 'occasional') return clamp(drinks * 2, 0, 30);
  return 0;
}

function computeExerciseRiskScore(frequency?: string): number {
  if (frequency === 'active') return 10;
  if (frequency === 'moderate') return 30;
  if (frequency === 'light') return 55;
  return 80;
}

class AdaptiveLearningService {
  private readonly samples: AdaptiveTrainingSample[] = [];
  private readonly maxSamples = 5000;

  addSample(inputs: number[], output: number, source: string, patientId?: string): AdaptiveTrainingSample {
    const clampedOutput = clamp(Math.round(output), 0, 100);
    const sample: AdaptiveTrainingSample = {
      id: `adapt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      inputs: inputs.slice(0, 11),
      output: clampedOutput,
      category: toCategory(clampedOutput),
      source,
      patientId,
      timestamp: new Date().toISOString(),
    };

    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) {
      this.samples.splice(0, this.samples.length - this.maxSamples);
    }

    return sample;
  }

  ingestFromPatient(payload: IngestFromPatientPayload): AdaptiveTrainingSample {
    const age = payload.demographics.age || 50;
    const bmi = payload.demographics.bmi || 25;
    const systolic = payload.demographics.bloodPressure?.systolic || 120;
    const diastolic = payload.demographics.bloodPressure?.diastolic || 80;
    const heartRate = payload.demographics.heartRate || 72;

    const numConditions = payload.medicalHistory?.conditions?.length || 0;
    const numAllergies = payload.medicalHistory?.allergies?.length || 0;
    const numMeds = payload.currentMedications?.medications?.length || 0;

    const smokingScore = computeSmokingScore(
      payload.lifestyle?.smoking?.status,
      payload.lifestyle?.smoking?.years,
    );
    const alcoholScore = computeAlcoholScore(
      payload.lifestyle?.alcohol?.frequency,
      payload.lifestyle?.alcohol?.drinksPerWeek,
    );
    const exerciseScore = computeExerciseRiskScore(payload.lifestyle?.exercise?.frequency);

    return this.addSample(
      [
        age,
        bmi,
        systolic,
        diastolic,
        heartRate,
        numConditions,
        numAllergies,
        numMeds,
        smokingScore,
        alcoholScore,
        exerciseScore,
      ],
      payload.riskScore,
      payload.source,
      payload.patientId,
    );
  }

  getSamples(limit?: number): AdaptiveTrainingSample[] {
    if (!limit || limit <= 0) {
      return [...this.samples];
    }
    return this.samples.slice(Math.max(0, this.samples.length - limit));
  }

  getTrainingData(limit?: number): { inputs: number[][]; outputs: number[][] } {
    const data = this.getSamples(limit);
    return {
      inputs: data.map(sample => sample.inputs),
      outputs: data.map(sample => [sample.output]),
    };
  }

  getStats(): AdaptiveLearningStats {
    const byCategory: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    for (const sample of this.samples) {
      byCategory[sample.category]++;
    }

    return {
      sampleCount: this.samples.length,
      byCategory,
      latestTimestamp: this.samples.length > 0 ? this.samples[this.samples.length - 1].timestamp : null,
    };
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();
