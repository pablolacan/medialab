import React from 'react';
import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
          className={cn(
            "w-full px-3 py-2 bg-zinc-900 border rounded-md text-zinc-100 placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
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

Input.displayName = "Input";