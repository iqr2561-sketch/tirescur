import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem } from '../types';

interface MobileNavbarProps {
  toggleCart: () => void;
  totalItemsInCart: number;
  toggleSearchModal: () => void;
  mobileMenus: MenuItem[]; // New prop for dynamic menu items
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ toggleCart, totalItemsInCart, toggleSearchModal, mobileMenus }) => {
  const location = useLocation();

  const getIcon = (menuItem: MenuItem, isActive: boolean) => {
    const defaultClasses = `h-6 w-6 ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'}`;

    // Define icons for specific paths/actions if needed
    // Otherwise, you might consider an optional iconUrl in MenuItem or a generic icon
    switch (menuItem.path) {
      case '/': // Home
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={defaultClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7-7 7 7M19 10v10a1 1 0 01-1 1h-3m-7 0V4a1 1 0 011-1h2a1 1 0 011 1v16z" /></svg>
        );
      case '/shop': // Shop (generic, might be a placeholder route)
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={defaultClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        );
      case 'toggleSearch': // Search action
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={defaultClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        );
      case 'toggleCart': // Cart action
        return (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className={defaultClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {totalItemsInCart > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {totalItemsInCart}
              </span>
            )}
          </div>
        );
      case '/account': // Account
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={defaultClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        );
      default:
        // Generic icon if none match, or an empty div if no icon is desired for generic links
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={defaultClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        );
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-lg z-30 md:hidden">
      <div className="flex justify-around items-center h-16">
        {mobileMenus.map((item) => {
          const isActive = item.path === location.pathname; // For routes

          if (item.type === 'action') {
            const action = item.path === 'toggleCart' ? toggleCart : item.path === 'toggleSearch' ? toggleSearchModal : () => {};
            return (
              <button
                key={item.id}
                onClick={action}
                className="group flex flex-col items-center justify-center text-xs font-medium w-full h-full text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
                aria-label={item.name}
              >
                {getIcon(item, isActive)}
                <span className={`mt-1 ${isActive ? 'text-red-600' : ''}`}>{item.name}</span>
              </button>
            );
          } else if (item.isExternal) {
            return (
              <a
                key={item.id}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center text-xs font-medium w-full h-full text-gray-400 hover:text-red-600 transition-colors"
                aria-label={item.name}
              >
                {getIcon(item, isActive)}
                <span className={`mt-1 ${isActive ? 'text-red-600' : ''}`}>{item.name}</span>
              </a>
            );
          } else {
            return (
              <Link
                key={item.id}
                to={item.path}
                className="group flex flex-col items-center justify-center text-xs font-medium w-full h-full text-gray-400 hover:text-red-600 transition-colors"
                aria-label={item.name}
              >
                {getIcon(item, isActive)}
                <span className={`mt-1 ${isActive ? 'text-red-600' : ''}`}>{item.name}</span>
              </Link>
            );
          }
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;