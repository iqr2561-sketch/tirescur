import { IncomingMessage, ServerResponse } from 'http';
import { supabaseAdmin } from '../lib/supabase';
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

// Helper function to convert Supabase row to client Product
const toClientProduct = (row: any): Product => {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand_name,
    brandId: row.brand_id,
    brandLogoUrl: row.brand_logo_url,
    price: parseFloat(row.price),
    rating: parseFloat(row.rating) || 0,
    reviews: row.reviews || 0,
    imageUrl: row.image_url || '',
    description: row.description || '',
    tags: row.tags || [],
    stock: row.stock || 0,
    width: row.width || '',
    profile: row.profile || '',
    diameter: row.diameter || '',
    // Deal/Offer fields
    isOnSale: row.is_on_sale || false,
    salePrice: row.sale_price ? parseFloat(row.sale_price) : undefined,
    discountPercentage: row.discount_percentage || undefined,
    categoryId: row.category_id,
  };
};

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
  try {
    console.log(`[Products API] ${req.method} request recibida`);

    // Seeding logic - verificar si hay productos
    const { count: productCount } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`[Products API] Productos en base de datos: ${productCount || 0}`);

    if (productCount === 0) {
      console.log('[Products API] Iniciando seeding de datos...');

      // Primero asegurar que existan las marcas
      const { count: brandCount } = await supabaseAdmin
        .from('brands')
        .select('*', { count: 'exact', head: true });

      if (brandCount === 0) {
        const brandsToInsert = INITIAL_BRANDS_DATA.map(brand => ({
          name: brand.name,
          logo_url: brand.logoUrl,
        }));

        const { error: brandsError } = await supabaseAdmin
          .from('brands')
          .insert(brandsToInsert);

        if (brandsError) {
          console.error('[Products API] Error insertando marcas:', brandsError);
        } else {
          console.log(`[Products API] ✅ ${brandsToInsert.length} marcas insertadas`);
        }
      }

      // Obtener marcas para mapear
      const { data: brands } = await supabaseAdmin.from('brands').select('*');

      // Insertar productos
      const seededProducts = PRODUCTS_DATA.map(p => {
        const brand = brands?.find((b: any) => b.name === p.brand);
        return {
          sku: p.sku,
          name: p.name,
          brand_name: p.brand,
          brand_id: brand?.id || null,
          brand_logo_url: brand?.logo_url || p.brandLogoUrl || '',
          price: p.price.toString(),
          rating: (p.rating || 0).toString(),
          reviews: p.reviews || 0,
          image_url: p.imageUrl || '',
          description: p.description || '',
          tags: p.tags || [],
          stock: p.stock || 0,
          width: p.width || '',
          profile: p.profile || '',
          diameter: p.diameter || '',
          is_on_sale: p.isOnSale || false,
          sale_price: p.salePrice?.toString() || null,
          discount_percentage: p.discountPercentage || null,
          category_id: p.categoryId || null,
        };
      });

      const { error: productsError } = await supabaseAdmin
        .from('products')
        .insert(seededProducts);

      if (productsError) {
        console.error('[Products API] Error insertando productos:', productsError);
      } else {
        console.log(`[Products API] ✅ ${seededProducts.length} productos insertados`);
      }
    }

    switch (req.method) {
      case 'GET': {
        const { data: products, error } = await supabaseAdmin
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Products API] Error obteniendo productos:', error);
          res.statusCode = 500;
          res.json({ message: 'Error obteniendo productos', error: error.message });
          return;
        }

        const clientProducts = (products || []).map(toClientProduct);
        console.log(`[Products API] ✅ Devolviendo ${clientProducts.length} productos`);
        res.statusCode = 200;
        res.json(clientProducts);
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

          // Obtener marcas para mapear
          const { data: brands } = await supabaseAdmin.from('brands').select('*');

          const productsToInsert = newProductsData.map((p) => {
            const brand = brands?.find((b: any) => b.name === p.brand);
            return {
              sku: p.sku,
              name: p.name,
              brand_name: p.brand,
              brand_id: brand?.id || null,
              brand_logo_url: brand?.logo_url || p.brandLogoUrl || '',
              price: p.price.toString(),
              rating: (p.rating || 0).toString(),
              reviews: p.reviews || 0,
              image_url: p.imageUrl || '',
              description: p.description || '',
              tags: p.tags || [],
              stock: p.stock || 0,
              width: p.width || '',
              profile: p.profile || '',
              diameter: p.diameter || '',
              is_on_sale: p.isOnSale || false,
              sale_price: p.salePrice?.toString() || null,
              discount_percentage: p.discountPercentage || null,
              category_id: p.categoryId || null,
            };
          });

          const { data: insertedProducts, error } = await supabaseAdmin
            .from('products')
            .insert(productsToInsert)
            .select();

          if (error) {
            console.error('[Products API] Error en bulk insert:', error);
            res.statusCode = 500;
            res.json({ message: 'Error creando productos', error: error.message });
            return;
          }

          const clientProducts = (insertedProducts || []).map(toClientProduct);
          res.statusCode = 201;
          res.json(clientProducts);
        } else {
          const newProductData: Omit<Product, 'id'> = await req.json();

          // Buscar marca por nombre
          const { data: brands } = await supabaseAdmin
            .from('brands')
            .select('*')
            .eq('name', newProductData.brand)
            .single();

          const brand = brands as any;

          const productToInsert = {
            sku: newProductData.sku,
            name: newProductData.name,
            brand_name: newProductData.brand,
            brand_id: brand?.id || null,
            brand_logo_url: brand?.logo_url || newProductData.brandLogoUrl || '',
            price: newProductData.price.toString(),
            rating: (newProductData.rating || 0).toString(),
            reviews: newProductData.reviews || 0,
            image_url: newProductData.imageUrl || '',
            description: newProductData.description || '',
            tags: newProductData.tags || [],
            stock: newProductData.stock || 0,
            width: newProductData.width || '',
            profile: newProductData.profile || '',
            diameter: newProductData.diameter || '',
            is_on_sale: newProductData.isOnSale || false,
            sale_price: newProductData.salePrice?.toString() || null,
            discount_percentage: newProductData.discountPercentage || null,
            category_id: newProductData.categoryId || null,
          };

          const { data: insertedProduct, error } = await supabaseAdmin
            .from('products')
            .insert(productToInsert)
            .select()
            .single();

          if (error) {
            console.error('[Products API] Error creando producto:', error);
            res.statusCode = 500;
            res.json({ message: 'Error creando producto', error: error.message });
            return;
          }

          if (!insertedProduct) {
            res.statusCode = 500;
            res.json({ message: 'Error creando producto' });
            return;
          }

          const clientProduct = toClientProduct(insertedProduct);
          res.statusCode = 201;
          res.json(clientProduct);
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
            // Buscar marca si es necesario
            let brand_id_to_update = product.brandId || null;
            let brand_logo_url_to_update = product.brandLogoUrl;

            if (product.brand && !product.brandId) {
              const { data: brand } = await supabaseAdmin
                .from('brands')
                .select('*')
                .eq('name', product.brand)
                .single();
              
              if (brand) {
                brand_id_to_update = brand.id;
                brand_logo_url_to_update = brand.logo_url;
              }
            }

            const dataToUpdate: any = {
              sku: product.sku,
              name: product.name,
              brand_name: product.brand,
              brand_id: brand_id_to_update,
              brand_logo_url: brand_logo_url_to_update || '',
              price: product.price.toString(),
              rating: (product.rating || 0).toString(),
              reviews: product.reviews || 0,
              image_url: product.imageUrl || '',
              description: product.description || '',
              tags: product.tags || [],
              stock: product.stock || 0,
              width: product.width || '',
              profile: product.profile || '',
              diameter: product.diameter || '',
              is_on_sale: product.isOnSale || false,
              sale_price: product.salePrice?.toString() || null,
              discount_percentage: product.discountPercentage || null,
              category_id: product.categoryId || null,
            };

            const { error } = await supabaseAdmin
              .from('products')
              .update(dataToUpdate)
              .eq('id', product.id);

            if (error) {
              console.error(`[Products API] Error actualizando producto ${product.id}:`, error);
              throw error;
            }
          });

          try {
            await Promise.all(updatePromises);
            res.statusCode = 200;
            res.json({ message: 'Products updated in bulk' });
          } catch (error: any) {
            console.error('[Products API] Error en bulk update:', error);
            res.statusCode = 500;
            res.json({ message: 'Error actualizando productos', error: error.message });
          }
        } else {
          const id = req.query.id;
          if (!id) {
            res.statusCode = 400;
            res.json({ message: 'Product ID is required for update' });
            return;
          }

          const updatedProductData: Product = await req.json();
          const { id: clientSideId, ...updateData } = updatedProductData;

          // Buscar marca si es necesario
          let brand_id_to_update = updatedProductData.brandId || null;
          let brand_logo_url_to_update = updatedProductData.brandLogoUrl;

          if (updatedProductData.brand && !updatedProductData.brandId) {
            const { data: brand } = await supabaseAdmin
              .from('brands')
              .select('*')
              .eq('name', updatedProductData.brand)
              .single();
            
            if (brand) {
              brand_id_to_update = brand.id;
              brand_logo_url_to_update = brand.logo_url;
            }
          }

          const dataToUpdate: any = {
            sku: updateData.sku,
            name: updateData.name,
            brand_name: updateData.brand,
            brand_id: brand_id_to_update,
            brand_logo_url: brand_logo_url_to_update || '',
            price: updateData.price.toString(),
            rating: (updateData.rating || 0).toString(),
            reviews: updateData.reviews || 0,
            image_url: updateData.imageUrl || '',
            description: updateData.description || '',
            tags: updateData.tags || [],
            stock: updateData.stock || 0,
            width: updateData.width || '',
            profile: updateData.profile || '',
            diameter: updateData.diameter || '',
            is_on_sale: updateData.isOnSale || false,
            sale_price: updateData.salePrice?.toString() || null,
            discount_percentage: updateData.discountPercentage || null,
            category_id: updateData.categoryId || null,
          };

          const { data: updatedProduct, error } = await supabaseAdmin
            .from('products')
            .update(dataToUpdate)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            console.error('[Products API] Error actualizando producto:', error);
            res.statusCode = 500;
            res.json({ message: 'Error actualizando producto', error: error.message });
            return;
          }

          if (!updatedProduct) {
            res.statusCode = 404;
            res.json({ message: 'Product not found' });
            return;
          }

          const clientProduct = toClientProduct(updatedProduct);
          res.statusCode = 200;
          res.json(clientProduct);
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

        const { error } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', idToDelete);

        if (error) {
          console.error('[Products API] Error eliminando producto:', error);
          res.statusCode = 500;
          res.json({ message: 'Error eliminando producto', error: error.message });
          return;
        }

        // Verificar si se eliminó algún registro
        const { count } = await supabaseAdmin
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('id', idToDelete);

        if (count === 0) {
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 404;
          res.json({ message: 'Product not found' });
        }
        break;
      }

      default: {
        res.statusCode = 405;
        res.json({ message: 'Method Not Allowed' });
        break;
      }
    }
  } catch (error: any) {
    console.error('❌ Error in products API:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);

    // Verificar si es un error de configuración de Supabase
    if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
      console.error('⚠️ Supabase URL no está configurada');
      res.statusCode = 503;
      res.json({ 
        message: 'Servicio no disponible: Supabase no configurado', 
        error: 'VITE_SUPABASE_URL or SUPABASE_URL environment variable is not set',
        hint: 'Por favor, configura la variable de entorno VITE_SUPABASE_URL en Vercel'
      });
      return;
    }

    if (!process.env.VITE_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY) {
      console.error('⚠️ Supabase Anon Key no está configurada');
      res.statusCode = 503;
      res.json({ 
        message: 'Servicio no disponible: Supabase no configurado', 
        error: 'VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable is not set',
        hint: 'Por favor, configura la variable de entorno VITE_SUPABASE_ANON_KEY en Vercel'
      });
      return;
    }

    res.statusCode = 500;
    res.json({ 
      message: 'Error interno del servidor',
      error: error.message || 'Error desconocido',
      type: error.name || 'UnknownError',
      hint: 'Revisa los logs del servidor para más detalles'
    });
  }
}

export default allowCors(handler);
