import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseClient } from '../lib/supabase';
import { Product, Brand } from '../types';
import { PRODUCTS_DATA, INITIAL_BRANDS_DATA } from '../constants';

interface CustomRequest extends IncomingMessage {
  query: {
    id?: string;
  };
  json: () => Promise<any>;
  method?: string;
  url?: string;
}

interface CustomResponse extends ServerResponse {
  json: (data: any) => void;
  setHeader(name: string, value: string | string[]): this;
  statusCode: number;
  end(cb?: () => void): this;
}

const allowCors = (fn: Function) => async (req: CustomRequest, res: CustomResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  return await fn(req, res);
};

async function handler(req: CustomRequest, res: CustomResponse) {
  const supabase = getSupabaseClient();

  // Seeding logic
  const { data: countData } = await supabase.from('products').select('id', { count: 'exact' });
  if (countData?.length === 0) {
    // Ensure brands also exist for product seeding
    const { data: brandsCountData } = await supabase.from('brands').select('id', { count: 'exact' });
    if (brandsCountData?.length === 0) {
      const { error: brandUpsertError } = await supabase
        .from('brands')
        .upsert(INITIAL_BRANDS_DATA, { onConflict: 'name' });
      if (brandUpsertError) console.error('Error seeding brands:', brandUpsertError);
    }

    const seededProducts = PRODUCTS_DATA.map(p => {
      const brand = INITIAL_BRANDS_DATA.find(b => b.name === p.brand);
      return { ...p, brand_name: p.brand, brand_id: undefined, brand_logo_url: brand?.logoUrl || p.brandLogoUrl };
    });
    const { error: productUpsertError } = await supabase
      .from('products')
      .upsert(seededProducts, { onConflict: 'sku' });
    if (productUpsertError) console.error('Error seeding products:', productUpsertError);
  }

  switch (req.method) {
    case 'GET': {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        res.statusCode = 500;
        res.json({ message: 'Error fetching products', error: error.message });
        return;
      }
      res.statusCode = 200;
      res.json(data);
      break;
    }

    case 'POST': {
      if (req.url === '/api/products/bulk-create') {
        const newProductsData: Omit<Product, 'id'>[] = await req.json();
        if (!Array.isArray(newProductsData) || newProductsData.length === 0) {
          res.statusCode = 400;
          res.json({ message: 'Array of new products is required for bulk creation' });
          return;
        }

        // Fix: Changed Promise.All to Promise.all
        const productsWithBrandInfo = await Promise.all(newProductsData.map(async (p) => {
          const { data: brandData, error: brandError } = await supabase
            .from('brands')
            .select('id, name, logo_url')
            .eq('name', p.brand)
            .single();

          if (brandError) {
            console.warn(`Brand "${p.brand}" not found for product "${p.name}", skipping brand_id. Error: ${brandError.message}`);
          }

          return {
            ...p,
            brand_name: p.brand, // Storing name directly as per SQL schema
            brand_id: brandData?.id || null, // Link to brand ID if found
            brand_logo_url: brandData?.logo_url || p.brandLogoUrl, // Denormalize logo URL
          };
        }));

        const { data, error } = await supabase.from('products').insert(productsWithBrandInfo).select('*');
        if (error) {
          res.statusCode = 500;
          res.json({ message: 'Error bulk creating products', error: error.message });
          return;
        }
        res.statusCode = 201;
        res.json(data);
      } else {
        const newProductData: Omit<Product, 'id'> = await req.json();

        // Map client-side 'brand' to Supabase 'brand_name' and 'brand_id'
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('id, name, logo_url')
          .eq('name', newProductData.brand)
          .single();

        if (brandError) {
          console.warn(`Brand "${newProductData.brand}" not found for new product, skipping brand_id. Error: ${brandError.message}`);
        }

        const productToInsert = {
          ...newProductData,
          brand_name: newProductData.brand,
          brand_id: brandData?.id || null,
          brand_logo_url: brandData?.logo_url || newProductData.brandLogoUrl,
        };

        const { data, error } = await supabase.from('products').insert(productToInsert).select('*').single();
        if (error) {
          res.statusCode = 500;
          res.json({ message: 'Error adding product', error: error.message });
          return;
        }
        res.statusCode = 201;
        res.json(data);
      }
      break;
    }

    case 'PUT': {
      if (req.url === '/api/products/bulk') {
        const bulkUpdates: Product[] = await req.json();
        if (!Array.isArray(bulkUpdates) || bulkUpdates.length === 0) {
          res.statusCode = 400;
          res.json({ message: 'Array of products is required for bulk update' });
          return;
        }

        const updatePromises = bulkUpdates.map(async (product) => {
          // Map client-side 'brand' to Supabase 'brand_name' and 'brand_id' if brand name is updated
          let brand_id_to_update = product.brandId;
          let brand_logo_url_to_update = product.brandLogoUrl;

          if (product.brand) { // If brand name is part of the update
            const { data: brandData, error: brandError } = await supabase
              .from('brands')
              .select('id, logo_url')
              .eq('name', product.brand)
              .single();

            if (brandError) {
              console.warn(`Brand "${product.brand}" not found for product "${product.name}", cannot update brand_id/logo_url. Error: ${brandError.message}`);
            } else {
              brand_id_to_update = brandData?.id;
              brand_logo_url_to_update = brandData?.logo_url;
            }
          }

          const { id, ...updateData } = product; // Exclude 'id' from update payload
          const dataToUpdate = {
            ...updateData,
            brand_id: brand_id_to_update,
            brand_name: product.brand,
            brand_logo_url: brand_logo_url_to_update,
          };

          // Remove frontend-only properties like brand and brandLogoUrl from the data sent to Supabase
          // Fix: Ensure these are deleted from `dataToUpdate` which is built from `updateData`
          delete (dataToUpdate as any).brand;
          delete (dataToUpdate as any).brandLogoUrl;
          
          return supabase
            .from('products')
            .update(dataToUpdate)
            .eq('id', id);
        });

        const results = await Promise.all(updatePromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          console.error('Errors during bulk update:', errors);
          res.statusCode = 500;
          res.json({ message: `Errors updating some products: ${errors.map(e => e.error?.message).join(', ')}` });
          return;
        }
        res.statusCode = 200;
        res.json({ message: 'Products updated in bulk' });
      } else {
        const id = req.query.id;
        if (!id) {
          res.statusCode = 400;
          res.json({ message: 'Product ID is required for update' });
          return;
        }
        const updatedProductData: Product = await req.json();
        const { id: clientSideId, ...updateData } = updatedProductData; // Exclude 'id' from update payload

        // Map client-side 'brand' to Supabase 'brand_name' and 'brand_id'
        let brand_id_to_update = updatedProductData.brandId;
        let brand_logo_url_to_update = updatedProductData.brandLogoUrl;

        if (updatedProductData.brand) {
          const { data: brandData, error: brandError } = await supabase
            .from('brands')
            .select('id, logo_url')
            .eq('name', updatedProductData.brand)
            .single();

          if (brandError) {
            console.warn(`Brand "${updatedProductData.brand}" not found for product update, skipping brand_id. Error: ${brandError.message}`);
          } else {
            brand_id_to_update = brandData?.id;
            brand_logo_url_to_update = brandData?.logo_url;
          }
        }

        const dataToUpdate = {
          ...updateData,
          brand_id: brand_id_to_update,
          brand_name: updatedProductData.brand,
          brand_logo_url: brand_logo_url_to_update,
        };

        // Remove frontend-only properties like brand and brandLogoUrl from the data sent to Supabase
        delete (dataToUpdate as any).brand;
        delete (dataToUpdate as any).brandLogoUrl;

        const { data, error } = await supabase
          .from('products')
          .update(dataToUpdate)
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Supabase error code for "not found"
            res.statusCode = 404;
            res.json({ message: 'Product not found', error: error.message });
            return;
          }
          res.statusCode = 500;
          res.json({ message: 'Error updating product', error: error.message });
          return;
        }
        res.statusCode = 200;
        res.json(data);
      }
      break;
    }

    case 'DELETE': {
      const idToDelete = req.query.id;
      if (!idToDelete) {
        res.statusCode = 400;
        res.json({ message: 'Product ID is required for delete' });
        return;
      }
      const { error } = await supabase.from('products').delete().eq('id', idToDelete);
      if (error) {
        if (error.code === 'PGRST116') { // Supabase error code for "not found"
          res.statusCode = 404;
          res.json({ message: 'Product not found', error: error.message });
          return;
        }
        res.statusCode = 500;
        res.json({ message: 'Error deleting product', error: error.message });
        return;
      }
      res.statusCode = 204;
      res.end();
      break;
    }

    default: {
      res.statusCode = 405;
      res.json({ message: 'Method Not Allowed' });
      break;
    }
  }
}

export default allowCors(handler);