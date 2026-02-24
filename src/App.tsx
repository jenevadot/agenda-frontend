import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/comunes/Notificacion';
import { RutaProtegida } from './components/auth';
import { DevAutoLoginProvider } from './utils/devAutoLogin';
import PaginaInicio from './pages/PaginaInicio';
import PaginaLogin from './pages/PaginaLogin';
import PaginaRegistro from './pages/PaginaRegistro';
import PaginaSeleccionNegocios from './pages/PaginaSeleccionNegocios';
import PaginaNegocios from './pages/PaginaNegocios';
import PaginaCitas from './pages/PaginaCitas';
import PaginaReserva from './pages/PaginaReserva';
import PaginaNegocio from './pages/PaginaNegocio';
import PaginaDetalleCita from './pages/PaginaDetalleCita';
import PaginaEditarCita from './pages/PaginaEditarCita';
import PanelAdmin from './pages/PanelAdmin';

// Create QueryClient with configuration from RF-FE-051
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as { response?: { status?: number } }).response;
          if (response?.status && response.status >= 400 && response.status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DevAutoLoginProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PaginaInicio />} />
              <Route path="/login" element={<PaginaLogin />} />
              <Route path="/registro" element={<PaginaRegistro />} />

              {/* Business discovery/directory */}
              <Route path="/negocios" element={<PaginaNegocios />} />

              {/* Business public page */}
              <Route path="/negocio/:negocioId" element={<PaginaNegocio />} />

              {/* Booking flow (public but service catalog visible) */}
              <Route path="/reservar/:negocioId" element={<PaginaReserva />} />

              {/* Protected routes - Dashboard / Business Selection */}
              <Route
                path="/dashboard"
                element={
                  <RutaProtegida>
                    <PaginaSeleccionNegocios />
                  </RutaProtegida>
                }
              />

              {/* Protected routes - My Appointments */}
              <Route
                path="/citas"
                element={
                  <RutaProtegida>
                    <PaginaCitas />
                  </RutaProtegida>
                }
              />

              {/* Appointment detail */}
              <Route
                path="/citas/:negocioId/:citaId"
                element={
                  <RutaProtegida>
                    <PaginaDetalleCita />
                  </RutaProtegida>
                }
              />

              {/* Edit appointment */}
              <Route
                path="/citas/:negocioId/:citaId/editar"
                element={
                  <RutaProtegida>
                    <PaginaEditarCita />
                  </RutaProtegida>
                }
              />

              {/* Admin panel - protected for business owners */}
              <Route
                path="/admin/:negocioId/*"
                element={
                  <RutaProtegida rolesPermitidos={['dueno_negocio']}>
                    <PanelAdmin />
                  </RutaProtegida>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </DevAutoLoginProvider>
    </QueryClientProvider>
  );
}

export default App;
