import { Store, MapPin, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../comunes/Button';
import type { Negocio } from '../../tipos';

interface TarjetaNegocioProps {
  negocio: Negocio;
  onClick: () => void;
}

/**
 * Business card component for directory listing
 * Displays business info with action to view services
 * Implements RF-FE-010
 */
export function TarjetaNegocio({ negocio, onClick }: TarjetaNegocioProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Business Icon & Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
              {negocio.nombre}
            </h3>
            <p className="text-sm text-gray-500">/{negocio.slug}</p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="space-y-2 mb-4">
        {negocio.direccion && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{negocio.direccion}</span>
          </div>
        )}
        {negocio.telefono && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{negocio.telefono}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-gray-700 hover:text-purple-600 hover:bg-purple-50"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <span>Ver servicios</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
