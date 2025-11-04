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

  const { showSuccess, showError, showWarning } = useToast();

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
    
    reader.onerror = () => {
      console.error('Error al leer el archivo');
      setExcelStatus('error');
      setExcelMessage('Error al leer el archivo. Por favor, intenta con otro archivo.');
      setFile(null);
    };

    reader.onload = async (event) => {
      try {
        // Validar que el resultado del reader sea válido
        if (!event.target?.result) {
          throw new Error('No se pudo leer el contenido del archivo');
        }

        const data = new Uint8Array(event.target.result as ArrayBuffer);
        
        // Validar que el archivo no esté vacío
        if (data.length === 0) {
          throw new Error('El archivo está vacío');
        }

        let workbook;
        try {
          // Detectar si es CSV por extensión
          const isCSV = file.name.toLowerCase().endsWith('.csv');
          
          if (isCSV) {
            // Leer CSV: primero convertir a string, luego parsear
            const text = new TextDecoder('utf-8').decode(data);
            // XLSX.read puede leer CSV directamente desde string
            workbook = XLSX.read(text, { 
              type: 'string',
              raw: false,
              defval: ''
            });
          } else {
            // Leer Excel (.xlsx, .xls)
            workbook = XLSX.read(data, { 
              type: 'array', 
              cellDates: false, 
              cellNF: false, 
              cellText: false,
              sheetStubs: false,
              raw: false
            });
          }
        } catch (readError: any) {
          console.error('Error específico de XLSX.read:', readError);
          console.error('Detalles del error:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            error: readError
          });
          const errorDetails = readError?.message || readError?.toString() || 'Desconocido';
          throw new Error(`Error al procesar el archivo "${file.name}". Verifica que sea un archivo .xlsx o .csv válido. Detalles: ${errorDetails}`);
        }

        // Validar que el workbook tenga hojas
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('El archivo Excel no contiene hojas de cálculo');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          throw new Error('No se pudo leer la primera hoja del archivo');
        }

        let json: ExcelProductRow[];
        try {
          json = XLSX.utils.sheet_to_json(worksheet, { 
            defval: '', 
            raw: false,
            blankrows: false 
          }) as ExcelProductRow[];
        } catch (jsonError) {
          console.error('Error al convertir a JSON:', jsonError);
          throw new Error(`Error al convertir los datos del Excel. Verifica que el formato sea correcto.`);
        }

        // Validar que hay datos
        if (!json || json.length === 0) {
          throw new Error('El archivo Excel no contiene datos. Verifica que tenga filas con información.');
        }

        let updatedCount = 0;
        let createdCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        const productsToUpdate: Product[] = [];
        const productsToCreate: Omit<Product, 'id'>[] = [];

        // Create a map for efficient lookup of existing products by SKU or combination
        const existingProductsMap = new Map<string, Product>();
        const safeProducts = products || [];
        safeProducts.forEach(p => {
            if (p.sku) existingProductsMap.set((p.sku || '').toLowerCase(), p);
            // Also store by a combined key for dimensional match if SKU fails
            const brand = (p.brand || '').toLowerCase();
            const name = (p.name || '').toLowerCase();
            const dimensionalKey = `${brand}-${name}-${p.width || ''}-${p.profile || ''}-${p.diameter || ''}`;
            existingProductsMap.set(dimensionalKey, p);
        });

        // Create a map for brands to get logo URLs for new products
        const brandsMap = new Map<string, Brand>();
        const safeBrands = brands || [];
        safeBrands.forEach(b => {
          if (b.name) {
            brandsMap.set(b.name.toLowerCase(), b);
          }
        });


        for (const row of json) {
          try {
            const parsedSize = parseExcelSize(row.Size || '');
            const rimValue = (row.RIM || '').toString().replace(/^R?/i, ''); // Remove 'R' prefix if present
            const diameter = rimValue ? `R${rimValue}` : ''; // Ensure 'R' prefix for consistency

            const brandName = (row.Marca || '').toString().trim();
            const productName = (row.Modelo || '').toString().trim();
            const priceValue = row.Precio ? (typeof row.Precio === 'string' ? row.Precio : row.Precio.toString()) : '';
            const newPrice = parseFloat(priceValue);
            const imageUrl = ((row.Imagen || '').toString()).trim();

            // Skip row if essential data is missing
            if (!brandName || !productName || isNaN(newPrice) || newPrice <= 0 || !parsedSize.width || !parsedSize.profile || !diameter) {
                errorCount++;
                errors.push(`Fila ${json.indexOf(row) + 1} (Marca: ${row.Marca || 'N/A'}, Modelo: ${row.Modelo || 'N/A'}, Size: ${row.Size || 'N/A'}, RIM: ${row.RIM || 'N/A'}, Precio: ${row.Precio || 'N/A'}): Datos insuficientes o precio inválido.`);
                continue;
            }

            let foundProduct: Product | undefined = undefined;

            // Try to match by SKU first
            if (productName && productName.startsWith('SKU: ')) {
              const skuToMatch = productName.substring(5).toLowerCase();
              foundProduct = existingProductsMap.get(skuToMatch);
            }
            
            // If not found by SKU, try by full dimensions, brand and name
            if (!foundProduct && brandName && productName) {
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
              const brandPrefix = brandName.length >= 3 ? brandName.substring(0, 3).toUpperCase() : brandName.toUpperCase();
              const productPrefix = productName.length >= 3 ? productName.substring(0, 3).toUpperCase() : productName.toUpperCase();
              const newSku = `SKU: ${brandPrefix}-${productPrefix}-${parsedSize.width}-${parsedSize.profile}-${diameter}`;

              productsToCreate.push({
                sku: newSku,
                name: productName,
                brand: brandName,
                brandLogoUrl: brandInfo?.logoUrl,
                price: newPrice,
                rating: 0,
                reviews: 0,
                imageUrl: imageUrl || '',
                description: `Neumático ${productName} de la marca ${brandName} con dimensiones ${parsedSize.width}/${parsedSize.profile}${diameter}.`,
                tags: [],
                stock: 10, // Default stock for new products
                width: parsedSize.width,
                profile: parsedSize.profile,
                diameter: diameter,
                isActive: true, // Default to active
              });
              createdCount++;
            }
          } catch (rowError: any) {
            errorCount++;
            const rowIndex = json.indexOf(row) + 1;
            errors.push(`Fila ${rowIndex}: Error al procesar - ${rowError?.message || 'Error desconocido'}`);
            console.error(`Error procesando fila ${rowIndex}:`, rowError, row);
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
        const successMessage = errorCount > 0 
          ? `✅ Actualización completada: ${updatedCount} productos actualizados, ${createdCount} productos creados, ${errorCount} ${errorCount === 1 ? 'error' : 'errores'}. Consulta la consola para detalles.`
          : `✅ ¡Actualización exitosa! ${updatedCount} productos actualizados, ${createdCount} productos creados.`;
        setExcelMessage(successMessage);
        
        // Mostrar notificación toast también
        if (errorCount === 0) {
          showSuccess(`✅ ${updatedCount} productos actualizados, ${createdCount} productos creados`, 7000);
        } else {
          showWarning(`⚠️ Actualización con errores: ${updatedCount} actualizados, ${createdCount} creados, ${errorCount} errores`, 8000);
        }
        if (errors.length > 0) {
          console.error('Errores de Excel:', errors);
        }
      } catch (error: any) {
        console.error('Error al leer el archivo Excel:', error);
        setExcelStatus('error');
        const errorMessage = error?.message || 'Error desconocido al leer el archivo';
        let userMessage = `Error al procesar el archivo: ${errorMessage}`;
        
        // Mensajes más específicos según el tipo de error
        if (errorMessage.includes('405') || errorMessage.includes('Method not allowed')) {
          userMessage = '❌ Error de conexión: El servidor rechazó la petición. Verifica que el endpoint esté disponible.';
        } else if (errorMessage.includes('is_active') || errorMessage.includes('column') || errorMessage.includes('schema')) {
          userMessage = '❌ Error de configuración: La columna \'is_active\' no existe en la base de datos. Ejecuta la migración: migrations/add_is_active_to_products.sql en Supabase.';
        } else if (errorMessage.includes('toLowerCase') || errorMessage.includes('toUpperCase')) {
          userMessage = '❌ Error: El archivo contiene datos incompletos. Verifica que todas las columnas (Marca, Modelo, Size, RIM, Precio) tengan valores válidos.';
        } else if (errorMessage.includes('no contiene datos')) {
          userMessage = '❌ El archivo está vacío o no contiene datos válidos. Verifica que tenga al menos una fila con información.';
        } else if (errorMessage.includes('no contiene hojas')) {
          userMessage = '❌ El archivo Excel no contiene hojas de cálculo. Verifica que el archivo no esté corrupto.';
        } else if (errorMessage.includes('formato')) {
          userMessage = '❌ Error de formato en el archivo. Asegúrate de que sea un archivo .xlsx o .csv válido.';
        } else {
          userMessage = `❌ ${errorMessage}`;
        }
        
        setExcelMessage(`${userMessage}\n\n📋 Formato esperado:\n• Marca: Nombre de la marca\n• Modelo: Nombre del producto\n• Size: Formato "155/70R12"\n• RIM: Diámetro (ej: "12" o "R12")\n• Precio: Número válido\n• Imagen: URL (opcional)`);
      } finally {
        setFile(null); // Clear selected file after processing
      }
    };
    
    try {
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Error al iniciar la lectura del archivo:', error);
      setExcelStatus('error');
      setExcelMessage(`Error al leer el archivo: ${error?.message || 'Error desconocido'}`);
      setFile(null);
    }
  }, [file, products, brands, onUpdateProductsBulk, onAddProductsBulk, showSuccess, showError, showWarning]);

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