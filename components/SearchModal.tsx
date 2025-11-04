import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Product } from '../types';
import Modal from './Modal';
import { useToast } from '../contexts/ToastContext';
import SafeImage from './SafeImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[]; // Pass products as a prop
}

const debounce = (func: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showInfo } = useToast();

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const generateSuggestions = useCallback((term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lowerCaseTerm = term.toLowerCase();
    const filtered = products.filter(product => // Use products prop here
      product.name.toLowerCase().includes(lowerCaseTerm) ||
      product.brand.toLowerCase().includes(lowerCaseTerm) ||
      product.sku.toLowerCase().includes(lowerCaseTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowerCaseTerm))
    ).slice(0, 5);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [products]); // Add products to dependency array

  const debouncedGenerateSuggestions = useCallback(debounce(generateSuggestions, 300), [generateSuggestions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedGenerateSuggestions(value);
  };

  const handleSelectSuggestion = (product: Product) => {
    setSearchTerm(product.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onClose();
    console.log('Selected product:', product.name);
    showInfo(`Producto seleccionado: ${product.name}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Performing full search for:', searchTerm);
      showInfo(`Buscando: ${searchTerm}`);
      setSuggestions([]);
      setShowSuggestions(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Productos">
      <form onSubmit={handleSearchSubmit} className="relative mb-4">
        <input
          type="text"
          placeholder="Introduce palabra clave o número"
          className="py-2 px-4 rounded-full shadow-sm w-full pr-10 focus:outline-none focus:ring-2 focus:ring-red-600
                     bg-gray-100 text-gray-800 placeholder:text-gray-500
                     dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
          value={searchTerm}
          onChange={handleSearchChange}
          ref={searchInputRef}
          aria-label="Campo de búsqueda de productos"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600" aria-label="Buscar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="rounded-md shadow-lg overflow-hidden border
                    bg-white border-gray-200
                    dark:bg-gray-800 dark:border-gray-700">
          <ul className="max-h-80 overflow-y-auto" role="listbox">
            {suggestions.map((product) => (
              <li
                key={product.id}
                className="px-4 py-3 cursor-pointer text-sm flex items-center border-b last:border-b-0
                           hover:bg-gray-100 text-gray-800 border-gray-100
                           dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700"
                onClick={() => handleSelectSuggestion(product)}
                role="option"
                aria-selected={false}
              >
                <SafeImage src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded mr-3" />
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-gray-600 text-xs dark:text-gray-400">{product.brand} - {product.sku}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchTerm.trim() && !showSuggestions && suggestions.length === 0 && (
        <p className="text-center text-gray-500 mt-4 dark:text-gray-400">No se encontraron productos.</p>
      )}
    </Modal>
  );
};

export default SearchModal;