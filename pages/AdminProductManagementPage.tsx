import React, { useState, useCallback, useMemo } from 'react';
import { Product, AdminProductFormData, Brand } from '../types';
import AdminProductCard from '../components/AdminProductCard';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import StarRatingInput from '../components/StarRatingInput';
import { useToast } from '../contexts/ToastContext';
import { WIDTHS, PROFILES, DIAMETERS } from '../constants';
import SafeImage from '../components/SafeImage';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; productId: string | null }>({ isOpen: false, productId: null });
  const { showSuccess, showError, showWarning } = useToast();
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [filterOnSale, setFilterOnSale] = useState<boolean | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
    // Deal/Offer fields
    isOnSale: false,
    salePrice: '',
    discountPercentage: '',
    categoryId: '',
    // Product status
    isActive: true, // Default to active
  });

  // Validar que products y brands sean arrays
  const safeProducts = products || [];
  const safeBrands = brands || [];

  // Initialize brand field to the first actual brand if available, or empty string
  // when the modal opens for adding a new product.
  // Using useMemo to prevent re-calculating on every render if brands don't change.
  const initialBrand = useMemo(() => safeBrands.length > 0 ? safeBrands[0].name : '', [safeBrands]);

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
      // Deal/Offer fields
      isOnSale: false,
      salePrice: '',
      discountPercentage: '',
      categoryId: '',
      isActive: true,
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
      // Deal/Offer fields
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice ? product.salePrice.toFixed(2) : '',
      discountPercentage: product.discountPercentage ? product.discountPercentage.toString() : '',
      categoryId: product.categoryId || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
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
      showError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      showError('El precio debe ser un número positivo.');
      return;
    }
    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      showError('El stock debe ser un número entero no negativo.');
      return;
    }
    if (formData.width === WIDTHS[0] || formData.profile === PROFILES[0] || formData.diameter === DIAMETERS[0]) {
      showError('Por favor, selecciona un valor válido para ancho, perfil y diámetro.');
      return;
    }
    
    // Validate sale price if product is on sale
    if (formData.isOnSale && formData.salePrice) {
      const salePrice = parseFloat(formData.salePrice);
      const regularPrice = parseFloat(formData.price);
      if (isNaN(salePrice) || salePrice <= 0) {
        showError('El precio de oferta debe ser un número positivo.');
        return;
      }
      if (salePrice >= regularPrice) {
        showError('El precio de oferta debe ser menor que el precio regular.');
        return;
      }
    }

    const selectedBrand = safeBrands.find(b => b.name === formData.brand);

    const baseProduct: Omit<Product, 'id'> = { // Base object without 'id'
      sku: formData.sku,
      name: formData.name,
      brand: formData.brand,
      brandLogoUrl: selectedBrand?.logoUrl,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews),
      imageUrl: formData.imageUrl.trim(),
      description: formData.description,
      tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      stock: parseInt(formData.stock),
      width: formData.width,
      profile: formData.profile,
      diameter: formData.diameter,
      // Deal/Offer fields
      isOnSale: formData.isOnSale || false,
      salePrice: formData.isOnSale && formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      discountPercentage: (() => {
        if (!formData.isOnSale) return undefined;
        // Calculate discount if salePrice is provided and discountPercentage is not
        if (formData.salePrice && !formData.discountPercentage) {
          const regularPrice = parseFloat(formData.price);
          const salePrice = parseFloat(formData.salePrice);
          return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
        }
        return formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined;
      })(),
      categoryId: formData.categoryId || undefined,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
    };

    if (editingProduct) {
      // For update, we need the existing ID
      const productToUpdate: Product = { ...baseProduct, id: editingProduct.id };
      onUpdateProduct(productToUpdate);
      showSuccess('Producto actualizado exitosamente');
    } else {
      // For add, we pass the product without ID, MongoDB will generate it
      onAddProduct(baseProduct);
      showSuccess('Producto agregado exitosamente');
    }

    handleCloseModal();
  }, [formData, editingProduct, onAddProduct, onUpdateProduct, handleCloseModal, brands, WIDTHS, PROFILES, DIAMETERS, showSuccess, showError]);

  const handleDeleteProduct = useCallback((id: string) => {
    setConfirmModal({ isOpen: true, productId: id });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (confirmModal.productId) {
      onDeleteProduct(confirmModal.productId);
      showSuccess('Producto eliminado exitosamente');
      setConfirmModal({ isOpen: false, productId: null });
    }
  }, [confirmModal.productId, onDeleteProduct, showSuccess]);

  // Filtrar y ordenar productos
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...safeProducts];

    // Búsqueda por término
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(term) ||
        (product.sku || '').toLowerCase().includes(term) ||
        (product.brand || '').toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term)
      );
    }

    // Filtro por marca
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Filtro por ofertas
    if (filterOnSale === true) {
      filtered = filtered.filter(product => product.isOnSale === true);
    } else if (filterOnSale === false) {
      filtered = filtered.filter(product => product.isOnSale !== true);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.salePrice || a.price) - (b.salePrice || b.price);
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'created':
          comparison = new Date(a.id).getTime() - new Date(b.id).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [safeProducts, searchTerm, selectedBrand, filterOnSale, sortBy, sortOrder]);

  // Obtener marcas únicas para el filtro
  const uniqueBrands = useMemo(() => {
    const brandsSet = new Set(safeProducts.map(p => p.brand).filter(Boolean));
    return Array.from(brandsSet).sort();
  }, [safeProducts]);

  // Si no hay productos, mostrar mensaje
  if (safeProducts.length === 0 && products !== null) {
    return (
      <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Productos</h1>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md text-center dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay productos registrados</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Haz clic en "Añadir Nuevo Producto" para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Productos</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAndSortedProducts.length} de {safeProducts.length} productos
          </span>
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Vista de tarjetas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Vista de lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Añadir Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, SKU, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filtro por Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marca
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="all">Todas las marcas</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Ofertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ofertas
            </label>
            <select
              value={filterOnSale === 'all' ? 'all' : filterOnSale ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterOnSale(value === 'all' ? 'all' : value === 'true');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="all">Todas</option>
              <option value="true">En oferta</option>
              <option value="false">Sin oferta</option>
            </select>
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="mt-4 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'created')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
            <option value="stock">Stock</option>
            <option value="created">Fecha</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-100"
            title={`Orden ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
          >
            {sortOrder === 'asc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          {(searchTerm || selectedBrand !== 'all' || filterOnSale !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBrand('all');
                setFilterOnSale('all');
              }}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron productos</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Imagen</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 hidden sm:table-cell">SKU</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Producto</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 hidden md:table-cell">Marca</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Precio</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 hidden lg:table-cell">Oferta</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Stock</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 hidden xl:table-cell">Tamaño</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredAndSortedProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${product.isActive === false ? 'opacity-60' : ''}`}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <SafeImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 md:h-16 md:w-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                      {product.sku}
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                        {product.isActive === false && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                        SKU: {product.sku}
                      </div>
                      {product.description && (
                        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs mt-1" title={product.description}>
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                      {product.brand}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      {product.isOnSale ? (
                        <div>
                          <div className="text-sm font-medium text-red-600 dark:text-red-400">
                            ${product.salePrice?.toFixed(2) || product.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 line-through dark:text-gray-400">
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${product.price.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      {product.isOnSale ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                          {product.discountPercentage ? `${product.discountPercentage}% OFF` : 'En Oferta'}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      {product.stock <= 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                          Agotado
                        </span>
                      ) : product.stock < 5 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                          Pocas ({product.stock})
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          En Stock ({product.stock})
                        </span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden xl:table-cell">
                      {product.width && product.profile && product.diameter ? (
                        <span>{product.width}/{product.profile} {product.diameter}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs sm:text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-xs sm:text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                {safeBrands.length === 0 && <option value="">No hay marcas disponibles</option>}
                {safeBrands.map((brandOption) => (
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
          
          {/* Ofertas Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Configuración de Ofertas</h3>
            
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={formData.isOnSale || false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isOnSale: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Producto en oferta
                </span>
              </label>
            </div>

            {/* Estado del Producto */}
            <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive !== undefined ? formData.isActive : true}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Producto activo (visible para clientes)
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                Los productos inactivos no serán visibles en la tienda
              </p>
            </div>
            
            {formData.isOnSale && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Precio de Oferta ($)
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    id="salePrice"
                    value={formData.salePrice || ''}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    max={formData.price || ''}
                    className={getInputFieldClasses()}
                    placeholder="Ej: 95.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Precio especial para oferta (debe ser menor que el precio regular)
                  </p>
                </div>
                <div>
                  <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Porcentaje de Descuento (%)
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    id="discountPercentage"
                    value={formData.discountPercentage || ''}
                    onChange={handleChange}
                    step="1"
                    min="1"
                    max="99"
                    className={getInputFieldClasses()}
                    placeholder="Ej: 20"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Porcentaje de descuento (opcional, se calcula automáticamente si hay precio de oferta)
                  </p>
                </div>
              </div>
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
              {editingProduct ? 'Guardar Cambios' : 'Añadir Producto'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, productId: null })}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default AdminProductManagementPage;