import { parse } from 'url';
import allowCors from '../../lib/cors.js';
import { ensureSupabase } from '../../lib/supabase.js';
import { Product } from '../../types';

// Wrapper para rutas dinámicas /api/products/[id]
// Este archivo es necesario porque Vercel maneja rutas dinámicas de forma especial
// Mantiene el total en 12 funciones (límite del plan Hobby)

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();
    const { query } = parse(req.url ?? '', true);
    
    // El ID viene automáticamente en query.id cuando usas [id].ts en Vercel
    const productId = Array.isArray(query.id) ? query.id[0] : query.id;
    
    if (!productId) {
      res.statusCode = 400;
      res.json({ error: 'Product ID is required' });
      return;
    }

    console.log('[Products API [id]] Request:', {
      method: req.method,
      productId: productId,
      url: req.url
    });

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !data) {
        res.statusCode = 404;
        res.json({ error: 'Producto no encontrado' });
        return;
      }

      res.statusCode = 200;
      res.json(toClientProduct(data));
      return;
    }

    if (req.method === 'PUT') {
      const body = await parseBody(req);
      const updated = await updateSingleProduct(supabase, productId, body as Product);
      res.statusCode = 200;
      res.json(toClientProduct(updated));
      return;
    }

    if (req.method === 'DELETE') {
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
    console.error('[Products API [id]] Error:', error);
    res.statusCode = 500;
    res.json({ error: error?.message || 'Error interno del servidor' });
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

  const { data, error } = await supabase
    .from('products')
    .update(mapProductForInsert(product, { id: brandId, logo_url: brandLogo }))
    .eq('id', productId)
    .select()
    .single();

  if (error || !data) {
    if (error?.code === 'PGRST116' || error?.message?.includes('No rows')) {
      throw new Error(`Producto con ID "${productId}" no encontrado`);
    }
    throw new Error(error?.message || 'Error actualizando producto');
  }

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

