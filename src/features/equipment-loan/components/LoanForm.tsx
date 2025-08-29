import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { DatePicker } from './ui/DatePicker';
import { EventSelect } from './ui/EventSelect';
import { useInventory } from '../hooks/useInventory';
import { useEvents } from '../hooks/useEvents';
import { useLoanSubmission } from '../hooks/useLoanSubmission';
import { validateForm, getFieldError } from '../utils/validation';
import { getGuatemalaDateTime } from '../utils';
import { getGuatemalaDateString } from './ui/DatePicker';
import { useAuth } from '../../../hooks/useAuth';
import type { LoanFormData, CalendarEvent, Equipment } from '../types';

interface LoanFormProps {
  selectedEvent?: CalendarEvent | null;
}

const calculateLoanDates = (eventoInicio: string, eventoFin: string) => {
  const inicio = new Date(eventoInicio);
  const fin = new Date(eventoFin);
  
  const fechaPrestamo = new Date(inicio.getTime() - (60 * 60 * 1000));
  const fechaDevolucion = new Date(fin.getTime() + (60 * 60 * 1000));
  
  return {
    fechaPrestamo: fechaPrestamo.toISOString(),
    fechaDevolucion: fechaDevolucion.toISOString()
  };
};

// Helper function para obtener información del equipo seleccionado
const getSelectedEquipmentInfo = (equipmentId: string, equipments: Equipment[]) => {
  const found = equipments.find(eq => eq.id === equipmentId);
  console.log(`🔍 Looking for equipment ID: ${equipmentId}`);
  console.log('📋 Available equipments:', equipments.map(eq => ({ id: eq.id, autorizacion: eq.autorizacion })));
  console.log('✅ Found equipment:', found);
  return found;
};

