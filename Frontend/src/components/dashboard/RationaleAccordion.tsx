import React, { useState } from 'react';
import { Card } from '../ui';
import { ChevronDown, ChevronUp, BookOpen, Brain, Beaker } from 'lucide-react';

interface RationaleItem {
  title: string;
  content: string;
  type: 'reasoning' | 'evidence' | 'guidelines';
}

interface RationaleAccordionProps {
  rationale: string;
  clinicalGuidelines?: string[];
  evidenceSources?: string[];
}

const RationaleAccordion: React.FC<RationaleAccordionProps> = ({
  rationale,
  clinicalGuidelines = [],
  evidenceSources = [],
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  const items: RationaleItem[] = [
    {
      title: 'AI Reasoning',
      content: rationale,
      type: 'reasoning',
    },
    ...(clinicalGuidelines.length > 0
      ? [
          {
            title: 'Clinical Guidelines',
            content: clinicalGuidelines.join('\n\n'),
            type: 'guidelines' as const,
          },
        ]
      : []),
    ...(evidenceSources.length > 0
      ? [
          {
            title: 'Evidence Sources',
            content: evidenceSources.join('\n\n'),
            type: 'evidence' as const,
          },
        ]
      : []),
  ];

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reasoning':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'guidelines':
        return <BookOpen className="w-5 h-5 text-cyan-400" />;
      case 'evidence':
        return <Beaker className="w-5 h-5 text-emerald-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'reasoning':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'guidelines':
        return 'bg-cyan-500/10 border-cyan-500/20';
      case 'evidence':
        return 'bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'bg-obsidian-700/50 border-obsidian-600/30';
    }
  };

  return (
    <Card>
      <div className="p-4 border-b border-obsidian-600/30">
        <h3 className="text-lg font-display font-semibold text-white">Treatment Rationale</h3>
        <p className="text-sm text-slate-400 mt-1">Understanding the AI's clinical reasoning</p>
      </div>

      <div className="divide-y divide-obsidian-700/50">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`}>
            <button
              onClick={() => toggleItem(index)}
              className="w-full p-4 flex items-center justify-between hover:bg-obsidian-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getIcon(item.type)}
                <span className="font-medium text-white">{item.title}</span>
              </div>
              {expandedItems.has(index) ? (
                <ChevronUp className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {expandedItems.has(index) && (
              <div className={`px-4 pb-4 ${getTypeStyles(item.type)} mx-4 mb-4 rounded-lg border`}>
                <div className="py-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RationaleAccordion;
