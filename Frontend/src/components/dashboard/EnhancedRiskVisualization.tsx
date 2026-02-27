import React, { useMemo } from 'react';
import { Card } from '../ui';
import {
  Shield, AlertTriangle, Activity, Brain, Zap, FileText,
  ChevronDown, ChevronRight, HeartPulse
} from 'lucide-react';
import type { EnsembleRiskResult, SubModelScore, ClinicalFlag } from '../../services/ensemble-risk-scorer';

interface EnhancedRiskVisualizationProps {
  result: EnsembleRiskResult;
}

const severityBadge = (severity: ClinicalFlag['severity']) => {
  const styles: Record<string, string> = {
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };
  return `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[severity] ?? styles.info}`;
};

const subModelIcon = (name: string) => {
  if (name.includes('Neural')) return <Brain className="w-4 h-4" />;
  if (name.includes('Drug')) return <Zap className="w-4 h-4" />;
  if (name.includes('NLP')) return <FileText className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

const getScoreBarColor = (score: number): string => {
  if (score >= 80) return 'bg-red-500';
  if (score >= 60) return 'bg-orange-400';
  if (score >= 30) return 'bg-yellow-400';
  return 'bg-emerald-400';
};

const getInteractionSeverityBadge = (severity: string): string => {
  if (severity === 'major') return 'bg-rose-500/20 text-rose-300';
  if (severity === 'moderate') return 'bg-amber-500/20 text-amber-300';
  return 'bg-cyan-500/20 text-cyan-300';
};

const riskColorMap: Record<string, { ring: string; text: string; bg: string; gradient: string }> = {
  LOW: { ring: 'ring-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', gradient: 'from-emerald-400 to-emerald-600' },
  MEDIUM: { ring: 'ring-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10', gradient: 'from-yellow-400 to-yellow-600' },
  HIGH: { ring: 'ring-orange-400', text: 'text-orange-400', bg: 'bg-orange-500/10', gradient: 'from-orange-400 to-orange-600' },
  CRITICAL: { ring: 'ring-red-400', text: 'text-red-400', bg: 'bg-red-500/10', gradient: 'from-red-500 to-red-700' },
};

const EnhancedRiskVisualization: React.FC<EnhancedRiskVisualizationProps> = ({ result }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
  const colors = riskColorMap[result.riskLevel] ?? riskColorMap.LOW;

  const toggle = (section: string) =>
    setExpandedSection(prev => (prev === section ? null : section));

  const criticalFlags = useMemo(() => result.flags.filter(f => f.severity === 'critical'), [result.flags]);
  const warningFlags = useMemo(() => result.flags.filter(f => f.severity === 'warning'), [result.flags]);

  return (
    <Card className={`overflow-hidden border-2 ${colors.ring.replace('ring', 'border')} shadow-lg`}>
      {/* ── Header + Score ─────────────────────────────────────── */}
      <div className={`p-6 ${colors.bg}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-display font-bold text-white">Ensemble Risk Assessment</h3>
          </div>
          <HeartPulse className={`w-7 h-7 ${colors.text}`} />
        </div>

        {/* Big score */}
        <div className="flex items-center gap-6 mb-4">
          <div className={`relative flex items-center justify-center w-28 h-28 rounded-full ring-8 ${colors.ring} bg-obsidian-900 shadow-inner`}>
            <div className="text-center">
              <span className={`text-4xl font-extrabold ${colors.text}`}>{result.overallScore}</span>
              <span className="block text-xs text-slate-500 -mt-1">/100</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${colors.gradient} shadow`}>
              {result.riskLevel} RISK
            </div>
            <div className="text-sm text-slate-400">
              Confidence: <span className="font-medium">{result.ensembleConfidence}%</span>
              <span className="text-slate-500 ml-2">
                (CI: {result.confidenceInterval.low}–{result.confidenceInterval.high})
              </span>
            </div>
            <div className="text-xs text-slate-500">{result.timestamp}</div>
          </div>
        </div>

        {/* Alert summary */}
        {(criticalFlags.length > 0 || warningFlags.length > 0) && (
          <div className="flex gap-3 mb-2">
            {criticalFlags.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-rose-500/20 rounded-full text-xs font-medium text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                {criticalFlags.length} Critical
              </div>
            )}
            {warningFlags.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 rounded-full text-xs font-medium text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                {warningFlags.length} Warning
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sub-model Breakdown ────────────────────────────────── */}
      <div className="border-t border-obsidian-700/50">
        <button
          onClick={() => toggle('submodels')}
          className="w-full flex items-center justify-between px-6 py-3 hover:bg-obsidian-700/30 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-300">Model Breakdown</span>
          {expandedSection === 'submodels' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {expandedSection === 'submodels' && (
          <div className="px-6 pb-4 space-y-3">
            {result.subModels.map((sm: SubModelScore) => (
              <div key={sm.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    {subModelIcon(sm.name)}
                    <span className="font-medium">{sm.name}</span>
                    {!sm.available && (
                      <span className="text-xs text-slate-500 italic">(fallback)</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white">{sm.score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreBarColor(sm.score)}`}
                      style={{ width: `${sm.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">w: {(sm.weight * 100).toFixed(0)}%</span>
                </div>
                {sm.details && <p className="text-xs text-slate-500">{sm.details}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Clinical Flags ─────────────────────────────────────── */}
      {result.flags.length > 0 && (
        <div className="border-t border-obsidian-700/50">
          <button
            onClick={() => toggle('flags')}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-obsidian-700/30 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-300">Clinical Flags ({result.flags.length})</span>
            {expandedSection === 'flags' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedSection === 'flags' && (
            <ul className="px-6 pb-4 space-y-2">
              {result.flags.map((flag, fIdx) => (
                <li key={`${flag.message}-${fIdx}`} className="flex items-start gap-2 text-sm">
                  <span className={severityBadge(flag.severity)}>{flag.severity}</span>
                  <span className="text-slate-300">{flag.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Drug Interactions ──────────────────────────────────── */}
      {result.predictedInteractions.length > 0 && (
        <div className="border-t border-obsidian-700/50">
          <button
            onClick={() => toggle('interactions')}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-obsidian-700/30 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-300">
              Predicted Drug Interactions ({result.predictedInteractions.length})
            </span>
            {expandedSection === 'interactions' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedSection === 'interactions' && (
            <div className="px-6 pb-4 space-y-2">
              {result.predictedInteractions.map((pi) => (
                <div key={`${pi.drug1}-${pi.drug2}`} className="flex items-center justify-between bg-obsidian-700/40 rounded-lg px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium text-slate-200">{pi.drug1}</span>
                    <span className="text-slate-500 mx-1">+</span>
                    <span className="font-medium text-slate-200">{pi.drug2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getInteractionSeverityBadge(pi.predictedSeverity)}`}>
                      {pi.predictedSeverity}
                    </span>
                    <span className="text-xs text-slate-500">{pi.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Differentials ──────────────────────────────────────── */}
      {result.differentials.length > 0 && (
        <div className="border-t border-obsidian-700/50">
          <button
            onClick={() => toggle('differentials')}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-obsidian-700/30 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-300">
              Differential Diagnoses ({result.differentials.length})
            </span>
            {expandedSection === 'differentials' ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedSection === 'differentials' && (
            <div className="px-6 pb-4 space-y-2">
              {result.differentials.map((dd) => (
                <div key={dd.condition} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{dd.condition}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${dd.probability * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-400 w-10 text-right">
                      {(dd.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default EnhancedRiskVisualization;
