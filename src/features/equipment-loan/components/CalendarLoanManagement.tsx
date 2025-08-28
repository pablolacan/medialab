// src/features/equipment-loan/components/CalendarLoanManagement.tsx
import React, { useState } from 'react';
import { CalendarView } from './CalendarView';
import { LoanForm } from './LoanForm';
import type { CalendarEvent } from '../types';

export const CalendarLoanManagement: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleBackToCalendar = () => {
    setShowForm(false);
    setSelectedEvent(null);
  };

  if (showForm && selectedEvent) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToCalendar}
          className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al calendario</span>
        </button>
        
        <LoanForm selectedEvent={selectedEvent} />
      </div>
    );
  }

  return <CalendarView onEventSelect={handleEventSelect} />;
};