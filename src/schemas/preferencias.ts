import { z } from 'zod';

const DIAS_VALIDOS = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
] as const;

export const DIAS_SEMANA: { value: (typeof DIAS_VALIDOS)[number]; label: string }[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miercoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sabado' },
  { value: 'domingo', label: 'Domingo' },
];

export const esquemaPreferencias = z.object({
  diasPreferentes: z.array(z.enum(DIAS_VALIDOS)),
  negocioId: z.string().uuid().nullable().optional(),
  personalId: z.string().uuid().nullable().optional(),
  comentario: z.string().max(500, 'Maximo 500 caracteres').nullable().optional(),
});

export type DiaSemana = (typeof DIAS_VALIDOS)[number];
export type PreferenciasFormValues = z.infer<typeof esquemaPreferencias>;

export const esquemaPerfil = z.object({
  nombreCompleto: z
    .string()
    .min(2, 'Minimo 2 caracteres')
    .max(255, 'Maximo 255 caracteres'),
  telefono: z
    .string()
    .regex(/^9\d{8}$/, 'Formato: 9XXXXXXXX (9 digitos comenzando con 9)'),
});

export type PerfilFormValues = z.infer<typeof esquemaPerfil>;
