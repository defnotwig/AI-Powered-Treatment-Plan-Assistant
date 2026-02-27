// Patient Demographics
export interface PatientDemographics {
  patientId: string;
  age: number;
  sex?: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  bmi: number; // auto-calculated
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature: number;
}

// Medical History
export interface MedicalCondition {
  condition: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  controlled: boolean;
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
}

export interface Surgery {
  procedure: string;
  date: string;
}

export interface MedicalHistory {
  conditions: MedicalCondition[];
  allergies: Allergy[];
  pastSurgeries: Surgery[];
  familyHistory: string[];
}

// Current Medications
export interface Medication {
  drugName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'IV' | 'topical' | 'injection' | 'sublingual';
  startDate: string;
  prescribedBy: string;
}

export interface CurrentMedications {
  medications: Medication[];
}

// Lifestyle Factors
export interface SmokingStatus {
  status: 'never' | 'former' | 'current';
  packsPerDay?: number;
  years?: number;
}

export interface AlcoholConsumption {
  frequency: 'none' | 'occasional' | 'moderate' | 'heavy';
  drinksPerWeek?: number;
}

export interface ExerciseHabits {
  frequency: 'sedentary' | 'light' | 'moderate' | 'active';
  minutesPerWeek?: number;
}

export interface ChiefComplaint {
  complaint: string;
  duration: string;
  severity: 1 | 2 | 3 | 4 | 5;
  symptoms: string[];
}

export interface LifestyleFactors {
  smoking: SmokingStatus;
  alcohol: AlcoholConsumption;
  exercise: ExerciseHabits;
  diet: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'other';
  chiefComplaint: ChiefComplaint;
}

// Complete Patient Data
export interface CompletePatientData {
  demographics: PatientDemographics;
  medicalHistory: MedicalHistory;
  currentMedications: CurrentMedications;
  lifestyle: LifestyleFactors;
}
