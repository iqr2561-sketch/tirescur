import allowCors from '../../lib/cors.js';
import { ensureSupabase } from '../../lib/supabase.js';
import { Product } from '../../types.js';

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

function mapProductForInsert(product: any, brand: any) {
  return {
    sku: product.sku,
    name: product.name,
    brand_name: product.brand,
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
    is_on_sale: product.isOnSale || false,
    sale_price: product.salePrice ? Number(product.salePrice).toString() : null,
    discount_percentage: product.discountPercentage || null,
    category_id: product.categoryId || null,
    is_active: product.isActive !== undefined ? product.isActive : true
  };
}

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

  const { data, error } = await supabase
    .from('products')
    .update(mapProductForInsert(product, { id: brandId, logo_url: brandLogo }))
    .eq('id', productId)
    .select()
    .single();

  if (error || !data) {
    console.error('[Products API Bulk] Error actualizando producto:', error);
    const errorMessage = error?.message || 'Error desconocido al actualizar producto';
    throw new Error(errorMessage);
  }

  return data;
}

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    if (req.method !== 'PUT') {
      res.statusCode = 405;
      res.json({ error: 'Método no permitido. Solo se permite PUT para actualización masiva.' });
      return;
    }

    const body = await parseBody(req);

    console.log('[Products API Bulk] Bulk-update request:', {
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
        console.error(`[Products API Bulk] Error updating product ${i + 1} (${product.id}):`, error);
        errors.push(`Product ${i + 1} (${product.sku || product.name || 'N/A'}): ${error?.message || 'Error desconocido'}`);
      }
    }

    if (errors.length > 0) {
      console.error('[Products API Bulk] Bulk update completed with errors:', errors);
      res.statusCode = 207; // Multi-Status - partial success
      res.json({ 
        message: `Bulk update completed: ${updateResults.length} updated, ${errors.length} errors`,
        updated: updateResults.length,
        errors: errors.length,
        errorDetails: errors
      });
      return;
    }

    console.log('[Products API Bulk] Bulk update completed successfully:', updateResults.length, 'products updated');
    res.statusCode = 200;
    res.json({ 
      message: 'Products updated in bulk',
      updated: updateResults.length
    });
  } catch (error: any) {
    console.error('[Products API Bulk] Error en endpoint:', error);
    console.error('[Products API Bulk] Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack
    });
    
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

