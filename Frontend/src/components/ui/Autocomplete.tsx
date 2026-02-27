import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';

interface AutocompleteOption {
  value: string;
  label: string;
  category?: string;
}

interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  allowCustom?: boolean;
  onSelect?: (option: AutocompleteOption) => void;
  disabled?: boolean;
  className?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Start typing to search...',
  required = false,
  hint,
  error,
  allowCustom = true,
  onSelect,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on input value
  const filterOptions = useCallback((inputValue: string) => {
    if (!inputValue || inputValue.length < 1) {
      // When no input, show items from different categories to give variety
      const categories = new Map<string, AutocompleteOption[]>();
      options.forEach((opt) => {
        const cat = opt.category || 'Other';
        if (!categories.has(cat)) {
          categories.set(cat, []);
        }
        categories.get(cat)!.push(opt);
      });

      // Get first 2 items from each category, up to 20 total
      const diverseOptions: AutocompleteOption[] = [];
      for (const [, catOptions] of categories) {
        diverseOptions.push(...catOptions.slice(0, 2));
        if (diverseOptions.length >= 20) break;
      }

      // If we have few categories, add more items
      if (diverseOptions.length < 15) {
        setFilteredOptions(options.slice(0, 20));
      } else {
        setFilteredOptions(diverseOptions.slice(0, 20));
      }
      return;
    }

    const searchTerm = inputValue.toLowerCase();
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm) ||
      option.value.toLowerCase().includes(searchTerm) ||
      option.category?.toLowerCase().includes(searchTerm)
    );

    setFilteredOptions(filtered.slice(0, 20));
  }, [options]);

  useEffect(() => {
    filterOptions(value);
  }, [value, filterOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value);
    onSelect?.(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleAddCustom = () => {
    if (value.trim() && allowCustom) {
      const customOption: AutocompleteOption = {
        value: value.trim(),
        label: value.trim(),
        category: 'Custom',
      };
      onSelect?.(customOption);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (allowCustom && value.trim()) {
          handleAddCustom();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const showAddCustomOption = allowCustom &&
    value.trim() &&
    !filteredOptions.some((opt) => opt.value.toLowerCase() === value.toLowerCase());

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 pr-16 border rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
            ${disabled ? 'bg-obsidian-700/30 cursor-not-allowed' : 'bg-obsidian-800/80 text-slate-100'}
            ${error ? 'border-rose-500' : 'border-obsidian-500'}
          `}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {hint && !error && (
        <p className="mt-1 text-sm text-slate-500">{hint}</p>
      )}

      {error && (
        <p className="mt-1 text-sm text-rose-400">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-full mt-1 bg-obsidian-800 border border-obsidian-600/30 rounded-lg shadow-xl max-h-60 overflow-auto"
          style={{ position: 'absolute', top: '100%', left: 0 }}
        >
          {filteredOptions.length > 0 ? (
            <>
              {filteredOptions.map((option, index) => (
                <button
                  type="button"
                  key={`${option.value}-${index}`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full text-left px-4 py-2.5 cursor-pointer transition-colors
                    ${highlightedIndex === index ? 'bg-cyan-500/10' : 'hover:bg-obsidian-700/50'}
                  `}
                >
                  <div className="font-medium text-slate-100">{option.label}</div>
                  {option.category && (
                    <div className="text-xs text-slate-500">{option.category}</div>
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-3 text-slate-500 text-sm">
              No matches found
            </div>
          )}

          {showAddCustomOption && (
            <button
              type="button"
              onClick={handleAddCustom}
              className="w-full text-left px-4 py-2.5 cursor-pointer bg-obsidian-700/50 border-t border-obsidian-600/30 hover:bg-obsidian-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-medium">
                Add "{value}" as custom entry
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
