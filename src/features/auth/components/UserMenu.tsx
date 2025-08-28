// src/features/auth/components/UserMenu.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-zinc-200 hover:text-white transition-colors"
      >
        <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:block">{user.username}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg border border-zinc-700 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-zinc-300 border-b border-zinc-700">
              <p className="font-medium">{user.username}</p>
              {user.role && (
                <p className="text-xs text-zinc-400 capitalize">{user.role}</p>
              )}
            </div>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};