export const LoanForm: React.FC<LoanFormProps> = ({ selectedEvent }) => {
  const { user, name, email } = useAuth();
  
  const [formData, setFormData] = useState<LoanFormData>({
    nombreCompleto: name || '',
    contacto: email || '',
    tipoEquipo: '',
    equipoId: '',
    evento: '',
    fecha: getGuatemalaDateString(),
    fechaPrestamo: '',
    fechaDevolucion: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<any>({});
  
  const { 
    availableTypes, 
    getEquipmentsByType, 
    isLoading: inventoryLoading 
  } = useInventory();
  
  const { 
    currentEvents,
    eventOptions,
    isLoading: eventsLoading 
  } = useEvents();
  
  const { 
    submitLoan, 
    isSubmitting, 
    isSuccess, 
    error: submissionError,
    reset 
  } = useLoanSubmission();

  // Obtener información del equipo seleccionado con debugging mejorado
  const selectedEquipment = formData.equipoId 
    ? getSelectedEquipmentInfo(formData.equipoId, getEquipmentsByType(formData.tipoEquipo))
    : null;

  const requiresAuthorization = selectedEquipment?.autorizacion || false;

  // Debug logging para autorización
  useEffect(() => {
    if (formData.equipoId) {
      console.log('🔍 Authorization Debug Info:');
      console.log('Selected Equipment ID:', formData.equipoId);
      console.log('Selected Equipment Object:', selectedEquipment);
      console.log('Requires Authorization:', requiresAuthorization);
      console.log('Equipment Type:', formData.tipoEquipo);
      console.log('Available Equipments for Type:', getEquipmentsByType(formData.tipoEquipo));
    }
  }, [formData.equipoId, selectedEquipment, requiresAuthorization, formData.tipoEquipo, getEquipmentsByType]);

  useEffect(() => {
    if (name && !formData.nombreCompleto) {
        setFormData(prev => ({ ...prev, nombreCompleto: name }));
    }
    if (email && !formData.contacto) {
        setFormData(prev => ({ ...prev, contacto: email }));
    }
    if (selectedEvent && !formData.evento) {
        const { fechaPrestamo, fechaDevolucion } = calculateLoanDates(
        selectedEvent.inicio,
        selectedEvent.fin
        );
        setFormData(prev => ({
        ...prev,
        evento: selectedEvent.evento,
        fecha: new Date(selectedEvent.inicio).toISOString().split('T')[0],
        fechaPrestamo,
        fechaDevolucion
        }));
    }
  }, [name, email, formData.nombreCompleto, formData.contacto, selectedEvent, formData.evento]);

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    // Bloquear edición de campos automáticos si el usuario está logueado
    if ((field === 'nombreCompleto' || field === 'contacto') && user) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors((prev: typeof validationErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEventInputChange = (value: string) => {
    handleInputChange('evento', value);
  };

  const handleEventSelectChange = (value: string) => {
    handleInputChange('evento', value);
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tipoEquipo: type,
      equipoId: ''
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
    
    // Log datos antes del envío incluyendo información de autorización
    console.log('📤 Submitting loan with authorization info:');
    console.log('Form Data:', formData);
    console.log('Selected Equipment:', selectedEquipment);
    console.log('Requires Authorization:', requiresAuthorization);
    
    // Agregar el campo de autorización a los datos del formulario
    const submissionData = {
      ...formData,
      requiereAutorizacion: requiresAuthorization
    };
    
    await submitLoan(submissionData);
  };

  const handleNewLoan = () => {
    setFormData({
      nombreCompleto: name || '',
      contacto: email || '',
      tipoEquipo: '',
      equipoId: '',
      evento: '',
      fecha: getGuatemalaDateString(),
      fechaPrestamo: '',
      fechaDevolucion: ''
    });
    reset();
  };

  const equipmentOptions = formData.tipoEquipo 
    ? getEquipmentsByType(formData.tipoEquipo).map(eq => ({
        value: eq.id,
        label: `${eq.id} - ${eq.estado}${eq.autorizacion ? ' ⚠️ (Requiere autorización)' : ''}`
      }))
    : [];

  const typeOptions = availableTypes.map(type => ({
    value: type,
    label: type
  }));

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            {/* Success Icon - Conditional based on authorization */}
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-2 ${
              requiresAuthorization 
                ? 'bg-amber-500/20 border-amber-500/30'
                : 'bg-green-500/20 border-green-500/30'
            }`}>
              {requiresAuthorization ? (
                <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            {/* Success Message */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-zinc-100">
                {requiresAuthorization 
                  ? '⏳ Solicitud de Préstamo Enviada' 
                  : '✅ Préstamo Registrado Exitosamente'
                }
              </h2>
              <p className="text-zinc-400 text-lg">
                {requiresAuthorization
                  ? 'Tu solicitud está pendiente de autorización. Recibirás una notificación cuando sea aprobada.'
                  : 'El equipo ha sido asignado y está listo para ser retirado.'
                }
              </p>
            </div>

            {/* Loan Summary Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-left">
              <h3 className="text-xl font-semibold text-zinc-100 mb-6 text-center">
                Resumen del Préstamo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-zinc-400 text-sm font-medium">Usuario Responsable</span>
                  <p className="text-zinc-200 font-semibold text-lg">{formData.nombreCompleto}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-zinc-400 text-sm font-medium">Email de Contacto</span>
                  <p className="text-zinc-200 font-semibold text-lg">{formData.contacto}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-zinc-400 text-sm font-medium">Equipo Asignado</span>
                  <p className="text-zinc-200 font-semibold text-lg">{formData.equipoId}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-zinc-400 text-sm font-medium">Evento</span>
                  <p className="text-zinc-200 font-semibold text-lg">{formData.evento}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-zinc-400 text-sm font-medium">Fecha</span>
                  <p className="text-zinc-200 font-semibold text-lg">
                    {new Date(formData.fecha + 'T00:00:00').toLocaleDateString('es-GT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {formData.fechaPrestamo && formData.fechaDevolucion && (
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-sm font-medium">Horario del Préstamo</span>
                    <div className="text-zinc-200 font-semibold text-sm">
                      <p>Préstamo: {new Date(formData.fechaPrestamo).toLocaleString('es-GT')}</p>
                      <p>Devolución: {new Date(formData.fechaDevolucion).toLocaleString('es-GT')}</p>
                    </div>
                  </div>
                )}

                {/* Alerta de autorización en resumen */}
                {requiresAuthorization && (
                  <div className="col-span-full bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-amber-400 font-semibold text-sm">Estado: Pendiente de autorización</p>
                        <p className="text-amber-300 text-xs">
                          Un administrador debe aprobar este préstamo antes de poder retirar el equipo. 
                          Te notificaremos por email cuando sea aprobado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmación de préstamo automático */}
                {!requiresAuthorization && (
                  <div className="col-span-full bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-green-400 font-semibold text-sm">Estado: Préstamo Autorizado</p>
                        <p className="text-green-300 text-xs">
                          El equipo está listo para ser retirado. Puedes proceder según el horario establecido.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button 
                onClick={handleNewLoan} 
                className="w-full max-w-md mx-auto" 
                size="lg"
              >
                Registrar Otro Préstamo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-zinc-100">
                Nuevo Préstamo de Equipo
              </h1>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Complete la información para registrar el préstamo de equipo. 
                Los campos marcados con * son obligatorios.
              </p>
            </div>
            
            {/* Timezone Info */}
            <div className="inline-flex items-center space-x-3 bg-zinc-900 border border-zinc-800 rounded-lg px-6 py-3">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-zinc-300 font-medium">
                Fecha actual en Guatemala: {getGuatemalaDateTime().formatted}
              </span>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* User Field */}
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
                    <p className="text-xs text-zinc-500 mt-2">
                      Usuario actual: {user?.email}
                    </p>
                  )}
                </div>

                {/* Contact Field */}
                <div className="relative">
                  <Input
                    label="Email de Contacto"
                    type="email"
                    value={formData.contacto}
                    onChange={(e) => handleInputChange('contacto', e.target.value)}
                    error={getFieldError(validationErrors, 'contacto')}
                    required
                    disabled={!!email || isSubmitting}
                    className={email ? 'bg-zinc-800 cursor-not-allowed' : ''}
                  />
                  {email && (
                    <div className="absolute right-3 top-8 text-zinc-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                  {email && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Email automático de la cuenta
                    </p>
                  )}
                </div>

                {/* Equipment Type */}
                <Select
                  label="Tipo de Equipo"
                  value={formData.tipoEquipo}
                  onChange={handleTypeChange}
                  options={typeOptions}
                  error={getFieldError(validationErrors, 'tipoEquipo')}
                  required
                  disabled={inventoryLoading || isSubmitting}
                />

                {/* Specific Equipment */}
                <AnimatePresence>
                  {formData.tipoEquipo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
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
                      
                      {/* Alerta de autorización - Aparece dinámicamente */}
                      <AnimatePresence>
                        {requiresAuthorization && formData.equipoId && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
                          >
                            <div className="flex items-start space-x-3">
                              <svg className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <div>
                                <h4 className="text-amber-400 font-semibold mb-1">
                                  ⚠️ Equipo requiere autorización
                                </h4>
                                <p className="text-amber-300 text-sm">
                                  El equipo <strong>{formData.equipoId}</strong> requiere autorización previa. 
                                  Tu solicitud quedará pendiente hasta ser aprobada por un administrador.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Event */}
                <EventSelect
                  label="Evento"
                  inputValue={formData.evento}
                  onInputChange={handleEventInputChange}
                  onSelectChange={handleEventSelectChange}
                  options={eventOptions}
                  error={getFieldError(validationErrors, 'evento')}
                  helperText={
                    eventsLoading 
                      ? "Cargando eventos..." 
                      : currentEvents.length > 0
                        ? `${currentEvents.length} eventos activos disponibles`
                        : "No hay eventos activos - escribe el nombre del evento"
                  }
                  required
                  disabled={isSubmitting}
                />

                {/* Date */}
                <DatePicker
                  label="Fecha del Préstamo"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  error={getFieldError(validationErrors, 'fecha')}
                  required
                  disabled={isSubmitting}
                  helperText="Fechas permitidas: desde 2020 hasta el próximo año"
                />

                {/* Fechas calculadas - Solo mostrar si hay datos */}
                {(formData.fechaPrestamo || formData.fechaDevolucion) && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-medium text-zinc-200 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Horarios de Préstamo</span>
                    </h3>
                    
                    {formData.fechaPrestamo && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Préstamo:</span>
                        <span className="text-zinc-200 ml-2 font-medium">
                          {new Date(formData.fechaPrestamo).toLocaleString('es-GT')}
                        </span>
                      </div>
                    )}
                    
                    {formData.fechaDevolucion && (
                      <div className="text-sm">
                        <span className="text-zinc-400">Devolución:</span>
                        <span className="text-zinc-200 ml-2 font-medium">
                          {new Date(formData.fechaDevolucion).toLocaleString('es-GT')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {submissionError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-red-400 font-semibold mb-1">Error al registrar préstamo</h4>
                      <p className="text-red-300">{submissionError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="pt-8">
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
        </motion.div>
      </div>
    </div>
  );
};

export default LoanForm;