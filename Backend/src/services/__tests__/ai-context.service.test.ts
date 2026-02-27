import { describe, it, expect, jest } from '@jest/globals';
import {
  buildRealtimeClinicalContext,
  extractCandidateDrugNames,
} from '../ai-context.service';
import { CompletePatientData } from '../../types';
import { DrugLookupResult } from '../medical-data-scraper.service';

function buildPatientData(overrides: Partial<CompletePatientData> = {}): CompletePatientData {
  const base: CompletePatientData = {
    demographics: {
      patientId: 'PT-001',
      age: 67,
      sex: 'male',
      weight: 80,
      height: 175,
      bmi: 26.1,
      bloodPressure: { systolic: 138, diastolic: 86 },
      heartRate: 78,
      temperature: 98.6,
    },
    medicalHistory: {
      conditions: [{ condition: 'Hypertension', diagnosisDate: '2020-01-01', severity: 'moderate', controlled: true }],
      allergies: [{ allergen: 'Penicillin', reaction: 'Rash', severity: 'moderate' }],
      pastSurgeries: [],
      familyHistory: [],
    },
    currentMedications: {
      medications: [
        {
          drugName: 'Metformin',
          genericName: 'metformin',
          dosage: '500mg',
          frequency: 'BID',
          route: 'oral',
          startDate: '2024-01-01',
          prescribedBy: 'Dr. Chen',
        },
      ],
    },
    lifestyle: {
      smoking: { status: 'former', years: 10 },
      alcohol: { frequency: 'occasional', drinksPerWeek: 2 },
      exercise: { frequency: 'light', minutesPerWeek: 120 },
      diet: 'standard',
      chiefComplaint: {
        complaint: 'Erectile dysfunction for 6 months',
        duration: '6 months',
        severity: 3,
        symptoms: ['erectile dysfunction'],
      },
    },
  };

  return {
    ...base,
    ...overrides,
  };
}

function buildLookupResult(drugName: string): DrugLookupResult {
  return {
    drugName,
    rxcui: '12345',
    fdaLabel: {
      brandName: drugName,
      genericName: drugName,
      manufacturer: 'Demo Pharma',
      route: ['oral'],
      dosageForm: 'tablet',
      activeIngredients: [drugName],
      warnings: ['Use caution in renal impairment'],
      contraindications: ['Contraindicated with severe hepatic failure'],
      drugInteractions: ['Interacts with alcohol'],
      adverseReactions: ['Nausea'],
      indicationsAndUsage: ['Condition management'],
    },
    interactions: [
      {
        drug1: { rxcui: '1', name: drugName },
        drug2: { rxcui: '2', name: 'aspirin' },
        severity: 'moderate',
        description: 'Increased bleeding risk',
        source: 'RxNorm',
      },
    ],
    adverseEvents: [
      {
        drugName,
        reactionName: 'Headache',
        count: 123,
        serious: false,
        outcome: 'reported',
      },
    ],
    drugClasses: [{ classId: 'C001', className: 'Antidiabetic Agent', classType: 'ATC' }],
    dailyMedInfo: { setId: 'set-1', title: `${drugName} label`, publishedDate: '2025-01-01' },
    scrapedAt: new Date('2026-01-01T00:00:00.000Z'),
    sources: ['OpenFDA', 'RxNorm', 'DailyMed'],
  };
}

describe('ai-context.service', () => {
  it('extractCandidateDrugNames merges medication names and complaint hints', () => {
    const patientData = buildPatientData();
    const candidates = extractCandidateDrugNames(patientData);

    expect(candidates).toContain('metformin');
    expect(candidates).toContain('sildenafil');
    expect(candidates).toContain('tadalafil');
  });

  it('buildRealtimeClinicalContext aggregates summary and sources', async () => {
    const patientData = buildPatientData();
    const lookupDrug = jest.fn(async (drugName: string) => buildLookupResult(drugName));

    const context = await buildRealtimeClinicalContext(patientData, {
      maxDrugLookups: 2,
      lookupDrug,
    });

    expect(lookupDrug).toHaveBeenCalledTimes(2);
    expect(context.drugsAnalyzed).toHaveLength(2);
    expect(context.sources).toEqual(expect.arrayContaining(['OpenFDA', 'RxNorm', 'DailyMed']));
    expect(context.summary).toContain('METFORMIN');
    expect(context.summary).toContain('FDA warning');
    expect(context.summary).toContain('RxNorm interactions');
  });

  it('returns fallback summary when no candidate drugs are available', async () => {
    const patientData = buildPatientData({
      currentMedications: { medications: [] },
      lifestyle: {
        smoking: { status: 'never' },
        alcohol: { frequency: 'none' },
        exercise: { frequency: 'sedentary' },
        diet: 'standard',
        chiefComplaint: {
          complaint: '',
          duration: '',
          severity: 1,
          symptoms: [],
        },
      },
    });

    const lookupDrug = jest.fn(async (drugName: string) => buildLookupResult(drugName));
    const context = await buildRealtimeClinicalContext(patientData, { lookupDrug });

    expect(lookupDrug).not.toHaveBeenCalled();
    expect(context.drugsAnalyzed).toHaveLength(0);
    expect(context.summary).toContain('No candidate medications');
  });
});
