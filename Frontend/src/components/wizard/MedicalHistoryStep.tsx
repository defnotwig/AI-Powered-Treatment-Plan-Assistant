import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Input, Select, Card, Autocomplete } from '../ui';
import { MedicalCondition, Allergy, Surgery } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import {
  MEDICAL_CONDITIONS,
  ALLERGENS,
  ALLERGY_REACTIONS,
  SURGERIES,
} from '../../data/medical-data';

const getSeverityBadgeClass = (severity: string): string => {
  switch (severity) {
    case 'severe': return 'bg-rose-500/20 text-rose-300';
    case 'moderate': return 'bg-amber-500/20 text-amber-300';
    default: return 'bg-emerald-500/20 text-emerald-300';
  }
};

const getAllergySeverityBadgeClass = (severity: string): string => {
  switch (severity) {
    case 'anaphylaxis': return 'bg-rose-500/30 text-rose-200';
    case 'severe': return 'bg-orange-500/20 text-orange-300';
    case 'moderate': return 'bg-amber-500/20 text-amber-300';
    default: return 'bg-emerald-500/20 text-emerald-300';
  }
};

const MedicalHistoryStep: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { medicalHistory } = state.patientData;

  // Condition form state
  const [newCondition, setNewCondition] = useState<Partial<MedicalCondition>>({
    condition: '',
    diagnosisDate: '',
    severity: 'mild',
    controlled: true,
  });

  // Allergy form state
  const [newAllergy, setNewAllergy] = useState<Partial<Allergy>>({
    allergen: '',
    reaction: '',
    severity: 'mild',
  });

  // Surgery form state
  const [newSurgery, setNewSurgery] = useState<Partial<Surgery>>({
    procedure: '',
    date: '',
  });

  // Family history input
  const [familyHistoryInput, setFamilyHistoryInput] = useState('');

  // Memoized options for autocomplete
  const conditionOptions = useMemo(() => 
    MEDICAL_CONDITIONS.map((c) => ({
      value: c.name,
      label: c.name,
      category: c.category,
    })), []
  );

  const allergenOptions = useMemo(() => 
    ALLERGENS.map((a) => ({
      value: a.name,
      label: a.name,
      category: a.category,
    })), []
  );

  const reactionOptions = useMemo(() => 
    ALLERGY_REACTIONS.map((r) => ({
      value: r,
      label: r,
    })), []
  );

  const surgeryOptions = useMemo(() => 
    SURGERIES.map((s) => ({
      value: s.name,
      label: s.name,
      category: s.category,
    })), []
  );

  const familyConditionOptions = useMemo(() => 
    MEDICAL_CONDITIONS.map((c) => ({
      value: c.name,
      label: c.name,
      category: c.category,
    })), []
  );

  const addCondition = () => {
    if (newCondition.condition && newCondition.diagnosisDate) {
      dispatch({
        type: 'UPDATE_MEDICAL_HISTORY',
        payload: {
          conditions: [...medicalHistory.conditions, newCondition as MedicalCondition],
        },
      });
      setNewCondition({ condition: '', diagnosisDate: '', severity: 'mild', controlled: true });
    }
  };

  const removeCondition = (index: number) => {
    const updated = medicalHistory.conditions.filter((_, i) => i !== index);
    dispatch({ type: 'UPDATE_MEDICAL_HISTORY', payload: { conditions: updated } });
  };

  const addAllergy = () => {
    if (newAllergy.allergen && newAllergy.reaction) {
      dispatch({
        type: 'UPDATE_MEDICAL_HISTORY',
        payload: {
          allergies: [...medicalHistory.allergies, newAllergy as Allergy],
        },
      });
      setNewAllergy({ allergen: '', reaction: '', severity: 'mild' });
    }
  };

  const removeAllergy = (index: number) => {
    const updated = medicalHistory.allergies.filter((_, i) => i !== index);
    dispatch({ type: 'UPDATE_MEDICAL_HISTORY', payload: { allergies: updated } });
  };

  const addSurgery = () => {
    if (newSurgery.procedure && newSurgery.date) {
      dispatch({
        type: 'UPDATE_MEDICAL_HISTORY',
        payload: {
          pastSurgeries: [...medicalHistory.pastSurgeries, newSurgery as Surgery],
        },
      });
      setNewSurgery({ procedure: '', date: '' });
    }
  };

  const removeSurgery = (index: number) => {
    const updated = medicalHistory.pastSurgeries.filter((_, i) => i !== index);
    dispatch({ type: 'UPDATE_MEDICAL_HISTORY', payload: { pastSurgeries: updated } });
  };

  const addFamilyHistory = () => {
    if (familyHistoryInput.trim()) {
      dispatch({
        type: 'UPDATE_MEDICAL_HISTORY',
        payload: {
          familyHistory: [...medicalHistory.familyHistory, familyHistoryInput.trim()],
        },
      });
      setFamilyHistoryInput('');
    }
  };

  const removeFamilyHistory = (index: number) => {
    const updated = medicalHistory.familyHistory.filter((_, i) => i !== index);
    dispatch({ type: 'UPDATE_MEDICAL_HISTORY', payload: { familyHistory: updated } });
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white">Medical History</h2>
        <p className="text-slate-400 mt-1">Document conditions, allergies, surgeries, and family history</p>
      </div>

      {/* Conditions */}
      <Card title="Medical Conditions">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Autocomplete
              label="Condition"
              value={newCondition.condition || ''}
              onChange={(value) => setNewCondition({ ...newCondition, condition: value })}
              options={conditionOptions}
              placeholder="Search or type condition..."
              allowCustom={true}
              hint="Type to search or add a custom condition"
            />
            <Input
              label="Diagnosis Date"
              type="date"
              value={newCondition.diagnosisDate || ''}
              onChange={(e) => setNewCondition({ ...newCondition, diagnosisDate: e.target.value })}
            />
            <Select
              label="Severity"
              value={newCondition.severity || 'mild'}
              onChange={(e) => setNewCondition({ ...newCondition, severity: e.target.value as MedicalCondition['severity'] })}
              options={[
                { value: 'mild', label: 'Mild' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'severe', label: 'Severe' },
              ]}
            />
            <div className="flex items-end">
              <Button onClick={addCondition} className="w-full">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newCondition.controlled ?? true}
                onChange={(e) => setNewCondition({ ...newCondition, controlled: e.target.checked })}
                className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500 bg-obsidian-700 border-obsidian-500"
              />
              <span className="text-sm text-slate-300">Condition is controlled/managed</span>
            </label>
          </div>
          
          {medicalHistory.conditions.length > 0 && (
            <div className="mt-4 space-y-2">
              {medicalHistory.conditions.map((condition, index) => (
                <div key={condition.condition || `condition-${index}`} className="flex items-center justify-between p-3 bg-obsidian-700/50 rounded-lg border border-obsidian-600/30">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium text-slate-200">{condition.condition}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getSeverityBadgeClass(condition.severity || 'mild')}`}>
                        {condition.severity || 'mild'}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        condition.controlled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {condition.controlled ? 'Controlled' : 'Uncontrolled'}
                      </span>
                    </div>
                    <span className="text-slate-500 text-sm">since {condition.diagnosisDate}</span>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => removeCondition(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Allergies */}
      <Card title="Allergies">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Autocomplete
              label="Allergen"
              value={newAllergy.allergen || ''}
              onChange={(value) => setNewAllergy({ ...newAllergy, allergen: value })}
              options={allergenOptions}
              placeholder="Search allergen..."
              allowCustom={true}
              hint="Medications, foods, environmental"
            />
            <Autocomplete
              label="Reaction"
              value={newAllergy.reaction || ''}
              onChange={(value) => setNewAllergy({ ...newAllergy, reaction: value })}
              options={reactionOptions}
              placeholder="Select or type reaction..."
              allowCustom={true}
            />
            <Select
              label="Severity"
              value={newAllergy.severity || 'mild'}
              onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value as Allergy['severity'] })}
              options={[
                { value: 'mild', label: 'Mild' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'severe', label: 'Severe' },
                { value: 'anaphylaxis', label: 'Anaphylaxis (Life-threatening)' },
              ]}
            />
            <div className="flex items-end">
              <Button onClick={addAllergy} className="w-full">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
          
          {medicalHistory.allergies.length > 0 && (
            <div className="mt-4 space-y-2">
              {medicalHistory.allergies.map((allergy, index) => (
                <div key={allergy.allergen || `allergy-${index}`} className="flex items-center justify-between p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <div>
                    <span className="font-medium text-rose-300">{allergy.allergen}</span>
                    <span className="text-rose-400 ml-2">→ {allergy.reaction}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getAllergySeverityBadgeClass(allergy.severity || 'mild')}`}>
                      {allergy.severity || 'mild'}
                    </span>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => removeAllergy(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Past Surgeries */}
      <Card title="Past Surgeries">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Autocomplete
              label="Procedure"
              value={newSurgery.procedure || ''}
              onChange={(value) => setNewSurgery({ ...newSurgery, procedure: value })}
              options={surgeryOptions}
              placeholder="Search surgery/procedure..."
              allowCustom={true}
              hint="Type to search or add a custom procedure"
            />
            <Input
              label="Date"
              type="date"
              value={newSurgery.date || ''}
              onChange={(e) => setNewSurgery({ ...newSurgery, date: e.target.value })}
            />
            <div className="flex items-end">
              <Button onClick={addSurgery} className="w-full">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
          
          {medicalHistory.pastSurgeries.length > 0 && (
            <div className="mt-4 space-y-2">
              {medicalHistory.pastSurgeries.map((surgery, index) => (
                <div key={`${surgery.procedure}-${surgery.date || index}`} className="flex items-center justify-between p-3 bg-obsidian-700/50 rounded-lg border border-obsidian-600/30">
                  <div>
                    <span className="font-medium text-slate-200">{surgery.procedure}</span>
                    <span className="text-slate-500 ml-2">on {surgery.date}</span>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => removeSurgery(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Family History */}
      <Card title="Family History">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-2">
            Enter conditions that run in the patient's family, with the relation (e.g., "Heart disease (father)")
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Autocomplete
                label="Family Condition"
                value={familyHistoryInput}
                onChange={setFamilyHistoryInput}
                options={familyConditionOptions}
                placeholder="e.g., Diabetes, Heart disease..."
                allowCustom={true}
                hint="Add relation in parentheses: Diabetes (mother)"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addFamilyHistory} className="w-full">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
          
          {medicalHistory.familyHistory.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {medicalHistory.familyHistory.map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-300">
                  {item}
                  <button onClick={() => removeFamilyHistory(index)} className="text-purple-400 hover:text-rose-400 ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MedicalHistoryStep;
