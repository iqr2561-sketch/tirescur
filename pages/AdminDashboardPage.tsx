import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sale } from '../types';

interface AdminDashboardPageProps {
  totalProducts: number;
  sales?: Sale[];
  totalUsers?: number;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ 
  totalProducts,
  sales = [],
  totalUsers = 0
}) => {
  const navigate = useNavigate();
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

  // Calcular estadísticas en tiempo real
  const safeSales = sales || [];
  const totalOrders = safeSales.length;
  const pendingOrders = safeSales.filter(s => s.status === 'Pendiente').length;
  const completedOrders = safeSales.filter(s => s.status === 'Completado').length;
  const totalRevenue = safeSales
    .filter(s => s.status === 'Completado')
    .reduce((sum, sale) => sum + sale.total, 0);
  const pendingRevenue = safeSales
    .filter(s => s.status === 'Pendiente')
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Ventas del mes actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySales = safeSales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  }).length;
  
  const monthlyRevenue = safeSales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && 
             saleDate.getFullYear() === currentYear && 
             sale.status === 'Completado';
    })
    .reduce((sum, sale) => sum + sale.total, 0);

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

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800 hover:shadow-lg transition-shadow">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Total de Usuarios</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Administradores activos</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.109-1.29-.311-1.874M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.109-1.29.311-1.874m0 0a5 5 0 019.222 0M9 11a4 4 0 11-8 0 4 4 0 018 0zm7 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800 hover:shadow-lg transition-shadow">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Total de Pedidos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalOrders}</p>
            <p className="text-xs text-gray-400 mt-1">{completedOrders} completados</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M10 12h.01" /></svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800 hover:shadow-lg transition-shadow">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Pedidos Pendientes</p>
            <p className="text-3xl font-bold text-red-600">{pendingOrders}</p>
            <p className="text-xs text-gray-400 mt-1">${pendingRevenue.toFixed(2)} pendiente</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800 hover:shadow-lg transition-shadow">
          <div>
            <p className="text-gray-500 text-sm dark:text-gray-400">Ingresos Totales</p>
            <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{monthlySales} ventas este mes</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 transition-all duration-700 delay-300 ${
        isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Ventas del Mes</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total de ventas:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{monthlySales}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Ingresos del mes:</span>
              <span className="text-2xl font-bold text-green-600">${monthlyRevenue.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Promedio por venta: ${monthlySales > 0 ? (monthlyRevenue / monthlySales).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Estado de Pedidos</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completados:</span>
              <span className="text-xl font-bold text-green-600">{completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pendientes:</span>
              <span className="text-xl font-bold text-yellow-600">{pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Cancelados:</span>
              <span className="text-xl font-bold text-red-600">
                {safeSales.filter(s => s.status === 'Cancelado').length}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tasa de completación: {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

          {/* Ventas Recientes - Card Clickable */}
          <div 
            className={`bg-white p-6 rounded-lg shadow-md mt-8 dark:bg-gray-800 transition-all duration-700 delay-400 hover:shadow-lg cursor-pointer ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            onClick={() => navigate('/admin/sales')}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Ventas Recientes</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ver todas las ventas con detalles completos</p>
                </div>
              </div>
              <Link
                to="/admin/sales"
                className="flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 hover:scale-105"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Ver todas</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
        {safeSales.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay ventas registradas aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {safeSales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {sale.customerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sale.status === 'Completado' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : sale.status === 'Pendiente'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(sale.date).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;