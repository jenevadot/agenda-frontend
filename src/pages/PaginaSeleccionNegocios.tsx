import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, Plus, Calendar, ArrowRight } from 'lucide-react';
import { Header, Footer, Button, SpinnerCarga, MensajeError } from '../components/comunes';
import { ModalCrearNegocio } from '../components/negocios';
import { obtenerMisNegocios } from '../api/negocios';
import { useAuthStore } from '../stores/authStore';

/**
 * Business selection page - shown after login for business owners
 * Displays all businesses owned by the user
 * Implements RF-FE-041, RF-FE-049, RF-FE-050
 */
export default function PaginaSeleccionNegocios() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  const {
    data: negocios,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['negocios'],
    queryFn: obtenerMisNegocios,
  });

  const handleSeleccionarNegocio = (negocioId: string) => {
    navigate(`/admin/${negocioId}`);
  };

  const handleCrearNegocio = () => {
    setModalCrearAbierto(true);
  };

  const handleNegocioCreado = (_negocioId: string) => {
    // Optional: Navigate to the new business dashboard
    // navigate(`/admin/${negocioId}`);
  };

  const handleIrACitas = () => {
    navigate('/citas');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <SpinnerCarga />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <MensajeError
            mensaje="Error al cargar los negocios. Por favor, intenta de nuevo más tarde"
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bienvenido, {usuario?.nombreCompleto?.split(' ')[0] || 'Usuario'}
            </h1>
            <p className="text-lg text-gray-600">
              {usuario?.rol === 'dueno_negocio'
                ? 'Selecciona un negocio para administrar o crea uno nuevo'
                : 'Gestiona tus citas o explora los servicios disponibles'}
            </p>
          </div>

          {/* Client Quick Actions */}
          {usuario?.rol === 'cliente' && (
            <div className="mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Área de Cliente</h2>
                    <p className="text-gray-700">Gestiona tus citas y reservas</p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleIrACitas}
                  className="w-full sm:w-auto"
                >
                  Ver mis citas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Business Owner Section */}
          {usuario?.rol === 'dueno_negocio' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mis Negocios</h2>
                <Button onClick={handleCrearNegocio} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Crear negocio
                </Button>
              </div>

              {!negocios || negocios.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No tienes negocios registrados
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Crea tu primer negocio para comenzar a gestionar tus servicios, personal y
                    citas
                  </p>
                  <Button onClick={handleCrearNegocio} size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Crear mi primer negocio
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {negocios.map((negocio) => (
                    <div
                      key={negocio.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => handleSeleccionarNegocio(negocio.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-purple-600" />
                        </div>
                        {negocio.activo ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            Inactivo
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {negocio.nombre}
                      </h3>

                      <p className="text-sm text-gray-500 mb-4">
                        /{negocio.slug}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                          Administrar
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Dual Role Info */}
          {usuario?.rol === 'dueno_negocio' && (
            <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    ¿Necesitas reservar una cita?
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    También puedes usar tu cuenta como cliente para reservar citas en otros
                    salones
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleIrACitas}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Ver mis citas como cliente
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal de crear negocio (RF-FE-042) */}
      <ModalCrearNegocio
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        onExito={handleNegocioCreado}
      />
    </div>
  );
}
