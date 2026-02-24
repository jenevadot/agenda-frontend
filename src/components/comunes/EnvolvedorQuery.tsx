import type { UseQueryResult } from '@tanstack/react-query';
import { SpinnerCarga } from './SpinnerCarga';
import { MensajeError } from './MensajeError';

interface EnvolvedorQueryProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  mensajeError?: string;
}

/**
 * Query wrapper component that handles loading, error, and success states
 * - If loading: shows SpinnerCarga
 * - If error: shows MensajeError with retry button
 * - If success: renders children with data
 */
export function EnvolvedorQuery<T>({
  query,
  children,
  mensajeError = 'Ha ocurrido un error al cargar los datos',
}: EnvolvedorQueryProps<T>) {
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SpinnerCarga size="lg" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <MensajeError
        mensaje={mensajeError}
        onReintentar={() => query.refetch()}
      />
    );
  }

  if (query.data === undefined) {
    return null;
  }

  return <>{children(query.data)}</>;
}
