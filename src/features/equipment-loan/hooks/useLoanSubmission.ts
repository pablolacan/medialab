import { useState } from 'react';
import { equipmentLoanApi } from '../services/api';
import type { LoanFormData, LoanSubmissionResponse } from '../types';

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

  // Función auxiliar para verificar si la respuesta indica éxito
  const isSuccessfulResponse = (response: LoanSubmissionResponse): boolean => {
    // Verificar formato estándar
    if (typeof response.success === 'boolean') {
      return response.success;
    }
    
    // Verificar formato de n8n
    if (response.Estado) {
      const estadosExitosos = ['Prestado', 'Asignado', 'En Préstamo', 'Activo'];
      return estadosExitosos.includes(response.Estado);
    }
    
    // Si tiene campo Fecha, asumir que es exitoso (n8n solo devuelve esto si procesa correctamente)
    if (response.Fecha) {
      return true;
    }
    
    return false;
  };

  const submitLoan = async (data: LoanFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('🎯 Iniciando proceso de envío de préstamo...');
      console.log('📋 Datos del formulario recibidos:', data);

      // Validar campos requeridos antes del envío
      const requiredFields = ['nombreCompleto', 'tipoEquipo', 'equipoId', 'evento', 'fecha'];
      const missingFields = requiredFields.filter(field => !data[field as keyof LoanFormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Preparar datos para enviar a n8n
      const payload = {
        nombreCompleto: data.nombreCompleto.trim(),
        tipoEquipo: data.tipoEquipo,
        equipoId: data.equipoId,
        evento: data.evento.trim(),
        fecha: data.fecha,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      console.log('📤 Payload a enviar:', payload);

      const response = await equipmentLoanApi.submitLoan(payload);

      console.log('📥 Respuesta de la API:', response);

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      if (isSuccessfulResponse(response)) {
        console.log('✅ Préstamo enviado exitosamente');
        
        // Log información adicional si está disponible
        if (response.Estado) {
          console.log(`📊 Estado del equipo: ${response.Estado}`);
        }
        if (response.Fecha) {
          console.log(`📅 Fecha: ${response.Fecha}`);
        }
        if (response.message) {
          console.log(`💬 Mensaje: ${response.message}`);
        }
        
        setIsSuccess(true);
        return;
      }

      // Si llegamos aquí, la respuesta indica error
      const errorMessage = response.message || 
                           `Estado inesperado: ${response.Estado || 'desconocido'}` ||
                           'Error desconocido del servidor';
      
      console.error('❌ Servidor indicó error:', errorMessage);
      throw new Error(errorMessage);

    } catch (err) {
      console.error('❌ Error en submitLoan:', err);
      
      let errorMessage = 'Error desconocido';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        const errObj = err as any;
        errorMessage = errObj.message || errObj.error || errObj.toString() || 'Error del servidor';
      }

      // Proporcionar mensajes de error más amigables
      if (errorMessage.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Servicio no disponible. Contacta al administrador.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Error interno del servidor. Intenta de nuevo en unos momentos.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.';
      }

      setError(errorMessage);
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