import React, { useState, useCallback } from 'react';
import { MenuItem } from '../types';
import Modal from '../components/Modal';

interface AdminMenuManagementPageProps {
  menus: MenuItem[];
  onAddMenu: (menu: Omit<MenuItem, 'id'>) => void;
  onUpdateMenu: (menu: MenuItem) => void;
  onDeleteMenu: (menuId: string) => void;
}

const MENU_LOCATIONS = [
  { value: 'header-desktop', label: 'Encabezado (Desktop)' },
  { value: 'mobile-navbar', label: 'Barra de Navegación Móvil' },
  { value: 'footer-info', label: 'Pie de Página (Información)' },
  { value: 'footer-account', label: 'Pie de Página (Mi Cuenta)' },
  { value: 'admin-sidebar', label: 'Barra Lateral de Administración' },
];

const MOBILE_MENU_TYPES = [
  { value: 'route', label: 'Ruta Interna' },
  { value: 'external', label: 'Enlace Externo' },
  { value: 'action', label: 'Acción Específica (Móvil)' },
];

const AdminMenuManagementPage: React.FC<AdminMenuManagementPageProps> = ({
  menus,
  onAddMenu,
  onUpdateMenu,
  onDeleteMenu,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    path: '',
    isExternal: false,
    order: 0,
    location: MENU_LOCATIONS[0].value as MenuItem['location'],
    type: 'route', // Default for mobile if applicable
  });

  const getInputFieldClasses = () => `
    mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500
    bg-white text-gray-900 placeholder:text-gray-500
    dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
  `;

  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setFormData({
      name: '',
      path: '',
      isExternal: false,
      order: 0,
      location: MENU_LOCATIONS[0].value as MenuItem['location'],
      type: 'route',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = useCallback((menu: MenuItem) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      path: menu.path,
      isExternal: menu.isExternal,
      order: menu.order,
      location: menu.location,
      type: menu.type || 'route', // Default to 'route' if not set
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.path.trim()) {
      alert('Nombre y Ruta son obligatorios.');
      return;
    }
    if (isNaN(formData.order)) {
      alert('El orden debe ser un número.');
      return;
    }

    const menuToSave: Omit<MenuItem, 'id'> = {
      name: formData.name.trim(),
      path: formData.path.trim(),
      isExternal: formData.isExternal,
      order: parseInt(formData.order.toString()), // Ensure order is number
      location: formData.location,
      type: formData.location === 'mobile-navbar' ? formData.type : undefined, // Only apply type for mobile
    };

    if (editingMenu) {
      onUpdateMenu({ ...menuToSave, id: editingMenu.id });
    } else {
      // For add, we pass the menu item without 'id', MongoDB will generate it.
      onAddMenu(menuToSave);
    }

    handleCloseModal();
  }, [formData, editingMenu, onAddMenu, onUpdateMenu, handleCloseModal]);

  const handleDeleteMenu = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento de menú?')) {
      onDeleteMenu(id);
    }
  }, [onDeleteMenu]);

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Menús</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>Añadir Nuevo Elemento</span>
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ruta/URL</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Externo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Orden</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ubicación</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Tipo (Móvil)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {menus.map((menuItem) => (
              <tr key={menuItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{menuItem.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 line-clamp-1 max-w-xs" title={menuItem.path}>{menuItem.path}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {menuItem.isExternal ? (
                    <span className="text-green-500">✔</span>
                  ) : (
                    <span className="text-red-500">✖</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{menuItem.order}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {MENU_LOCATIONS.find(loc => loc.value === menuItem.location)?.label || menuItem.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {menuItem.location === 'mobile-navbar' ? (MOBILE_MENU_TYPES.find(type => type.value === menuItem.type)?.label || menuItem.type) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(menuItem)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    aria-label={`Editar elemento de menú ${menuItem.name}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menuItem.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Eliminar elemento de menú ${menuItem.name}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMenu ? 'Editar Elemento de Menú' : 'Añadir Nuevo Elemento de Menú'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="menuName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              id="menuName"
              value={formData.name}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Ej: Inicio"
              required
            />
          </div>
          <div>
            <label htmlFor="menuPath" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Ruta/URL<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="path"
              id="menuPath"
              value={formData.path}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Ej: / o https://google.com"
              required
            />
          </div>
          <div>
            <label htmlFor="menuOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Orden</label>
            <input
              type="number"
              name="order"
              id="menuOrder"
              value={formData.order}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Ej: 1"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isExternal"
              id="isExternal"
              checked={formData.isExternal}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isExternal" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Es un enlace externo</label>
          </div>
          <div>
            <label htmlFor="menuLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Ubicación del Menú</label>
            <select
              name="location"
              id="menuLocation"
              value={formData.location}
              onChange={handleChange}
              className={getInputFieldClasses() + " appearance-none"}
            >
              {MENU_LOCATIONS.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200 top-0 mt-10 mr-4">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
            </div>
          </div>
          {formData.location === 'mobile-navbar' && (
            <div>
              <label htmlFor="menuType" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tipo de Enlace (Móvil)</label>
              <select
                name="type"
                id="menuType"
                value={formData.type}
                onChange={handleChange}
                className={getInputFieldClasses() + " appearance-none"}
              >
                {MOBILE_MENU_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200 top-0 mt-[16.5rem] mr-4">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Si el tipo es 'Acción Específica', la ruta debe ser 'toggleCart' o 'toggleSearch'.</p>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCloseModal}
              className="py-2 px-4 border rounded-md transition-colors focus:outline-none focus:ring-2
                         border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300
                         dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
            >
              {editingMenu ? 'Guardar Cambios' : 'Añadir Elemento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMenuManagementPage;