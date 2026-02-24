import { X, Mail, Phone } from 'lucide-react';
import { Button } from './comunes';
import { CONTACTO_CONFIG } from '../config/contacto';

interface ModalContactoNegocioProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function ModalContactoNegocio({ abierto, onCerrar }: ModalContactoNegocioProps) {
  if (!abierto) return null;

  const infoContacto = {
    email: CONTACTO_CONFIG.email,
    telefono: CONTACTO_CONFIG.telefono,
    mensaje: CONTACTO_CONFIG.mensajeRegistroNegocio
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCerrar}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Registra tu Negocio
            </h2>
            <p className="text-gray-600 mt-2">
              {infoContacto.mensaje}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 my-6">
          {/* Email */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Correo Electrónico
              </p>
              <a
                href={`mailto:${infoContacto.email}`}
                className="text-base font-semibold text-blue-600 hover:underline break-all"
              >
                {infoContacto.email}
              </a>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Teléfono / WhatsApp
              </p>
              <a
                href={`tel:${infoContacto.telefono.replace(/\s/g, '')}`}
                className="text-base font-semibold text-green-600 hover:underline"
              >
                {infoContacto.telefono}
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onCerrar}
          >
            Cerrar
          </Button>
          <Button
            onClick={() => {
              window.location.href = `mailto:${infoContacto.email}`;
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enviar correo
          </Button>
        </div>
      </div>
    </div>
  );
}
