export interface Equipment {
  tipo: string;
  id: string;
  estado: string;
}

export interface Event {
  nombre: string;
  inicio: string;
  fin: string;
  activo: boolean;
}

export interface LoanFormData {
  nombreCompleto: string;
  tipoEquipo: string;
  equipoId: string;
  evento: string;
  fecha: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface InventoryResponse {
  success: boolean;
  equipos: Equipment[];
  total: number;
}

export interface EventsResponse {
  success: boolean;
  eventoActual: string;
  eventos: Event[];
  timestamp: string;
}

export interface LoanSubmissionResponse {
  success: boolean;
  message: string;
}