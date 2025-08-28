import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Grid3X3, List, Search } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { formatTime } from '../utils';
import { cn } from '../utils';
import type { CalendarEvent } from '../types';

interface CalendarViewProps {
  onEventSelect: (event: CalendarEvent) => void;
}

type ViewMode = 'week' | 'day' | 'list';

export const CalendarView: React.FC<CalendarViewProps> = ({ onEventSelect }) => {
  const { allEvents, isLoading, error } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [] = useState<string>('all');

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const diasCompletos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Filtrar eventos por búsqueda
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.evento.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.ubicacion && event.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Obtener categorías únicas de eventos

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  const { start: weekStart, end: weekEnd } = getWeekDates(selectedDate);

  const eventosPorDia = React.useMemo(() => {
    const grupos: { [key: string]: CalendarEvent[] } = {};
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(weekStart);
      fecha.setDate(weekStart.getDate() + i);
      const key = fecha.toDateString();
      grupos[key] = [];
    }
    
    filteredEvents.forEach(evento => {
      const fechaEvento = new Date(evento.inicio);
      if (fechaEvento >= weekStart && fechaEvento <= weekEnd) {
        const key = fechaEvento.toDateString();
        if (grupos[key]) {
          grupos[key].push(evento);
        }
      }
    });
    
    Object.keys(grupos).forEach(dia => {
      grupos[dia].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
    });
    
    return grupos;
  }, [filteredEvents, weekStart, weekEnd]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (fecha: Date) => {
    const today = new Date();
    return fecha.toDateString() === today.toDateString();
  };

  const getEventColor = (evento: CalendarEvent) => {
    if (evento.evento.includes('ESTEC')) return 'blue';
    if (evento.evento.includes('BIMBO')) return 'orange';
    if (evento.evento.includes('WALMART')) return 'green';
    if (evento.evento.includes('Cabina') || evento.evento.includes('USO DE')) return 'purple';
    return 'gray';
  };

  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20',
    green: 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20',
    gray: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/20'
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin"></div>
          <Calendar className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-zinc-400 text-lg">Cargando eventos...</p>
        <div className="flex space-x-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-2 h-2 bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-sm"
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-red-400 mb-2">Error al cargar eventos</h3>
        <p className="text-red-300 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
        >
          Reintentar
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Moderno */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl p-6 backdrop-blur-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Título y navegación */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  {weekStart.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-zinc-400 text-sm">
                  {weekStart.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })} - {weekEnd.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-all duration-200 font-medium"
              >
                Hoy
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Selector de vista */}
            <div className="flex bg-zinc-800 rounded-lg p-1">
              {[
                { mode: 'week' as ViewMode, icon: Grid3X3, label: 'Semana' },
                { mode: 'list' as ViewMode, icon: List, label: 'Lista' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-1 rounded transition-all duration-200 text-sm font-medium",
                    viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vista de semana */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {diasSemana.map((dia, index) => {
            const fecha = new Date(weekStart);
            fecha.setDate(weekStart.getDate() + index);
            const fechaKey = fecha.toDateString();
            const eventos = eventosPorDia[fechaKey] || [];
            const esHoy = isToday(fecha);

            return (
              <motion.div
                key={dia}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "bg-gradient-to-b from-zinc-900 to-zinc-800 border rounded-2xl overflow-hidden backdrop-blur-sm",
                  esHoy 
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10" 
                    : "border-zinc-700 hover:border-zinc-600"
                )}
              >
                {/* Header del día */}
                <div className={cn(
                  "p-4 border-b",
                  esHoy 
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20" 
                    : "border-zinc-700"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={cn(
                        "font-semibold text-sm",
                        esHoy ? "text-blue-400" : "text-zinc-200"
                      )}>
                        {dia}
                      </h3>
                      <span className={cn(
                        "text-xs",
                        esHoy ? "text-blue-400" : "text-zinc-400"
                      )}>
                        {fecha.getDate()}
                      </span>
                    </div>
                    {eventos.length > 0 && (
                      <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-full">
                        {eventos.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista de eventos */}
                <div className="p-3 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {eventos.length === 0 ? (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-zinc-500 text-xs text-center py-8"
                      >
                        Sin eventos
                      </motion.p>
                    ) : (
                      eventos.map((evento, eventIndex) => {
                        const inicio = new Date(evento.inicio);
                        const fin = new Date(evento.fin);
                        const ahora = new Date();
                        const esActivo = ahora >= inicio && ahora <= fin;
                        const color = getEventColor(evento);

                        return (
                          <motion.button
                            key={evento.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: eventIndex * 0.02 }}
                            onClick={() => onEventSelect(evento)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "w-full text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden",
                              colorClasses[color],
                              esActivo && "ring-2 ring-green-500/30"
                            )}
                          >
                            {/* Indicador de evento activo */}
                            {esActivo && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"
                              />
                            )}

                            <div className="space-y-1">
                              <h4 className="font-medium text-xs line-clamp-2">
                                {evento.evento}
                              </h4>
                              
                              <div className="flex items-center space-x-1 text-xs opacity-75">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatTime(evento.inicio)}
                                </span>
                              </div>

                              {evento.ubicacion && (
                                <div className="flex items-center space-x-1 text-xs opacity-60">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate text-xs">
                                    {evento.ubicacion}
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Vista de lista */}
      {viewMode === 'list' && (
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-700">
            <h3 className="text-xl font-semibold text-zinc-100">Todos los eventos de la semana</h3>
            <p className="text-zinc-400 mt-1">{Object.values(eventosPorDia).flat().length} eventos encontrados</p>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {Object.entries(eventosPorDia).map(([fechaKey, eventos]) => {
              const fecha = new Date(fechaKey);
              const diaIndex = fecha.getDay();
              
              if (eventos.length === 0) return null;
              
              return (
                <div key={fechaKey} className="border-b border-zinc-700 last:border-b-0">
                  <div className="p-4 bg-zinc-800/50">
                    <h4 className="font-semibold text-zinc-200">
                      {diasCompletos[diaIndex]}, {fecha.getDate()} de {fecha.toLocaleDateString('es-GT', { month: 'long' })}
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {eventos.map((evento) => {
                      const color = getEventColor(evento);
                      const inicio = new Date(evento.inicio);
                      const fin = new Date(evento.fin);
                      const ahora = new Date();
                      const esActivo = ahora >= inicio && ahora <= fin;
                      
                      return (
                        <motion.button
                          key={evento.id}
                          onClick={() => onEventSelect(evento)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border transition-all duration-200 relative",
                            colorClasses[color]
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm mb-2">{evento.evento}</h5>
                              
                              <div className="flex items-center space-x-4 text-xs opacity-75">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(evento.inicio)} - {formatTime(evento.fin)}</span>
                                </div>
                                
                                {evento.ubicacion && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{evento.ubicacion}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {esActivo && (
                              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                                En vivo
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total eventos', value: Object.values(eventosPorDia).flat().length, color: 'blue' },
          { label: 'Eventos activos', value: Object.values(eventosPorDia).flat().filter(e => {
            const ahora = new Date();
            const inicio = new Date(e.inicio);
            const fin = new Date(e.fin);
            return ahora >= inicio && ahora <= fin;
          }).length, color: 'green' },
          { label: 'Próximos', value: Object.values(eventosPorDia).flat().filter(e => {
            const ahora = new Date();
            const inicio = new Date(e.inicio);
            return inicio > ahora;
          }).length, color: 'orange' },
          { label: 'Completados', value: Object.values(eventosPorDia).flat().filter(e => {
            const ahora = new Date();
            const fin = new Date(e.fin);
            return fin < ahora;
          }).length, color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-4 text-center"
          >
            <div className={cn(
              "text-2xl font-bold mb-1",
              stat.color === 'blue' && 'text-blue-400',
              stat.color === 'green' && 'text-green-400',
              stat.color === 'orange' && 'text-orange-400',
              stat.color === 'purple' && 'text-purple-400'
            )}>
              {stat.value}
            </div>
            <div className="text-zinc-400 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};