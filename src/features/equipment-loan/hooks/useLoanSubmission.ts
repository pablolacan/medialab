import { useState } from 'react';
import { equipmentLoanApi } from '../services/api';
import type { LoanFormData } from '../types';

interface UseLoanSubmissionReturn {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  submitLoan: (data: LoanFormData) => Promise<void>;
  reset: () => void;
}

export const useLoanSubmission = (): UseLoanSubmissionReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLoan = async (data: LoanFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Preparar datos para enviar a n8n
      const payload = {
        nombreCompleto: data.nombreCompleto,
        tipoEquipo: data.tipoEquipo,
        equipoId: data.equipoId,
        evento: data.evento,
        fecha: data.fecha,
        timestamp: new Date().toISOString()
      };

      const response = await equipmentLoanApi.submitLoan(payload);

      if (response.success) {
        setIsSuccess(true);
      } else {
        throw new Error(response.message || 'Error al registrar préstamo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error submitting loan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSuccess(false);
    setError(null);
    setIsSubmitting(false);
  };

  return {
    isSubmitting,
    isSuccess,
    error,
    submitLoan,
    reset
  };
};