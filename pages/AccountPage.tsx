import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AccountPageProps {
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ isAdminAuthenticated, onOpenAdminLogin, onLogout }) => {
  const navigate = useNavigate();

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <header className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-red-600 font-semibold">Centro de clientes</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mi Cuenta</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona tus accesos y obtén herramientas de administración de la tienda desde un único lugar seguro.
            </p>
          </header>

          {isAdminAuthenticated ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/40">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">Sesión administrativa activa</h2>
              <p className="mt-2 text-green-700 dark:text-green-300">
                Ya tienes acceso al panel de administración. Puedes continuar gestionando el catálogo y la configuración de la tienda.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleGoToAdmin}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Ir al panel de administración
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 dark:focus:ring-offset-gray-900"
                >
                  Cerrar sesión administrativa
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/60">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Acceso al panel de administración</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Esta área está protegida. Solo el personal autorizado puede ingresar para administrar productos, marcas, menús y configuración general del sitio.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200 text-xs font-semibold">1</span>
                  Haz clic en "Iniciar sesión como administrador" para abrir el formulario seguro.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200 text-xs font-semibold">2</span>
                  Ingresa las credenciales provistas por el equipo técnico.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200 text-xs font-semibold">3</span>
                  Una vez verificado el acceso, serás redirigido al panel completo.
                </li>
              </ul>
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Iniciar sesión como administrador
              </button>
            </div>
          )}

          <section className="rounded-xl border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-900/60">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">¿Necesitas ayuda?</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Si olvidaste tus credenciales o detectas un acceso no autorizado, comunícate con el responsable de TI para restablecer el usuario administrador.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

