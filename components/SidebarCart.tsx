import React from 'react';
import { CartItem } from '../types';
import SafeImage from './SafeImage';
import { useToast } from '../contexts/ToastContext';

interface SidebarCartProps {
  isOpen: boolean;
  toggleCart: () => void;
  cartItems: CartItem[];
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  whatsappPhoneNumber: string;
  onInitiateOrder: (products: { productId: string; name: string; quantity: number; price: number; }[], total: number) => void;
}

const SidebarCart: React.FC<SidebarCartProps> = ({ isOpen, toggleCart, cartItems, updateQuantity, removeFromCart, whatsappPhoneNumber, onInitiateOrder }) => {
  const { showWarning } = useToast();
  const totalAmount = cartItems.reduce((sum, item: CartItem) => sum + item.price * item.quantity, 0);

  const handleProceedToWhatsApp = () => {
    if (cartItems.length === 0) {
      showWarning('Tu carrito está vacío. Por favor, añade artículos antes de proceder.');
      return;
    }

    const productsForSale = cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    onInitiateOrder(productsForSale, totalAmount);
    toggleCart();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleCart}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 w-full max-w-xs sm:w-80 h-full shadow-lg transform transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-white dark:bg-gray-800`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de Compras"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Carrito de Compras</h2>
          <button onClick={toggleCart} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Cerrar carrito">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-160px)]">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center mt-8 dark:text-gray-400">Tu carrito está vacío.</p>
          ) : (
            cartItems.map((item: CartItem) => {
              return (
                <div key={item.id} className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100 last:border-b-0 dark:border-gray-700">
                <SafeImage src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-gray-800 text-sm font-medium line-clamp-2 dark:text-gray-100">{item.name}</h3>
                    <p className="text-red-600 font-bold mt-1">${item.price.toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 rounded-l disabled:opacity-50
                                   bg-gray-200 hover:bg-gray-300
                                   dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >-</button>
                      <span className="px-3 py-1 text-gray-800
                                     bg-gray-100 dark:bg-gray-600 dark:text-gray-100">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 rounded-r
                                   bg-gray-200 hover:bg-gray-300
                                   dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >+</button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-gray-400 hover:text-red-600"
                        aria-label={`Eliminar ${item.name} del carrito`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3m-3 0h14" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center text-lg font-semibold mb-4">
            <span>Subtotal:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handleProceedToWhatsApp}
            className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
          >
            Proceder a WhatsApp
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarCart;