import React, { useState, useEffect } from 'react';

interface FloatingCartButtonProps {
  totalItems: number;
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ totalItems, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [pulse, setPulse] = useState(false);
  const prevTotalItems = React.useRef(totalItems);

  useEffect(() => {
    if (totalItems > 0) {
      setIsVisible(true);
      
      // Si aumentó el total de items, hacer animación
      if (totalItems > prevTotalItems.current) {
        setBounce(true);
        setPulse(true);
        const bounceTimer = setTimeout(() => setBounce(false), 600);
        const pulseTimer = setTimeout(() => setPulse(false), 1000);
        return () => {
          clearTimeout(bounceTimer);
          clearTimeout(pulseTimer);
        };
      }
    } else {
      // Ocultar con delay cuando el carrito está vacío
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    
    prevTotalItems.current = totalItems;
  }, [totalItems]);

  if (!isVisible && totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-4 transition-all duration-300 flex items-center justify-center group ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-0 translate-y-10'
      } ${bounce ? 'animate-bounce' : ''}`}
      aria-label={`Carrito de compras (${totalItems} ${totalItems === 1 ? 'producto' : 'productos'})`}
    >
      {/* Icono del carrito */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {/* Contador de productos */}
      {totalItems > 0 && (
        <span
          className={`absolute -top-2 -right-2 bg-red-800 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center transition-all duration-300 ${
            bounce ? 'scale-125' : 'scale-100'
          }`}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      {/* Efecto de pulso sutil - solo cuando se agrega un producto */}
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-red-600 opacity-75 animate-ping"></span>
      )}
    </button>
  );
};

export default FloatingCartButton;

