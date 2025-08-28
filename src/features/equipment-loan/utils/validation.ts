import { z } from 'zod';

export const loanFormSchema = z.object({
  nombreCompleto: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  tipoEquipo: z
    .string()
    .min(1, 'Debes seleccionar un tipo de equipo'),
  
  equipoId: z
    .string()
    .min(1, 'Debes seleccionar un equipo específico'),
  
  evento: z
    .string()
    .min(1, 'El evento es requerido'),
  
  fecha: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'La fecha no puede ser anterior a hoy')
});

export type LoanFormData = z.infer<typeof loanFormSchema>;

// Utility functions for form validation
export const validateForm = (data: unknown) => {
  return loanFormSchema.safeParse(data);
};

export const getFieldError = (
  errors: z.ZodFormattedError<LoanFormData> | undefined,
  field: keyof LoanFormData
): string | undefined => {
  return errors?.[field]?._errors?.[0];
};