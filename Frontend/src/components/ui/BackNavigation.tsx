import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from './Button';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type BackNavigationStrategy = 'auto' | 'fallback-only';

export interface BackNavigationProps {
  label?: string;
  fallbackLabel?: string;
  onFallback?: () => void;
  strategy?: BackNavigationStrategy;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

export function hasBrowserBackHistory(): boolean {
  if (typeof window === 'undefined') return false;
  return window.history.length > 1;
}

const BackNavigation: React.FC<BackNavigationProps> = ({
  label = 'Back',
  fallbackLabel = 'Back',
  onFallback,
  strategy = 'auto',
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled = false,
}) => {
  const canUseBrowserBack = strategy !== 'fallback-only' && hasBrowserBackHistory();
  const buttonText = canUseBrowserBack ? label : fallbackLabel;

  const handleClick = () => {
    if (disabled) return;

    if (strategy !== 'fallback-only' && hasBrowserBackHistory()) {
      window.history.back();
      return;
    }

    onFallback?.();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      disabled={disabled}
      aria-label={buttonText}
    >
      <ArrowLeft className="w-4 h-4" />
      {buttonText}
    </Button>
  );
};

export default BackNavigation;
