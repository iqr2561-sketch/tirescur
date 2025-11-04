import { parse } from 'url';
import allowCors from '../../lib/cors.js';
import { ensureSupabase } from '../../lib/supabase.js';
import { Product } from '../../types.js';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();
    const { query, pathname } = parse(req.url ?? '', true);
    
    // El ID viene en query.id cuando se usa [id].ts en Vercel
    // También puede venir del pathname como fallback
    let productId = Array.isArray(query.id) ? query.id[0] : query.id;
    
    // Si no está en query, intentar extraerlo del pathname
    if (!productId && pathname) {
      const pathParts = pathname.split('/').filter(p => p);
      const productsIndex = pathParts.indexOf('products');
      if (productsIndex !== -1 && productsIndex < pathParts.length - 1) {
        productId = pathParts[productsIndex + 1];
      } else {
        // Si no está 'products', buscar UUID
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        for (const part of pathParts) {
          if (uuidPattern.test(part)) {
            productId = part;
            break;
          }
        }
      }
    }

    if (!productId) {
      console.error('[Products API [id]] No product ID found. Pathname:', pathname, 'Query:', query);
      res.statusCode = 400;
      res.json({ error: 'Product ID is required', debug: { pathname, query } });
      return;
    }
    
    console.log('[Products API [id]] Processing request:', { 
      method: req.method, 
      productId, 
      pathname,
      url: req.url,
      query: query
    });

    if (req.method === 'PUT') {
      console.log('[Products API [id]] PUT request received for product:', productId);
      const body = await parseBody(req);
      console.log('[Products API [id]] Body parsed:', {
        hasBody: !!body,
        hasIsActive: 'isActive' in (body || {}),
        isActive: body?.isActive,
        name: body?.name
      });
      const updated = await updateSingleProduct(supabase, productId, body as Product);
      console.log('[Products API [id]] Product updated successfully:', {
        id: updated.id,
        name: updated.name,
        hasIsActive: 'is_active' in updated,
        isActive: updated.is_active
      });
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
    console.error('[Products API] Error en endpoint [id]:', error);
    res.statusCode = 500;
    res.json({ message: error?.message || 'Error interno del servidor' });
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
    throw new Error(error?.message || 'Error actualizando el producto');
  }

  return data;
}

function mapProductForInsert(product: any, brand: any) {
  // Si está en oferta pero no tiene sale_price, calcular uno con 10% de descuento
  let salePriceValue = null;
  if (product.isOnSale) {
    if (product.salePrice) {
      salePriceValue = Number(product.salePrice).toString();
    } else {
      // Calcular precio de oferta con 10% de descuento por defecto
      const regularPrice = Number(product.price || 0);
      salePriceValue = (regularPrice * 0.9).toFixed(2);
    }
  }

  // Calcular discount_percentage si no está presente pero hay sale_price
  let discountPercentageValue = product.discountPercentage || null;
  if (product.isOnSale && salePriceValue && !discountPercentageValue) {
    const regularPrice = Number(product.price || 0);
    const salePrice = Number(salePriceValue);
    if (regularPrice > 0) {
      discountPercentageValue = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
    }
  }

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
    sale_price: salePriceValue,
    discount_percentage: discountPercentageValue,
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

