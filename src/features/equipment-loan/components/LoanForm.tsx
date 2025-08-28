// src/features/equipment-loan/components/LoanForm.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { DatePicker } from './ui/DatePicker';
import { EventComboBox } from './ui/EventComboBox';
import { useInventory } from '../hooks/useInventory';
import { useEvents } from '../hooks/useEvents';
import { useLoanSubmission } from '../hooks/useLoanSubmission';
import { validateForm, getFieldError } from '../utils/validation';
import { getGuatemalaDateTime } from '../utils';
import { getGuatemalaDateString } from './ui/DatePicker';
import { useAuth } from '../../../hooks/useAuth';
import type { LoanFormData } from '../types';

export const LoanForm: React.FC = () => {
  const { user, name } = useAuth();
  
  const [formData, setFormData] = useState<LoanFormData>({
    nombreCompleto: name || '', // Prerellenar con el usuario loggeado
    tipoEquipo: '',
    equipoId: '',
    evento: '',
    fecha: getGuatemalaDateString() // Usar fecha de Guatemala
  });
  
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [hasUserInteractedWithEvent, setHasUserInteractedWithEvent] = useState(false);
  
  const { 
    availableTypes, 
    getEquipmentsByType, 
    isLoading: inventoryLoading 
  } = useInventory();
  
  const { 
    currentEvents,
    eventOptions,
    primaryEvent, 
    isLoading: eventsLoading 
  } = useEvents();
  
  const { 
    submitLoan, 
    isSubmitting, 
    isSuccess, 
    error: submissionError,
    reset 
  } = useLoanSubmission();

  // Auto-set user name when it loads
  useEffect(() => {
    if (name && !formData.nombreCompleto) {
      setFormData(prev => ({ ...prev, nombreCompleto: name }));
    }
  }, [name, formData.nombreCompleto]);

  // Auto-set primary event when it loads, but only if user hasn't interacted
  useEffect(() => {
    if (primaryEvent && !formData.evento && !hasUserInteractedWithEvent) {
      setFormData(prev => ({ ...prev, evento: primaryEvent }));
    }
  }, [primaryEvent, formData.evento, hasUserInteractedWithEvent]);

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    // Prevenir cambio del nombre si está bloqueado
    if (field === 'nombreCompleto' && name) {
      return; // No permitir cambios si el usuario está loggeado
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors((prev: typeof validationErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEventChange = (value: string) => {
    setHasUserInteractedWithEvent(true);
    handleInputChange('evento', value);
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
      nombreCompleto: name || '', // Mantener el usuario loggeado
      tipoEquipo: '',
      equipoId: '',
      evento: primaryEvent || '',
      fecha: getGuatemalaDateString() // Usar fecha de Guatemala
    });
    setHasUserInteractedWithEvent(false);
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
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8"
        >
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
                ¡Préstamo Registrado Exitosamente!
              </h2>
              <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Usuario:</span>
                    <p className="text-zinc-200 font-medium">{formData.nombreCompleto}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Equipo:</span>
                    <p className="text-zinc-200 font-medium">{formData.equipoId}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Evento:</span>
                    <p className="text-zinc-200 font-medium">{formData.evento}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400">Fecha:</span>
                    <p className="text-zinc-200 font-medium">
                      {new Date(formData.fecha + 'T00:00:00').toLocaleDateString('es-GT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={handleNewLoan} className="w-full max-w-md mx-auto" size="lg">
              Registrar Otro Préstamo
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-100 mb-3">
            Nuevo Préstamo de Equipo
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Complete la información para registrar el préstamo de equipo. Los campos marcados con * son obligatorios.
          </p>
          
          {/* Información de zona horaria */}
          <div className="mt-4 inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Fecha actual en Guatemala: {getGuatemalaDateTime().formatted}</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
        {/* Usuario - Bloqueado si está loggeado */}
        <div className="relative">
          <Input
            label="Usuario Responsable"
            value={formData.nombreCompleto}
            onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
            error={getFieldError(validationErrors, 'nombreCompleto')}
            required
            disabled={!!name || isSubmitting}
            className={name ? 'bg-zinc-800 cursor-not-allowed' : ''}
          />
          {name && (
            <div className="absolute right-3 top-8 text-zinc-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          )}
          {name && (
            <p className="text-xs text-zinc-500 mt-1">
              Usuario actual: {user?.email}
            </p>
          )}
        </div>

        {/* Tipo de Equipo */}
        <Select
          label="Tipo de Equipo"
          value={formData.tipoEquipo}
          onChange={handleTypeChange}
          options={typeOptions}
          error={getFieldError(validationErrors, 'tipoEquipo')}
          required
          disabled={inventoryLoading || isSubmitting}
        />

        {/* Equipo Específico */}
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
                placeholder="Selecciona un equipo disponible..."
                required
                disabled={isSubmitting}
                helperText={`${equipmentOptions.length} equipos disponibles`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Evento */}
        <EventComboBox
          label="Evento"
          value={formData.evento}
          onChange={handleEventChange}
          options={eventOptions}
          error={getFieldError(validationErrors, 'evento')}
          helperText={
            eventsLoading 
              ? "Cargando eventos..." 
              : currentEvents.length > 1 
                ? `${currentEvents.length} eventos activos disponibles`
                : currentEvents.length === 1
                  ? "Evento actual pre-seleccionado"
                  : "No hay eventos activos"
          }
          required
          disabled={isSubmitting}
        />

        {/* Fecha */}
        <DatePicker
          label="Fecha del Préstamo"
          value={formData.fecha}
          onChange={(e) => handleInputChange('fecha', e.target.value)}
          error={getFieldError(validationErrors, 'fecha')}
          required
          disabled={isSubmitting}
          helperText="Puede seleccionar fechas anteriores, actuales o futuras"
        />

        {/* Error de envío */}
        {submissionError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-400 text-sm font-medium">{submissionError}</p>
            </div>
          </motion.div>
        )}

        {/* Botón de envío */}
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full" 
            loading={isSubmitting}
            disabled={inventoryLoading || eventsLoading}
            size="lg"
          >
            {isSubmitting ? 'Registrando Préstamo...' : 'Registrar Préstamo'}
          </Button>
        </div>
      </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoanForm;