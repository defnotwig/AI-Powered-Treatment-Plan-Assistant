import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hint?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  hint,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replaceAll(/\s+/g, '-');
  const displayHelper = hint || helperText;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-300 mb-1">
          {label}
          {props.required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 border rounded-lg text-slate-100 placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
          transition-all duration-200
          ${error ? 'border-rose-500/50 focus:ring-rose-500/50' : 'border-obsidian-500'}
          ${props.disabled ? 'bg-obsidian-900 cursor-not-allowed opacity-50' : 'bg-obsidian-800/80'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
      {displayHelper && !error && <p className="mt-1 text-sm text-slate-500">{displayHelper}</p>}
    </div>
  );
};

export default Input;
