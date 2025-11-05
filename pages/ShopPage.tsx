import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Brand } from '../types';
import ProductCard from '../components/ProductCard';
import ShopSidebar from '../components/ShopSidebar';

interface ShopPageProps {
  products: Product[];
  brands: Brand[];
  onAddToCart: (product: Product) => void;
  onOpenProductSelectionModal: (product: Product) => void;
}

const ShopPage: React.FC<ShopPageProps> = ({
  products,
  brands,
  onAddToCart,
  onOpenProductSelectionModal,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOfferPage = searchParams.get('offer') === 'true';
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedBrands: [] as string[],
    priceRange: [0, 10000] as [number, number],
    width: '',
    profile: '',
    diameter: '',
    showOnlyOnSale: isOfferPage, // Activar automáticamente si viene de ofertas
  });

  // Actualizar filtro cuando cambie la URL
  useEffect(() => {
    if (isOfferPage) {
      setFilters(prev => ({ ...prev, showOnlyOnSale: true }));
    }
  }, [isOfferPage]);

  // Calculate initial price range
  const initialPriceRange = useMemo(() => {
    if (products.length === 0) return [0, 10000] as [number, number];
    const prices = products.map(p => p.salePrice || p.price);
    return [Math.min(...prices), Math.max(...prices)] as [number, number];
  }, [products]);

  // Update price range when products change
  React.useEffect(() => {
    if (filters.priceRange[0] === 0 && filters.priceRange[1] === 10000) {
      setFilters(prev => ({ ...prev, priceRange: initialPriceRange }));
    }
  }, [initialPriceRange]);

  // Filter products - Solo mostrar productos activos y en oferta si es página de ofertas
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Solo mostrar productos activos
      if (product.isActive === false) return false;

      // Si estamos en la página de ofertas, SOLO mostrar productos en oferta
      if (isOfferPage && !product.isOnSale) return false;

      // Search query
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        
        if (!matchesSearch) return false;
      }

      // Brand filter
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(product.brand)) {
        return false;
      }

      // Price range
      const productPrice = product.salePrice || product.price;
      if (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1]) {
        return false;
      }

      // Size filters
      if (filters.width && product.width !== filters.width) return false;
      if (filters.profile && product.profile !== filters.profile) return false;
      if (filters.diameter && product.diameter !== filters.diameter) return false;

      // On sale filter
      if (filters.showOnlyOnSale && !product.isOnSale) return false;

      return true;
    });
  }, [products, filters, isOfferPage]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with filters toggle */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {isOfferPage ? '🎯 Ofertas Especiales' : 'Tienda'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} {isOfferPage ? 'en oferta' : 'encontrado'}{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Botón rápido para ver ofertas */}
              {!isOfferPage && (
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, showOnlyOnSale: !prev.showOnlyOnSale }));
                    if (!filters.showOnlyOnSale) {
                      navigate('/shop?offer=true');
                    } else {
                      navigate('/shop');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.showOnlyOnSale
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filters.showOnlyOnSale ? '🎯 Ver Ofertas' : 'Ver Ofertas'}
                </button>
              )}
              <button
                onClick={handleToggleSidebar}
                className="lg:hidden px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {sidebarOpen ? 'Ocultar' : 'Mostrar'} Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <ShopSidebar
              brands={brands}
              products={products}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <ShopSidebar
              brands={brands}
              products={products}
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Separación visual para productos en oferta */}
            {!isOfferPage && filters.showOnlyOnSale && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg">
                <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                  🎯 Productos en Oferta
                </h2>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Mostrando solo productos con descuentos especiales
                </p>
              </div>
            )}
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No se encontraron productos con los filtros seleccionados.
                </p>
                <button
                  onClick={() => setFilters({
                    searchQuery: '',
                    selectedBrands: [],
                    priceRange: initialPriceRange,
                    width: '',
                    profile: '',
                    diameter: '',
                    showOnlyOnSale: false,
                  })}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <>
                {/* Separar productos en oferta de los demás si no está activo el filtro */}
                {!isOfferPage && !filters.showOnlyOnSale && (() => {
                  const productsOnSale = filteredProducts.filter(p => p.isOnSale);
                  const productsNotOnSale = filteredProducts.filter(p => !p.isOnSale);
                  
                  return (
                    <>
                      {productsOnSale.length > 0 && (
                        <div className="mb-8">
                          <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                              <span className="text-red-600">🎯</span> Productos en Oferta
                            </h2>
                            <button
                              onClick={() => {
                                setFilters(prev => ({ ...prev, showOnlyOnSale: true }));
                                navigate('/shop?offer=true');
                              }}
                              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                            >
                              Ver todos →
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {productsOnSale.map((product) => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                allProducts={products}
                                onOpenProductSelectionModal={onOpenProductSelectionModal}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {productsNotOnSale.length > 0 && (
                        <div>
                          {productsOnSale.length > 0 && (
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                              Todos los Productos
                            </h2>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {productsNotOnSale.map((product) => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                allProducts={products}
                                onOpenProductSelectionModal={onOpenProductSelectionModal}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
                
                {/* Mostrar todos si el filtro de ofertas está activo o es página de ofertas */}
                {(isOfferPage || filters.showOnlyOnSale) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        allProducts={products}
                        onOpenProductSelectionModal={onOpenProductSelectionModal}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;

