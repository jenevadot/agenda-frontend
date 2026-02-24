/**
 * Premium Footer component
 * Black background with elegant typography
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <p className="text-3xl font-bold tracking-tight mb-2">
            Agenda<span className="font-light text-gray-500">Salon</span>
          </p>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Sistema de gestion de citas para salones de belleza
          </p>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-600">
              &copy; {year} Agenda Salon. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
