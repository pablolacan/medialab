import { useState, useEffect } from 'react';
import { equipmentLoanApi } from '../services/api';
import type { Event } from '../types';

interface UseEventsReturn {
  currentEvent: string;
  events: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEvents = (): UseEventsReturn => {
  const [currentEvent, setCurrentEvent] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await equipmentLoanApi.getEvents();
      
      if (response.success) {
        setCurrentEvent(response.eventoActual || 'Sin evento activo');
        setEvents(response.eventos || []);
      } else {
        throw new Error('Error al cargar eventos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCurrentEvent('Sin evento activo');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Actualizar eventos cada 5 minutos
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    currentEvent,
    events,
    isLoading,
    error,
    refetch: fetchEvents
  };
};

export default useEvents;