import { describe, expect, it } from 'vitest';
import { generateTreatmentPlanPDF, sanitizePdfText } from '../pdf-generator';

function containsOnlyPrintableAscii(text: string): boolean {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) {
      return false;
    }
  }
  return true;
}

describe('pdf-generator sanitizePdfText', () => {
  it('normalizes unsupported unicode and emoji to PDF-safe ASCII', () => {
    const input = '\u26A0\uFE0F CRITICAL \u2013 CONTRAINDICATION \u2022 m\u00B2 \u00B0F \u201Cquoted\u201D text';
    const output = sanitizePdfText(input);

    expect(output).toContain('WARNING');
    expect(output).toContain('CONTRAINDICATION');
    expect(output).toContain('m2');
    expect(output).toContain('deg');
    expect(output).toContain('"quoted"');
    expect(containsOnlyPrintableAscii(output)).toBe(true);
  });

  it('returns empty string for nullish values', () => {
    expect(sanitizePdfText(undefined)).toBe('');
    expect(sanitizePdfText(null)).toBe('');
  });

  it('strips mojibake artifacts and unsupported symbols from legacy text', () => {
    const input = '\u00E2\u20AC\u00A2 \u00E2\u20AC\u201C \u00E2\u20AC\u201D \u00C2 & \u00FE CRITICAL ALERT';
    const output = sanitizePdfText(input);

    expect(output).toContain('CRITICAL ALERT');
    expect(output).not.toContain('&');
    expect(containsOnlyPrintableAscii(output)).toBe(true);
  });
});

describe('pdf-generator integration', () => {
  it('generates a PDF without throwing when content includes unicode symbols', () => {
    const doc = generateTreatmentPlanPDF(
      {
        patientId: 'PT-TEST-001',
        age: 72,
        sex: 'male',
        weight: 85,
        height: 170,
        bmi: 29.4,
        bloodPressure: { systolic: 145, diastolic: 92 },
        heartRate: 78,
        temperature: 98.2,
      },
      {
        conditions: [{ condition: 'Coronary Artery Disease', severity: 'severe', controlled: true }],
        allergies: [{ allergen: 'Sulfa drugs', reaction: 'Stevens-Johnson syndrome', severity: 'severe' }],
      },
      {
        medications: [{ drugName: 'Nitroglycerin', dosage: '0.4mg', frequency: 'PRN', route: 'sublingual' }],
      },
      {
        chiefComplaint: 'Erectile dysfunction \u2013 affects quality of life',
        smokingStatus: 'former',
        alcoholUse: 'occasional',
        exerciseLevel: 'light',
      },
      {
        recommendations: [
          {
            drugName: 'Alprostadil',
            dosage: '10mcg',
            frequency: 'PRN',
            route: 'injection',
            instructions: 'Use only as directed',
            priority: 'high',
          },
        ],
        riskAssessment: {
          overallRisk: 'CRITICAL',
          riskScore: 100,
          confidence: 85,
          riskFactors: ['\u26A0\uFE0F ABSOLUTE CONTRAINDICATION \u2013 PDE5 with nitrates'],
        },
        flaggedIssues: [
          {
            type: 'contraindication',
            severity: 'critical',
            title: '\u26A0\uFE0F CRITICAL Alert',
            description: '\u26A0\uFE0F PDE5 inhibitors are contraindicated with nitrates.',
          },
        ],
        rationale: 'Use non-PDE5 options only.',
      },
      {
        generatedBy: 'MedAssist AI',
        approvalStatus: 'pending',
      },
    );

    const bytes = doc.output('arraybuffer');
    expect(bytes.byteLength).toBeGreaterThan(500);
  });
});
