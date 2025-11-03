import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';
import { Product } from '../types';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    const { query, pathname } = parse(req.url ?? '', true);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const formatted = (data || []).map(toClientProduct);
      res.statusCode = 200;
      res.json(formatted);
      return;
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);

      if (pathname === '/api/products/bulk-create') {
        if (!Array.isArray(body) || body.length === 0) {
          res.statusCode = 400;
          res.json({ error: 'Array of new products is required for bulk creation' });
          return;
        }

        const brandsResponse = await supabase.from('brands').select('*');
        if (brandsResponse.error) {
          throw new Error(brandsResponse.error.message);
        }

        const payload = body.map((product: Product) => {
          const brand = brandsResponse.data?.find((item: any) => item.name === product.brand);
          return mapProductForInsert(product, brand);
        });

        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select();

        if (error) {
          throw new Error(error.message);
        }

        const formatted = (data || []).map(toClientProduct);
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
        throw new Error(error?.message || 'Error creando producto');
      }

      res.statusCode = 201;
      res.json(toClientProduct(data));
      return;
    }

    if (req.method === 'PUT') {
      const body = await parseBody(req);

      if (pathname === '/api/products/bulk') {
        if (!Array.isArray(body) || body.length === 0) {
          res.statusCode = 400;
          res.json({ error: 'Array of products is required for bulk update' });
          return;
        }

        for (const product of body as Product[]) {
          await updateSingleProduct(supabase, product.id, product);
        }

        res.statusCode = 200;
        res.json({ message: 'Products updated in bulk' });
        return;
      }

      const productId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!productId) {
        res.statusCode = 400;
        res.json({ error: 'Product ID is required for update' });
        return;
      }

      const updated = await updateSingleProduct(supabase, productId, body as Product);
      res.statusCode = 200;
      res.json(toClientProduct(updated));
      return;
    }

    if (req.method === 'DELETE') {
      const productId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!productId) {
        res.statusCode = 400;
        res.json({ error: 'Product ID is required for delete' });
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
    category_id: product.categoryId || null
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
    categoryId: row.category_id
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
