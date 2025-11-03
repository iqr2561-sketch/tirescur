import React, { useState, useCallback, useMemo } from 'react';
import { Category } from '../types';
import { CATEGORIES_DATA } from '../constants';

interface AdminCategoryManagementPageProps {
  categories: Category[];
  onAddCategory?: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

const AdminCategoryManagementPage: React.FC<AdminCategoryManagementPageProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    imageUrl: string;
    order: string;
    isActive: boolean;
  }>({
    name: '',
    description: '',
    imageUrl: '',
    order: '0',
    isActive: true,
  });

  // Use default categories if none provided
  const displayCategories = categories.length > 0 ? categories : CATEGORIES_DATA;

  const getInputFieldClasses = () => `
    mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500
    bg-white text-gray-900 placeholder:text-gray-500
    dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
  `;

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      order: '0',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl,
      order: category.order?.toString() || '0',
      isActive: category.isActive !== false,
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre de la categoría es obligatorio.');
      return;
    }

    const categoryData: Omit<Category, 'id'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl || CATEGORIES_DATA[0]?.imageUrl || '',
      icon: CATEGORIES_DATA.find(c => c.name === formData.name)?.icon || React.createElement('div'),
      order: parseInt(formData.order) || 0,
      isActive: formData.isActive,
    };

    if (editingCategory && onUpdateCategory) {
      onUpdateCategory({ ...categoryData, id: editingCategory.id });
    } else if (onAddCategory) {
      onAddCategory(categoryData);
    }

    handleCloseModal();
  }, [formData, editingCategory, onAddCategory, onUpdateCategory, handleCloseModal]);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      onDeleteCategory?.(categoryId);
    }
  }, [onDeleteCategory]);

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Categorías</h1>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            + Agregar Categoría
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {displayCategories
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-red-600 mr-2">{category.icon}</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {category.order || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isActive !== false 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {category.isActive !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="text-red-600 hover:text-red-900 mr-4 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Editar
                      </button>
                      {onDeleteCategory && (
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={getInputFieldClasses()}
                      placeholder="Ej: Neumáticos de Verano"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className={getInputFieldClasses()}
                      placeholder="Descripción de la categoría"
                    />
                  </div>
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      URL de Imagen
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className={getInputFieldClasses()}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Orden
                      </label>
                      <input
                        type="number"
                        name="order"
                        id="order"
                        value={formData.order}
                        onChange={handleChange}
                        min="0"
                        className={getInputFieldClasses()}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                          Categoría activa
                        </span>
                      </label>
                    </div>
                  </div>
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
                      className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors
                                 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      {editingCategory ? 'Actualizar' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryManagementPage;

