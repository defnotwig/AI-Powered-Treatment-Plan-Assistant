// Re-export types from context for consistency
// These types are defined in AppContext.tsx but re-exported here for convenience

export type { 
  PatientDemographics,
  MedicalCondition,
  Allergy,
  Surgery,
  MedicalHistory,
  CurrentMedications,
  LifestyleFactors,
  PatientData
} from '../context/AppContext';

// Also export Medication from treatment-plan
export type { Medication } from './treatment-plan';
