import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils';

interface EventOption {
  value: string;
  label: string;
  type: 'predefined' | 'current';
}

interface EventComboBoxProps {
  className?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: EventOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const EventComboBox = React.forwardRef<HTMLInputElement, EventComboBoxProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    placeholder = "Escribe o selecciona un evento...",
    options,
    value,
    onChange,
    required,
    disabled,
    ...props 
  }, _ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<EventOption[]>(options);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter options based on input value
    useEffect(() => {
      if (value) {
        const filtered = options.filter(option => 
          option.label.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
      } else {
        setFilteredOptions(options);
      }
    }, [value, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
    };

    const handleOptionSelect = (option: EventOption) => {
      onChange(option.value);
      setIsOpen(false);
      inputRef.current?.focus();
    };

    const handleInputFocus = () => {
      setIsOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    return (
      <div className="space-y-1" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-zinc-200">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-100 placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "pr-10", // Space for the dropdown arrow
              error 
                ? "border-red-500 focus:ring-red-500/20" 
                : "border-zinc-700 hover:border-zinc-600",
              className
            )}
            {...props}
          />
          
          {/* Dropdown arrow */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400 hover:text-zinc-200 disabled:hover:text-zinc-400"
          >
            <svg 
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && filteredOptions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredOptions.map((option, index) => (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none",
                    "first:rounded-t-md last:rounded-b-md",
                    option.type === 'current' ? "text-zinc-100 font-medium" : "text-zinc-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.type === 'current' && (
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                        Activo
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

EventComboBox.displayName = "EventComboBox";