import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '../components/comunes/Header';
import { Button } from '../components/comunes/Button';
import { cn } from '../lib/utils';
import { useNegociosPublicos, usePersonalNegocio } from '../hooks/useNegocio';
import {
  useMiPerfil,
  useActualizarPerfil,
  useMisPreferencias,
  useGuardarPreferencias,
} from '../hooks/useUsuario';
import {
  esquemaPerfil,
  esquemaPreferencias,
  DIAS_SEMANA,
  type DiaSemana,
  type PerfilFormValues,
  type PreferenciasFormValues,
} from '../schemas/preferencias';

type Tab = 'informacion' | 'preferencias';

// ─────────────────────────────────────────
// Sub-form: perfil
// ─────────────────────────────────────────
function FormularioPerfil() {
  const { data: usuario, isLoading } = useMiPerfil();
  const { mutate: actualizarPerfil, isPending } = useActualizarPerfil();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: { nombreCompleto: '', telefono: '' },
  });

  // Populate with current profile when data arrives
  useEffect(() => {
    if (usuario) {
      reset({ nombreCompleto: usuario.nombreCompleto, telefono: usuario.telefono });
    }
  }, [usuario, reset]);

  const onSubmit = (datos: PerfilFormValues) => {
    actualizarPerfil({ nombreCompleto: datos.nombreCompleto, telefono: datos.telefono });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nombre completo
        </label>
        <input
          {...register('nombreCompleto')}
          type="text"
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 bg-white text-sm',
            'focus:outline-none focus:border-black transition-colors',
            errors.nombreCompleto ? 'border-red-400' : 'border-gray-200'
          )}
          placeholder="Tu nombre completo"
        />
        {errors.nombreCompleto && (
          <p className="mt-1 text-xs text-red-500">{errors.nombreCompleto.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Telefono
        </label>
        <input
          {...register('telefono')}
          type="tel"
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 bg-white text-sm',
            'focus:outline-none focus:border-black transition-colors',
            errors.telefono ? 'border-red-400' : 'border-gray-200'
          )}
          placeholder="9XXXXXXXX"
        />
        {errors.telefono && (
          <p className="mt-1 text-xs text-red-500">{errors.telefono.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={usuario?.email ?? ''}
          disabled
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">El email no se puede cambiar</p>
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────
// Sub-form: preferencias
// ─────────────────────────────────────────
function FormularioPreferencias() {
  const { data: preferencias, isLoading: cargandoPrefs } = useMisPreferencias();
  const { data: negocios, isLoading: cargandoNegocios } = useNegociosPublicos();
  const { mutate: guardarPreferencias, isPending } = useGuardarPreferencias();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PreferenciasFormValues>({
    resolver: zodResolver(esquemaPreferencias),
    defaultValues: {
      diasPreferentes: [],
      negocioId: null,
      personalId: null,
      comentario: null,
    },
  });

  const negocioIdActual = watch('negocioId');
  const diasActuales = watch('diasPreferentes');

  const { data: personal, isLoading: cargandoPersonal } = usePersonalNegocio(
    negocioIdActual ?? null
  );

  // Populate with existing preferences when data arrives
  useEffect(() => {
    if (preferencias !== undefined) {
      reset({
        diasPreferentes: preferencias?.diasPreferentes ?? [],
        negocioId: preferencias?.negocioId ?? null,
        personalId: preferencias?.personalId ?? null,
        comentario: preferencias?.comentario ?? null,
      });
    }
  }, [preferencias, reset]);

  const toggleDia = (dia: DiaSemana) => {
    const nuevos = diasActuales.includes(dia)
      ? diasActuales.filter((d) => d !== dia)
      : [...diasActuales, dia];
    setValue('diasPreferentes', nuevos as PreferenciasFormValues['diasPreferentes'], {
      shouldValidate: true,
    });
  };

  const handleNegocioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value || null;
    setValue('negocioId', valor as string | null | undefined, { shouldValidate: true });
    setValue('personalId', null, { shouldValidate: false });
  };

  const onSubmit = (datos: PreferenciasFormValues) => {
    guardarPreferencias({
      diasPreferentes: datos.diasPreferentes,
      negocioId: datos.negocioId ?? null,
      personalId: datos.personalId ?? null,
      comentario: datos.comentario ?? null,
    });
  };

  if (cargandoPrefs) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Días preferentes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dias preferentes
        </label>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map(({ value, label }) => {
            const seleccionado = diasActuales.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleDia(value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors',
                  seleccionado
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        {errors.diasPreferentes && (
          <p className="mt-1 text-xs text-red-500">{errors.diasPreferentes.message}</p>
        )}
      </div>

      {/* Negocio preferido */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Negocio preferido
        </label>
        <select
          value={negocioIdActual ?? ''}
          onChange={handleNegocioChange}
          disabled={cargandoNegocios}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 bg-white text-sm',
            'focus:outline-none focus:border-black transition-colors',
            errors.negocioId ? 'border-red-400' : 'border-gray-200'
          )}
        >
          <option value="">Sin preferencia</option>
          {(negocios ?? []).map((n) => (
            <option key={n.id} value={n.id}>
              {n.nombre}
            </option>
          ))}
        </select>
        {errors.negocioId && (
          <p className="mt-1 text-xs text-red-500">{errors.negocioId.message}</p>
        )}
      </div>

      {/* Profesional preferido - solo visible si se seleccionó un negocio */}
      {negocioIdActual && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Profesional preferido
          </label>
          <select
            {...register('personalId')}
            disabled={cargandoPersonal}
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2 bg-white text-sm',
              'focus:outline-none focus:border-black transition-colors',
              errors.personalId ? 'border-red-400' : 'border-gray-200'
            )}
          >
            <option value="">Sin preferencia</option>
            {(personal ?? [])
              .filter((p) => p.activo)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
          </select>
          {errors.personalId && (
            <p className="mt-1 text-xs text-red-500">{errors.personalId.message}</p>
          )}
        </div>
      )}

      {/* Comentario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Comentario adicional
        </label>
        <textarea
          {...register('comentario')}
          rows={3}
          maxLength={500}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 bg-white text-sm resize-none',
            'focus:outline-none focus:border-black transition-colors',
            errors.comentario ? 'border-red-400' : 'border-gray-200'
          )}
          placeholder="Ej: Prefiero citas por la manana"
        />
        {errors.comentario && (
          <p className="mt-1 text-xs text-red-500">{errors.comentario.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Guardando...' : 'Guardar preferencias'}
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────

/**
 * PaginaCuenta - User account page
 * Two tabs: profile information and preferences
 */
export default function PaginaCuenta() {
  const [tabActual, setTabActual] = useState<Tab>('informacion');

  const TABS: { id: Tab; label: string }[] = [
    { id: 'informacion', label: 'Informacion' },
    { id: 'preferencias', label: 'Preferencias' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mi cuenta</h1>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActual(tab.id)}
              className={cn(
                'px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                tabActual === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {tabActual === 'informacion' && <FormularioPerfil />}
          {tabActual === 'preferencias' && <FormularioPreferencias />}
        </div>
      </main>
    </div>
  );
}
