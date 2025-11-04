import { parse } from 'url';
import allowCors from '../../lib/cors.js';
import { ensureSupabase } from '../../lib/supabase.js';
import { Product } from '../../types.js';

export default allowCors(async function handler(req, res) {
  try {
    console.log('[Bulk-Create API] Request received:', {
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length']
      }
    });

    if (req.method !== 'POST') {
      console.error('[Bulk-Create API] Method not allowed:', req.method);
      res.statusCode = 405;
      res.json({ error: 'Método no permitido. Solo se acepta POST.', receivedMethod: req.method });
      return;
    }

    const supabase = ensureSupabase();
    const body = await parseBody(req);
    
    console.log('[Bulk-Create API] Body parsed:', {
      isArray: Array.isArray(body),
      length: Array.isArray(body) ? body.length : 'N/A',
      firstItem: Array.isArray(body) && body.length > 0 ? {
        sku: body[0].sku,
        name: body[0].name,
        brand: body[0].brand,
        hasIsActive: 'isActive' in (body[0] || {})
      } : null
    });

    if (!Array.isArray(body) || body.length === 0) {
      console.error('[Bulk-Create API] Invalid body:', { isArray: Array.isArray(body), length: body?.length });
      res.statusCode = 400;
      res.json({ error: 'Array de productos es requerido para creación masiva', received: typeof body });
      return;
    }

    console.log('[Bulk-Create API] Processing', body.length, 'products');

    const brandsResponse = await supabase.from('brands').select('*');
    if (brandsResponse.error) {
      console.error('[Bulk-Create API] Error fetching brands:', brandsResponse.error);
      throw new Error(brandsResponse.error.message);
    }

    console.log('[Bulk-Create API] Found', brandsResponse.data?.length || 0, 'brands');

    const payload = body.map((product: Product) => {
      const brand = brandsResponse.data?.find((item: any) => item.name === product.brand);
      const mapped = mapProductForInsert(product, brand);
      return mapped;
    });

    console.log('[Bulk-Create API] Mapped payload:', {
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
    
    console.log('[Bulk-Create API] Insert result:', {
      hasError: !!error,
      error: error?.message,
      dataCount: data?.length || 0
    });

    if (error) {
      console.error('[Products API] Error en bulk-create:', error);
      const errorMessage = error.message || 'Error desconocido al crear productos';
      // Si el error es sobre una columna que no existe, dar mensaje más claro
      if (errorMessage.includes('column') || errorMessage.includes('schema') || errorMessage.includes('is_active')) {
        throw new Error(`Error de configuración: La columna 'is_active' no existe en la tabla 'products'. Ejecuta la migración: migrations/add_is_active_to_products.sql`);
      }
      throw new Error(errorMessage);
    }

    const formatted = (data || []).map(toClientProduct);
    res.statusCode = 201;
    res.json(formatted);
  } catch (error: any) {
    console.error('[Products API] Error en bulk-create endpoint:', error);
    res.statusCode = 500;
    res.json({ error: error?.message || 'Error interno del servidor' });
  }
});

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

async function parseBody(req: any): Promise<any> {
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

