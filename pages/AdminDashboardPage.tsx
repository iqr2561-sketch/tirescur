import React, { useEffect, useState } from 'react';

interface AdminDashboardPageProps {
  totalProducts: number;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ totalProducts }) => {
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  useEffect(() => {
    // Simular transición de entrada
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('es-ES', options);

  // Remaining stats are static mock data for now
  const ADMIN_STATS = {
    totalUsers: 120,
    totalOrders: 450,
    pendingOrders: 15,
  };

  return (
    <div className={`flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900 transition-all duration-700 ${
      isTransitioning ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
    }`}>
      <div className={`transition-all duration-700 delay-100 ${
        isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 dark:text-gray-100">Panel de Control</h1>
        <p className="text-gray-600 text-lg mb-6 dark:text-gray-300">Fecha Actual: {formattedDate}</p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-700 delay-200 ${
        isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Total de Productos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalProducts}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M7 7h10" /></svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Total de Usuarios</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{ADMIN_STATS.totalUsers}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.109-1.29-.311-1.874M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.109-1.29.311-1.874m0 0a5 5 0 019.222 0M9 11a4 4 0 11-8 0 4 4 0 018 0zm7 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Total de Pedidos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{ADMIN_STATS.totalOrders}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M10 12h.01" /></svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Pedidos Pendientes</p>
            <p className="text-3xl font-bold text-red-600">{ADMIN_STATS.pendingOrders}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-md mt-8 dark:bg-gray-800 transition-all duration-700 delay-300 ${
        isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Actividades Recientes</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-2 text-gray-700 dark:text-gray-200">El usuario John Doe se registró.</li>
          <li className="py-2 text-gray-700 dark:text-gray-200">Se añadió el nuevo producto "Neumático de Verano Ultraligero".</li>
          <li className="py-2 text-gray-700 dark:text-gray-200">El pedido #1001 fue pagado y enviado.</li>
          <li className="py-2 text-gray-700 dark:text-gray-200">La cantidad del producto "Neumático All-Season Premium" fue actualizada.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardPage;