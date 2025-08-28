// src/components/layout/Header.tsx
import React from 'react';
import { UserMenu } from '../UserMenu';
import { cn } from '../../features/equipment-loan/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "Dashboard",
  subtitle,
  className,
  onMenuToggle 
}) => {
  return (
    <header className={cn(
      "bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-4",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Botón menú móvil */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-zinc-400 hover:text-zinc-100 transition-colors p-2 -ml-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100">
              {title}
            </h1>
            {subtitle && (
              <p className="text-zinc-400 mt-1 text-sm sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
