import React, { useState } from 'react';
import { Card, Button, Input } from '../ui';
import { TreatmentRecommendation } from '../../types';
import { Pill, Edit2, Save, X, Clock, AlertTriangle } from 'lucide-react';

interface TreatmentPlanCardProps {
  recommendations: TreatmentRecommendation[];
  onUpdate: (recommendations: TreatmentRecommendation[]) => void;
  editable?: boolean;
}

const TreatmentPlanCard: React.FC<TreatmentPlanCardProps> = ({
  recommendations,
  onUpdate,
  editable = true,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<TreatmentRecommendation | null>(null);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...recommendations[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editData) {
      const updated = [...recommendations];
      updated[editingIndex] = editData;
      onUpdate(updated);
      cancelEdit();
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded text-xs">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs">Medium Priority</span>;
      default:
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs">Low Priority</span>;
    }
  };

  return (
    <Card>
      <div className="p-4 border-b border-obsidian-600/30">
        <h3 className="text-lg font-display font-semibold text-white">Treatment Recommendations</h3>
        <p className="text-sm text-slate-400 mt-1">AI-generated treatment plan based on patient data</p>
      </div>

      <div className="divide-y divide-obsidian-700/50">
        {recommendations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Pill className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No treatment recommendations</p>
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <div key={`${rec.drugName}-${index}`} className="p-4">
              {editingIndex === index && editData ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Drug Name"
                      value={editData.drugName}
                      onChange={(e) => setEditData({ ...editData, drugName: e.target.value })}
                    />
                    <Input
                      label="Dosage"
                      value={editData.dosage}
                      onChange={(e) => setEditData({ ...editData, dosage: e.target.value })}
                    />
                    <Input
                      label="Frequency"
                      value={editData.frequency}
                      onChange={(e) => setEditData({ ...editData, frequency: e.target.value })}
                    />
                    <Input
                      label="Duration"
                      value={editData.duration || ''}
                      onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="med-instructions" className="block text-sm font-medium text-slate-300 mb-1">Instructions</label>
                    <textarea
                      id="med-instructions"
                      className="w-full px-3 py-2 border border-obsidian-500 bg-obsidian-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                      rows={2}
                      value={editData.instructions || ''}
                      onChange={(e) => setEditData({ ...editData, instructions: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button size="sm" variant="secondary" onClick={cancelEdit}>
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Pill className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-white">{rec.drugName}</h4>
                      {getPriorityBadge(rec.priority)}
                      {rec.requiresMonitoring && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Monitoring Required
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <p>
                        <span className="font-medium">{rec.dosage}</span>
                        <span className="mx-2">•</span>
                        <span>{rec.frequency}</span>
                        {rec.route && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{rec.route}</span>
                          </>
                        )}
                      </p>
                      {rec.duration && (
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rec.duration}
                        </p>
                      )}
                      {rec.instructions && (
                        <p className="text-slate-500 mt-2">{rec.instructions}</p>
                      )}
                    </div>
                  </div>
                  {editable && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEdit(index)}
                      className="flex-shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TreatmentPlanCard;
