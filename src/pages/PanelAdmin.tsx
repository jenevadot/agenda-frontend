import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import {
  LayoutAdmin,
  DashboardAdmin,
  GestorServicios,
  GestorPersonal,
  ConfiguradorHorarios,
  GestorExcepciones,
  CalendarioAgenda,
} from '../components/admin';

/**
 * Admin panel page with nested routes
 * Only accessible for business owners (dueno_negocio role)
 */
export default function PanelAdmin() {
  const { negocioId } = useParams<{ negocioId: string }>();

  if (!negocioId) {
    return <Navigate to="/" replace />;
  }

  return (
    <LayoutAdmin negocioId={negocioId}>
      <Routes>
        {/* Dashboard */}
        <Route index element={<DashboardAdmin negocioId={negocioId} />} />

        {/* Services management */}
        <Route
          path="servicios"
          element={<GestorServicios negocioId={negocioId} />}
        />

        {/* Business hours configuration */}
        <Route
          path="horarios"
          element={
            <div className="space-y-6">
              <ConfiguradorHorarios negocioId={negocioId} />
              <GestorExcepciones negocioId={negocioId} />
            </div>
          }
        />

        {/* Appointments calendar */}
        <Route
          path="agenda"
          element={<CalendarioAgenda negocioId={negocioId} />}
        />

        {/* Staff management */}
        <Route
          path="personal"
          element={<GestorPersonal negocioId={negocioId} />}
        />

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </LayoutAdmin>
  );
}
