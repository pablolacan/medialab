import type { InventoryResponse, EventsResponse, LoanSubmissionResponse } from '../types';

const BASE_URL = 'https://n8n.thedojolab.com/webhook';

// Enhanced utility function for API calls with better error handling
const apiCall = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    console.log(`🚀 Making API call to: ${url}`);
    console.log('📤 Request options:', options);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    // Try to get the response body for better error messages
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`API returned invalid JSON. Status: ${response.status}. Response: ${responseText.slice(0, 200)}`);
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`API Error: ${errorMessage}`);
    }

    return responseData;
  } catch (error) {
    console.error('❌ API call failed:', error);
    
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to ${url}. Please check your internet connection and server availability.`);
    }
    
    throw error;
  }
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
   * Submit a loan request with enhanced error handling
   */
  submitLoan: async (data: any): Promise<LoanSubmissionResponse> => {
    console.log('🎯 Submitting loan with data:', data);
    
    try {
      const response = await apiCall<LoanSubmissionResponse>(`${BASE_URL}/prestamo`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('✅ Loan submission response:', response);
      return response;
    } catch (error) {
      console.error('❌ Loan submission failed:', error);
      throw error;
    }
  },
};

export default equipmentLoanApi;