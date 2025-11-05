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

  const handleDownloadTemplate = useCallback(() => {
    try {
      // Preparar datos para Excel con SKU incluido
      const excelData = products.map(product => {
        // Construir Size desde width y profile (ej: "155/70")
        const size = product.width && product.profile 
          ? `${product.width}/${product.profile}${product.diameter ? `R${product.diameter}` : ''}`
          : '';
        
        return {
          'SKU': product.sku || '',
          'Marca': product.brand || '',
          'Modelo': product.name || '',
          'Size': size,
          'RIM': product.diameter || '',
          'Precio': product.price || 0,
          'Imagen': product.imageUrl || ''
        };
      });

      // Crear workbook y worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 30 }, // SKU
        { wch: 20 }, // Marca
        { wch: 30 }, // Modelo
        { wch: 15 }, // Size
        { wch: 10 }, // RIM
        { wch: 12 }, // Precio
        { wch: 40 }  // Imagen
      ];
      worksheet['!cols'] = columnWidths;

      // Generar archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla_productos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(`✅ Plantilla descargada con ${products.length} productos. Edita los precios y vuelve a subir el archivo.`);
    } catch (error: any) {
      console.error('Error al generar plantilla Excel:', error);
      showError(`❌ Error al generar la plantilla: ${error?.message || 'Error desconocido'}`);
    }
  }, [products, showSuccess, showError]);

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

        // Helper function to validate UUID (also used later in the code)
        const isValidUUID = (str: string): boolean => {
          if (!str) return false;
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(str);
        };

        // Create a map for efficient lookup of existing products by SKU or combination
        // SOLO incluir productos con IDs válidos (UUIDs) para evitar errores de actualización
        const existingProductsMap = new Map<string, Product>();
        const safeProducts = products || [];
        console.log('[Excel Import] Building existing products map from', safeProducts.length, 'products');
        
        let validProductsCount = 0;
        let invalidProductsCount = 0;
        
        safeProducts.forEach(p => {
          // Solo incluir productos con IDs válidos en el mapa
          if (!p.id || !isValidUUID(p.id)) {
            invalidProductsCount++;
            console.warn(`[Excel Import] Skipping product with invalid ID: ${p.sku || p.name} (ID: ${p.id || 'missing'})`);
            return; // Saltar productos con IDs inválidos
          }
          
          validProductsCount++;
          // Store by SKU (normalized to lowercase)
          if (p.sku) {
            const normalizedSku = (p.sku || '').trim().toLowerCase();
            existingProductsMap.set(normalizedSku, p);
          }
          // Also store by a combined key for dimensional match if SKU fails
          const brand = (p.brand || '').toLowerCase().trim();
          const name = (p.name || '').toLowerCase().trim();
          const dimensionalKey = `${brand}-${name}-${p.width || ''}-${p.profile || ''}-${p.diameter || ''}`;
          existingProductsMap.set(dimensionalKey, p);
        });
        
        console.log('[Excel Import] Existing products map:', {
          totalProducts: safeProducts.length,
          validProducts: validProductsCount,
          invalidProducts: invalidProductsCount,
          mapSize: existingProductsMap.size
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

            // Get SKU from Excel row if present (from template download)
            const excelSku = (row.SKU || '').toString().trim();
            const normalizedExcelSku = excelSku ? excelSku.toLowerCase() : '';
            
            // Generate the SKU that would be used for this product (fallback)
            const brandInfo = brandsMap.get(brandName.toLowerCase());
            const brandPrefix = brandName.length >= 3 ? brandName.substring(0, 3).toUpperCase() : brandName.toUpperCase();
            const productPrefix = productName.length >= 3 ? productName.substring(0, 3).toUpperCase() : productName.toUpperCase();
            const generatedSku = `SKU: ${brandPrefix}-${productPrefix}-${parsedSize.width}-${parsedSize.profile}-${diameter}`;
            const normalizedGeneratedSku = generatedSku.trim().toLowerCase();
            
            let foundProduct: Product | undefined = undefined;

            // PRIORIDAD 1: Try to match by SKU from Excel (if provided in template)
            if (normalizedExcelSku) {
              foundProduct = existingProductsMap.get(normalizedExcelSku);
              if (foundProduct) {
                console.log(`[Excel Import] Found product by Excel SKU: ${normalizedExcelSku}`);
              }
            }

            // PRIORIDAD 2: Try to match by generated SKU (most reliable for new uploads)
            if (!foundProduct && normalizedGeneratedSku) {
              foundProduct = existingProductsMap.get(normalizedGeneratedSku);
              if (foundProduct) {
                console.log(`[Excel Import] Found product by generated SKU: ${normalizedGeneratedSku}`);
              }
            }
            
            // PRIORIDAD 3: If not found by SKU, try by full dimensions, brand and name
            if (!foundProduct && brandName && productName) {
              const dimensionalKey = `${brandName.toLowerCase()}-${productName.toLowerCase()}-${parsedSize.width}-${parsedSize.profile}-${diameter}`;
              foundProduct = existingProductsMap.get(dimensionalKey);
            }
            
            // PRIORIDAD 4: Also try to match if the product name in Excel starts with "SKU: "
            if (!foundProduct && productName && productName.startsWith('SKU: ')) {
              const skuFromName = productName.substring(5).toLowerCase();
              foundProduct = existingProductsMap.get(skuFromName);
            }

            if (foundProduct) {
              // Validar que el producto encontrado tenga un ID válido (UUID)
              // Nota: isValidUUID ya está definida arriba, pero por si acaso la validamos aquí también
              if (!foundProduct.id || !isValidUUID(foundProduct.id)) {
                // Producto encontrado pero con ID inválido - tratarlo como nuevo
                console.warn(`[Excel Import] Product found but has invalid ID "${foundProduct.id}". Treating as new product.`, foundProduct);
                // Intentar buscar otro producto con el mismo SKU que tenga ID válido
                const validProduct = safeProducts.find(p => 
                  p.sku && p.sku.trim().toLowerCase() === normalizedGeneratedSku && 
                  p.id && isValidUUID(p.id)
                );
                
                if (validProduct && validProduct.id && isValidUUID(validProduct.id)) {
                  console.log(`[Excel Import] Found valid product with same SKU: ${validProduct.sku} (ID: ${validProduct.id})`);
                  const updatedProduct = {
                    ...validProduct,
                    price: newPrice,
                    imageUrl: imageUrl || validProduct.imageUrl,
                  };
                  // VALIDACIÓN FINAL antes de push
                  if (updatedProduct.id && isValidUUID(updatedProduct.id)) {
                    productsToUpdate.push(updatedProduct);
                    updatedCount++;
                  } else {
                    console.error(`[Excel Import] CRITICAL: Valid product became invalid after update!`, updatedProduct);
                    errors.push(`Producto ${json.indexOf(row) + 1}: ID inválido en producto de reemplazo (SKU: ${generatedSku})`);
                    errorCount++;
                  }
                } else {
                  // No hay producto válido con este SKU, crear uno nuevo
                  console.log(`[Excel Import] Creating new product (old one had invalid ID): ${generatedSku}`);
                  productsToCreate.push({
                    sku: generatedSku,
                    name: productName,
                    brand: brandName,
                    brandLogoUrl: brandInfo?.logoUrl,
                    price: newPrice,
                    rating: 0,
                    reviews: 0,
                    imageUrl: imageUrl || '',
                    description: `Neumático ${productName} de la marca ${brandName} con dimensiones ${parsedSize.width}/${parsedSize.profile}${diameter}.`,
                    tags: [],
                    stock: 10,
                    width: parsedSize.width,
                    profile: parsedSize.profile,
                    diameter: diameter,
                    isActive: true,
                  });
                  createdCount++;
                }
              } else {
                // Producto encontrado con ID válido - actualizarlo
                // VALIDACIÓN FINAL: Asegurarse de que el ID sea válido antes de agregarlo
                if (!foundProduct.id || !isValidUUID(foundProduct.id)) {
                  console.error(`[Excel Import] CRITICAL: Product found but ID is invalid after validation!`, foundProduct);
                  // Intentar buscar otro producto válido
                  const validProduct = safeProducts.find(p => 
                    p.sku && p.sku.trim().toLowerCase() === normalizedGeneratedSku && 
                    p.id && isValidUUID(p.id)
                  );
                  
                  if (validProduct) {
                    console.log(`[Excel Import] Found valid product replacement: ${validProduct.sku} (ID: ${validProduct.id})`);
                    const updatedProduct = {
                      ...validProduct,
                      price: newPrice,
                      imageUrl: imageUrl || validProduct.imageUrl,
                    };
                    productsToUpdate.push(updatedProduct);
                    updatedCount++;
                  } else {
                    // Crear nuevo producto
                    console.log(`[Excel Import] Creating new product (no valid replacement found): ${generatedSku}`);
                    productsToCreate.push({
                      sku: generatedSku,
                      name: productName,
                      brand: brandName,
                      brandLogoUrl: brandInfo?.logoUrl,
                      price: newPrice,
                      rating: 0,
                      reviews: 0,
                      imageUrl: imageUrl || '',
                      description: `Neumático ${productName} de la marca ${brandName} con dimensiones ${parsedSize.width}/${parsedSize.profile}${diameter}.`,
                      tags: [],
                      stock: 10,
                      width: parsedSize.width,
                      profile: parsedSize.profile,
                      diameter: diameter,
                      isActive: true,
                    });
                    createdCount++;
                  }
                } else {
                  console.log(`[Excel Import] Product found for update: ${foundProduct.sku || foundProduct.name} (ID: ${foundProduct.id}, SKU: ${generatedSku})`);
                  const updatedProduct = {
                    ...foundProduct,
                    price: newPrice,
                    imageUrl: imageUrl || foundProduct.imageUrl, // Update image if provided
                  };
                  // VALIDACIÓN FINAL ANTES DE PUSH
                  if (updatedProduct.id && isValidUUID(updatedProduct.id)) {
                    productsToUpdate.push(updatedProduct);
                    updatedCount++;
                  } else {
                    console.error(`[Excel Import] CRITICAL: Updated product has invalid ID! Skipping.`, updatedProduct);
                    errors.push(`Producto ${json.indexOf(row) + 1}: ID inválido después de actualización (SKU: ${generatedSku})`);
                    errorCount++;
                  }
                }
              }
            } else {
              // Product not found, create a new one
              console.log(`[Excel Import] Creating new product: ${generatedSku}`);
              productsToCreate.push({
                sku: generatedSku,
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
        
        // Perform bulk updates - FILTRAR PRODUCTOS CON IDs INVÁLIDOS ANTES DE ACTUALIZAR
        if (productsToUpdate.length > 0) {
            // VALIDACIÓN CRÍTICA FINAL: Filtrar cualquier producto con ID inválido que haya pasado
            const validProductsToUpdate = productsToUpdate.filter(product => {
              if (!product.id || !isValidUUID(product.id)) {
                console.error(`[Excel Import] CRITICAL: Removing product with invalid ID from update list:`, product);
                errors.push(`Producto con SKU "${product.sku || 'N/A'}" tiene ID inválido "${product.id}" y no se puede actualizar`);
                errorCount++;
                return false;
              }
              return true;
            });
            
            console.log('[Excel Import] Products to update:', {
              total: productsToUpdate.length,
              valid: validProductsToUpdate.length,
              invalid: productsToUpdate.length - validProductsToUpdate.length
            });
            
            // LOGGING DETALLADO: Mostrar todos los productos que se intentarán actualizar
            console.log('[Excel Import] Valid products to update (IDs):', 
              validProductsToUpdate.map(p => ({ sku: p.sku, id: p.id, name: p.name }))
            );
            
            // VALIDACIÓN EXTRA: Verificar que TODOS los productos tengan IDs válidos
            const invalidProducts = validProductsToUpdate.filter(p => !p.id || !isValidUUID(p.id));
            if (invalidProducts.length > 0) {
              console.error('[Excel Import] CRITICAL BUG: Found invalid products in validProductsToUpdate!', invalidProducts);
              // Remover los inválidos
              const reallyValidProducts = validProductsToUpdate.filter(p => p.id && isValidUUID(p.id));
              console.log('[Excel Import] After removing invalid products:', {
                before: validProductsToUpdate.length,
                after: reallyValidProducts.length
              });
              
              if (reallyValidProducts.length > 0) {
                // Usar solo los productos realmente válidos
                validProductsToUpdate.length = 0;
                validProductsToUpdate.push(...reallyValidProducts);
              }
            }
            
            if (validProductsToUpdate.length > 0) {
              try {
                await onUpdateProductsBulk(validProductsToUpdate);
                console.log('[Excel Import] Bulk update completed successfully');
              } catch (updateError: any) {
              console.error('[Excel Import] Error in bulk update:', updateError);
              console.error('[Excel Import] Update error details:', {
                message: updateError?.message,
                details: updateError?.details,
                code: updateError?.code,
                hint: updateError?.hint
              });
              
              const errorMessage = updateError?.message || 'Error desconocido';
              const errorDetails = updateError?.details || '';
              const errorHint = updateError?.hint || '';
              
              let detailedError = `Error al actualizar ${validProductsToUpdate.length} productos: ${errorMessage}`;
              if (errorDetails) {
                detailedError += `\n\nDetalles: ${errorDetails}`;
              }
              if (errorHint) {
                detailedError += `\n\n💡 Sugerencia: ${errorHint}`;
              }
              
              errorCount += validProductsToUpdate.length;
              errors.push(detailedError);
              }
            } else {
              console.warn('[Excel Import] No valid products to update after filtering');
              errors.push('No hay productos válidos para actualizar después del filtrado');
            }
        }

        // Perform bulk creations - FILTER OUT DUPLICATES FIRST
        if (productsToCreate.length > 0) {
            console.log('[Excel Import] Creating', productsToCreate.length, 'products');
            
            // Create a Set of existing SKUs for quick lookup
            const existingSkus = new Set<string>();
            safeProducts.forEach(p => {
              if (p.sku) {
                existingSkus.add(p.sku.trim().toLowerCase());
              }
            });
            
            // Filter out products that already exist by SKU
            let duplicatesFound = 0;
            const productsToCreateFiltered = productsToCreate.filter(product => {
              const productSku = (product.sku || '').trim().toLowerCase();
              const exists = existingSkus.has(productSku);
              if (exists) {
                duplicatesFound++;
                console.warn(`[Excel Import] Skipping duplicate product: ${product.sku} - already exists`);
                // Try to find the existing product and add it to update list instead
                const existingProduct = safeProducts.find(p => p.sku && p.sku.trim().toLowerCase() === productSku);
                if (existingProduct) {
                  const updatedProduct = {
                    ...existingProduct,
                    price: product.price,
                    imageUrl: product.imageUrl || existingProduct.imageUrl,
                  };
                  // Check if not already in productsToUpdate AND validate ID
                  if (updatedProduct.id && isValidUUID(updatedProduct.id) && !productsToUpdate.find(p => p.id === existingProduct.id)) {
                    productsToUpdate.push(updatedProduct);
                    updatedCount++;
                    createdCount--; // Adjust count since we're updating instead of creating
                  } else {
                    console.error(`[Excel Import] CRITICAL: Duplicate filter found invalid ID!`, updatedProduct);
                  }
                }
                return false; // Filter out this product
              }
              return true; // Keep this product for creation
            });
            
            if (duplicatesFound > 0) {
              console.log(`[Excel Import] Found ${duplicatesFound} duplicate products, moved to update list`);
            }
            
            console.log('[Excel Import] After filtering duplicates:', productsToCreateFiltered.length, 'products to create');
            console.log('[Excel Import] Sample product to create:', productsToCreateFiltered[0] ? {
              sku: productsToCreateFiltered[0].sku,
              name: productsToCreateFiltered[0].name,
              brand: productsToCreateFiltered[0].brand,
              hasIsActive: 'isActive' in productsToCreateFiltered[0],
              isActive: productsToCreateFiltered[0].isActive
            } : null);
            
            if (productsToCreateFiltered.length > 0) {
              try {
                const createdProducts = await onAddProductsBulk(productsToCreateFiltered);
                console.log('[Excel Import] Bulk create completed successfully,', createdProducts?.length || 0, 'products created');
              } catch (createError: any) {
              console.error('[Excel Import] Error in bulk create:', createError);
              console.error('[Excel Import] Error details:', {
                message: createError?.message,
                details: createError?.details,
                code: createError?.code,
                hint: createError?.hint,
                status: createError?.status
              });
              
              const errorMessage = createError?.message || 'Error desconocido';
              const errorDetails = createError?.details || '';
              const errorHint = createError?.hint || '';
              
              // Construir mensaje de error más detallado
              let detailedError = `Error al crear ${productsToCreate.length} productos: ${errorMessage}`;
              if (errorDetails) {
                detailedError += `\n\nDetalles: ${errorDetails}`;
              }
              if (errorHint) {
                detailedError += `\n\n💡 Sugerencia: ${errorHint}`;
              }
              
              errorCount += productsToCreateFiltered.length;
              errors.push(detailedError);
            }
            } else {
              console.log('[Excel Import] All products were duplicates, skipping creation');
            }
        }

        setExcelStatus('success');
        
        // Construir mensaje detallado con todos los errores
        let successMessage = '';
        if (errorCount > 0) {
          successMessage = `✅ Actualización completada:\n\n` +
            `• ${updatedCount} productos actualizados\n` +
            `• ${createdCount} productos creados\n` +
            `• ${errorCount} ${errorCount === 1 ? 'error encontrado' : 'errores encontrados'}\n\n` +
            `Errores detallados:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n\n')}`;
        } else {
          successMessage = `✅ ¡Actualización exitosa!\n\n` +
            `• ${updatedCount} productos actualizados\n` +
            `• ${createdCount} productos creados`;
        }
        setExcelMessage(successMessage);
        
        // Mostrar notificación toast también
        if (errorCount === 0) {
          showSuccess(`✅ ${updatedCount} productos actualizados, ${createdCount} productos creados`, 7000);
        } else {
          // Mostrar un resumen y los primeros errores en la notificación
          const errorSummary = errors.length > 0 
            ? `\n\nPrimeros errores:\n${errors.slice(0, 3).map((e, i) => `${i + 1}. ${e.split('\n')[0]}`).join('\n')}${errors.length > 3 ? `\n... y ${errors.length - 3} más (ver detalles abajo)` : ''}`
            : '';
          showWarning(`⚠️ Actualización con errores: ${updatedCount} actualizados, ${createdCount} creados, ${errorCount} errores${errorSummary}`, 10000);
        }
        if (errors.length > 0) {
          console.error('Errores de Excel:', errors);
        }
      } catch (error: any) {
        console.error('Error al leer el archivo Excel:', error);
        console.error('Error details:', {
          message: error?.message,
          details: error?.details,
          code: error?.code,
          hint: error?.hint,
          stack: error?.stack
        });
        
        setExcelStatus('error');
        const errorMessage = error?.message || 'Error desconocido al leer el archivo';
        const errorDetails = error?.details || '';
        const errorHint = error?.hint || '';
        
        let userMessage = `Error al procesar el archivo: ${errorMessage}`;
        
        // Mensajes más específicos según el tipo de error
        if (errorMessage.includes('405') || errorMessage.includes('Method not allowed')) {
          userMessage = '❌ Error de conexión: El servidor rechazó la petición. Verifica que el endpoint esté disponible.';
        } else if (errorMessage.includes('is_active') || errorMessage.includes('column') || errorMessage.includes('schema')) {
          userMessage = '❌ Error de configuración: La columna \'is_active\' no existe en la base de datos. Ejecuta la migración: migrations/add_is_active_to_products.sql en Supabase.';
        } else if (errorMessage.includes('duplicate') || errorMessage.includes('SKUs sean únicos')) {
          userMessage = `❌ ${errorMessage}${errorDetails ? `\n\nDetalles: ${errorDetails}` : ''}${errorHint ? `\n\n💡 Sugerencia: ${errorHint}` : ''}`;
        } else if (errorMessage.includes('Marca no encontrada') || errorMessage.includes('foreign key')) {
          userMessage = `❌ ${errorMessage}${errorDetails ? `\n\nDetalles: ${errorDetails}` : ''}${errorHint ? `\n\n💡 Sugerencia: ${errorHint}` : ''}`;
        } else if (errorMessage.includes('Campos requeridos') || errorMessage.includes('null value')) {
          userMessage = `❌ ${errorMessage}${errorDetails ? `\n\nDetalles: ${errorDetails}` : ''}${errorHint ? `\n\n💡 Sugerencia: ${errorHint}` : ''}`;
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
          if (errorDetails) userMessage += `\n\nDetalles: ${errorDetails}`;
          if (errorHint) userMessage += `\n\n💡 Sugerencia: ${errorHint}`;
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
              Sube un archivo Excel (.xlsx) o CSV con las columnas: <strong>SKU</strong>, Marca, Modelo, Size, RIM, Precio, Imagen.
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              El formato de 'Size' debe ser como '155/70R12'. 'Modelo' debería coincidir con el nombre del producto o el SKU. 'RIM' el diámetro de la llanta.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              title="Descargar plantilla Excel con todos los productos actuales"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar Plantilla</span>
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              disabled={!file || excelStatus === 'processing'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>{excelStatus === 'processing' ? 'Subiendo...' : 'Subir Excel/CSV'}</span>
            </button>
          </div>
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