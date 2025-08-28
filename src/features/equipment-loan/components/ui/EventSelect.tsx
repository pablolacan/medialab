import React from 'react';
import { cn } from '../../utils';

interface EventOption {
  value: string;
  label: string;
  type: 'predefined' | 'current';
}

interface EventSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: EventOption[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSelectChange: (value: string) => void;
}

export const EventSelect = React.forwardRef<HTMLSelectElement, EventSelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    placeholder = "Escribe el nombre del evento...",
    options,
    inputValue,
    onInputChange,
    onSelectChange,
    required,
    disabled,
    ...props 
  }, ref) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(e.target.value);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      if (selectedValue) {
        onSelectChange(selectedValue);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-zinc-200">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        <div className="space-y-2">
          {/* Input para escribir libremente */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 bg-zinc-900 border rounded-lg text-zinc-100 placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
              error 
                ? "border-red-500 focus:ring-red-500/20" 
                : "border-zinc-700 hover:border-zinc-600",
              className
            )}
          />
          
          {/* Select para opciones predefinidas */}
          {options.length > 0 && (
            <div className="relative">
              <select
                ref={ref}
                onChange={handleSelectChange}
                disabled={disabled}
                className={cn(
                  "w-full px-4 py-3 bg-zinc-800 border rounded-lg text-zinc-100",
                  "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "appearance-none cursor-pointer transition-all",
                  "border-zinc-600 hover:border-zinc-500"
                )}
                {...props}
              >
                <option value="" className="text-zinc-400">
                  O selecciona un evento existente...
                </option>
                
                {/* Eventos activos primero */}
                {options.filter(opt => opt.type === 'current').length > 0 && (
                  <optgroup label="Eventos Activos" className="bg-zinc-800">
                    {options
                      .filter(opt => opt.type === 'current')
                      .map((option, index) => (
                        <option
                          key={`current-${index}`}
                          value={option.value}
                          className="bg-zinc-800 text-zinc-100"
                        >
                          {option.label} ✅
                        </option>
                      ))
                    }
                  </optgroup>
                )}
                
                {/* Eventos recientes */}
                {options.filter(opt => opt.type === 'predefined').length > 0 && (
                  <optgroup label="Eventos Recientes" className="bg-zinc-800">
                    {options
                      .filter(opt => opt.type === 'predefined')
                      .map((option, index) => (
                        <option
                          key={`recent-${index}`}
                          value={option.value}
                          className="bg-zinc-800 text-zinc-300"
                        >
                          {option.label}
                        </option>
                      ))
                    }
                  </optgroup>
                )}
              </select>
              
              {/* Chevron down icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-zinc-400">{helperText}</p>
        )}
        
        {/* Indicador de que se puede escribir */}
        <p className="text-xs text-zinc-500">
          💡 Puedes escribir el nombre del evento directamente o seleccionar uno de la lista
        </p>
      </div>
    );
  }
);

EventSelect.displayName = "EventSelect";