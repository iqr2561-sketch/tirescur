import React, { useState } from 'react';
import { WIDTHS, PROFILES, DIAMETERS, DEFAULT_HERO_IMAGE_URL } from '../constants';
import { TireFilter, Product } from '../types';

interface HeroSearchProps {
  heroImageUrl: string;
  products: Product[]; // Pass products from App.tsx
}

const HeroSearch: React.FC<HeroSearchProps> = ({ heroImageUrl, products }) => {
  const [width, setWidth] = useState(WIDTHS[0]);
  const [profile, setProfile] = useState(PROFILES[0]);
  const [diameter, setDiameter] = useState(DIAMETERS[0]);

  const handleSearch = () => {
    const filter: TireFilter = { width, profile, diameter };
    console.log('Buscando neumáticos con filtros:', filter);

    const filteredProducts = products.filter(product => { // Use products prop here
      const matchWidth = (width === WIDTHS[0] || product.width === width);
      const matchProfile = (profile === PROFILES[0] || product.profile === profile);
      const matchDiameter = (diameter === DIAMETERS[0] || product.diameter === diameter);
      return matchWidth && matchProfile && matchDiameter;
    });

    if (filteredProducts.length > 0) {
      alert(`Se encontraron ${filteredProducts.length} neumático(s) con los filtros:\nAncho: ${width}\nPerfil: ${profile}\nDiámetro: ${diameter}\n\nProductos: ${filteredProducts.map(p => p.name).join(', ')}`);
    } else {
      alert(`No se encontraron neumáticos con los filtros:\nAncho: ${width}\nPerfil: ${profile}\nDiámetro: ${diameter}`);
    }
  };

  return (
    <div
      className="relative bg-gray-800 bg-cover bg-center py-16 sm:py-20 md:py-24"
      style={{ backgroundImage: `url(${heroImageUrl || DEFAULT_HERO_IMAGE_URL})` }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative container mx-auto px-4 text-center text-white">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Encuentra los Neumáticos Perfectos</h1>
        <p className="text-base sm:text-lg mb-8">Gran variedad de marcas y medidas</p>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl inline-block w-full max-w-2xl dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <select
                className="p-3 pr-10 border rounded-md shadow-sm w-full appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600
                           bg-white text-gray-800 border-gray-300
                           dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                aria-label="Seleccionar Ancho"
              >
                {WIDTHS.map((w) => (
                  <option key={w} value={w} className={w === WIDTHS[0] ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}>
                    {w}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select
                className="p-3 pr-10 border rounded-md shadow-sm w-full appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600
                           bg-white text-gray-800 border-gray-300
                           dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                aria-label="Seleccionar Perfil"
              >
                {PROFILES.map((p) => (
                  <option key={p} value={p} className={p === PROFILES[0] ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select
                className="p-3 pr-10 border rounded-md shadow-sm w-full appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600
                           bg-white text-gray-800 border-gray-300
                           dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                aria-label="Seleccionar Diámetro"
              >
                {DIAMETERS.map((d) => (
                  <option key={d} value={d} className={d === DIAMETERS[0] ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
              </div>
            </div>
            
            <button
              className="bg-red-600 text-white font-semibold py-3 px-8 rounded-md shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 text-base"
              onClick={handleSearch}
            >
              Buscar Neumáticos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;