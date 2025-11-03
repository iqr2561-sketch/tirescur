import React, { useState, useCallback } from 'react';
import { Brand, Product } from '../types';

interface ShopSidebarProps {
  brands: Brand[];
  products: Product[];
  filters: {
    searchQuery: string;
    selectedBrands: string[];
    priceRange: [number, number];
    width: string;
    profile: string;
    diameter: string;
    showOnlyOnSale: boolean;
  };
  onFiltersChange: (filters: ShopSidebarProps['filters']) => void;
  onClose?: () => void;
}

const ShopSidebar: React.FC<ShopSidebarProps> = ({
  brands,
  products,
  filters,
  onFiltersChange,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate available filter options from products
  const availableWidths = Array.from(new Set(products.map(p => p.width).filter(Boolean))).sort();
  const availableProfiles = Array.from(new Set(products.map(p => p.profile).filter(Boolean))).sort();
  const availableDiameters = Array.from(new Set(products.map(p => p.diameter).filter(Boolean))).sort();

  // Calculate price range from products
  const prices = products.map(p => p.salePrice || p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentMinPrice = filters.priceRange[0] || minPrice;
  const currentMaxPrice = filters.priceRange[1] || maxPrice;

  const handleBrandToggle = useCallback((brandName: string) => {
    const newBrands = filters.selectedBrands.includes(brandName)
      ? filters.selectedBrands.filter(b => b !== brandName)
      : [...filters.selectedBrands, brandName];
    
    onFiltersChange({ ...filters, selectedBrands: newBrands });
  }, [filters, onFiltersChange]);

  const handlePriceRangeChange = useCallback((type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      onFiltersChange({ ...filters, priceRange: [Math.max(minPrice, Math.min(value, currentMaxPrice)), currentMaxPrice] });
    } else {
      onFiltersChange({ ...filters, priceRange: [currentMinPrice, Math.min(maxPrice, Math.max(value, currentMinPrice))] });
    }
  }, [filters, onFiltersChange, minPrice, maxPrice, currentMinPrice, currentMaxPrice]);

  const handleSizeChange = useCallback((type: 'width' | 'profile' | 'diameter', value: string) => {
    onFiltersChange({ ...filters, [type]: value });
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      searchQuery: '',
      selectedBrands: [],
      priceRange: [minPrice, maxPrice],
      width: '',
      profile: '',
      diameter: '',
      showOnlyOnSale: false,
    });
  }, [onFiltersChange, minPrice, maxPrice]);

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  }, [filters, onFiltersChange]);

  const handleToggleOnSale = useCallback(() => {
    onFiltersChange({ ...filters, showOnlyOnSale: !filters.showOnlyOnSale });
  }, [filters, onFiltersChange]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 h-full bg-white dark:bg-gray-800 z-50
        w-80 overflow-y-auto shadow-lg lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Filtros</h2>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* On Sale Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="onSale"
              checked={filters.showOnlyOnSale}
              onChange={handleToggleOnSale}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="onSale" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Solo productos en oferta
            </label>
          </div>

          {/* Brands */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Marcas
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.selectedBrands.includes(brand.name)}
                    onChange={() => handleBrandToggle(brand.name)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de Precio
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={minPrice}
                  max={maxPrice}
                  value={currentMinPrice}
                  onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Mín"
                />
                <input
                  type="number"
                  min={minPrice}
                  max={maxPrice}
                  value={currentMaxPrice}
                  onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Máx"
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Width */}
          {availableWidths.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ancho
              </label>
              <select
                value={filters.width}
                onChange={(e) => handleSizeChange('width', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos</option>
                {availableWidths.map((width) => (
                  <option key={width} value={width}>{width}</option>
                ))}
              </select>
            </div>
          )}

          {/* Profile */}
          {availableProfiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Perfil
              </label>
              <select
                value={filters.profile}
                onChange={(e) => handleSizeChange('profile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos</option>
                {availableProfiles.map((profile) => (
                  <option key={profile} value={profile}>{profile}</option>
                ))}
              </select>
            </div>
          )}

          {/* Diameter */}
          {availableDiameters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diámetro
              </label>
              <select
                value={filters.diameter}
                onChange={(e) => handleSizeChange('diameter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos</option>
                {availableDiameters.map((diameter) => (
                  <option key={diameter} value={diameter}>{diameter}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </>
  );
};

export default ShopSidebar;

