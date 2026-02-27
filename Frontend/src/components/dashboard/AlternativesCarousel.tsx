import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { AlternativeTreatment } from '../../types';
import { ChevronLeft, ChevronRight, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AlternativesCarouselProps {
  alternatives: AlternativeTreatment[];
  onSelect: (alternative: AlternativeTreatment) => void;
}

const AlternativesCarousel: React.FC<AlternativesCarouselProps> = ({
  alternatives,
  onSelect,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? alternatives.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === alternatives.length - 1 ? 0 : prev + 1));
  };

  if (alternatives.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-slate-500">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p>No alternative treatments available</p>
        </div>
      </Card>
    );
  }

  const current = alternatives[currentIndex];

  return (
    <Card>
      <div className="p-4 border-b border-obsidian-600/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold text-white">Alternative Treatments</h3>
          <span className="text-sm text-slate-400">
            {currentIndex + 1} of {alternatives.length}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full hover:bg-obsidian-700/50 transition-colors"
            disabled={alternatives.length <= 1}
          >
            <ChevronLeft className="w-6 h-6 text-slate-400" />
          </button>

          <div className="flex-1 text-center">
            <h4 className="text-xl font-display font-semibold text-white mb-2">{current.drugName}</h4>
            <p className="text-slate-400 mb-4">{current.dosage} • {current.frequency}</p>

            <div className="bg-obsidian-700/50 rounded-lg p-4 mb-4">
              <h5 className="text-sm font-medium text-slate-300 mb-2">Reason for Alternative</h5>
              <p className="text-sm text-slate-400">{current.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-emerald-500/10 rounded-lg p-3">
                <h5 className="text-xs font-medium text-emerald-300 mb-1 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> Benefits
                </h5>
                <ul className="text-sm text-emerald-400 space-y-1">
                  {current.benefits?.map((benefit, i) => (
                    <li key={benefit}>• {benefit}</li>
                  )) || <li>• May be more suitable</li>}
                </ul>
              </div>
              <div className="bg-rose-500/10 rounded-lg p-3">
                <h5 className="text-xs font-medium text-rose-300 mb-1 flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> Drawbacks
                </h5>
                <ul className="text-sm text-rose-400 space-y-1">
                  {current.drawbacks?.map((drawback, i) => (
                    <li key={drawback}>• {drawback}</li>
                  )) || <li>• May require adjustment</li>}
                </ul>
              </div>
            </div>

            {current.evidenceLevel && (
              <div className="mt-4 text-xs text-slate-500">
                Evidence Level: <span className="font-medium">{current.evidenceLevel}</span>
              </div>
            )}
          </div>

          <button
            onClick={goToNext}
            className="p-2 rounded-full hover:bg-obsidian-700/50 transition-colors"
            disabled={alternatives.length <= 1}
          >
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => onSelect(current)}>
            <RefreshCw className="w-4 h-4" /> Use This Alternative
          </Button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {alternatives.map((alt, index) => (
            <button
              key={alt.drugName || `alt-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-cyan-500' : 'bg-obsidian-600'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AlternativesCarousel;
