import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import { TreatmentPlanResponse, TreatmentRecommendation } from '../types';

// Patient Demographics interface
export interface PatientDemographics {
  patientId?: string;
  age: number;
  sex?: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  bmi: number;
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
  };
  heartRate?: number;
  temperature?: number;
  serumCreatinine?: number; // mg/dL — used by dosing calculator for CrCl/eGFR
}

// Medical condition interface
export interface MedicalCondition {
  condition: string;
  name?: string;
  diagnosisDate?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  controlled?: boolean;
  isControlled?: boolean;
}

// Allergy interface
export interface Allergy {
  allergen: string;
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'anaphylaxis';
}

// Surgery interface
export interface Surgery {
  procedure: string;
  date?: string;
  notes?: string;
}

// Medical History interface
export interface MedicalHistory {
  conditions: MedicalCondition[];
  allergies: Allergy[];
  surgeries: Surgery[];
  pastSurgeries: Surgery[];
  familyHistory: string[];
}

// Medication interface
export interface Medication {
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'IV' | 'topical' | 'injection' | 'sublingual';
  startDate?: string;
  prescribedBy?: string;
}

// Current Medications interface
export interface CurrentMedications {
  medications: Medication[];
}

// Lifestyle Factors interface
export interface LifestyleFactors {
  chiefComplaint: string;
  symptomDuration?: string;
  smokingStatus?: 'never' | 'former' | 'current';
  packYears?: number;
  alcoholUse?: 'none' | 'occasional' | 'moderate' | 'heavy';
  drinksPerWeek?: number;
  exerciseLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
  dietType?: string;
  sleepHours?: number;
  stressLevel?: 'low' | 'moderate' | 'high' | 'severe';
  recreationalDrugs?: string;
  caffeineIntake?: string;
  occupation?: string;
  occupationalHazards?: string;
  additionalNotes?: string;
}

// Complete Patient Data interface
export interface PatientData {
  demographics: PatientDemographics;
  medicalHistory: MedicalHistory;
  currentMedications: CurrentMedications;
  lifestyleFactors: LifestyleFactors;
}

// Initial empty patient data
const initialPatientData: PatientData = {
  demographics: {
    age: 0,
    weight: 0,
    height: 0,
    bmi: 0,
    bloodPressure: {
      systolic: 0,
      diastolic: 0,
    },
  },
  medicalHistory: {
    conditions: [],
    allergies: [],
    surgeries: [],
    pastSurgeries: [],
    familyHistory: [],
  },
  currentMedications: {
    medications: [],
  },
  lifestyleFactors: {
    chiefComplaint: '',
    smokingStatus: 'never',
    alcoholUse: 'none',
    exerciseLevel: 'sedentary',
    dietType: 'regular',
    stressLevel: 'moderate',
  },
};

// App State Interface
export interface AppState {
  currentStep: 'home' | 'intake' | 'dashboard';
  patientData: PatientData;
  currentPatientId: string | null;
  treatmentPlan: TreatmentPlanResponse | null;
  isAnalyzing: boolean;
  error: string | null;
}

// Initial State
const initialState: AppState = {
  currentStep: 'home',
  patientData: initialPatientData,
  currentPatientId: null,
  treatmentPlan: null,
  isAnalyzing: false,
  error: null,
};

// Action Types
type AppAction =
  | { type: 'SET_STEP'; payload: 'home' | 'intake' | 'dashboard' }
  | { type: 'UPDATE_DEMOGRAPHICS'; payload: Partial<PatientDemographics> }
  | { type: 'UPDATE_MEDICAL_HISTORY'; payload: Partial<MedicalHistory> }
  | { type: 'UPDATE_MEDICATIONS'; payload: Partial<CurrentMedications> }
  | { type: 'UPDATE_LIFESTYLE'; payload: Partial<LifestyleFactors> }
  | { type: 'SET_PATIENT_DATA'; payload: PatientData }
  | { type: 'SET_CURRENT_PATIENT_ID'; payload: string }
  | { type: 'SET_TREATMENT_PLAN'; payload: TreatmentPlanResponse }
  | { type: 'UPDATE_RECOMMENDATIONS'; payload: TreatmentRecommendation[] }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_FORM' };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'UPDATE_DEMOGRAPHICS':
      return {
        ...state,
        patientData: {
          ...state.patientData,
          demographics: { ...state.patientData.demographics, ...action.payload },
        },
      };

    case 'UPDATE_MEDICAL_HISTORY':
      return {
        ...state,
        patientData: {
          ...state.patientData,
          medicalHistory: { ...state.patientData.medicalHistory, ...action.payload },
        },
      };

    case 'UPDATE_MEDICATIONS':
      return {
        ...state,
        patientData: {
          ...state.patientData,
          currentMedications: { ...state.patientData.currentMedications, ...action.payload },
        },
      };

    case 'UPDATE_LIFESTYLE':
      return {
        ...state,
        patientData: {
          ...state.patientData,
          lifestyleFactors: { ...state.patientData.lifestyleFactors, ...action.payload },
        },
      };

    case 'SET_PATIENT_DATA':
      return {
        ...state,
        patientData: action.payload,
      };

    case 'SET_CURRENT_PATIENT_ID':
      return { ...state, currentPatientId: action.payload };

    case 'SET_TREATMENT_PLAN':
      return { ...state, treatmentPlan: action.payload };

    case 'UPDATE_RECOMMENDATIONS':
      return {
        ...state,
        treatmentPlan: state.treatmentPlan
          ? { ...state.treatmentPlan, recommendations: action.payload }
          : null,
      };

    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET_FORM':
      return {
        ...initialState,
        currentStep: 'home',
      };

    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export default AppContext;
