import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { esquemaRegistro, type DatosRegistroForm } from '../../schemas/auth';
import { registrarUsuario } from '../../api/auth';
import { Button, useNotificacion } from '../comunes';
import { cn } from '../../lib/utils';

/**
 * Premium Registration form with modern black/white design
 */
export function FormularioRegistro() {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useNotificacion();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DatosRegistroForm>({
    resolver: zodResolver(esquemaRegistro),
    mode: 'onBlur',
  });

  const mutation = useMutation({
    mutationFn: registrarUsuario,
    onSuccess: () => {
      mostrarExito('Cuenta creada exitosamente. Inicia sesion para continuar.');
      navigate('/login');
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
          : 'Error al crear la cuenta. Intenta de nuevo.';
      mostrarError(mensaje);
    },
  });

  const onSubmit = (data: DatosRegistroForm) => {
    mutation.mutate({
      email: data.email,
      contrasena: data.contrasena,
      nombreCompleto: data.nombreCompleto,
      telefono: data.telefono,
    });
  };

  const inputClasses = (hasError: boolean) =>
    cn(
      'w-full px-5 py-4 text-base border-2 rounded-xl transition-all duration-200',
      'placeholder:text-gray-400',
      'hover:border-gray-300 hover:bg-gray-50/50',
      'focus:outline-none focus:border-black focus:bg-white',
      hasError ? 'border-black' : 'border-gray-200'
    );

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
            Crear cuenta
          </h1>
          <p className="text-gray-500">
            Ingresa tus datos para comenzar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Ingresa tu nombre completo"
              className={inputClasses(!!errors.nombreCompleto)}
              {...register('nombreCompleto')}
            />
            {errors.nombreCompleto && (
              <p className="mt-2 text-sm text-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {errors.nombreCompleto.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              className={inputClasses(!!errors.email)}
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
              Telefono
            </label>
            <input
              type="tel"
              placeholder="912345678"
              className={inputClasses(!!errors.telefono)}
              {...register('telefono')}
            />
            <p className="mt-2 text-sm text-gray-500">
              Formato: 9XXXXXXXX (9 digitos empezando con 9)
            </p>
            {errors.telefono && (
              <p className="mt-2 text-sm text-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {errors.telefono.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Contrasena
            </label>
            <input
              type="password"
              placeholder="Minimo 8 caracteres"
              className={inputClasses(!!errors.contrasena)}
              {...register('contrasena')}
            />
            <p className="mt-2 text-sm text-gray-500">
              Debe contener al menos una mayuscula, una minuscula y un numero
            </p>
            {errors.contrasena && (
              <p className="mt-2 text-sm text-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {errors.contrasena.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Confirmar contrasena
            </label>
            <input
              type="password"
              placeholder="Repite tu contrasena"
              className={inputClasses(!!errors.confirmarContrasena)}
              {...register('confirmarContrasena')}
            />
            {errors.confirmarContrasena && (
              <p className="mt-2 text-sm text-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                {errors.confirmarContrasena.message}
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
            Crear cuenta
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-center text-gray-500">
            Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="text-black font-medium hover:underline underline-offset-4"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500 px-4">
        Al crear una cuenta, aceptas los terminos de servicio y la politica de privacidad.
      </p>
    </div>
  );
}
