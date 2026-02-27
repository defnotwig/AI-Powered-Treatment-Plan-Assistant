import React from 'react';
import { Card } from '../ui';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Shield } from 'lucide-react';
import { normalizeRiskLevel } from '../../types/treatment-plan';

interface RiskScoreCardProps {
  riskLevel: string; // Accepts canonical RiskLevel or legacy formats (e.g., 'MEDIUM', 'HIGH')
  riskScore: number;
  confidence: number;
  riskFactors: string[];
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  riskLevel: rawRiskLevel,
  riskScore,
  confidence,
  riskFactors,
}) => {
  const riskLevel = normalizeRiskLevel(rawRiskLevel);
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          color: 'red',
          bgColor: 'bg-rose-500',
          textColor: 'text-rose-400',
          bgLight: 'bg-rose-500/10',
          borderColor: 'border-rose-500/30',
          ringColor: 'ring-rose-500',
          icon: <AlertTriangle className="w-8 h-8 text-rose-400" />,
          label: 'Critical Risk',
          gradient: 'from-rose-500 to-rose-600',
        };
      case 'high':
        return {
          color: 'orange',
          bgColor: 'bg-orange-500',
          textColor: 'text-orange-400',
          bgLight: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          ringColor: 'ring-orange-500',
          icon: <AlertCircle className="w-8 h-8 text-orange-400" />,
          label: 'High Risk',
          gradient: 'from-orange-500 to-orange-600',
        };
      case 'moderate':
        return {
          color: 'yellow',
          bgColor: 'bg-amber-500',
          textColor: 'text-amber-400',
          bgLight: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          ringColor: 'ring-amber-500',
          icon: <Info className="w-8 h-8 text-amber-400" />,
          label: 'Moderate Risk',
          gradient: 'from-amber-500 to-amber-600',
        };
      default:
        return {
          color: 'green',
          bgColor: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          bgLight: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          ringColor: 'ring-emerald-500',
          icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
          label: 'Low Risk',
          gradient: 'from-emerald-500 to-emerald-600',
        };
    }
  };

  const config = getRiskConfig();

  // Calculate gauge angle (0-180 degrees for semicircle)
  const gaugeAngle = (riskScore / 100) * 180;

  return (
    <Card className={`overflow-hidden border-2 ${config.borderColor} shadow-lg`}>
      <div className={`p-6 ${config.bgLight}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-500" />
            <h3 className="text-lg font-display font-semibold text-white">Risk Assessment</h3>
          </div>
          {config.icon}
        </div>

        {/* Risk Gauge */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-24 overflow-hidden">
            {/* Background arc */}
            <div className="absolute w-48 h-48 rounded-full border-[16px] border-obsidian-700" 
                 style={{ top: '0', clipPath: 'inset(0 0 50% 0)' }} />
            
            {/* Colored arc - using conic gradient for gauge effect */}
            <div 
              className={`absolute w-48 h-48 rounded-full border-[16px] ${config.bgColor}`}
              style={{ 
                top: '0', 
                clipPath: 'inset(0 0 50% 0)',
                transform: `rotate(${gaugeAngle - 180}deg)`,
                transformOrigin: 'center center',
                opacity: 0.9
              }} 
            />
            
            {/* Center text */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <div className={`text-4xl font-bold ${config.textColor}`}>{riskScore}</div>
              <div className="text-sm text-slate-500">/ 100</div>
            </div>
          </div>

          <div className={`mt-4 px-5 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white font-semibold shadow-lg`}>
            {config.label}
          </div>
        </div>

        {/* Confidence */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">AI Confidence</span>
            <span className="font-medium text-white">{confidence > 1 ? confidence.toFixed(0) : (confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-obsidian-700 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${confidence > 1 ? confidence : confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Contributing Factors</h4>
            <ul className="space-y-2">
              {riskFactors.map((factor, index) => (
                <li key={`${factor}-${index}`} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className={`w-4 h-4 ${config.textColor} flex-shrink-0 mt-0.5`} />
                  <span className="text-slate-400">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskScoreCard;
