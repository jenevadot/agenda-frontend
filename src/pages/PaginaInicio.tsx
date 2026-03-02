import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Store, Check, Smartphone, ChevronDown } from 'lucide-react';
import { Header, Footer, Button } from '../components/comunes';
import { ModalContactoNegocio } from '../components/ModalContactoNegocio';

// Feature data for Business section
const businessFeatures = [
  {
    title: 'Panel de administracion completo',
    description: 'Gestiona servicios, personal y horarios desde un solo lugar',
  },
  {
    title: 'Calendario de citas en tiempo real',
    description: 'Visualiza todas tus reservas organizadas por dia y semana',
  },
  {
    title: 'Gestion de personal',
    description: 'Asigna servicios a tu equipo y optimiza la disponibilidad',
  },
  {
    title: 'Configuracion flexible',
    description: 'Define horarios, excepciones y precios segun tus necesidades',
  },
];

// Feature data for Client section
const clientFeatures = [
  {
    title: 'Reserva en segundos',
    description: 'Encuentra el servicio que necesitas y reserva en 3 simples pasos',
  },
  {
    title: 'Disponibilidad en tiempo real',
    description: 'Ve los horarios disponibles y elige el que mejor te convenga',
  },
  {
    title: 'Elige tu estilista favorito',
    description: 'Selecciona al profesional de tu preferencia o deja que te asignemos uno',
  },
  {
    title: 'Gestiona tus citas',
    description: 'Edita o cancela tus reservas facilmente desde tu cuenta',
  },
];

// Main features data
const mainFeatures = [
  {
    icon: Smartphone,
    title: '100% Online',
    description: 'Accede desde cualquier dispositivo, en cualquier momento y lugar. Sin necesidad de descargar aplicaciones.',
  },
  {
    icon: Calendar,
    title: 'Disponibilidad 24/7',
    description: 'Reserva tus citas en cualquier momento, sin llamadas ni esperas. Confirmacion instantanea.',
  },
  {
    icon: Clock,
    title: 'Gestion eficiente',
    description: 'Sistema inteligente que optimiza horarios y evita sobrecargas. Todo organizado y bajo control.',
  },
];

/**
 * Premium Landing page with black/white design
 * Features dramatic hero, two-profile layout, and elegant CTAs
 */
export default function PaginaInicio() {
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* HERO SECTION - Dramatic black background */}
      <section className="relative min-h-[90vh] bg-black text-white flex items-center overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900" />

        {/* Subtle radial gradient decoration */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center py-20 w-full">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight animate-fade-in-up">
            <span className="block">Reservas</span>
            <span className="block text-gray-500 font-light mt-2">sin complicaciones</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-1">
            La plataforma completa para gestionar y reservar citas en salones de belleza
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            <Link to="/registro">
              <Button
                size="xl"
                className="bg-white text-black hover:bg-gray-100 min-w-[220px]"
              >
                Comenzar gratis
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="xl"
                className="bg-white text-black hover:bg-gray-100 min-w-[220px]"
              >
                Iniciar sesion
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </div>
      </section>

      <main className="flex-1">
        {/* TWO PROFILES SECTION */}
        <section className="py-24 lg:py-32 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">
                Una solucion para todos
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Ya seas dueno de un negocio o cliente, tenemos las herramientas perfectas para ti
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Owner Card - Black */}
              <div className="group relative bg-black text-white rounded-3xl p-8 lg:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-glass-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Para Negocios</h3>
                    <p className="text-gray-400">Duenos de salones</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Gestiona tu salon de belleza de manera profesional y eficiente
                </p>

                <ul className="space-y-4 mb-10">
                  {businessFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-white text-black hover:bg-gray-100"
                  size="lg"
                  onClick={() => setModalContactoAbierto(true)}
                >
                  Comunícate con nosotros
                </Button>
              </div>

              {/* Client Card - White with border */}
              <div className="group relative bg-white text-black rounded-3xl p-8 lg:p-10 border-2 border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-glass-xl hover:border-gray-200">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Para Clientes</h3>
                    <p className="text-gray-500">Usuarios del servicio</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Reserva tus citas de forma rapida y sencilla, sin complicaciones
                </p>

                <ul className="space-y-4 mb-10">
                  {clientFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-black">{feature.title}</p>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Link to="/registro" className="block">
                  <Button className="w-full" size="lg">
                    Crear mi cuenta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 lg:py-32 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">
                Caracteristicas destacadas
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Todo lo que necesitas para una experiencia perfecta
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mainFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="text-center bg-white p-8 lg:p-10 rounded-3xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 lg:py-32 px-6 lg:px-8 bg-black text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
              Listo para comenzar?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Unete a cientos de salones y clientes que ya estan usando Agenda Salon
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/registro">
                <Button
                  size="xl"
                  className="bg-white text-black hover:bg-gray-100 min-w-[220px]"
                >
                  Registrarse gratis
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="xl"
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-white/10 min-w-[220px]"
                >
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal de contacto para negocios */}
      <ModalContactoNegocio
        abierto={modalContactoAbierto}
        onCerrar={() => setModalContactoAbierto(false)}
      />
    </div>
  );
}
