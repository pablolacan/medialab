import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 rounded-lg";
    
    const variants = {
      primary: "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 focus:ring-zinc-400 shadow-sm",
      secondary: "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 focus:ring-zinc-600 shadow-sm",
      ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 focus:ring-zinc-600",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm"
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6",
      lg: "h-12 px-8 text-lg"
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";