import { FormularioRegistro } from '../components/auth';

/**
 * Premium Registration page with split-screen layout
 */
export default function PaginaRegistro() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-md text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Agenda<span className="font-light text-gray-500">Salon</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Unete a la plataforma de reservas mas moderna
          </p>
          <div className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-gray-500 text-sm">
              Crea tu cuenta y comienza a gestionar tus citas hoy mismo
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <FormularioRegistro />
      </div>
    </div>
  );
}
