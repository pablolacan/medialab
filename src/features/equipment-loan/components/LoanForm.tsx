import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { DatePicker } from './ui/DatePicker';
import { useInventory } from '../hooks/useInventory';
import { useEvents } from '../hooks/useEvents';
import { useLoanSubmission } from '../hooks/useLoanSubmission';
import { validateForm, getFieldError } from '../utils/validation';
import { getTodayDate } from '../utils';
import type { LoanFormData } from '../types';

export const LoanForm: React.FC = () => {
  const [formData, setFormData] = useState<LoanFormData>({
    nombreCompleto: '',
    tipoEquipo: '',
    equipoId: '',
    evento: '',
    fecha: getTodayDate()
  });
  
  const [validationErrors, setValidationErrors] = useState<any>({});
  
  const { 
    availableTypes, 
    getEquipmentsByType, 
    isLoading: inventoryLoading 
  } = useInventory();
  
  const { 
    currentEvent, 
    isLoading: eventsLoading 
  } = useEvents();
  
  const { 
    submitLoan, 
    isSubmitting, 
    isSuccess, 
    error: submissionError,
    reset 
  } = useLoanSubmission();

  // Auto-set current event when it loads
  useEffect(() => {
    if (currentEvent && currentEvent !== 'Sin evento activo') {
      setFormData(prev => ({ ...prev, evento: currentEvent }));
    }
  }, [currentEvent]);

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors((prev: typeof validationErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tipoEquipo: type,
      equipoId: '' // Reset equipment selection when type changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm(formData);
    
    if (!validation.success) {
      setValidationErrors(validation.error.format());
      return;
    }
    
    setValidationErrors({});
    await submitLoan(formData);
  };

  const handleNewLoan = () => {
    setFormData({
      nombreCompleto: '',
      tipoEquipo: '',
      equipoId: '',
      evento: currentEvent && currentEvent !== 'Sin evento activo' ? currentEvent : '',
      fecha: getTodayDate()
    });
    reset();
  };

  const equipmentOptions = formData.tipoEquipo 
    ? getEquipmentsByType(formData.tipoEquipo).map(eq => ({
        value: eq.id,
        label: `${eq.id} - ${eq.estado}`
      }))
    : [];

  const typeOptions = availableTypes.map(type => ({
    value: type,
    label: type
  }));

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-lg p-6"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">
              ¡Préstamo Registrado!
            </h2>
            <p className="text-zinc-400 mb-4">
              El equipo <strong className="text-zinc-200">{formData.equipoId}</strong> ha sido asignado a{' '}
              <strong className="text-zinc-200">{formData.nombreCompleto}</strong>
            </p>
          </div>
          <Button onClick={handleNewLoan} className="w-full">
            Registrar Otro Préstamo
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-lg p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">
          Préstamo de Equipo
        </h2>
        <p className="text-zinc-400">
          Complete este formulario para registrar el préstamo de equipo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre Completo"
          value={formData.nombreCompleto}
          onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
          error={getFieldError(validationErrors, 'nombreCompleto')}
          required
          disabled={isSubmitting}
        />

        <Select
          label="Tipo de Equipo"
          value={formData.tipoEquipo}
          onChange={handleTypeChange}
          options={typeOptions}
          error={getFieldError(validationErrors, 'tipoEquipo')}
          required
          disabled={inventoryLoading || isSubmitting}
        />

        <AnimatePresence>
          {formData.tipoEquipo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Select
                label="Equipo Específico"
                value={formData.equipoId}
                onChange={(value) => handleInputChange('equipoId', value)}
                options={equipmentOptions}
                error={getFieldError(validationErrors, 'equipoId')}
                placeholder="Selecciona un equipo..."
                required
                disabled={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          label="Evento"
          value={formData.evento}
          onChange={(e) => handleInputChange('evento', e.target.value)}
          error={getFieldError(validationErrors, 'evento')}
          helperText={eventsLoading ? "Cargando evento actual..." : undefined}
          required
          disabled={isSubmitting}
        />

        <DatePicker
          label="Fecha"
          value={formData.fecha}
          onChange={(e) => handleInputChange('fecha', e.target.value)}
          error={getFieldError(validationErrors, 'fecha')}
          min={getTodayDate()}
          required
          disabled={isSubmitting}
        />

        {submissionError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-md"
          >
            <p className="text-red-400 text-sm">{submissionError}</p>
          </motion.div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          loading={isSubmitting}
          disabled={inventoryLoading || eventsLoading}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Préstamo'}
        </Button>
      </form>
    </motion.div>
  );
};

export default LoanForm;