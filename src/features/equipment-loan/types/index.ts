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

// ACTUALIZADO: Tipo para manejar tanto el formato estándar como la respuesta real de n8n
export interface LoanSubmissionResponse {
  // Formato estándar (por si n8n lo usa en el futuro)
  success?: boolean;
  message?: string;
  
  // Formato actual de n8n
  Fecha?: string;
  Estado?: string;
  "Fecha Devolucion"?: string;
  
  // Para permitir cualquier otra propiedad que n8n pueda devolver
  [key: string]: any;
}