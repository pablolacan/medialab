// src/features/auth/components/LoginForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(credentials.username, credentials.password);
    } catch (err) {
      // Error is handled by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-zinc-950 flex items-center justify-center py-8 px-4"
    >
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-zinc-400">
            Accede al sistema de préstamo de equipos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent"
              placeholder="Ingresa tu usuario"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-transparent"
              placeholder="Ingresa tu contraseña"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-md"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zinc-100 text-zinc-950 py-2 px-4 rounded-md font-medium hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-500">
            Credenciales de prueba: admin / password123
          </p>
        </div>
      </div>
    </motion.div>
  );
};