import Ajv from 'ajv';
import { ValidationResult } from '../types';

const ajv = new Ajv({ allErrors: true });

// JSON Schema for Treatment Plan Response
const TREATMENT_PLAN_SCHEMA = {
  type: 'object',
  required: ['treatmentPlan', 'riskAssessment', 'flaggedIssues', 'rationale'],
  properties: {
    treatmentPlan: {
      type: 'object',
      required: ['primaryTreatment'],
      properties: {
        primaryTreatment: {
          type: 'object',
          required: ['medication', 'dosage', 'frequency', 'duration', 'route'],
          properties: {
            medication: { type: 'string' },
            genericName: { type: 'string' },
            dosage: { type: 'string' },
            frequency: { type: 'string' },
            duration: { type: 'string' },
            route: { type: 'string' },
            instructions: { type: 'string' },
          },
        },
        alternativeTreatments: {
          type: 'array',
          items: {
            type: 'object',
            required: ['medication', 'dosage', 'frequency', 'duration', 'route'],
            properties: {
              medication: { type: 'string' },
              genericName: { type: 'string' },
              dosage: { type: 'string' },
              frequency: { type: 'string' },
              duration: { type: 'string' },
              route: { type: 'string' },
              instructions: { type: 'string' },
            },
          },
        },
        supportiveCare: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    riskAssessment: {
      type: 'object',
      required: ['overallRisk', 'riskScore', 'confidenceScore'],
      properties: {
        overallRisk: { enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        riskScore: { type: 'number', minimum: 0, maximum: 100 },
        confidenceScore: { type: 'number', minimum: 0, maximum: 100 },
        riskFactors: { type: 'array', items: { type: 'string' } },
      },
    },
    flaggedIssues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'severity', 'description', 'recommendation'],
        properties: {
          type: {
            enum: ['interaction', 'contraindication', 'dosage', 'allergy', 'monitoring'],
          },
          severity: { enum: ['critical', 'high', 'medium', 'low'] },
          description: { type: 'string' },
          recommendation: { type: 'string' },
          affectedDrugs: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    drugInteractions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          drug1: { type: 'string' },
          drug2: { type: 'string' },
          severity: { type: 'string' },
          effect: { type: 'string' },
          management: { type: 'string' },
        },
      },
    },
    contraindications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          drug: { type: 'string' },
          condition: { type: 'string' },
          type: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    rationale: {
      type: 'object',
      required: ['primaryChoice', 'riskBenefit'],
      properties: {
        primaryChoice: { type: 'string' },
        riskBenefit: { type: 'string' },
        alternativeRationale: { type: 'string' },
        monitoringPlan: { type: 'string' },
        patientEducation: { type: 'string' },
      },
    },
  },
};

// Compile schema
const validateSchema = ajv.compile(TREATMENT_PLAN_SCHEMA);

// Validate treatment plan response
export const validateTreatmentPlan = (response: unknown): ValidationResult => {
  const valid = validateSchema(response);
  
  if (!valid) {
    return {
      isValid: false,
      errors: validateSchema.errors?.map(err => ({
        field: err.instancePath || err.schemaPath,
        message: err.message || 'Validation error',
      })),
    };
  }
  
  return { isValid: true };
};

// Validate patient data input
export const validatePatientData = (data: unknown): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];
  
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'data', message: 'Patient data is required' }],
    };
  }
  
  const patientData = data as Record<string, unknown>;
  
  // Validate demographics
  if (!patientData.demographics) {
    errors.push({ field: 'demographics', message: 'Demographics data is required' });
  } else {
    const demo = patientData.demographics as Record<string, unknown>;
    if (typeof demo.age !== 'number' || demo.age < 0 || demo.age > 150) {
      errors.push({ field: 'demographics.age', message: 'Valid age is required (0-150)' });
    }
    if (typeof demo.weight !== 'number' || demo.weight <= 0) {
      errors.push({ field: 'demographics.weight', message: 'Valid weight is required' });
    }
    if (typeof demo.height !== 'number' || demo.height <= 0) {
      errors.push({ field: 'demographics.height', message: 'Valid height is required' });
    }
  }
  
  // Validate medical history
  if (!patientData.medicalHistory) {
    errors.push({ field: 'medicalHistory', message: 'Medical history is required' });
  }
  
  // Validate lifestyle
  if (!patientData.lifestyle) {
    errors.push({ field: 'lifestyle', message: 'Lifestyle factors are required' });
  } else {
    const lifestyle = patientData.lifestyle as Record<string, unknown>;
    if (!lifestyle.chiefComplaint) {
      errors.push({ field: 'lifestyle.chiefComplaint', message: 'Chief complaint is required' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
