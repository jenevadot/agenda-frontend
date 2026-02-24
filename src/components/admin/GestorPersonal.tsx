import { Users } from 'lucide-react';

interface Props {
  negocioId: string;
}

/**
 * Placeholder component for staff management
 * To be implemented in a future task
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GestorPersonal(_props: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Gestion de Personal
          </h2>
          <p className="text-sm text-gray-500">
            Administra el personal de tu negocio
          </p>
        </div>
      </div>

      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Proximamente</p>
        <p className="text-sm mt-1">
          Esta seccion estara disponible pronto
        </p>
      </div>
    </div>
  );
}
