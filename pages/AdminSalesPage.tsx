import React, { useState } from 'react';
import Modal from '../components/Modal';
import { Sale } from '../types';

interface AdminSalesPageProps {
  salesData: Sale[];
}

const AdminSalesPage: React.FC<AdminSalesPageProps> = ({ salesData }) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const getStatusClasses = (status: Sale['status']) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const openDetailsModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSale(null);
  };

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">Gestión de Ventas</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">ID de Pedido</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cliente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {salesData.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{sale.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sale.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${sale.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(sale.status)}`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(sale.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openDetailsModal(sale)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    aria-label={`Ver detalles del pedido ${sale.id}`}
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title={`Detalles del Pedido: ${selectedSale?.id || ''}`}>
        {selectedSale ? (
          <div className="space-y-4 text-gray-700 dark:text-gray-200">
            <p><strong>Cliente:</strong> {selectedSale.customerName}</p>
            <p><strong>Total:</strong> ${selectedSale.total.toFixed(2)}</p>
            <p><strong>Estado:</strong> <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(selectedSale.status)}`}>{selectedSale.status}</span></p>
            <p><strong>Fecha:</strong> {new Date(selectedSale.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <h3 className="text-lg font-semibold mt-6 mb-2">Productos:</h3>
            <ul className="list-disc pl-5 space-y-2">
              {selectedSale.products.length > 0 ? (
                selectedSale.products.map(product => (
                  <li key={product.productId} className="flex justify-between items-center">
                    <span>{product.name} (x{product.quantity})</span>
                    <span className="font-semibold">${(product.price * product.quantity).toFixed(2)}</span>
                  </li>
                ))
              ) : (
                <li>No hay productos en este pedido (posiblemente cancelado).</li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-200">No hay detalles de venta disponibles.</p>
        )}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={closeDetailsModal}
            className="py-2 px-4 border rounded-md transition-colors focus:outline-none focus:ring-2
                       border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300
                       dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSalesPage;