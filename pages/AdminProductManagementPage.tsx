import React, { useState, useCallback, useMemo } from 'react';
import { Product, AdminProductFormData, Brand } from '../types';
import AdminProductCard from '../components/AdminProductCard';
import Modal from '../components/Modal';
import StarRatingInput from '../components/StarRatingInput';
import { DEFAULT_PRODUCT_IMAGE_URL, WIDTHS, PROFILES, DIAMETERS, DEFAULT_BRAND_LOGO_URL } from '../constants';

interface AdminProductManagementPageProps {
  products: Product[];
  brands: Brand[]; // New prop for brands
  onAddProduct: (product: Omit<Product, 'id'>) => void; // Expect product without ID
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const AdminProductManagementPage: React.FC<AdminProductManagementPageProps> = ({
  products,
  brands,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<AdminProductFormData>({
    sku: '',
    name: '',
    brand: '', // Will be set to the first actual brand or empty
    price: '',
    rating: '0',
    reviews: '0',
    imageUrl: '',
    description: '',
    tags: '',
    stock: '',
    width: WIDTHS[0], // Default to the first (placeholder) value
    profile: PROFILES[0], // Default to the first (placeholder) value
    diameter: DIAMETERS[0], // Default to the first (placeholder) value
  });

  // Initialize brand field to the first actual brand if available, or empty string
  // when the modal opens for adding a new product.
  // Using useMemo to prevent re-calculating on every render if brands don't change.
  const initialBrand = useMemo(() => brands.length > 0 ? brands[0].name : '', [brands]);

  const getInputFieldClasses = () => `
    mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500
    bg-white text-gray-900 placeholder:text-gray-500
    dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
  `;

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      brand: initialBrand, // Set initial brand for new product
      price: '',
      rating: '0',
      reviews: '0',
      imageUrl: '',
      description: '',
      tags: '',
      stock: '',
      width: WIDTHS[0],
      profile: PROFILES[0],
      diameter: DIAMETERS[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand, // Use existing brand for editing
      price: product.price.toFixed(2),
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
      imageUrl: product.imageUrl,
      description: product.description,
      tags: product.tags ? product.tags.join(', ') : '',
      stock: product.stock.toString(),
      width: product.width,
      profile: product.profile,
      diameter: product.diameter,
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRatingChange = useCallback((newRating: number) => {
    setFormData((prev) => ({ ...prev, rating: newRating.toString() }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.brand || !formData.price || !formData.sku || !formData.stock) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      alert('El precio debe ser un número positivo.');
      return;
    }
    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      alert('El stock debe ser un número entero no negativo.');
      return;
    }
    if (formData.width === WIDTHS[0] || formData.profile === PROFILES[0] || formData.diameter === DIAMETERS[0]) {
      alert('Por favor, selecciona un valor válido para ancho, perfil y diámetro.');
      return;
    }

    const selectedBrand = brands.find(b => b.name === formData.brand);

    const baseProduct: Omit<Product, 'id'> = { // Base object without 'id'
      sku: formData.sku,
      name: formData.name,
      brand: formData.brand,
      brandLogoUrl: selectedBrand?.logoUrl || DEFAULT_BRAND_LOGO_URL, // Assign brand logo
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews),
      imageUrl: formData.imageUrl || DEFAULT_PRODUCT_IMAGE_URL,
      description: formData.description,
      tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      stock: parseInt(formData.stock),
      width: formData.width,
      profile: formData.profile,
      diameter: formData.diameter,
    };

    if (editingProduct) {
      // For update, we need the existing ID
      const productToUpdate: Product = { ...baseProduct, id: editingProduct.id };
      onUpdateProduct(productToUpdate);
    } else {
      // For add, we pass the product without ID, Supabase will generate it
      onAddProduct(baseProduct);
    }

    handleCloseModal();
  }, [formData, editingProduct, onAddProduct, onUpdateProduct, handleCloseModal, brands, WIDTHS, PROFILES, DIAMETERS]);

  const handleDeleteProduct = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      onDeleteProduct(id);
    }
  }, [onDeleteProduct]);

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Productos</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>Añadir Nuevo Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <AdminProductCard
            key={product.id}
            product={product}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre del Producto<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Ej: Neumático de Verano Ultraligero"
              required
            />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-200">SKU<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="sku"
              id="sku"
              value={formData.sku}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Ej: TNR-205-55-R16"
              required
            />
          </div>
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Marca<span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                name="brand"
                id="brand"
                value={formData.brand}
                onChange={handleChange}
                className={getInputFieldClasses() + " appearance-none"}
                required
              >
                {brands.length === 0 && <option value="">No hay marcas disponibles</option>}
                {brands.map((brandOption) => (
                  <option key={brandOption.id} value={brandOption.name}>{brandOption.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200 top-0 mt-1">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Descripción</label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Descripción detallada del producto."
            ></textarea>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Precio ($)<span className="text-red-500">*</span></label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={getInputFieldClasses()}
                placeholder="Ej: 120.00"
                required
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Stock<span className="text-red-500">*</span></label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                className={getInputFieldClasses()}
                placeholder="Ej: 25"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Ancho<span className="text-red-500">*</span></label>
                <select
                    name="width"
                    id="width"
                    value={formData.width}
                    onChange={handleChange}
                    className={getInputFieldClasses() + " appearance-none"} // Add appearance-none for custom arrow
                    required
                >
                    {WIDTHS.map((w) => (
                        <option key={w} value={w} disabled={w === WIDTHS[0]}>{w}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200 top-6">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
                </div>
            </div>
            <div className="relative">
                <label htmlFor="profile" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Perfil<span className="text-red-500">*</span></label>
                <select
                    name="profile"
                    id="profile"
                    value={formData.profile}
                    onChange={handleChange}
                    className={getInputFieldClasses() + " appearance-none"}
                    required
                >
                    {PROFILES.map((p) => (
                        <option key={p} value={p} disabled={p === PROFILES[0]}>{p}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200 top-6">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
                </div>
            </div>
            <div className="relative">
                <label htmlFor="diameter" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Diámetro de Llanta<span className="text-red-500">*</span></label>
                <select
                    name="diameter"
                    id="diameter"
                    value={formData.diameter}
                    onChange={handleChange}
                    className={getInputFieldClasses() + " appearance-none"}
                    required
                >
                    {DIAMETERS.map((d) => (
                        <option key={d} value={d} disabled={d === DIAMETERS[0]}>{d}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200 top-6">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
                </div>
            </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200">URL de Imagen</label>
            <input
              type="url"
              name="imageUrl"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Vista previa" className="mt-2 h-20 w-20 object-cover rounded-md" />
            )}
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Valoración</label>
            <StarRatingInput
              value={parseFloat(formData.rating)}
              onChange={handleRatingChange}
              ariaLabel="Valoración del producto"
            />
          </div>
          <div>
            <label htmlFor="reviews" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Número de Opiniones</label>
            <input
              type="number"
              name="reviews"
              id="reviews"
              value={formData.reviews}
              onChange={handleChange}
              min="0"
              step="1"
              className={getInputFieldClasses()}
              placeholder="Ej: 10"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Etiquetas (separadas por comas)</label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags}
              onChange={handleChange}
              className={getInputFieldClasses()}
              placeholder="Ej: neumático, verano, deportivo"
            />
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
              {editingProduct ? 'Guardar Cambios' : 'Añadir Producto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProductManagementPage;