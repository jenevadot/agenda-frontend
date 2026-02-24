import { z } from 'zod';

/**
 * Registration form schema
 * Implements RF-FE-002, RF-FE-003 validations
 */
export const esquemaRegistro = z
  .object({
    email: z
      .string()
      .min(1, 'Email es requerido')
      .email('Email inválido'),
    contrasena: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmarContrasena: z.string(),
    nombreCompleto: z
      .string()
      .min(2, 'Mínimo 2 caracteres'),
    telefono: z
      .string()
      .regex(/^9\d{8}$/, 'Formato: 9XXXXXXXX (9 dígitos)'),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  });

export type DatosRegistroForm = z.infer<typeof esquemaRegistro>;

/**
 * Login form schema
 */
export const esquemaLogin = z.object({
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email inválido'),
  contrasena: z
    .string()
    .min(1, 'Contraseña es requerida'),
});

export type DatosLoginForm = z.infer<typeof esquemaLogin>;
