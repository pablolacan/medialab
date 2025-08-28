// src/features/auth/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock API functions (reemplaza con tu API real)
const authAPI = {
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (username === 'admin' && password === 'password123') {
      return {
        user: { id: '1', username: 'admin', role: 'admin' },
        token: 'mock-jwt-token-12345'
      };
    }
    
    throw new Error('Credenciales incorrectas');
  },

  validateToken: async (token: string): Promise<User> => {
    // Simular validación de token
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (token === 'mock-jwt-token-12345') {
      return { id: '1', username: 'admin', role: 'admin' };
    }
    
    throw new Error('Token inválido');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar token al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authAPI.validateToken(token);
        setUser(userData);
      } catch (err) {
        console.error('Token validation failed:', err);
        localStorage.removeItem('auth-token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { user: userData, token } = await authAPI.login(username, password);
      
      localStorage.setItem('auth-token', token);
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de login';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
