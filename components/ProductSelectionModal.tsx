import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from './Modal';
import { Product } from '../types';
import SafeImage from './SafeImage';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null; // The base product clicked to open the modal
  allProducts: Product[]; // All products to find variations from
  onAddToCart: (product: Product) => void;
  whatsappPhoneNumber: string;
  onInitiateOrder: (products: { productId: string; name: string; quantity: number; price: number; }[], total: number) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  product,
  allProducts,
  onAddToCart,
  whatsappPhoneNumber,
  onInitiateOrder,
}) => {
  const [selectedWidth, setSelectedWidth] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [selectedDiameter, setSelectedDiameter] = useState<string>('');
  const [showAddToCartConfirmation, setShowAddToCartConfirmation] = useState(false);

  // Reset selections when the modal opens with a new product
  useEffect(() => {
    if (product) {
      setSelectedWidth(product.width);
      setSelectedProfile(product.profile);
      setSelectedDiameter(product.diameter);
      setShowAddToCartConfirmation(false); // Reset confirmation on new product
    } else {
      setSelectedWidth('');
      setSelectedProfile('');
      setSelectedDiameter('');
    }
  }, [product]);

  const variations = useMemo(() => {
    if (!product) return [];
    // Find all products that are variations of the current product (same name and brand)
    return allProducts.filter(p => p.name === product.name && p.brand === product.brand);
  }, [product, allProducts]);

  const currentSelectedProduct = useMemo(() => {
    // Find the product that matches the current selections
    return variations.find(p =>
      p.width === selectedWidth &&
      p.profile === selectedProfile &&
      p.diameter === selectedDiameter
    );
  }, [variations, selectedWidth, selectedProfile, selectedDiameter]);

  const uniqueWidths = useMemo(() => {
    const widths = new Set<string>();
    variations.forEach(p => widths.add(p.width));
    return Array.from(widths).sort((a,b) => parseInt(a) - parseInt(b));
  }, [variations]);

  const uniqueProfiles = useMemo(() => {
    const profiles = new Set<string>();
    variations.forEach(p => profiles.add(p.profile));
    return Array.from(profiles).sort((a,b) => parseInt(a) - parseInt(b));
  }, [variations]);

  const uniqueDiameters = useMemo(() => {
    const diameters = new Set<string>();
    variations.forEach(p => diameters.add(p.diameter));
    return Array.from(diameters).sort((a,b) => {
      const numA = parseInt(a.replace('R', ''));
      const numB = parseInt(b.replace('R', ''));
      return numA - numB;
    });
  }, [variations]);

  const getStockIndicator = (stock: number) => {
    if (stock <= 0) {
      return { text: 'Agotado', color: 'bg-red-500' };
    } else if (stock < 5) {
      return { text: 'Pocas unidades', color: 'bg-yellow-500' };
    } else {
      return { text: 'En stock', color: 'bg-green-500' };
    }
  };

  const currentStock = currentSelectedProduct?.stock || 0;
  const stockInfo = getStockIndicator(currentStock);
  const isAddToCartDisabled = !currentSelectedProduct || currentSelectedProduct.stock <= 0;

  const handleAddToCartClick = () => {
    if (!currentSelectedProduct || isAddToCartDisabled) return;
    onAddToCart(currentSelectedProduct);
    setShowAddToCartConfirmation(true);
    setTimeout(() => {
      setShowAddToCartConfirmation(false);
      onClose(); // Close modal after confirmation
    }, 1500);
  };

  const handleOrderViaWhatsApp = () => {
    if (!currentSelectedProduct || isAddToCartDisabled) return;
    onInitiateOrder([{ productId: currentSelectedProduct.id, name: currentSelectedProduct.name, quantity: 1, price: currentSelectedProduct.price }], currentSelectedProduct.price);
    onClose(); // Close modal after initiating order
  };

  const selectClasses = `p-3 pr-10 border rounded-md shadow-sm w-full appearance-none cursor-pointer hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600
                        bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:border-gray-500`;
  const selectWrapperClasses = `relative flex-1`;
  const selectArrowClasses = `pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 dark:text-gray-200`;

  if (!product) return null; // Don't render if no product is selected

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Seleccionar Medidas para ${product.name}`}>
      <div className="flex flex-col space-y-4">
        {/* Product Info Card */}
        <div className="flex items-center space-x-4 p-3 bg-gray-100 rounded-lg dark:bg-gray-700">
          <SafeImage
            src={currentSelectedProduct?.imageUrl || product.imageUrl}
            alt={product.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <h3 className="text-gray-900 font-semibold dark:text-gray-100">{product.name}</h3>
            <p className="text-gray-600 text-sm dark:text-gray-300">{product.brand}</p>
          </div>
        </div>

        {/* Dimension Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={selectWrapperClasses}>
            <label htmlFor="modal-width-select" className="sr-only">Ancho</label>
            <select
              id="modal-width-select"
              value={selectedWidth}
              onChange={(e) => setSelectedWidth(e.target.value)}
              className={selectClasses}
              aria-label="Seleccionar Ancho"
            >
              {uniqueWidths.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <div className={selectArrowClasses}>
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
            </div>
          </div>

          <div className={selectWrapperClasses}>
            <label htmlFor="modal-profile-select" className="sr-only">Perfil</label>
            <select
              id="modal-profile-select"
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className={selectClasses}
              aria-label="Seleccionar Perfil"
            >
              {uniqueProfiles.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className={selectArrowClasses}>
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
            </div>
          </div>

          <div className={selectWrapperClasses}>
            <label htmlFor="modal-diameter-select" className="sr-only">Diámetro de Llanta</label>
            <select
              id="modal-diameter-select"
              value={selectedDiameter}
              onChange={(e) => setSelectedDiameter(e.target.value)}
              className={selectClasses}
              aria-label="Seleccionar Diámetro de Llanta"
            >
              {uniqueDiameters.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className={selectArrowClasses}>
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.071 6.9l-1.414 1.414L9.293 12.95z"/></svg>
            </div>
          </div>
        </div>

        {/* Price and Stock Status */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentSelectedProduct ? `$${currentSelectedProduct.price.toFixed(2)}` : 'N/A'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${stockInfo.color}`}>
            {stockInfo.text}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 relative">
            <span className={`absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-md text-sm z-10 whitespace-nowrap
                                transition-all duration-300
                                ${showAddToCartConfirmation ? 'opacity-100 -top-12' : 'opacity-0 -top-8'}
                                bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
                ¡Añadido al carrito!
            </span>
          <button
            onClick={handleAddToCartClick}
            className={`w-full sm:flex-1 py-3 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 text-base flex items-center justify-center
              ${isAddToCartDisabled ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600' : 'bg-red-600 hover:bg-red-700 focus:ring-red-600'}`}
            disabled={isAddToCartDisabled}
            aria-label="Añadir al Carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Añadir al Carrito
          </button>
          <button
            onClick={handleOrderViaWhatsApp}
            className={`w-full sm:flex-1 py-3 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 text-base flex items-center justify-center
              ${isAddToCartDisabled ? 'opacity-50 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'}`}
            disabled={isAddToCartDisabled}
            aria-label="Pedir por WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.964.001-6.577 5.338-11.916 11.917-11.916 3.22 0 6.227 1.24 8.537 3.538 2.31 2.297 3.54 5.292 3.54 8.541 0 6.58-5.337 11.917-11.916 11.917-1.959 0-3.857-.501-5.517-1.457l-6.177 1.689zm6.559-4.884c1.328.733 2.871 1.144 4.537 1.144 5.385 0 9.754-4.368 9.754-9.752 0-2.644-1.026-5.111-2.879-6.957-1.854-1.845-4.322-2.873-6.96-2.873-5.384 0-9.751 4.368-9.751 9.752 0 1.583.432 3.122 1.258 4.502l-.845 3.085 3.125-.813zm-1.121-1.08l-.504-.262c-.655.361-1.082.906-1.082 1.581 0 .864.636 1.487 1.298 1.487 1.096 0 2.253-.404 2.253-1.488 0-.491-.328-.888-.897-1.168l-.897-.245zm-1.002-3.238l-.135-.297c-.378-.838-.135-1.745.541-2.227.676-.482 1.621-.482 2.379.135l.135.297c-.378.838.135 1.745-.541 2.227-.676.482-1.621.482-2.379-.135zm-1.002-3.238l-.135-.297c-.378-.838-.135-1.745.541-2.227.676-.482 1.621-.482 2.379.135l.135.297c-.378.838.135 1.745-.541 2.227-.676.482-1.621.482-2.379-.135z"></path></svg>
            WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductSelectionModal;