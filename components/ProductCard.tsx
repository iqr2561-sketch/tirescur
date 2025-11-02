import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { DEFAULT_PRODUCT_IMAGE_URL, WIDTHS, PROFILES, DIAMETERS } from '../constants';

interface ProductCardProps {
  product: Product; // The initial product (one variation)
  allProducts: Product[]; // All products from the database to find variations
  onOpenProductSelectionModal: (product: Product) => void; // New prop to open the selection modal
}

const ProductCard: React.FC<ProductCardProps> = ({ product, allProducts, onOpenProductSelectionModal }) => {
  // We no longer need state for selected dimensions or currentSelectedProduct here,
  // as that logic will be moved into the ProductSelectionModal.
  // However, we still need to derive the current product's stock and image for the card itself.

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1  0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" /></svg>
        ))}
        {hasHalfStar && (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#fbbf24"/>
                <stop offset="50%" stopColor="#cbd5e0"/>
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1  0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"/>
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1  0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" /></svg>
        ))}
      </div>
    );
  };

  const getStockIndicator = (stock: number) => {
    if (stock <= 0) {
      return { text: 'Agotado', color: 'bg-red-500' };
    } else if (stock < 5) {
      return { text: 'Pocas unidades', color: 'bg-yellow-500' };
    } else {
      return { text: 'En stock', color: 'bg-green-500' };
    }
  };

  const stockInfo = getStockIndicator(product.stock);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
      <div className="relative h-48 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700">
        <img src={product.imageUrl || DEFAULT_PRODUCT_IMAGE_URL} alt={product.name} className="max-h-full max-w-full object-contain" />
        {product.brandLogoUrl && (
          <img src={product.brandLogoUrl} alt={`${product.brand} Logo`} className="absolute top-2 left-2 h-8 object-contain" />
        )}
        {(product.tags?.includes('new')) && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">NUEVO</span>
        )}
        {(product.tags?.includes('hot')) && !(product.tags?.includes('new')) && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">OFERTA</span>
        )}
        <span className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded-full ${stockInfo.color}`}>
          {stockInfo.text}
        </span>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">{product.sku}</p>
        <h3 className="text-gray-800 text-lg font-semibold mb-2 line-clamp-2 dark:text-gray-100" title={product.name}>{product.name}</h3>
        <p className="text-gray-600 text-sm mb-1 dark:text-gray-300">{product.brand}</p> 
        
        {/* Dimensions as a clickable pill */}
        <div className="flex items-center justify-between mt-2 mb-3">
          <p className="text-sm text-gray-700 dark:text-gray-200">Medidas:</p>
          <button
            onClick={() => onOpenProductSelectionModal(product)}
            className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            aria-label={`Seleccionar medidas para ${product.name}`}
          >
            {`${product.width}/${product.profile}${product.diameter}`}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {product.rating > 0 ? (
          <div className="flex items-center mb-3">
            {renderStars(product.rating)}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{product.reviews} opiniones</span>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-3 dark:text-gray-400">Sin opiniones aún</p>
        )}
        <div className="flex flex-col space-y-2 mt-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</span>
          <div className="relative">
            <button
              onClick={() => onOpenProductSelectionModal(product)} // Open modal on "Comprar" click
              className={`w-full p-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm flex items-center justify-center
                ${product.stock <= 0 ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600' : 'bg-red-600 hover:bg-red-700 focus:ring-red-600'}`}
              aria-label={`Comprar ${product.name}`}
              disabled={product.stock <= 0}
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;