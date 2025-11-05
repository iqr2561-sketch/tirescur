import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';
import { Product } from '../types';

// Consolidated API endpoint - handles all product operations to stay within Vercel Hobby limit

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    const { query, pathname } = parse(req.url ?? '', true);
    
    // Extraer ID del producto si está en la URL (para rutas como /api/products/[id])
    // El ID puede venir de query.id (Vercel dynamic routes) o del pathname
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let productId: string | undefined = Array.isArray(query.id) ? query.id[0] : query.id;
    
    // Logging para debugging
    console.log('[Products API] Request details:', {
      method: req.method,
      url: req.url,
      pathname: pathname,
      query: query,
      queryId: productId
    });
    
    // Si no está en query, intentar extraerlo del pathname o de la URL completa
    if (!productId) {
      // Primero intentar desde pathname
      if (pathname) {
        const pathParts = pathname.split('/').filter(p => p);
        const productsIndex = pathParts.indexOf('products');
        if (productsIndex !== -1 && productsIndex < pathParts.length - 1) {
          const potentialId = pathParts[productsIndex + 1];
          // Solo usar si parece un UUID válido (no es "bulk" u otra palabra)
          if (uuidRegex.test(potentialId)) {
            productId = potentialId;
            console.log('[Products API] Found productId from pathname:', productId);
          }
        }
      }
      
      // Si todavía no tenemos ID, intentar desde la URL completa
      if (!productId && req.url) {
        // Buscar UUID en la URL completa
        const urlMatch = req.url.match(uuidRegex);
        if (urlMatch) {
          productId = urlMatch[0];
          console.log('[Products API] Found productId from full URL:', productId);
        }
      }
    } else {
      console.log('[Products API] Using productId from query:', productId);
    }

    if (req.method === 'GET') {
      // Si hay un productId, devolver solo ese producto
      if (productId) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (!data || !uuidRegex.test(data.id)) {
          res.statusCode = 404;
          res.json({ error: 'Producto no encontrado' });
          return;
        }

        res.statusCode = 200;
        res.json(toClientProduct(data));
        return;
      }
      
      // GET sin ID: listar todos los productos
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Validar UUID antes de formatear productos
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUUID = (str: string): boolean => {
        return str && typeof str === 'string' && uuidRegex.test(str);
      };

      // Filtrar productos con IDs inválidos
      const validProducts = (data || []).filter((row: any) => {
        if (!isValidUUID(row.id)) {
          console.warn(`[Products API] Filtering out product with invalid ID: "${row.id}" (SKU: ${row.sku || row.name || 'N/A'})`);
          return false;
        }
        return true;
      });

      const formatted = validProducts.map(toClientProduct);
      
      if (validProducts.length < (data || []).length) {
        console.warn(`[Products API] Filtered out ${(data || []).length - validProducts.length} products with invalid IDs`);
      }
      
      res.statusCode = 200;
      res.json(formatted);
      return;
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      
      // Log para depurar
      console.log('[Products API] POST request:', { 
        pathname, 
        url: req.url,
        method: req.method,
        isArray: Array.isArray(body),
        bodyLength: Array.isArray(body) ? body.length : 'N/A'
      });

      // Detectar bulk-create: verificar si el body es un array (indica bulk-create)
      // o si la URL contiene 'bulk' o 'bulk-create'
      const isBulkCreate = Array.isArray(body) && body.length > 0 && 
        (pathname?.includes('/bulk-create') || req.url?.includes('/bulk-create') || 
         req.url?.includes('bulk=true') || query?.bulk === 'true' ||
         (body[0] && typeof body[0] === 'object' && 'sku' in body[0] && 'name' in body[0]));

      if (isBulkCreate) {
        console.log('[Products API] Detected bulk-create request:', {
          productCount: body.length,
          sampleProduct: body[0] ? {
            sku: body[0].sku,
            name: body[0].name,
            brand: body[0].brand,
            hasIsActive: 'isActive' in (body[0] || {})
          } : null
        });

        if (!Array.isArray(body) || body.length === 0) {
          console.error('[Products API] Invalid bulk-create body:', { isArray: Array.isArray(body), length: body?.length });
          res.statusCode = 400;
          res.json({ error: 'Array de productos es requerido para creación masiva', received: typeof body });
          return;
        }

        console.log('[Products API] Processing', body.length, 'products for bulk-create');

        const brandsResponse = await supabase.from('brands').select('*');
        if (brandsResponse.error) {
          console.error('[Products API] Error fetching brands:', brandsResponse.error);
          throw new Error(brandsResponse.error.message);
        }

        console.log('[Products API] Found', brandsResponse.data?.length || 0, 'brands');

        const payload = body.map((product: Product) => {
          const brand = brandsResponse.data?.find((item: any) => item.name === product.brand);
          return mapProductForInsert(product, brand);
        });

        console.log('[Products API] Mapped payload:', {
          count: payload.length,
          sample: payload[0] ? {
            sku: payload[0].sku,
            name: payload[0].name,
            brand_name: payload[0].brand_name,
            hasIsActive: 'is_active' in payload[0],
            isActive: payload[0].is_active
          } : null
        });

        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select();

        console.log('[Products API] Insert result:', {
          hasError: !!error,
          error: error?.message,
          dataCount: data?.length || 0
        });

        if (error) {
          console.error('[Products API] Error en bulk-create:', error);
          const errorMessage = error.message || 'Error desconocido al crear productos';
          const errorCode = error.code || '';
          const errorDetails = error.details || '';
          const errorHint = error.hint || '';
          
          // Mensajes más específicos según el tipo de error
          if (errorMessage.includes('column') || errorMessage.includes('schema') || errorMessage.includes('is_active')) {
            throw new Error(`Error de configuración: La columna 'is_active' no existe en la tabla 'products'. Ejecuta la migración: migrations/add_is_active_to_products.sql`);
          }
          if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint') || errorCode === '23505') {
            throw new Error(`Error: Productos duplicados detectados. Verifica que los SKUs sean únicos. Detalles: ${errorMessage}`);
          }
          if (errorMessage.includes('foreign key') || errorCode === '23503') {
            throw new Error(`Error: Marca no encontrada. Verifica que todas las marcas existan antes de importar. Detalles: ${errorMessage}`);
          }
          if (errorMessage.includes('null value') || errorCode === '23502') {
            throw new Error(`Error: Campos requeridos faltantes. Verifica que todos los productos tengan SKU, nombre y marca. Detalles: ${errorMessage}`);
          }
          
          // Error genérico con más detalles
          const fullErrorMessage = errorDetails || errorHint 
            ? `${errorMessage}${errorDetails ? ` | Detalles: ${errorDetails}` : ''}${errorHint ? ` | Sugerencia: ${errorHint}` : ''}`
            : errorMessage;
          throw new Error(fullErrorMessage);
        }

        const formatted = (data || []).map(toClientProduct);
        console.log('[Products API] Bulk-create completed successfully:', formatted.length, 'products created');
        res.statusCode = 201;
        res.json(formatted);
        return;
      }

      const productPayload = body as Omit<Product, 'id'>;
      const { data: brandRecord, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('name', productPayload.brand)
        .maybeSingle();

      if (brandError) {
        throw new Error(brandError.message);
      }

      const { data, error } = await supabase
        .from('products')
        .insert(mapProductForInsert(productPayload, brandRecord))
        .select()
        .single();

      if (error || !data) {
        console.error('[Products API] Error creando producto:', error);
        const errorMessage = error?.message || 'Error desconocido al crear producto';
        // Si el error es sobre una columna que no existe, dar mensaje más claro
        if (errorMessage.includes('column') || errorMessage.includes('schema')) {
          throw new Error(`Error de configuración: ${errorMessage}. Verifica que la base de datos tenga todas las columnas necesarias.`);
        }
        throw new Error(errorMessage);
      }

      res.statusCode = 201;
      res.json(toClientProduct(data));
      return;
    }

    if (req.method === 'PUT') {
      const body = await parseBody(req);

      // Detectar bulk update: verificar query parameter, URL, o si el body es un array
      // Si hay productId en la URL, es update individual, no bulk
      const isBulkUpdate = !productId && (
        query?.bulk === 'true' ||
        query?.bulk === true ||
        pathname?.includes('/bulk') || 
        req.url?.includes('/bulk') || 
        (Array.isArray(body) && body.length > 0 && body[0]?.id && uuidRegex.test(body[0].id))
      );

      if (isBulkUpdate) {
        console.log('[Products API] Detected bulk-update request:', {
          pathname,
          url: req.url,
          productCount: Array.isArray(body) ? body.length : 0,
          sampleProduct: Array.isArray(body) && body[0] ? {
            id: body[0].id,
            sku: body[0].sku,
            name: body[0].name,
            price: body[0].price
          } : null
        });

        if (!Array.isArray(body) || body.length === 0) {
          res.statusCode = 400;
          res.json({ error: 'Array of products is required for bulk update' });
          return;
        }

        const updateResults = [];
        const errors = [];

        // Update products one by one and collect results
        for (let i = 0; i < body.length; i++) {
          const product = body[i] as Product;
          try {
            if (!product.id) {
              errors.push(`Product ${i + 1}: Missing ID (SKU: ${product.sku || 'N/A'})`);
              continue;
            }
            const updated = await updateSingleProduct(supabase, product.id, product);
            updateResults.push(updated);
          } catch (error: any) {
            console.error(`[Products API] Error updating product ${i + 1} (${product.id}):`, error);
            errors.push(`Product ${i + 1} (${product.sku || product.name || 'N/A'}): ${error?.message || 'Error desconocido'}`);
          }
        }

        if (errors.length > 0) {
          console.error('[Products API] Bulk update completed with errors:', errors);
          res.statusCode = 207; // Multi-Status - partial success
          res.json({ 
            message: `Bulk update completed: ${updateResults.length} updated, ${errors.length} errors`,
            updated: updateResults.length,
            errors: errors.length,
            errorDetails: errors
          });
          return;
        }

        console.log('[Products API] Bulk update completed successfully:', updateResults.length, 'products updated');
        res.statusCode = 200;
        res.json({ 
          message: 'Products updated in bulk',
          updated: updateResults.length
        });
        return;
      }

      // PUT individual: actualizar un producto por ID
      if (!productId) {
        console.error('[Products API] PUT request without productId. URL:', req.url, 'Pathname:', pathname, 'Query:', query);
        res.statusCode = 400;
        res.json({ 
          error: 'Product ID is required for update. Use /api/products/[id] or include ID in URL path.',
          debug: {
            url: req.url,
            pathname: pathname,
            query: query
          }
        });
        return;
      }

      console.log('[Products API] Updating individual product:', productId);
      const updated = await updateSingleProduct(supabase, productId, body as Product);
      res.statusCode = 200;
      res.json(toClientProduct(updated));
      return;
    }

    if (req.method === 'DELETE') {
      // DELETE: eliminar un producto por ID
      if (!productId) {
        res.statusCode = 400;
        res.json({ error: 'Product ID is required for delete. Use /api/products/[id] or include ID in URL path.' });
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw new Error(error.message);
      }

      res.statusCode = 204;
      res.end();
      return;
    }

    res.statusCode = 405;
    res.json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('[Products API] Error en endpoint:', error);
    console.error('[Products API] Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack
    });
    
    // Si el error ya tiene un mensaje específico, usarlo
    const errorMessage = error?.message || 'Error interno del servidor';
    const errorCode = error?.code || '';
    const errorDetails = error?.details || '';
    
    res.statusCode = 500;
    res.json({ 
      error: errorMessage,
      code: errorCode,
      details: errorDetails,
      hint: error?.hint || undefined
    });
  }
});

