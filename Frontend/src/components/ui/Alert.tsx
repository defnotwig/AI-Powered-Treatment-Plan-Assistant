import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, children, onClose, className = '' }) => {
  const styles = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    },
    error: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    },
    info: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-300',
      icon: <Info className="w-5 h-5 text-cyan-400" />,
    },
  };

  const { bg, border, text, icon } = styles[type];
  const content = children || message;

  return (
    <div className={`${bg} ${border} ${text} border rounded-lg p-4 backdrop-blur-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          {title && <p className="font-display font-semibold">{title}</p>}
          <div className={title ? 'mt-1 text-sm opacity-90' : 'text-sm'}>{content}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="flex-shrink-0 hover:opacity-70 transition-opacity text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
