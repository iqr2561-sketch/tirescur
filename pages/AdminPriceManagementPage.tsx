import React, { useState, useCallback } from 'react';
import { Product, ExcelProductRow, Brand } from '../types';
import * as XLSX from 'xlsx'; // Assuming xlsx is available, e.g., via importmap or bundling
import { useToast } from '../contexts/ToastContext';


interface AdminPriceManagementPageProps {
  products: Product[];
  brands: Brand[]; // Pass brands for new product creation lookup
  onUpdateProductsBulk: (products: Product[]) => void;
  onAddProductsBulk: (products: Omit<Product, 'id'>[]) => Promise<Product[]>; // New prop
}

// Helper to parse "Size" column from Excel (e.g., "155/70R12")
const parseExcelSize = (sizeString: string) => {
  if (!sizeString) return { width: '', profile: '' }; // Diameter will come from RIM
  const str = sizeString.toUpperCase().replace(/\s/g, ''); // Clean string
  const regex = /(\d+)\/(\d+)(?:R\d+)?/; // e.g., "155/70R12" or "155/70"
  const match = str.match(regex);
  if (match) {
    return {
      width: match[1],
      profile: match[2],
    };
  }
  return { width: '', profile: '' }; // Fallback
};

const AdminPriceManagementPage: React.FC<AdminPriceManagementPageProps> = ({ products, brands, onUpdateProductsBulk, onAddProductsBulk }) => {
  const [percentage, setPercentage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [excelStatus, setExcelStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [excelMessage, setExcelMessage] = useState('');

  const { showWarning } = useToast();

  const getInputFieldClasses = () => `
    mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500
    bg-white text-gray-900 placeholder:text-gray-500
    dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600
  `;

  const handlePercentageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(e.target.value);
  }, []);

  const handleApplyPercentage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const percentValue = parseFloat(percentage);

    if (isNaN(percentValue) || percentValue === 0) {
      showWarning('Por favor, introduce un porcentaje válido (ej. 10 para +10%, -5 para -5%).');
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres ${percentValue > 0 ? 'aumentar' : 'disminuir'} los precios en un ${Math.abs(percentValue)}% para TODOS los productos?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const updatedProducts = products.map(product => ({
      ...product,
      price: product.price * (1 + percentValue / 100),
    }));

    await onUpdateProductsBulk(updatedProducts);
    // onUpdateProductsBulk ya gestiona los mensajes
    setPercentage('');
  }, [percentage, products, onUpdateProductsBulk, showWarning]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExcelStatus('idle');
      setExcelMessage('');
    } else {
      setFile(null);
    }
  }, []);

  const handleUploadExcel = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showWarning('Por favor, selecciona un archivo Excel/CSV para subir.');
      return;
    }

    setExcelStatus('processing');
    setExcelMessage('Procesando archivo...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: ExcelProductRow[] = XLSX.utils.sheet_to_json(worksheet);

        let updatedCount = 0;
        let createdCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        const productsToUpdate: Product[] = [];
        const productsToCreate: Omit<Product, 'id'>[] = [];

        // Create a map for efficient lookup of existing products by SKU or combination
        const existingProductsMap = new Map<string, Product>();
        products.forEach(p => {
            if (p.sku) existingProductsMap.set(p.sku.toLowerCase(), p);
            // Also store by a combined key for dimensional match if SKU fails
            const dimensionalKey = `${p.brand.toLowerCase()}-${p.name.toLowerCase()}-${p.width}-${p.profile}-${p.diameter}`;
            existingProductsMap.set(dimensionalKey, p);
        });

        // Create a map for brands to get logo URLs for new products
        const brandsMap = new Map<string, Brand>();
        brands.forEach(b => brandsMap.set(b.name.toLowerCase(), b));


        for (const row of json) {
          const parsedSize = parseExcelSize(row.Size || '');
          const diameter = `R${(row.RIM || '').toString().replace('R', '')}`; // Ensure 'R' prefix for consistency

          const brandName = (row.Marca || '').trim();
          const productName = (row.Modelo || '').trim();
          const newPrice = parseFloat(row.Precio?.toString());
          const imageUrl = (row.Imagen || '').trim();

          // Skip row if essential data is missing
          if (!brandName || !productName || isNaN(newPrice) || newPrice <= 0 || !parsedSize.width || !parsedSize.profile || !diameter) {
              errorCount++;
              errors.push(`Fila (Marca: ${row.Marca}, Modelo: ${row.Modelo}, Size: ${row.Size}, RIM: ${row.RIM}): Datos insuficientes o precio inválido.`);
              continue;
          }

          let foundProduct: Product | undefined = undefined;

          // Try to match by SKU first
          if (productName.startsWith('SKU: ')) {
            const skuToMatch = productName.substring(5).toLowerCase();
            foundProduct = existingProductsMap.get(skuToMatch);
          }
          
          // If not found by SKU, try by full dimensions, brand and name
          if (!foundProduct) {
            const dimensionalKey = `${brandName.toLowerCase()}-${productName.toLowerCase()}-${parsedSize.width}-${parsedSize.profile}-${diameter}`;
            foundProduct = existingProductsMap.get(dimensionalKey);
          }

          if (foundProduct) {
            // Product found, update it
            const updatedProduct = {
              ...foundProduct,
              price: newPrice,
              imageUrl: imageUrl || foundProduct.imageUrl, // Update image if provided
            };
            productsToUpdate.push(updatedProduct);
            updatedCount++;
          } else {
            // Product not found, create a new one
            const brandInfo = brandsMap.get(brandName.toLowerCase());
            const newSku = `SKU: ${brandName.substring(0,3).toUpperCase()}-${productName.substring(0,3).toUpperCase()}-${parsedSize.width}-${parsedSize.profile}-${diameter}`;

            productsToCreate.push({
              sku: newSku,
              name: productName,
              brand: brandName,
              brandLogoUrl: brandInfo?.logoUrl,
              price: newPrice,
              rating: 0,
              reviews: 0,
              imageUrl: imageUrl?.trim() || '',
              description: `Neumático ${productName} de la marca ${brandName} con dimensiones ${parsedSize.width}/${parsedSize.profile}${diameter}.`,
              tags: [],
              stock: 10, // Default stock for new products
              width: parsedSize.width,
              profile: parsedSize.profile,
              diameter: diameter,
            });
            createdCount++;
          }
        }
        
        // Perform bulk updates
        if (productsToUpdate.length > 0) {
            await onUpdateProductsBulk(productsToUpdate);
        }

        // Perform bulk creations
        if (productsToCreate.length > 0) {
            await onAddProductsBulk(productsToCreate);
        }

        setExcelStatus('success');
        setExcelMessage(`Actualización por Excel completada: ${updatedCount} productos actualizados, ${createdCount} productos creados, ${errorCount} errores. Consulta la consola para detalles.`);
        console.log('Errores de Excel:', errors);
      } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        setExcelStatus('error');
        setExcelMessage('Error al leer el archivo Excel. Asegúrate de que es un formato válido.');
      } finally {
        setFile(null); // Clear selected file after processing
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file, products, brands, onUpdateProductsBulk, onAddProductsBulk, showWarning]);

  return (
    <div className="flex-1 p-8 bg-gray-100 overflow-auto dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">Actualizar Precios</h1>

      {/* Actualizar Precios por Porcentaje */}
      <div className="p-6 rounded-lg shadow-md mb-8 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Aplicar Porcentaje Global</h2>
        <form onSubmit={handleApplyPercentage} className="space-y-4">
          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Cambiar precios en (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="percentage"
              id="percentage"
              value={percentage}
              onChange={handlePercentageChange}
              step="0.1"
              className={getInputFieldClasses()}
              placeholder="Ej: 10 (para +10%), -5 (para -5%)"
              required
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Introduce un valor positivo para aumentar o negativo para disminuir.</p>
          </div>
          <button
            type="submit"
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            <span>Aplicar Porcentaje</span>
          </button>
        </form>
      </div>

      {/* Importar Precios desde Excel/CSV */}
      <div className="p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Importar Precios por Excel/CSV</h2>
        <form onSubmit={handleUploadExcel} className="space-y-4">
          <div>
            <label htmlFor="excelFile" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Archivo Excel/CSV <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="excelFile"
              id="excelFile"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className={`
                ${getInputFieldClasses()} file:mr-4 file:py-2 file:px-4 file:rounded-md
                file:border-0 file:text-sm file:font-semibold
                file:bg-red-50 file:text-red-700
                hover:file:bg-red-100
                dark:file:bg-red-900 dark:file:text-red-100 dark:hover:file:bg-red-800
              `}
              required
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sube un archivo Excel (.xlsx) o CSV con las columnas: Marca, Modelo, Size, RIM, Precio, Imagen.
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              El formato de 'Size' debe ser como '155/70R12'. 'Modelo' debería coincidir con el nombre del producto o el SKU. 'RIM' el diámetro de la llanta.
            </p>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            disabled={!file || excelStatus === 'processing'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>{excelStatus === 'processing' ? 'Subiendo...' : 'Subir Excel/CSV'}</span>
          </button>
          {excelStatus !== 'idle' && excelMessage && (
            <p className={`mt-4 text-sm ${excelStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {excelMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminPriceManagementPage;