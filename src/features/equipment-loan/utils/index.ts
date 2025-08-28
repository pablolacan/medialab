// src/features/equipment-loan/utils/index.ts
import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names
 */
export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/**
 * Get today's date in YYYY-MM-DD format for Guatemala timezone (GMT-6)
 */
export const getTodayDate = (): string => {
  const now = new Date();
  // Guatemala está en GMT-6
  const guatemalaTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return guatemalaTime.toISOString().split('T')[0];
};

/**
 * Get Guatemala current date and time info
 */
export const getGuatemalaDateTime = () => {
  const now = new Date();
  const guatemalaTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  
  return {
    date: guatemalaTime.toISOString().split('T')[0],
    time: guatemalaTime.toTimeString().split(' ')[0],
    datetime: guatemalaTime.toISOString(),
    formatted: guatemalaTime.toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for display
 */
export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Sleep utility for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};