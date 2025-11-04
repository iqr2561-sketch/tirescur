import React from 'react';
import { Product } from '../types';
import SafeImage from './SafeImage';

interface AdminProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({ product, onEdit, onDelete }) => {
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

  const isActive = product.isActive !== undefined ? product.isActive : true;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col dark:bg-gray-800 ${!isActive ? 'opacity-60 border-2 border-red-300' : ''}`}>
      {!isActive && (
        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          Inactivo
        </div>
      )}
      <div className="relative h-48 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700">
        <SafeImage src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
        <div className="absolute top-2 left-2 h-8 w-8">
          <SafeImage
            src={product.brandLogoUrl}
            alt={`${product.brand} Logo`}
            className="h-8 w-8 object-contain"
            fallbackText={(product.brand || '').slice(0, 2).toUpperCase()}
          />
        </div>
        <span className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded-full ${stockInfo.color}`}>
          {stockInfo.text}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">{product.sku}</p>
        <h3 className="text-gray-800 text-lg font-semibold mb-2 line-clamp-2 dark:text-gray-100" title={product.name}>{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 dark:text-gray-300">{product.brand}</p>
        <p className="text-2xl font-bold text-gray-900 mb-4 dark:text-gray-100">${product.price.toFixed(2)}</p>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onEdit(product)}
            className="text-indigo-600 hover:text-indigo-900 transition-colors text-sm font-medium dark:text-indigo-400 dark:hover:text-indigo-300"
            aria-label={`Editar producto ${product.name}`}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-900 transition-colors text-sm font-medium dark:text-red-400 dark:hover:text-red-300"
            aria-label={`Eliminar producto ${product.name}`}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductCard;