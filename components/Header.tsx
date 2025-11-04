import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CartItem, Product, MenuItem } from '../types';
import { DEFAULT_PRODUCT_IMAGE_URL } from '../constants';

interface HeaderProps {
  toggleCart: () => void;
  cartItems: CartItem[];
  whatsappPhoneNumber: string;
  toggleSearchModal: () => void; // Added for the mobile search button
  headerMenus: MenuItem[]; // New prop for dynamic menu items
  onAccountClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleCart, cartItems, whatsappPhoneNumber, toggleSearchModal, headerMenus, onAccountClick }) => {
  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [searchTerm, setSearchTerm] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      toggleSearchModal(); // Open the full search modal on desktop too
    }
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      {/* Top Bar */}
      <div className="bg-red-600 py-2 text-sm">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-4 space-y-1 sm:space-y-0">
          <div className="flex flex-wrap justify-center sm:justify-start space-x-4">
            <span className="whitespace-nowrap">Llámanos: {whatsappPhoneNumber}</span>
            <Link to="#" className="hover:text-gray-300 whitespace-nowrap">Nosotros</Link>
            <Link to="#" className="hover:text-gray-300 whitespace-nowrap">Contacto</Link>
            <Link to="#" className="hover:text-gray-300 whitespace-nowrap">Rastrear Pedido</Link>
          </div>
          <div className="flex space-x-4">
            {/* You could optionally add other utility links here if needed */}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-3xl font-bold text-red-600 mr-4 sm:mr-8">REDPARTS</Link>
          <nav className="hidden lg:flex space-x-6 text-sm">
            {headerMenus.map(menuItem => 
              menuItem.isExternal ? (
                <a
                  key={menuItem.id}
                  href={menuItem.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-600 transition-colors"
                >
                  {menuItem.name}
                </a>
              ) : (
                <Link
                  key={menuItem.id}
                  to={menuItem.path}
                  className="hover:text-red-600 transition-colors"
                >
                  {menuItem.name}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="relative hidden lg:block" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Introduce palabra clave o número"
                className="py-2 px-4 rounded-full shadow-sm w-64 pr-10 focus:outline-none focus:ring-2 focus:ring-red-600
                           bg-gray-100 text-gray-900 placeholder:text-gray-500
                           dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Buscar productos"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600" aria-label="Buscar">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={onAccountClick}
            className="hidden md:flex items-center text-gray-300 hover:text-red-600 transition-colors dark:text-gray-400 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-sm">Mi Cuenta</span>
          </button>

          <button onClick={toggleCart} className="relative flex items-center text-gray-300 hover:text-red-600 transition-colors focus:outline-none dark:text-gray-400" aria-label="Abrir carrito de compras">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="text-sm hidden lg:inline">Carrito de Compras</span>
            {totalItemsInCart > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {totalItemsInCart}
              </span>
            )}
            <span className="ml-2 text-sm font-semibold hidden lg:inline">${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;