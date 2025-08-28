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
      
      const response = await equipmentLoanApi.getInventory();
      
      if (response.success) {
        setEquipments(response.equipos || []);
      } else {
        throw new Error('Error al cargar inventario');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEquipmentsByType = (type: string): Equipment[] => {
    return equipments.filter(eq => 
      eq.tipo.toLowerCase() === type.toLowerCase()
    );
  };

  const availableTypes = Array.from(
    new Set(equipments.map(eq => eq.tipo))
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