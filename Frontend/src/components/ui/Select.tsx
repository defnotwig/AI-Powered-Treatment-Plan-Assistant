import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replaceAll(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-300 mb-1">
          {label}
          {props.required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-3 py-2 border rounded-lg text-slate-100
          focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
          transition-all duration-200
          ${error ? 'border-rose-500/50 focus:ring-rose-500/50' : 'border-obsidian-500'}
          ${props.disabled ? 'bg-obsidian-900 cursor-not-allowed opacity-50' : 'bg-obsidian-800/80'}
          ${className}
        `}
        {...props}
      >
        <option value="" className="bg-obsidian-800 text-slate-400">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-obsidian-800 text-slate-100">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
    </div>
  );
};

export default Select;
