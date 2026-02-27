import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Input, Select, Card, Autocomplete } from '../ui';
import { SYMPTOM_DURATION_OPTIONS, OCCUPATION_OPTIONS, DIET_TYPES, OCCUPATIONAL_HAZARDS } from '../../data/medical-data';

const LifestyleStep: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { lifestyleFactors } = state.patientData;

  const updateLifestyle = (field: string, value: string | number) => {
    dispatch({
      type: 'UPDATE_LIFESTYLE',
      payload: { [field]: value },
    });
  };

  // Memoized options
  const symptomDurationOptions = useMemo(() =>
    SYMPTOM_DURATION_OPTIONS.map((d) => ({
      value: d.value,
      label: d.label,
    })), []
  );

  const occupationOptions = useMemo(() =>
    OCCUPATION_OPTIONS.map((o) => ({
      value: o.value,
      label: o.value,
      category: o.category,
    })), []
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-white">Lifestyle & Chief Complaint</h2>
        <p className="text-slate-400 mt-1">Enter lifestyle factors and the patient's primary concern</p>
      </div>

      <Card title="Chief Complaint">
        <div className="space-y-4">
          <div>
            <label htmlFor="chief-complaint" className="block text-sm font-medium text-slate-300 mb-2">
              Primary Reason for Visit <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="chief-complaint"
              className="w-full px-4 py-3 bg-obsidian-800/80 border border-obsidian-500 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
              rows={4}
              value={lifestyleFactors.chiefComplaint || ''}
              onChange={(e) => updateLifestyle('chiefComplaint', e.target.value)}
              placeholder="Describe the patient's main symptoms or concerns in detail..."
              required
            />
          </div>
          <Autocomplete
            label="Symptom Duration"
            value={lifestyleFactors.symptomDuration || ''}
            onChange={(value) => updateLifestyle('symptomDuration', value)}
            options={symptomDurationOptions}
            placeholder="Select or type duration..."
            allowCustom={true}
            hint="How long have symptoms been present?"
          />
        </div>
      </Card>

      <Card title="Lifestyle Factors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Smoking Status */}
          <Select
            label="Smoking Status"
            value={lifestyleFactors.smokingStatus || 'never'}
            onChange={(e) => {
              updateLifestyle('smokingStatus', e.target.value);
              // Clear pack years when Never Smoked is selected
              if (e.target.value === 'never') {
                updateLifestyle('packYears', 0);
              }
            }}
            options={[
              { value: 'never', label: 'Never Smoked' },
              { value: 'former', label: 'Former Smoker' },
              { value: 'current', label: 'Current Smoker' },
            ]}
          />

          {lifestyleFactors.smokingStatus && lifestyleFactors.smokingStatus !== 'never' && (
            <Input
              label="Pack Years"
              type="number"
              value={lifestyleFactors.packYears || ''}
              onChange={(e) => updateLifestyle('packYears', Number.parseFloat(e.target.value) || 0)}
              placeholder="e.g., 10"
              hint="Packs per day × years smoked"
            />
          )}

          {/* Alcohol Use */}
          <Select
            label="Alcohol Use"
            value={lifestyleFactors.alcoholUse || 'none'}
            onChange={(e) => {
              updateLifestyle('alcoholUse', e.target.value);
              // Clear drinks per week when None is selected
              if (e.target.value === 'none') {
                updateLifestyle('drinksPerWeek', 0);
              }
            }}
            options={[
              { value: 'none', label: 'None' },
              { value: 'occasional', label: 'Occasional (1-2/month)' },
              { value: 'moderate', label: 'Moderate (1-2/week)' },
              { value: 'heavy', label: 'Heavy (daily)' },
            ]}
          />

          {lifestyleFactors.alcoholUse && lifestyleFactors.alcoholUse !== 'none' && (
            <Input
              label="Drinks Per Week"
              type="number"
              value={lifestyleFactors.drinksPerWeek || ''}
              onChange={(e) => updateLifestyle('drinksPerWeek', Number.parseInt(e.target.value, 10) || 0)}
              placeholder="e.g., 5"
            />
          )}

          {/* Exercise Level */}
          <Select
            label="Exercise Level"
            value={lifestyleFactors.exerciseLevel || 'sedentary'}
            onChange={(e) => updateLifestyle('exerciseLevel', e.target.value)}
            options={[
              { value: 'sedentary', label: 'Sedentary' },
              { value: 'light', label: 'Light (1-2 days/week)' },
              { value: 'moderate', label: 'Moderate (3-4 days/week)' },
              { value: 'active', label: 'Active (5+ days/week)' },
            ]}
          />

          {/* Diet Type */}
          <Autocomplete
            label="Diet Type"
            value={lifestyleFactors.dietType || ''}
            onChange={(value) => updateLifestyle('dietType', value)}
            options={DIET_TYPES.map((d) => ({
              value: d.value,
              label: d.value,
              category: d.category,
            }))}
            placeholder="Select or type diet..."
            allowCustom={true}
            hint="Select from list or type custom diet"
          />

          {/* Sleep Hours */}
          <Input
            label="Average Sleep (hours/night)"
            type="number"
            value={lifestyleFactors.sleepHours || ''}
            onChange={(e) => updateLifestyle('sleepHours', Number.parseFloat(e.target.value) || 0)}
            placeholder="e.g., 7"
            min={0}
            max={24}
          />

          {/* Stress Level */}
          <Select
            label="Stress Level"
            value={lifestyleFactors.stressLevel || 'moderate'}
            onChange={(e) => updateLifestyle('stressLevel', e.target.value)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'high', label: 'High' },
              { value: 'severe', label: 'Severe' },
            ]}
          />
        </div>
      </Card>

      <Card title="Recreational Substance Use">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Recreational Drug Use"
            value={lifestyleFactors.recreationalDrugs || 'none'}
            onChange={(e) => {
              updateLifestyle('recreationalDrugs', e.target.value);
              // Clear caffeine intake when None is selected
              if (e.target.value === 'none') {
                updateLifestyle('caffeineIntake', 'none');
              }
            }}
            options={[
              { value: 'none', label: 'None' },
              { value: 'marijuana', label: 'Marijuana/Cannabis' },
              { value: 'other', label: 'Other Substances' },
            ]}
          />

          {lifestyleFactors.recreationalDrugs && lifestyleFactors.recreationalDrugs !== 'none' && (
            <Select
              label="Caffeine Consumption"
              value={lifestyleFactors.caffeineIntake || 'moderate'}
              onChange={(e) => updateLifestyle('caffeineIntake', e.target.value)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'low', label: 'Low (1-2 cups/day)' },
                { value: 'moderate', label: 'Moderate (3-4 cups/day)' },
                { value: 'high', label: 'High (5+ cups/day)' },
              ]}
            />
          )}
        </div>
      </Card>

      <Card title="Occupational & Environmental Factors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Autocomplete
            label="Occupation"
            value={lifestyleFactors.occupation || ''}
            onChange={(value) => updateLifestyle('occupation', value)}
            options={occupationOptions}
            placeholder="Select or type occupation..."
            allowCustom={true}
            hint="Type to search or add custom"
          />

          <Autocomplete
            label="Occupational Hazards"
            value={lifestyleFactors.occupationalHazards || ''}
            onChange={(value) => updateLifestyle('occupationalHazards', value)}
            options={OCCUPATIONAL_HAZARDS.map((h) => ({
              value: h.value,
              label: h.value,
              category: h.category,
            }))}
            placeholder="Select or type hazard..."
            allowCustom={true}
            hint="Chemical, physical, biological hazards"
          />
        </div>
      </Card>

      <Card title="Additional Notes">
        <textarea
          className="w-full px-4 py-3 bg-obsidian-800/80 border border-obsidian-500 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
          rows={3}
          value={lifestyleFactors.additionalNotes || ''}
          onChange={(e) => updateLifestyle('additionalNotes', e.target.value)}
          placeholder="Any other relevant lifestyle information or concerns..."
        />
      </Card>
    </div>
  );
};

export default LifestyleStep;
