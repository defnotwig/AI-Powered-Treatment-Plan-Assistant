import React, { useState } from 'react';
import { Card } from '../ui';
import { FlaggedIssue } from '../../types';
import { 
  AlertTriangle, AlertCircle, Info, 
  ChevronDown, ChevronUp, Shield, Pill, Calculator 
} from 'lucide-react';

interface FlaggedIssuesPanelProps {
  issues: FlaggedIssue[];
}

const FlaggedIssuesPanel: React.FC<FlaggedIssuesPanelProps> = ({ issues }) => {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIssues(newExpanded);
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          bgColor: 'bg-rose-500/15',
          borderColor: 'border-rose-500/30',
          textColor: 'text-rose-300',
          badgeColor: 'bg-rose-500/20 text-rose-300',
        };
      case 'high':
      case 'major':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/20',
          textColor: 'text-rose-300',
          badgeColor: 'bg-rose-500/15 text-rose-300',
        };
      case 'moderate':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          textColor: 'text-amber-300',
          badgeColor: 'bg-amber-500/15 text-amber-300',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-cyan-400" />,
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/20',
          textColor: 'text-cyan-300',
          badgeColor: 'bg-cyan-500/15 text-cyan-300',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drug-interaction':
        return <Pill className="w-4 h-4" />;
      case 'contraindication':
        return <Shield className="w-4 h-4" />;
      case 'dosage-issue':
        return <Calculator className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const sortedIssues = [...issues].sort((a, b) => {
    const severityOrder: Record<string, number> = { critical: 0, high: 1, major: 1, moderate: 2, low: 3, minor: 3 };
    return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
  });

  const filteredIssues = sortedIssues.filter((issue) => {
    if (filter === 'all') return true;
    if (filter === 'high') return issue.severity === 'critical' || issue.severity === 'high' || issue.severity === 'major';
    if (filter === 'moderate') return issue.severity === 'moderate';
    return issue.severity === 'low' || issue.severity === 'minor';
  });

  const highCount = issues.filter((i) => i.severity === 'critical' || i.severity === 'high' || i.severity === 'major').length;
  const moderateCount = issues.filter((i) => i.severity === 'moderate').length;
  const lowCount = issues.filter((i) => i.severity === 'low' || i.severity === 'minor').length;

  return (
    <Card>
      <div className="p-4 border-b border-obsidian-600/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-white">Flagged Issues</h3>
          <span className="text-sm text-slate-400">{issues.length} total</span>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-cyan-500 text-obsidian-950'
                : 'bg-obsidian-700/50 text-slate-400 hover:bg-obsidian-700'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === 'high'
                ? 'bg-rose-500 text-white'
                : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            High ({highCount})
          </button>
          <button
            onClick={() => setFilter('moderate')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === 'moderate'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            Moderate ({moderateCount})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === 'low'
                ? 'bg-cyan-500 text-white'
                : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
            }`}
          >
            Low ({lowCount})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No issues found for this filter</p>
          </div>
        ) : (
          filteredIssues.map((issue, index) => {
            const config = getSeverityConfig(issue.severity);
            const isExpanded = expandedIssues.has(index);

            return (
              <div
                key={`${issue.title}-${index}`}
                className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden`}
              >
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-4 text-left flex items-start gap-3"
                >
                  {config.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${config.badgeColor} flex items-center gap-1`}>
                        {getTypeIcon(issue.type)}
                        {issue.type.replace('-', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${config.badgeColor} capitalize`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className={`mt-1 font-medium ${config.textColor}`}>{issue.title}</p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{issue.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-obsidian-600/20">
                    {issue.affectedDrugs && issue.affectedDrugs.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-500 mb-1">Affected Medications</p>
                        <div className="flex flex-wrap gap-1">
                          {issue.affectedDrugs.map((drug, i) => (
                            <span key={drug} className="px-2 py-0.5 bg-obsidian-700/60 rounded text-sm text-slate-300">
                              {drug}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {issue.recommendation && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-500 mb-1">Recommendation</p>
                        <p className="text-sm text-slate-300">{issue.recommendation}</p>
                      </div>
                    )}

                    {issue.clinicalEvidence && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Clinical Evidence</p>
                        <p className="text-sm text-slate-400 italic">{issue.clinicalEvidence}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default FlaggedIssuesPanel;
