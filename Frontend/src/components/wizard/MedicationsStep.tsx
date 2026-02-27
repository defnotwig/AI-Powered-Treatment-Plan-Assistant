import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Input, Select, Card, Autocomplete } from '../ui';
import { Medication } from '../../types';
import { Plus, Trash2, Pill } from 'lucide-react';
import { MEDICATIONS, FREQUENCY_OPTIONS, PRESCRIBER_OPTIONS, findDrugByName } from '../../data/medical-data';

const MedicationsStep: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentMedications } = state.patientData;

  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    drugName: '',
    genericName: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    startDate: '',
    prescribedBy: '',
  });

  // Memoized options for autocomplete
  const drugOptions = useMemo(() =>
    MEDICATIONS.map((med) => ({
      value: med.brandName,
      label: `${med.brandName} (${med.genericName})`,
      category: med.category,
    })), []
  );

  const dosageOptions = useMemo(() => {
    // Get dosages for the selected drug, or common dosages
    const selectedDrug = findDrugByName(newMedication.drugName || '');
    if (selectedDrug && selectedDrug.commonDosages.length > 0) {
      return selectedDrug.commonDosages.map((d) => ({
        value: d,
        label: d,
      }));
    }
    // Default common dosages
    return [
      { value: '5mg', label: '5mg' },
      { value: '10mg', label: '10mg' },
      { value: '20mg', label: '20mg' },
      { value: '25mg', label: '25mg' },
      { value: '50mg', label: '50mg' },
      { value: '100mg', label: '100mg' },
      { value: '250mg', label: '250mg' },
      { value: '500mg', label: '500mg' },
      { value: '1g', label: '1g' },
    ];
  }, [newMedication.drugName]);

  const frequencyOptions = useMemo(() =>
    FREQUENCY_OPTIONS.map((f) => ({
      value: f.value,
      label: f.label,
    })), []
  );

  const prescriberOptions = useMemo(() =>
    PRESCRIBER_OPTIONS.map((p) => ({
      value: p.value,
      label: p.value,
      category: p.category,
    })), []
  );

  // Auto-fill generic name when drug is selected
  const handleDrugSelect = useCallback((drugName: string) => {
    const drug = findDrugByName(drugName);
    if (drug) {
      setNewMedication((prev) => ({
        ...prev,
        drugName: drug.brandName,
        genericName: drug.genericName,
      }));
    } else {
      setNewMedication((prev) => ({
        ...prev,
        drugName: drugName,
      }));
    }
  }, []);

  const addMedication = () => {
    if (newMedication.drugName && newMedication.dosage && newMedication.frequency) {
      dispatch({
        type: 'UPDATE_MEDICATIONS',
        payload: {
          medications: [...currentMedications.medications, newMedication as Medication],
        },
      });
      setNewMedication({
        drugName: '',
        genericName: '',
        dosage: '',
        frequency: '',
        route: 'oral',
        startDate: '',
        prescribedBy: '',
      });
    }
  };

  const removeMedication = (index: number) => {
    const updated = currentMedications.medications.filter((_, i) => i !== index);
    dispatch({ type: 'UPDATE_MEDICATIONS', payload: { medications: updated } });
  };

  // Get display text for frequency
  const getFrequencyDisplay = (freq: string): string => {
    const found = FREQUENCY_OPTIONS.find((f) => f.value === freq);
    return found ? found.label : freq;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white">Current Medications</h2>
        <p className="text-slate-400 mt-1">List all current medications the patient is taking</p>
      </div>

      <Card title="Add Medication">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Autocomplete
            label="Drug Name"
            value={newMedication.drugName || ''}
            onChange={handleDrugSelect}
            options={drugOptions}
            placeholder="Search medication..."
            allowCustom={true}
            hint="Type to search or add custom"
          />
          <Input
            label="Generic Name"
            value={newMedication.genericName || ''}
            onChange={(e) => setNewMedication({ ...newMedication, genericName: e.target.value })}
            placeholder="Auto-filled or type..."
            hint="Auto-filled when drug is selected"
          />
          <Autocomplete
            label="Dosage"
            value={newMedication.dosage || ''}
            onChange={(value) => setNewMedication({ ...newMedication, dosage: value })}
            options={dosageOptions}
            placeholder="Select or type dosage..."
            allowCustom={true}
          />
          <Autocomplete
            label="Frequency"
            value={newMedication.frequency || ''}
            onChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
            options={frequencyOptions}
            placeholder="Select frequency..."
            allowCustom={true}
            hint="e.g., Twice daily (BID)"
          />
          <Select
            label="Route"
            value={newMedication.route || 'oral'}
            onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value as Medication['route'] })}
            options={[
              { value: 'oral', label: 'Oral' },
              { value: 'IV', label: 'Intravenous (IV)' },
              { value: 'IM', label: 'Intramuscular (IM)' },
              { value: 'SC', label: 'Subcutaneous (SC)' },
              { value: 'topical', label: 'Topical' },
              { value: 'transdermal', label: 'Transdermal (Patch)' },
              { value: 'inhalation', label: 'Inhalation' },
              { value: 'sublingual', label: 'Sublingual' },
              { value: 'rectal', label: 'Rectal' },
              { value: 'ophthalmic', label: 'Ophthalmic (Eye)' },
              { value: 'otic', label: 'Otic (Ear)' },
              { value: 'nasal', label: 'Nasal' },
            ]}
          />
          <Input
            label="Start Date"
            type="date"
            value={newMedication.startDate || ''}
            onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
          />
          <Autocomplete
            label="Prescribed By"
            value={newMedication.prescribedBy || ''}
            onChange={(value) => setNewMedication({ ...newMedication, prescribedBy: value })}
            options={prescriberOptions}
            placeholder="Select or type..."
            allowCustom={true}
            hint="Or type specific doctor name"
          />
          <div className="flex items-end">
            <Button onClick={addMedication} className="w-full">
              <Plus className="w-4 h-4" /> Add Medication
            </Button>
          </div>
        </div>
      </Card>

      {/* Medications List */}
      <Card title="Current Medications List" subtitle={`${currentMedications.medications.length} medication(s)`}>
        {currentMedications.medications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Pill className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No medications added yet</p>
            <p className="text-sm">Add medications using the form above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentMedications.medications.map((med, index) => (
              <div key={med.drugName || `med-${index}`} className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Pill className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">
                      {med.drugName}
                      {med.genericName && <span className="font-normal text-slate-500 ml-2">({med.genericName})</span>}
                    </div>
                    <div className="text-sm text-slate-400">
                      <span className="font-medium text-slate-300">{med.dosage}</span>
                      <span className="mx-2">•</span>
                      <span>{getFrequencyDisplay(med.frequency)}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{med.route}</span>
                    </div>
                    {(med.startDate || med.prescribedBy) && (
                      <div className="text-xs text-slate-500 mt-1">
                        {med.startDate && <span>Started: {med.startDate}</span>}
                        {med.startDate && med.prescribedBy && <span className="mx-2">•</span>}
                        {med.prescribedBy && <span>By: {med.prescribedBy}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={() => removeMedication(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MedicationsStep;
