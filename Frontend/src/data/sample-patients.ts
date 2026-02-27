import { PatientData } from '../context/AppContext';

export const SAMPLE_PATIENTS: Record<string, PatientData> = {
  highRisk: {
    demographics: {
      age: 72,
      sex: 'male',
      weight: 85,
      height: 170,
      bmi: 29.4,
      bloodPressure: { systolic: 145, diastolic: 92 },
      heartRate: 78,
      temperature: 98.2,
    },
    medicalHistory: {
      conditions: [
        { condition: 'Hypertension', name: 'Hypertension', diagnosisDate: '2015-03-15', severity: 'moderate', isControlled: true, controlled: true },
        { condition: 'Type 2 Diabetes', name: 'Type 2 Diabetes', diagnosisDate: '2018-07-22', severity: 'moderate', isControlled: true, controlled: true },
        { condition: 'Coronary Artery Disease', name: 'Coronary Artery Disease', diagnosisDate: '2020-11-10', severity: 'severe', isControlled: true, controlled: true },
        { condition: 'Chronic Kidney Disease Stage 3', name: 'Chronic Kidney Disease Stage 3', diagnosisDate: '2021-06-05', severity: 'moderate', isControlled: false, controlled: false },
      ],
      allergies: [
        { allergen: 'Penicillin', reaction: 'Rash and hives', severity: 'moderate' },
        { allergen: 'Sulfa drugs', reaction: 'Stevens-Johnson syndrome', severity: 'severe' },
      ],
      surgeries: [
        { procedure: 'Coronary artery bypass graft', date: '2021-01-15' },
      ],
      pastSurgeries: [
        { procedure: 'Coronary artery bypass graft', date: '2021-01-15' },
      ],
      familyHistory: ['Stroke (father)', 'Myocardial infarction (brother)'],
    },
    currentMedications: {
      medications: [
        { drugName: 'Metformin', genericName: 'metformin', dosage: '1000mg', frequency: 'BID', route: 'oral', startDate: '2018-07-22', prescribedBy: 'Dr. Smith' },
        { drugName: 'Lisinopril', genericName: 'lisinopril', dosage: '20mg', frequency: 'QD', route: 'oral', startDate: '2015-03-15', prescribedBy: 'Dr. Smith' },
        { drugName: 'Atorvastatin', genericName: 'atorvastatin', dosage: '40mg', frequency: 'QHS', route: 'oral', startDate: '2020-11-10', prescribedBy: 'Dr. Johnson' },
        { drugName: 'Aspirin', genericName: 'aspirin', dosage: '81mg', frequency: 'QD', route: 'oral', startDate: '2021-01-20', prescribedBy: 'Dr. Johnson' },
        { drugName: 'Nitroglycerin', genericName: 'nitroglycerin', dosage: '0.4mg', frequency: 'PRN', route: 'sublingual', startDate: '2021-01-20', prescribedBy: 'Dr. Johnson' },
      ],
    },
    lifestyleFactors: {
      chiefComplaint: 'Erectile dysfunction - difficulty achieving and maintaining erection for the past 6 months. Affecting quality of life and relationship.',
      symptomDuration: '6 months',
      smokingStatus: 'former',
      packYears: 30,
      alcoholUse: 'occasional',
      drinksPerWeek: 2,
      exerciseLevel: 'light',
      dietType: 'cardiac',
      sleepHours: 6,
      stressLevel: 'moderate',
    },
  },
  mediumRisk: {
    demographics: {
      age: 45,
      sex: 'male',
      weight: 92,
      height: 178,
      bmi: 29.0,
      bloodPressure: { systolic: 128, diastolic: 82 },
      heartRate: 72,
      temperature: 98.4,
    },
    medicalHistory: {
      conditions: [
        { condition: 'Hyperlipidemia', name: 'Hyperlipidemia', diagnosisDate: '2019-04-10', severity: 'mild', isControlled: true, controlled: true },
      ],
      allergies: [],
      surgeries: [],
      pastSurgeries: [],
      familyHistory: ['Hypertension (mother)'],
    },
    currentMedications: {
      medications: [
        { drugName: 'Simvastatin', genericName: 'simvastatin', dosage: '20mg', frequency: 'QHS', route: 'oral', startDate: '2019-04-10', prescribedBy: 'Dr. Lee' },
      ],
    },
    lifestyleFactors: {
      chiefComplaint: 'Progressive hair loss at the crown and receding hairline. Would like to discuss treatment options for male pattern baldness.',
      symptomDuration: '2 years',
      smokingStatus: 'never',
      alcoholUse: 'moderate',
      drinksPerWeek: 7,
      exerciseLevel: 'moderate',
      dietType: 'regular',
      sleepHours: 7,
      stressLevel: 'moderate',
    },
  },
  lowRisk: {
    demographics: {
      age: 32,
      sex: 'female',
      weight: 65,
      height: 168,
      bmi: 23.0,
      bloodPressure: { systolic: 118, diastolic: 76 },
      heartRate: 68,
      temperature: 98.1,
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
      chiefComplaint: 'Seeking guidance on healthy weight management. Would like to lose approximately 15 lbs but has plateaued with current diet and exercise routine.',
      symptomDuration: 'Ongoing',
      smokingStatus: 'never',
      alcoholUse: 'occasional',
      drinksPerWeek: 3,
      exerciseLevel: 'active',
      dietType: 'regular',
      sleepHours: 8,
      stressLevel: 'low',
    },
  },
};

export const getSamplePatient = (riskLevel: 'high' | 'medium' | 'low'): PatientData => {
  const key = riskLevel === 'high' ? 'highRisk' : riskLevel === 'medium' ? 'mediumRisk' : 'lowRisk';
  return { ...SAMPLE_PATIENTS[key] };
};

export default SAMPLE_PATIENTS;
