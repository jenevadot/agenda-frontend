import { useParams } from 'react-router-dom';
import { Header } from '../components/comunes';
import { ListaServicios } from '../components/reservas';

/**
 * Business public page
 * Shows business info and service catalog
 */
export default function PaginaNegocio() {
  const { negocioId } = useParams<{ negocioId: string }>();

  if (!negocioId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-gray-500">Negocio no encontrado</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nuestros Servicios
          </h1>
          <p className="text-gray-500">
            Selecciona un servicio para reservar tu cita
          </p>
        </div>

        <ListaServicios negocioId={negocioId} />
      </main>
    </div>
  );
}