async function updateSingleProduct(supabase: any, productId: string, product: Product) {
  let brandId = product.brandId || null;
  let brandLogo = product.brandLogoUrl || '';

  if (product.brand && !product.brandId) {
    const { data: brand, error } = await supabase
      .from('brands')
      .select('*')
      .eq('name', product.brand)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (brand) {
      brandId = brand.id;
      brandLogo = brand.logo_url || brandLogo;
    }
  }

  console.log('[Products API] updateSingleProduct called:', {
    productId: productId,
    sku: product.sku,
    name: product.name,
    brand: product.brand
  });

  const { data, error } = await supabase
    .from('products')
    .update(mapProductForInsert(product, { id: brandId, logo_url: brandLogo }))
    .eq('id', productId)
    .select()
    .single();

  if (error || !data) {
    console.error('[Products API] Error actualizando producto:', {
      productId: productId,
      error: error,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details
    });
    
    // Si el producto no existe (error 404 equivalente en Supabase)
    if (error?.code === 'PGRST116' || error?.message?.includes('No rows')) {
      throw new Error(`Producto con ID "${productId}" no encontrado en la base de datos`);
    }
    
    const errorMessage = error?.message || 'Error desconocido al actualizar producto';
    // Si el error es sobre una columna que no existe, dar mensaje más claro
    if (errorMessage.includes('column') || errorMessage.includes('schema') || errorMessage.includes('is_active')) {
      throw new Error(`Error de configuración: La columna 'is_active' no existe en la tabla 'products'. Ejecuta la migración: migrations/add_is_active_to_products.sql`);
    }
    throw new Error(errorMessage);
  }

  console.log('[Products API] Product updated successfully:', {
    productId: data.id,
    sku: data.sku,
    name: data.name
  });

  return data;
}

