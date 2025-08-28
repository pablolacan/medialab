// src/features/equipment-loan/components/ui/DatePicker.tsx
import React from 'react';
import { cn } from '../../utils';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Función para obtener la fecha actual en Guatemala (GMT-6)
const getGuatemalaDate = (): string => {
  const now = new Date();
  // Guatemala está en GMT-6 (CST - Central Standard Time)
  const guatemalaTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return guatemalaTime.toISOString().split('T')[0];
};

// Función para formatear fecha en español guatemalteco
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-GT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, helperText, value, onChange, ...props }, ref) => {
    // Si no hay valor, usar la fecha actual de Guatemala
    const currentValue = (typeof value === 'string' ? value : '') || getGuatemalaDate();
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-zinc-200">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            type="date"
            value={currentValue}
            onChange={handleDateChange}
            className={cn(
              "w-full px-4 py-3 bg-zinc-900 border rounded-lg text-zinc-100",
              "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
              "[color-scheme:dark]", // Para que el date picker se vea bien en tema oscuro
              error 
                ? "border-red-500 focus:ring-red-500/20" 
                : "border-zinc-700 hover:border-zinc-600",
              className
            )}
            ref={ref}
            {...props}
          />
          {/* Removido el ícono manual porque el input date ya tiene su propio ícono nativo */}
        </div>
        
        {/* Mostrar fecha seleccionada en formato legible */}
        {currentValue && !error && (
          <div className="text-xs text-zinc-500 bg-zinc-800 px-3 py-2 rounded-md">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Fecha seleccionada: <span className="text-zinc-300 font-medium">{formatDateForDisplay(currentValue)}</span>
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              Zona horaria: Guatemala (GMT-6)
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{error}</span>
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-zinc-400 flex items-center space-x-1">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{helperText}</span>
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

// Función helper para exportar
export const getGuatemalaDateString = getGuatemalaDate;