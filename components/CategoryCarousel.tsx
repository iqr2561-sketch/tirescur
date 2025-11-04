import React from 'react';
import { Category } from '../types';
import SafeImage from './SafeImage';

interface CategoryCarouselProps {
  categories: Category[];
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories }) => {
  if (!categories.length) {
    return null;
  }

  return (
    <div className="py-12 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center dark:text-gray-100">Explorar Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden text-center cursor-pointer dark:bg-gray-800">
              <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <SafeImage src={category.imageUrl} alt={category.name} className="max-h-full max-w-full object-contain p-2" />
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="text-red-600 mb-2">{category.icon}</div>
                <h3 className="text-gray-800 text-lg font-semibold dark:text-gray-100">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;