import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { esquemaLogin, type DatosLoginForm } from '../../schemas/auth';
import { iniciarSesion } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Button, useNotificacion } from '../comunes';
import { cn } from '../../lib/utils';

/**
 * Premium Login form with modern black/white design
 */
export function FormularioLogin() {
  const navigate = useNavigate();
  const { mostrarError } = useNotificacion();
  const iniciarSesionStore = useAuthStore((state) => state.iniciarSesion);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DatosLoginForm>({
    resolver: zodResolver(esquemaLogin),
    mode: 'onBlur',
  });

  const mutation = useMutation({
    mutationFn: iniciarSesion,
    onSuccess: (data) => {
      iniciarSesionStore(data.usuario, data.token);
      // Small delay to ensure zustand persist completes
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    },
    onError: (error: unknown) => {
      const mensaje =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'mensaje' in error.response.data
          ? String(error.response.data.mensaje)
          : 'Credenciales invalidas. Verifica tu email y contrasena.';
      mostrarError(mensaje);
    },
  });

  const onSubmit = (data: DatosLoginForm) => {
    mutation.mutate({
      email: data.email,
      contrasena: data.contrasena,
    });
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10">
        <div className="text-center mb-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-6">
            <span className="text-2xl font-bold tracking-tight text-black">
              Agenda
            </span>
            <span className="text-2xl font-light tracking-tight text-gray-400">
              Salon
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 tracking-tight">
            Bienvenido
          </h1>
          <p className="text-gray-500">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              className={cn(
                'w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200',
                'placeholder:text-gray-400',
                'hover:border-gray-300 hover:bg-gray-50/50',
                'focus:outline-none focus:border-black focus:bg-white',
                errors.email ? 'border-black' : 'border-gray-200'
              )}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Contrasena
            </label>
            <input
              type="password"
              placeholder="Tu contrasena"
              className={cn(
                'w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200',
                'placeholder:text-gray-400',
                'hover:border-gray-300 hover:bg-gray-50/50',
                'focus:outline-none focus:border-black focus:bg-white',
                errors.contrasena ? 'border-black' : 'border-gray-200'
              )}
              {...register('contrasena')}
            />
            {errors.contrasena && (
              <p className="mt-2 text-sm text-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {errors.contrasena.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!isValid || mutation.isPending}
            loading={mutation.isPending}
            className="mt-8"
          >
            Iniciar sesion
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-center text-gray-500">
            No tienes una cuenta?{' '}
            <Link
              to="/registro"
              className="text-black font-medium hover:underline underline-offset-4"
            >
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
