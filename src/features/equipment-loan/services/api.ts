import type { InventoryResponse, EventsResponse, LoanSubmissionResponse } from '../types';

const BASE_URL = 'https://n8n.thedojolab.com/webhook';

// Utility function for API calls
const apiCall = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const equipmentLoanApi = {
  /**
   * Get all available equipment from inventory
   */
  getInventory: (tipo?: string): Promise<InventoryResponse> => {
    const url = tipo 
      ? `${BASE_URL}/inventario?tipo=${encodeURIComponent(tipo)}`
      : `${BASE_URL}/inventario`;
    
    return apiCall<InventoryResponse>(url);
  },

  /**
   * Get current events from Google Calendar
   */
  getEvents: (): Promise<EventsResponse> => {
    return apiCall<EventsResponse>(`${BASE_URL}/eventos`);
  },

  /**
   * Submit a loan request
   */
  submitLoan: (data: any): Promise<LoanSubmissionResponse> => {
    return apiCall<LoanSubmissionResponse>(`${BASE_URL}/prestamo`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default equipmentLoanApi;