import { z } from 'zod';

/**
 * Contact info validation schema for booking confirmation
 * Implements RF-FE-025 validation rules
 */
export const esquemaInfoContacto = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  email: z
    .string()
    .email('Por favor ingresa un email valido'),
  telefono: z
    .string()
    .regex(/^9\d{8}$/, 'El telefono debe tener formato 9XXXXXXXX (9 digitos)'),
});

export type InfoContactoFormulario = z.infer<typeof esquemaInfoContacto>;
