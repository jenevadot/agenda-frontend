import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '../comunes';
import { ResumenReserva } from './ResumenReserva';
import { esquemaInfoContacto, type InfoContactoFormulario } from '../../schemas/reserva';
import { generarClaveIdempotencia } from '../../utils/idempotencia';
import { useAuthStore } from '../../stores/authStore';
import { useFlujoReservaStore } from '../../stores/flujoReservaStore';

interface ConfirmacionReservaProps {
  onConfirmar: (datos: InfoContactoFormulario, claveIdempotencia: string) => void;
  onVolver: () => void;
  isLoading: boolean;
}

/**
 * Premium booking confirmation with black/white design
 */
export function ConfirmacionReserva({
  onConfirmar,
  onVolver,
  isLoading,
}: ConfirmacionReservaProps) {
  const { usuario } = useAuthStore();
  const {
    servicioSeleccionado,
    fechaSeleccionada,
    horarioSeleccionado,
    personalSeleccionado,
  } = useFlujoReservaStore();

  // Generate idempotency key once when component mounts
  const claveIdempotencia = useMemo(() => generarClaveIdempotencia(), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfoContactoFormulario>({
    resolver: zodResolver(esquemaInfoContacto),
    defaultValues: {
      // Pre-fill with authenticated user data
      nombre: usuario?.nombreCompleto || '',
      email: usuario?.email || '',
      telefono: usuario?.telefono || '',
    },
  });

  const onSubmit = (datos: InfoContactoFormulario) => {
    onConfirmar(datos, claveIdempotencia);
  };

  // Guard: ensure all required data is present
  if (!servicioSeleccionado || !fechaSeleccionada || !horarioSeleccionado) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500">
          Datos de reserva incompletos. Por favor vuelve al inicio.
        </p>
        <Button onClick={onVolver} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
      {/* Booking summary */}
      <ResumenReserva
        servicio={servicioSeleccionado}
        fecha={fechaSeleccionada}
        horario={horarioSeleccionado}
        personal={personalSeleccionado ?? null}
      />

      {/* Contact form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <h3 className="font-bold text-black text-lg">Datos de contacto</h3>

        <Input
          label="Nombre completo"
          {...register('nombre')}
          error={errors.nombre?.message}
          required
        />

        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          required
        />

        <Input
          label="Telefono"
          type="tel"
          placeholder="9XXXXXXXX"
          {...register('telefono')}
          error={errors.telefono?.message}
          required
        />

        {/* Action buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onVolver}
            disabled={isLoading}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Procesando...' : 'Confirmar Reserva'}
          </Button>
        </div>
      </form>
    </div>
  );
}
