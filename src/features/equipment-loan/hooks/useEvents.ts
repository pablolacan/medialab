import { useState, useEffect } from 'react';
import { equipmentLoanApi } from '../services/api';
import type { CalendarEvent } from '../types';

interface EventOption {
  value: string;
  label: string;
  type: 'predefined' | 'current';
}

interface UseEventsReturn {
  currentEvents: CalendarEvent[];      // CAMBIAR Event a CalendarEvent
  allEvents: CalendarEvent[];          // CAMBIAR Event a CalendarEvent
  eventOptions: EventOption[];
  primaryEvent: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEvents = (): UseEventsReturn => {
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([]);  // CAMBIAR
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);          // CAMBIAR
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await equipmentLoanApi.getEvents();
      
      if (response.success) {
        const events = response.eventos || [];
        setAllEvents(events);
        
        // Filtrar eventos activos
        const activeEvents = events.filter(event => event.activo);
        setCurrentEvents(activeEvents);
      } else {
        throw new Error('Error al cargar eventos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCurrentEvents([]);
      setAllEvents([]);
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generar opciones para el combobox
  const eventOptions: EventOption[] = [
    // Primero los eventos activos (destacados)
    ...currentEvents.map(event => ({
      value: event.evento,
      label: event.evento,
      type: 'current' as const
    })),
    // Luego eventos recientes no activos (últimos 7 días)
    ...allEvents
      .filter(event => !event.activo)
      .filter(event => {
        const eventDate = new Date(event.inicio);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
      })
      .map(event => ({
        value: event.evento,
        label: event.evento,
        type: 'predefined' as const
      }))
  ];

  // Determinar el evento principal sugerido
  const getPrimaryEvent = (): string => {
    if (currentEvents.length === 0) {
      return '';
    }
    
    if (currentEvents.length === 1) {
      return currentEvents[0].evento;
    }
    
    // Si hay múltiples eventos activos, priorizar por:
    // 1. Eventos que no son de todo el día
    // 2. Eventos que empezaron más recientemente
    const sortedEvents = [...currentEvents].sort((a, b) => {
      const aStart = new Date(a.inicio);
      const bStart = new Date(b.inicio);
      const aEnd = new Date(a.fin);
      const bEnd = new Date(b.fin);
      
      // Verificar si es evento de todo el día (diferencia > 20 horas)
      const aIsAllDay = (aEnd.getTime() - aStart.getTime()) > (20 * 60 * 60 * 1000);
      const bIsAllDay = (bEnd.getTime() - bStart.getTime()) > (20 * 60 * 60 * 1000);
      
      // Priorizar eventos que NO son de todo el día
      if (aIsAllDay && !bIsAllDay) return 1;
      if (!aIsAllDay && bIsAllDay) return -1;
      
      // Si ambos son del mismo tipo, priorizar el más reciente
      return bStart.getTime() - aStart.getTime();
    });
    
    return sortedEvents[0].evento;
  };

  useEffect(() => {
    fetchEvents();
    
    // Actualizar eventos cada 5 minutos
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    currentEvents,
    allEvents,
    eventOptions,
    primaryEvent: getPrimaryEvent(),
    isLoading,
    error,
    refetch: fetchEvents
  };
};

export default useEvents;