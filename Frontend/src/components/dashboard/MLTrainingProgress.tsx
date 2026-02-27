import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../ui';
import { Brain, Zap, Activity, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { initializeRiskModel } from '../../services/ml-risk-predictor';
import { initializeDrugInteractionModel } from '../../services/drug-interaction-predictor';

type ModelStatus = 'idle' | 'training' | 'trained' | 'error';

interface ModelInfo {
  name: string;
  status: ModelStatus;
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy?: number;
  icon: React.ReactNode;
}

const MLTrainingProgress: React.FC = () => {
  const [models, setModels] = useState<Record<string, ModelInfo>>({
    risk: {
      name: 'Risk Prediction Model',
      status: 'idle',
      epoch: 0,
      totalEpochs: 150,
      loss: 1,
      icon: <Brain className="w-5 h-5" />,
    },
    interaction: {
      name: 'Drug Interaction Model',
      status: 'idle',
      epoch: 0,
      totalEpochs: 120,
      loss: 1,
      accuracy: 0,
      icon: <Zap className="w-5 h-5" />,
    },
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const hasStarted = useRef(false);

  const updateModel = useCallback((key: string, updates: Partial<ModelInfo>) => {
    setModels(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  }, []);

  const trainAll = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Train risk model
    updateModel('risk', { status: 'training' });
    try {
      await initializeRiskModel((epoch, loss) => {
        updateModel('risk', { epoch, loss, status: 'training' });
      });
      updateModel('risk', { status: 'trained' });
    } catch {
      updateModel('risk', { status: 'error' });
    }

    // Train drug interaction model
    updateModel('interaction', { status: 'training' });
    try {
      await initializeDrugInteractionModel((epoch, loss, acc) => {
        updateModel('interaction', { epoch, loss, accuracy: acc, status: 'training' });
      });
      updateModel('interaction', { status: 'trained' });
    } catch {
      updateModel('interaction', { status: 'error' });
    }
  }, [updateModel]);

  useEffect(() => {
    trainAll();
  }, [trainAll]);

  const allTrained = Object.values(models).every(m => m.status === 'trained');
  const anyTraining = Object.values(models).some(m => m.status === 'training');
  const anyError = Object.values(models).some(m => m.status === 'error');

  const getStatusColor = (status: ModelStatus) => {
    switch (status) {
      case 'trained': return 'text-emerald-400';
      case 'training': return 'text-cyan-400';
      case 'error': return 'text-rose-400';
      default: return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: ModelStatus) => {
    switch (status) {
      case 'trained': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'training': return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getHeaderBgClass = () => {
    if (allTrained) return 'bg-emerald-500/20';
    if (anyTraining) return 'bg-cyan-500/20';
    return 'bg-obsidian-700/50';
  };

  const getBrainClass = () => {
    if (allTrained) return 'text-emerald-400';
    if (anyTraining) return 'text-cyan-400';
    return 'text-slate-500';
  };

  const getStatusMessage = () => {
    if (allTrained) return 'All models ready';
    if (anyTraining) return 'Training in progress...';
    if (anyError) return 'Training error';
    return 'Initializing...';
  };

  const getModelDotClass = (status: ModelStatus): string => {
    if (status === 'trained') return 'bg-emerald-400';
    if (status === 'training') return 'bg-cyan-400 animate-pulse';
    if (status === 'error') return 'bg-rose-400';
    return 'bg-obsidian-600';
  };

  const getProgressBarClass = (status: ModelStatus): string => {
    if (status === 'trained') return 'bg-emerald-500';
    if (status === 'error') return 'bg-rose-500';
    return 'bg-cyan-500';
  };

  const getModelProgress = (model: ModelInfo): number => {
    if (model.status === 'trained') return 100;
    if (model.totalEpochs > 0) return Math.round((model.epoch / model.totalEpochs) * 100);
    return 0;
  };

  return (
    <Card className="overflow-hidden border border-obsidian-600/30 shadow-sm">
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-obsidian-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getHeaderBgClass()}`}>
            <Brain className={`w-5 h-5 ${getBrainClass()}`} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-display font-semibold text-white">ML Models</h3>
            <p className="text-xs text-slate-500">
              {getStatusMessage()}
            </p>
          </div>
        </div>

        {/* Compact status dots */}
        <div className="flex items-center gap-2">
          {Object.entries(models).map(([modelKey, m]) => (
            <div key={modelKey} className={`w-2.5 h-2.5 rounded-full ${getModelDotClass(m.status)}`} />
          ))}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-obsidian-700/50 p-4 space-y-4">
          {Object.entries(models).map(([key, model]) => {
            const progress = getModelProgress(model);

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(model.status)}>{model.icon}</span>
                    <span className="text-sm font-medium text-slate-200">{model.name}</span>
                  </div>
                  {getStatusIcon(model.status)}
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-2 bg-obsidian-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full rounded-full transition-all duration-300 ${getProgressBarClass(model.status)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Metrics row */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {model.status !== 'idle' && (
                    <>
                      <span>Epoch: {model.epoch}/{model.totalEpochs}</span>
                      <span>Loss: {model.loss.toFixed(4)}</span>
                      {model.accuracy !== undefined && (
                        <span>Acc: {(model.accuracy * 100).toFixed(1)}%</span>
                      )}
                    </>
                  )}
                  {model.status === 'idle' && <span>Queued</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default MLTrainingProgress;
