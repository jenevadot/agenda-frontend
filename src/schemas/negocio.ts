import { z } from 'zod';

/**
 * Business creation form schema
 * Implements RF-FE-044, RF-FE-045 validations
 */
export const esquemaCrearNegocio = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .trim(),
  direccion: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[0-9]+$/, 'Solo se permiten números')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type DatosCrearNegocioForm = z.infer<typeof esquemaCrearNegocio>;