function mapProductForInsert(product: any, brand: any) {
  // Si isOnSale es false, asegurar que sale_price y discount_percentage sean null
  const isOnSale = product.isOnSale || false;
  
  return {
    sku: product.sku || '',
    name: product.name || '',
    brand_name: product.brand || '',
    brand_id: brand?.id || product.brandId || null,
    brand_logo_url: brand?.logo_url || product.brandLogoUrl || '',
    price: Number(product.price || 0).toString(),
    rating: Number(product.rating || 0).toString(),
    reviews: product.reviews || 0,
    image_url: product.imageUrl || '',
    description: product.description || '',
    tags: product.tags || [],
    stock: product.stock || 0,
    width: product.width || '',
    profile: product.profile || '',
    diameter: product.diameter || '',
    is_on_sale: isOnSale,
    // Si no está en oferta, forzar null para limpiar los valores
    sale_price: isOnSale && product.salePrice ? Number(product.salePrice).toString() : null,
    discount_percentage: isOnSale && product.discountPercentage ? Number(product.discountPercentage) : null,
    category_id: product.categoryId || null,
    is_active: product.isActive !== undefined ? product.isActive : true
  };
}

function toClientProduct(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand_name,
    brandId: row.brand_id,
    brandLogoUrl: row.brand_logo_url,
    price: Number(row.price),
    rating: Number(row.rating) || 0,
    reviews: row.reviews || 0,
    imageUrl: row.image_url || '',
    description: row.description || '',
    tags: row.tags || [],
    stock: row.stock || 0,
    width: row.width || '',
    profile: row.profile || '',
    diameter: row.diameter || '',
    isOnSale: row.is_on_sale || false,
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    discountPercentage: row.discount_percentage || undefined,
    categoryId: row.category_id,
    isActive: row.is_active !== undefined ? row.is_active : true
  };
}

async function parseBody(req: any) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error: Error) => reject(error));
  });
}
