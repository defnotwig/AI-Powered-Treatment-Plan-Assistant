import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon,
}) => {
  return (
    <div className={`bg-obsidian-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-obsidian-600/30 overflow-visible ${className}`}>
      {(title || subtitle || action || icon) && (
        <div className="px-6 py-4 border-b border-obsidian-600/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {icon && <div className="text-cyan-400">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-display font-semibold text-slate-100">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6 overflow-visible">{children}</div>
    </div>
  );
};

export default Card;
