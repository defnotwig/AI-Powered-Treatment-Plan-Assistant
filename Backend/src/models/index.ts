import { Patient } from './Patient';
import { MedicalHistory } from './MedicalHistory';
import { CurrentMedication } from './CurrentMedication';
import { LifestyleFactors } from './LifestyleFactors';
import { TreatmentPlan } from './TreatmentPlan';
import { AuditLog } from './AuditLog';
import { DrugInteraction } from './DrugInteraction';
import { Contraindication } from './Contraindication';
import { DosageGuideline } from './DosageGuideline';

// Define associations
Patient.hasOne(MedicalHistory, { foreignKey: 'patientId', as: 'medicalHistory' });
MedicalHistory.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(CurrentMedication, { foreignKey: 'patientId', as: 'currentMedications' });
CurrentMedication.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasOne(LifestyleFactors, { foreignKey: 'patientId', as: 'lifestyleFactors' });
LifestyleFactors.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Patient.hasMany(TreatmentPlan, { foreignKey: 'patientId', as: 'treatmentPlans' });
TreatmentPlan.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

export {
  Patient,
  MedicalHistory,
  CurrentMedication,
  LifestyleFactors,
  TreatmentPlan,
  AuditLog,
  DrugInteraction,
  Contraindication,
  DosageGuideline,
};
