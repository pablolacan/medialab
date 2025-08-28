import React from 'react';
import { cn } from '../../utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    placeholder = "Selecciona una opción...",
    options,
    onChange,
    ...props 
  }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-zinc-200">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-100",
              "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "appearance-none cursor-pointer",
              error 
                ? "border-red-500 focus:ring-red-500/20" 
                : "border-zinc-700 hover:border-zinc-600",
              className
            )}
            ref={ref}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          >
            <option value="" disabled className="text-zinc-500">
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-zinc-900 text-zinc-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Chevron down icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
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

Select.displayName = "Select";