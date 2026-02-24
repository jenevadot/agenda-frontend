import { useNavigate } from 'react-router-dom';
import { Store, Search } from 'lucide-react';
import { Header, Footer, SpinnerCarga, MensajeError } from '../components/comunes';
import { TarjetaNegocio } from '../components/negocios';
import { useNegociosPublicos } from '../hooks';

/**
 * Business directory page - Browse available salons
 * Implements RF-FE-009, RF-FE-010, RF-FE-011, RF-FE-013, RF-FE-014
 */
export default function PaginaNegocios() {
  const navigate = useNavigate();
  const { data: negocios, isLoading, error, refetch } = useNegociosPublicos();

  const handleSeleccionarNegocio = (negocioId: string) => {
    navigate(`/negocio/${negocioId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Descubre Salones
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora los salones disponibles y reserva tu próxima cita
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <SpinnerCarga />
              <p className="text-gray-500 mt-4">Cargando negocios...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-md mx-auto">
              <MensajeError mensaje="Error al cargar los negocios. Por favor, intenta de nuevo." />
              <div className="mt-4 text-center">
                <button
                  onClick={() => refetch()}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && negocios && negocios.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay negocios disponibles
              </h3>
              <p className="text-gray-600">
                Vuelve pronto para descubrir nuevos salones
              </p>
            </div>
          )}

          {/* Success State - Business Grid */}
          {!isLoading && !error && negocios && negocios.length > 0 && (
            <>
              <div className="mb-6 text-sm text-gray-600">
                Mostrando {negocios.length} {negocios.length === 1 ? 'negocio' : 'negocios'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {negocios.map((negocio) => (
                  <TarjetaNegocio
                    key={negocio.id}
                    negocio={negocio}
                    onClick={() => handleSeleccionarNegocio(negocio.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
