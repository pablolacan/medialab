import { useState, useEffect } from 'react';
import { equipmentLoanApi } from '../services/api';
import type { Equipment } from '../types';

interface UseInventoryReturn {
  equipments: Equipment[];
  availableTypes: string[];
  isLoading: boolean;
  error: string | null;
  getEquipmentsByType: (type: string) => Equipment[];
  refetch: () => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching inventory...');
      const response = await equipmentLoanApi.getInventory();
      console.log('📦 Raw inventory response:', response);
      
      if (response.success) {
        const rawEquipments = response.equipos || [];
        console.log('📋 Raw equipments array:', rawEquipments);
        
        // Mapear y normalizar los datos del inventario
        const normalizedEquipments: Equipment[] = rawEquipments.map((item: any) => {
          // El campo puede venir como "Requiere Autorizacioń?" desde n8n
          const autorizacion = Boolean(
            item.autorizacion || 
            item["Requiere Autorizacioń?"] || 
            item["Requiere Autorización?"] ||
            item.requiere_autorizacion ||
            false
          );
          
          const equipment: Equipment = {
            tipo: item.tipo || item["Tipo Equipo"] || '',
            id: item.id || item["ID Equipo"] || '',
            estado: item.estado || item.Estado || '',
            autorizacion: autorizacion
          };
          
          console.log(`📱 Equipment ${equipment.id}:`, {
            tipo: equipment.tipo,
            estado: equipment.estado,
            autorizacion: equipment.autorizacion,
            originalData: item
          });
          
          return equipment;
        });
        
        console.log('✅ Normalized equipments:', normalizedEquipments);
        setEquipments(normalizedEquipments);
      } else {
        throw new Error('Error al cargar inventario');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error fetching inventory:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getEquipmentsByType = (type: string): Equipment[] => {
    const filtered = equipments.filter(eq => 
      eq.tipo.toLowerCase() === type.toLowerCase()
    );
    
    console.log(`🔍 Filtering equipments by type "${type}":`, {
      totalEquipments: equipments.length,
      filteredCount: filtered.length,
      filtered: filtered.map(eq => ({ 
        id: eq.id, 
        estado: eq.estado, 
        autorizacion: eq.autorizacion 
      }))
    });
    
    return filtered;
  };

  const availableTypes = Array.from(
    new Set(equipments.map(eq => eq.tipo).filter(Boolean))
  );

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    equipments,
    availableTypes,
    isLoading,
    error,
    getEquipmentsByType,
    refetch: fetchInventory
  };
};