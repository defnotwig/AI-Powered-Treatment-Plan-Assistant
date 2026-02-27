import React, { useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Input, Select, Alert } from '../ui';

interface ValidationErrors {
  age?: string;
  weight?: string;
  height?: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
}

const DemographicsStep: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { demographics } = state.patientData;
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Individual field validators to reduce cognitive complexity
  const validateRequired = (value: number | undefined, label: string): string | undefined => {
    if (value === undefined || value === null) return `${label} is required`;
    return undefined;
  };

  const validateRange = (value: number | undefined, min: number, max: number, message: string): string | undefined => {
    if (value !== undefined && (value < min || value > max)) return message;
    return undefined;
  };

  const fieldValidators: Record<string, (value: number | undefined) => string | undefined> = {
    age: (v) => validateRequired(v, 'Age') ?? (v !== undefined && v < 0 ? 'Age cannot be negative' : undefined) ?? (v !== undefined && v > 150 ? 'Age must be 150 or less' : undefined),
    weight: (v) => validateRequired(v, 'Weight') ?? (v !== undefined && v <= 0 ? 'Weight must be greater than 0' : undefined) ?? (v !== undefined && v > 700 ? 'Weight must be 700 kg or less' : undefined),
    height: (v) => validateRequired(v, 'Height') ?? (v !== undefined && v <= 0 ? 'Height must be greater than 0' : undefined) ?? (v !== undefined && v > 300 ? 'Height must be 300 cm or less' : undefined),
    heartRate: (v) => validateRange(v, 20, 300, 'Heart rate must be between 20 and 300 bpm'),
    temperature: (v) => validateRange(v, 30, 45, 'Temperature must be between 30°C and 45°C'),
  };

  // Validation function
  const validateField = useCallback((field: string, value: number | undefined): string | undefined => {
    const validator = fieldValidators[field];
    return validator ? validator(value) : undefined;
  }, []);

  const handleChange = (field: string, value: string | number) => {
    // Handle string fields like sex and patientId without converting to number
    const stringFields = new Set(['sex', 'patientId']);

    let processedValue: string | number = value;
    if (!stringFields.has(field)) {
      processedValue = typeof value === 'string' ? Number.parseFloat(value) || 0 : value;
    }

    // Validate numeric fields
    if (!stringFields.has(field)) {
      const error = validateField(field, processedValue as number);
      setErrors(prev => ({ ...prev, [field]: error }));
    }

    const updatedDemographics = { ...demographics, [field]: processedValue };

    // Auto-calculate BMI when height and weight are provided and valid
    if ((field === 'height' || field === 'weight') &&
      updatedDemographics.height > 0 &&
      updatedDemographics.weight > 0) {
      const heightInMeters = updatedDemographics.height / 100;
      updatedDemographics.bmi = Math.round((updatedDemographics.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    dispatch({ type: 'UPDATE_DEMOGRAPHICS', payload: updatedDemographics });
  };

  const handleBloodPressureChange = (field: 'systolic' | 'diastolic', value: number) => {
    const currentBP = demographics.bloodPressure || { systolic: 0, diastolic: 0 };
    const updatedBP = { ...currentBP, [field]: value };

    // Validate blood pressure
    let bpError: string | undefined;
    const systolic = updatedBP.systolic ?? 0;
    const diastolic = updatedBP.diastolic ?? 0;

    if (systolic > 0 && diastolic > 0 && diastolic >= systolic) {
      bpError = 'Diastolic must be less than systolic';
    } else if (systolic > 0 && (systolic < 50 || systolic > 300)) {
      bpError = 'Systolic must be between 50-300 mmHg';
    } else if (diastolic > 0 && (diastolic < 30 || diastolic > 200)) {
      bpError = 'Diastolic must be between 30-200 mmHg';
    }

    setErrors(prev => ({ ...prev, bloodPressure: bpError }));

    dispatch({
      type: 'UPDATE_DEMOGRAPHICS',
      payload: {
        bloodPressure: updatedBP,
      },
    });
  };

  const sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other / Prefer not to say' },
  ];

  const hasErrors = Object.values(errors).some(e => e !== undefined);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white">Patient Demographics & Vitals</h2>
        <p className="text-slate-400 mt-1">Enter the patient's basic information and vital signs</p>
      </div>

      {hasErrors && (
        <Alert type="warning" title="Validation Issues">
          Please correct the highlighted fields before proceeding.
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Patient ID"
          type="text"
          value={demographics.patientId || ''}
          onChange={(e) => handleChange('patientId', e.target.value)}
          placeholder="e.g., PT-001"
        />

        <Select
          label="Biological Sex"
          value={demographics.sex || ''}
          onChange={(e) => handleChange('sex', e.target.value)}
          options={sexOptions}
          required
        />

        <Input
          label="Age"
          type="number"
          value={demographics.age || ''}
          onChange={(e) => handleChange('age', Number.parseInt(e.target.value, 10) || 0)}
          min={0}
          max={150}
          required
          error={errors.age}
        />

        <Input
          label="Weight (kg)"
          type="number"
          value={demographics.weight || ''}
          onChange={(e) => handleChange('weight', Number.parseFloat(e.target.value) || 0)}
          min={0.1}
          max={700}
          step={0.1}
          required
          error={errors.weight}
        />

        <Input
          label="Height (cm)"
          type="number"
          value={demographics.height || ''}
          onChange={(e) => handleChange('height', Number.parseFloat(e.target.value) || 0)}
          min={1}
          max={300}
          required
          error={errors.height}
        />

        <Input
          label="BMI (auto-calculated)"
          type="number"
          value={demographics.bmi || ''}
          disabled
          helperText="Calculated from height and weight"
        />

        <Input
          label="Heart Rate (bpm)"
          type="number"
          value={demographics.heartRate || ''}
          onChange={(e) => handleChange('heartRate', Number.parseInt(e.target.value, 10) || 0)}
          min={20}
          max={300}
          required
          error={errors.heartRate}
        />

        <Input
          label="Systolic BP (mmHg)"
          type="number"
          value={demographics.bloodPressure?.systolic || ''}
          onChange={(e) => handleBloodPressureChange('systolic', Number.parseInt(e.target.value, 10) || 0)}
          min={50}
          max={300}
          required
          error={errors.bloodPressure}
        />

        <Input
          label="Diastolic BP (mmHg)"
          type="number"
          value={demographics.bloodPressure?.diastolic || ''}
          onChange={(e) => handleBloodPressureChange('diastolic', Number.parseInt(e.target.value, 10) || 0)}
          min={30}
          max={200}
          required
        />

        <Input
          label="Temperature (°C)"
          type="number"
          value={demographics.temperature || ''}
          onChange={(e) => handleChange('temperature', Number.parseFloat(e.target.value) || 0)}
          min={30}
          max={45}
          step={0.1}
          required
          error={errors.temperature}
        />

        <Input
          label="Serum Creatinine (mg/dL)"
          type="number"
          value={demographics.serumCreatinine || ''}
          onChange={(e) => handleChange('serumCreatinine', Number.parseFloat(e.target.value) || 0)}
          min={0.1}
          max={30}
          step={0.1}
          helperText="Used for renal dosing calculations (CrCl/eGFR). Defaults to 1.0 if not provided."
        />
      </div>
    </div>
  );
};

export default DemographicsStep;
