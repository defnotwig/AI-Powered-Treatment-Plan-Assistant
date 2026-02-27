import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import BackNavigation from '../BackNavigation';

describe('BackNavigation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses fallback action when history is unavailable', () => {
    const fallback = vi.fn();
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    render(
      <BackNavigation
        label="Back"
        fallbackLabel="Back to Home"
        onFallback={fallback}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));

    expect(fallback).toHaveBeenCalledTimes(1);
    expect(backSpy).not.toHaveBeenCalled();
  });

  it('uses browser history when available in auto mode', () => {
    const fallback = vi.fn();
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    window.history.pushState({}, '', '/analytics');

    render(<BackNavigation label="Back" onFallback={fallback} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(backSpy).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('uses fallback when strategy is fallback-only even if history exists', () => {
    const fallback = vi.fn();
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    window.history.pushState({}, '', '/patients');

    render(
      <BackNavigation
        label="Back"
        fallbackLabel="Back to Home"
        strategy="fallback-only"
        onFallback={fallback}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));

    expect(fallback).toHaveBeenCalledTimes(1);
    expect(backSpy).not.toHaveBeenCalled();
  });
});
