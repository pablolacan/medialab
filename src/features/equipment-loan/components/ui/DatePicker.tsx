import React from 'react';
import { cn } from '../../utils';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-zinc-200">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          type="date"
          className={cn(
            "w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-100",
            "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "[color-scheme:dark]", // Para que el date picker se vea bien en tema oscuro
            error 
              ? "border-red-500 focus:ring-red-500/20" 
              : "border-zinc-700 hover:border-zinc-600",
            className
          )}
          ref={ref}
          {...props}
        />
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

DatePicker.displayName = "DatePicker";