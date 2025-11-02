import React, { useState, useCallback } from 'react';
import { Brand } from '../types';
import Modal from '../components/Modal';
import { DEFAULT_BRAND_LOGO_URL } from '../constants';

interface AdminBrandManagementPageProps {
  brands: Brand[];
  onAddBrand: (brand: Omit<Brand, 'id'>) => void; // Expect brand without id for new
  onUpdateBrand: (brand: Brand) => void;
  onDeleteBrand: (brandId: string) => void;
}

const AdminBrandManagementPage: React.FC<AdminBrandManagementPageProps> = ({
  brands,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<{ name: string; logoUrl: string }>({
    name: '',
    logoUrl: '',
  });

  const getInputFieldClasses = () => `
    mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500
    bg-white text-gray-900 placeholder:text-gray-500
    dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
  `;

  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', logoUrl: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = useCallback((brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, logoUrl: brand.logoUrl || '' });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre de la marca es obligatorio.');
      return;
    }

    if (editingBrand) {
      const brandToUpdate: Brand = {
        id: editingBrand.id,
        name: formData.name.trim(),
        logoUrl: formData.logoUrl.trim() || DEFAULT_BRAND_LOGO_URL,
      };
      onUpdateBrand(brandToUpdate);
    } else {
      // For add, we pass the brand without 'id', MongoDB will generate it.
      const brandToAdd: Omit<Brand, 'id'> = {
        name: formData.name.trim(),
        logoUrl: formData.logoUrl.trim() || DEFAULT_BRAND_LOGO_URL,
      };
      onAddBrand(brandToAdd);
    }

    handleCloseModal();
  }, [formData, editingBrand, onAddBrand, onUpdateBrand, handleCloseModal]);

  const handleDeleteBrand = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
      onDeleteBrand(id);
    }
  }, [onDeleteBrand]);

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Marcas</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>Añadir Nueva Marca</span>
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Logo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">URL del Logo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={brand.logoUrl || DEFAULT_BRAND_LOGO_URL} alt={brand.name} className="h-10 w-auto object-contain" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{brand.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 line-clamp-1 max-w-xs" title={brand.logoUrl}>{brand.logoUrl}</td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(brand)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    aria-label={`Editar marca ${brand.name}`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Eliminar marca ${brand.name}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBrand ? 'Editar Marca' : 'Añadir Nueva Marca'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre de la Marca<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              id="brandName"
              value={formData.name}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Ej: Michelin"
              required
            />
          </div>
          <div>
            <label htmlFor="brandLogoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200">URL del Logo (opcional)</label>
            <input
              type="url"
              name="logoUrl"
              id="brandLogoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="https://example.com/logo.png"
            />
            {formData.logoUrl && (
              <img src={formData.logoUrl} alt="Vista previa del logo" className="mt-2 h-16 w-auto object-contain" />
            )}
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
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
            >
              {editingBrand ? 'Guardar Cambios' : 'Añadir Marca'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBrandManagementPage;