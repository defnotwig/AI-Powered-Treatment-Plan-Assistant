import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card, Alert } from '../ui';
import { 
  User, Heart, Pill, Activity, 
  AlertTriangle, CheckCircle, Info 
} from 'lucide-react';

const ReviewStep: React.FC = () => {
  const { state } = useAppContext();
  const { demographics, medicalHistory, currentMedications, lifestyleFactors } = state.patientData;

  const isValid = (): boolean => {
    return !!(
      demographics.age &&
      demographics.weight &&
      demographics.height &&
      lifestyleFactors.chiefComplaint
    );
  };

  const getRiskIndicators = (): string[] => {
    const risks: string[] = [];
    
    if (demographics.age > 65) {
      risks.push('Age >65 years - geriatric dosing considerations');
    }
    if (currentMedications.medications.length >= 5) {
      risks.push('Polypharmacy (5+ medications) - increased interaction risk');
    }
    if (medicalHistory.conditions.some(c => (c.name || c.condition || '').toLowerCase().includes('renal') || (c.name || c.condition || '').toLowerCase().includes('kidney'))) {
      risks.push('Renal impairment - dosage adjustments may be needed');
    }
    if (medicalHistory.conditions.some(c => (c.name || c.condition || '').toLowerCase().includes('hepatic') || (c.name || c.condition || '').toLowerCase().includes('liver'))) {
      risks.push('Hepatic impairment - dosage adjustments may be needed');
    }
    if (medicalHistory.allergies.length > 0) {
      risks.push(`${medicalHistory.allergies.length} known drug allergies`);
    }
    if (lifestyleFactors.smokingStatus === 'current') {
      risks.push('Current smoker - may affect drug metabolism');
    }
    if (lifestyleFactors.alcoholUse === 'heavy') {
      risks.push('Heavy alcohol use - interaction considerations');
    }

    return risks;
  };

  const riskIndicators = getRiskIndicators();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white">Review Patient Data</h2>
        <p className="text-slate-400 mt-1">Review all information before submitting for AI analysis</p>
      </div>

      {!isValid() && (
        <Alert type="warning" title="Incomplete Information">
          Please ensure all required fields are completed: Age, Weight, Height, and Chief Complaint.
        </Alert>
      )}

      {riskIndicators.length > 0 && (
        <Alert type="info" title="Pre-Analysis Risk Indicators">
          <ul className="mt-2 space-y-1">
            {riskIndicators.map((risk, index) => (
              <li key={`${risk}-${index}`} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Demographics Summary */}
      <Card title="Patient Demographics" icon={<User className="w-5 h-5 text-cyan-400" />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryItem label="Age" value={demographics.age ? `${demographics.age} years` : '-'} />
          <SummaryItem label="Sex" value={demographics.sex || '-'} />
          <SummaryItem label="Weight" value={demographics.weight ? `${demographics.weight} kg` : '-'} />
          <SummaryItem label="Height" value={demographics.height ? `${demographics.height} cm` : '-'} />
          <SummaryItem label="BMI" value={demographics.bmi ? demographics.bmi.toFixed(1) : '-'} />
          <SummaryItem 
            label="Blood Pressure" 
            value={demographics.bloodPressure?.systolic ? 
              `${demographics.bloodPressure.systolic}/${demographics.bloodPressure.diastolic} mmHg` : '-'
            } 
          />
          <SummaryItem label="Heart Rate" value={demographics.heartRate ? `${demographics.heartRate} bpm` : '-'} />
          <SummaryItem label="Temperature" value={demographics.temperature ? `${demographics.temperature}°F` : '-'} />
        </div>
      </Card>

      {/* Medical History Summary */}
      <Card title="Medical History" icon={<Heart className="w-5 h-5 text-rose-400" />}>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Conditions ({medicalHistory.conditions.length})</h4>
            {medicalHistory.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medicalHistory.conditions.map((condition, index) => (
                  <span key={condition.condition || condition.name || `condition-${index}`} className="px-3 py-1 bg-rose-500/10 text-rose-300 rounded-full text-sm border border-rose-500/20">
                    {condition.condition || condition.name}
                    {condition.severity && <span className="opacity-75"> ({condition.severity})</span>}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No conditions reported</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-slate-300 mb-2">Allergies ({medicalHistory.allergies.length})</h4>
            {medicalHistory.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medicalHistory.allergies.map((allergy, index) => (
                  <span key={allergy.allergen || `allergy-${index}`} className="px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-sm border border-amber-500/20">
                    {allergy.allergen}
                    {allergy.severity && <span className="opacity-75"> ({allergy.severity})</span>}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No known allergies</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-slate-300 mb-2">Past Surgeries ({(medicalHistory.pastSurgeries || medicalHistory.surgeries).length})</h4>
            {(medicalHistory.pastSurgeries || medicalHistory.surgeries).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(medicalHistory.pastSurgeries || medicalHistory.surgeries).map((surgery, index) => (
                  <span key={surgery.procedure || `surgery-${index}`} className="px-3 py-1 bg-obsidian-700/60 text-slate-300 rounded-full text-sm border border-obsidian-600/30">
                    {surgery.procedure}
                    {surgery.date && <span className="opacity-75"> ({surgery.date})</span>}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No past surgeries</p>
            )}
          </div>

          {medicalHistory.familyHistory && (
            <div>
              <h4 className="font-medium text-slate-300 mb-2">Family History</h4>
              <p className="text-slate-400 text-sm">{medicalHistory.familyHistory}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Current Medications Summary */}
      <Card title="Current Medications" icon={<Pill className="w-5 h-5 text-cyan-400" />}>
        {currentMedications.medications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-obsidian-600/30">
                  <th className="text-left py-2 px-3 text-sm font-medium text-slate-400">Medication</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-slate-400">Dosage</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-slate-400">Frequency</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-slate-400">Route</th>
                </tr>
              </thead>
              <tbody>
                {currentMedications.medications.map((med, index) => (
                  <tr key={med.drugName || `med-${index}`} className="border-b border-obsidian-700/50">
                    <td className="py-2 px-3 text-sm text-slate-200">{med.drugName}</td>
                    <td className="py-2 px-3 text-sm text-slate-400">{med.dosage}</td>
                    <td className="py-2 px-3 text-sm text-slate-400">{med.frequency}</td>
                    <td className="py-2 px-3 text-sm text-slate-400 capitalize">{med.route}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-4">No current medications</p>
        )}
      </Card>

      {/* Lifestyle Summary */}
      <Card title="Lifestyle Factors" icon={<Activity className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Chief Complaint</h4>
            <p className="text-slate-400 bg-obsidian-700/50 p-3 rounded-lg border border-obsidian-600/30">
              {lifestyleFactors.chiefComplaint || 'Not specified'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryItem label="Smoking" value={lifestyleFactors.smokingStatus || 'Never'} />
            <SummaryItem label="Alcohol" value={lifestyleFactors.alcoholUse || 'None'} />
            <SummaryItem label="Exercise" value={lifestyleFactors.exerciseLevel || 'Sedentary'} />
            <SummaryItem label="Diet" value={lifestyleFactors.dietType || 'Regular'} />
          </div>

          {lifestyleFactors.occupation && (
            <SummaryItem label="Occupation" value={lifestyleFactors.occupation} />
          )}
        </div>
      </Card>

      {/* Validation Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isValid() ? (
              <>
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="font-medium text-white">Ready for Analysis</p>
                  <p className="text-sm text-slate-400">All required information has been provided</p>
                </div>
              </>
            ) : (
              <>
                <Info className="w-6 h-6 text-amber-400" />
                <div>
                  <p className="font-medium text-white">Missing Required Information</p>
                  <p className="text-sm text-slate-400">Please complete all required fields before submitting</p>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

interface SummaryItemProps {
  label: string;
  value: string | number;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-slate-200 capitalize">{value}</p>
  </div>
);

export default ReviewStep;
