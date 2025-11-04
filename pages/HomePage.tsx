import React, { useState } from 'react';
import HeroSearch from '../components/HeroSearch';
import ProductCard from '../components/ProductCard';
import DealZoneTimer from '../components/DealZoneTimer';
import CategoryCarousel from '../components/CategoryCarousel';
import { Product, DealZoneConfig, Category } from '../types';

interface HomePageProps {
  onAddToCart: (product: Product) => void;
  heroImageUrl: string;
  whatsappPhoneNumber: string;
  dealZoneConfig: DealZoneConfig;
  products: Product[]; // New prop for all products
  categories: Category[];
  onInitiateOrder: (products: { productId: string; name: string; quantity: number; price: number; }[], total: number) => void;
  onOpenProductSelectionModal: (product: Product) => void; // New prop
}

const HomePage: React.FC<HomePageProps> = ({ onAddToCart, heroImageUrl, whatsappPhoneNumber, dealZoneConfig, products, categories, onInitiateOrder, onOpenProductSelectionModal }) => {
  // Use the products passed as props - Validar que products sea un array
  const safeProducts = products || [];
  const featuredProducts = safeProducts.slice(0, 5); // Example: Take first 5 for featured
  const newArrivals = safeProducts.slice(5, 10); // Example: Take next 5 for new arrivals
  const [activeFilter, setActiveFilter] = useState<string>('Todos');

  const filterOptions = ['Todos', 'Verano', 'Invierno', 'Todo el Año'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HeroSearch heroImageUrl={heroImageUrl} products={safeProducts} />

      {/* Services/Benefits Section */}
      <section className="bg-white py-10 shadow-sm dark:bg-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-1m4 1v-1m4 1v-1M4 14v6a2 2 0 002 2h12a2 2 0 002-2v-6M4 14h16M4 14l-.454-.546C4.443 13.064 4.896 13 5.372 13h13.256c.476 0 .93.064 1.076.454L20 14m-12 0H6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-4 0v4m-6-4h4" /></svg>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Envío Gratis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Para pedidos desde $50</p>
          </div>
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4v2m0 4v2m0 4a1 1 0 100-2 1 1 0 000 2z" /></svg>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Soporte 24/7</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Llámanos en cualquier momento</p>
          </div>
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.924 12c0 3.078 1.137 5.968 3.076 8.125l.001.001C7.618 21.365 9.773 22 12 22c2.227 0 4.382-.635 6.099-1.875l.001-.001c1.939-2.157 3.076-5.047 3.076-8.125a12.001 12.001 0 00-2.382-7.06" /></svg>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">100% Seguridad</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Solo pagos seguros</p>
          </div>
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ofertas Calientes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Descuentos de hasta el 90%</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Neumáticos Destacados</h2>
            <div className="flex space-x-2 overflow-x-auto p-2 rounded-lg shadow-sm w-full md:w-auto
                        bg-white dark:bg-gray-800">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors duration-200 text-sm font-medium
                    ${activeFilter === filter
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-gray-200 text-gray-800 hover:bg-red-700 hover:text-white dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-700'}`}
                >
                  {filter}
                </button>
              ))}
              <button className="hidden sm:inline-block text-gray-600 hover:text-red-600 transition-colors p-2 dark:text-gray-400 dark:hover:text-red-600" aria-label="Anterior"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
              <button className="hidden sm:inline-block text-gray-600 hover:text-red-600 transition-colors p-2 dark:text-gray-400 dark:hover:text-red-600" aria-label="Siguiente"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                allProducts={safeProducts} // Pass all products for variation selection
                onOpenProductSelectionModal={onOpenProductSelectionModal} // Pass the new prop
              />
            ))}
          </div>
        </div>
      </section>

      <DealZoneTimer 
        config={dealZoneConfig} 
        products={safeProducts}
        onOpenProductSelectionModal={onOpenProductSelectionModal}
      />

      <CategoryCarousel categories={categories} />

      {/* More product showcase, similar to "Featured Products" but with different images */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center dark:text-gray-100">Nuevos Ingresos en Neumáticos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {newArrivals.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                allProducts={safeProducts} // Pass all products for variation selection
                onOpenProductSelectionModal={onOpenProductSelectionModal} // Pass the new prop
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;