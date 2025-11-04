import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem } from '../types';
import { ShoppingBagIcon, TagIcon, DollarSignIcon } from '../constants'; // Import icons

interface AdminSidebarProps {
  adminMenus: MenuItem[]; // New prop for dynamic admin menu items
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminMenus }) => {
  const location = useLocation();

  const getIcon = (menuItem: MenuItem) => {
    // Return specific icon components based on path/name, or a default
    switch (menuItem.path) {
      case '/admin':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7-7 7 7M19 10v10a1 1 0 01-1 1h-3m-7 0V4a1 1 0 011-1h2a1 1 0 011 1v16z" /></svg>
        );
      case '/admin/products':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M7 7h10" /></svg>
        );
      case '/admin/brands':
        return TagIcon;
      case '/admin/prices':
        return DollarSignIcon;
      case '/admin/sales':
        return ShoppingBagIcon;
      case '/admin/settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        );
      case '/admin/menus': // New Menu icon
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        );
      case '/admin/categories': // Categories icon
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        );
      case '/admin/users': // Users icon
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        );
      case '/': // Back to store
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg> // Default arrow icon
        );
    }
  };


  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-red-600">Panel de Administración</h2>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {adminMenus.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            link.isExternal ? (
              <a
                key={link.id}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-lg transition-colors duration-200
                  ${isActive ? 'bg-red-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              >
                {getIcon(link)}
                <span className="text-sm font-medium">{link.name}</span>
              </a>
            ) : (
              <Link
                key={link.id}
                to={link.path}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200
                  ${isActive ? 'bg-red-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              >
                {getIcon(link)}
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            )
          );
        })}
      </nav>
      
      {/* Botón Ir a la Web */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to="/"
          className="flex items-center justify-center p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="text-sm font-medium">Ir a la Web</span>
        </Link>
      </div>
      
      <div className="p-6 text-xs text-gray-500 border-t border-gray-700 dark:text-gray-400">
        &copy; {new Date().getFullYear()} RedParts Admin
      </div>
    </div>
  );
};

export default AdminSidebar;