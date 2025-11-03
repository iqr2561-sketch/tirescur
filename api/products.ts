import { IncomingMessage, ServerResponse } from 'http';
import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb';
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

// Helper function to convert MongoDB _id to client id
const toClientProduct = (doc: any): Product => {
  return {
    id: doc._id.toString(),
    sku: doc.sku,
    name: doc.name,
    brand: doc.brand || doc.brand_name,
    brandId: doc.brand_id?.toString(),
    brandLogoUrl: doc.brand_logo_url || doc.brandLogoUrl,
    price: doc.price,
    rating: doc.rating,
    reviews: doc.reviews,
    imageUrl: doc.imageUrl,
    description: doc.description,
    tags: doc.tags,
    stock: doc.stock,
    width: doc.width,
    profile: doc.profile,
    diameter: doc.diameter,
    // Deal/Offer fields
    isOnSale: doc.isOnSale || doc.is_on_sale || false,
    salePrice: doc.salePrice || doc.sale_price,
    discountPercentage: doc.discountPercentage || doc.discount_percentage,
    categoryId: doc.categoryId || doc.category_id?.toString(),
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
    const productsCollection = await getCollection('products');
    const brandsCollection = await getCollection('brands');

    // Seeding logic
    const productCount = await productsCollection.countDocuments();
    console.log(`[Products API] Productos en base de datos: ${productCount}`);
    if (productCount === 0) {
      console.log('[Products API] Iniciando seeding de datos...');
      // Ensure brands also exist for product seeding
      const brandCount = await brandsCollection.countDocuments();
      if (brandCount === 0) {
        const brandsToInsert = INITIAL_BRANDS_DATA.map(brand => ({
          name: brand.name,
          logoUrl: brand.logoUrl,
        }));
        const brandsResult = await brandsCollection.insertMany(brandsToInsert);
        console.log(`[Products API] ✅ ${brandsResult.insertedCount} marcas insertadas`);
      }

      const brands = await brandsCollection.find({}).toArray();
      const seededProducts = PRODUCTS_DATA.map(p => {
        const brand = brands.find((b: any) => b.name === p.brand);
        return {
          ...p,
          brand_name: p.brand,
          brand_id: brand?._id || null,
          brand_logo_url: brand?.logoUrl || p.brandLogoUrl,
          // Deal/Offer fields - mapear a formato MongoDB
          is_on_sale: p.isOnSale || false,
          sale_price: p.salePrice,
          discount_percentage: p.discountPercentage,
          category_id: p.categoryId ? new ObjectId(p.categoryId) : null,
          // Remover campos camelCase
          isOnSale: undefined,
          salePrice: undefined,
          discountPercentage: undefined,
          categoryId: undefined,
        };
      });
      const productsResult = await productsCollection.insertMany(seededProducts);
      console.log(`[Products API] ✅ ${productsResult.insertedCount} productos insertados`);
    }

    switch (req.method) {
      case 'GET': {
        const products = await productsCollection.find({}).toArray();
        const clientProducts = products.map(toClientProduct);
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

          const brands = await brandsCollection.find({}).toArray();
          const productsWithBrandInfo = newProductsData.map((p) => {
            const brand = brands.find((b: any) => b.name === p.brand) as any;
            return {
              ...p,
              brand_name: p.brand,
              brand_id: brand?._id || null,
              brand_logo_url: brand?.logoUrl || p.brandLogoUrl,
            };
          });

          const result = await productsCollection.insertMany(productsWithBrandInfo);
          const insertedIds = Object.values(result.insertedIds);
          const insertedProducts = await productsCollection
            .find({ _id: { $in: insertedIds } })
            .toArray();
          const clientProducts = insertedProducts.map(toClientProduct);
          res.statusCode = 201;
          res.json(clientProducts);
        } else {
          const newProductData: Omit<Product, 'id'> = await req.json();

          // Find brand by name
          const brand = await brandsCollection.findOne({ name: newProductData.brand }) as any;

          const productToInsert = {
            ...newProductData,
            brand_name: newProductData.brand,
            brand_id: brand?._id || null,
            brand_logo_url: brand?.logoUrl || newProductData.brandLogoUrl,
            // Deal/Offer fields - mapear a formato MongoDB
            is_on_sale: newProductData.isOnSale || false,
            sale_price: newProductData.salePrice,
            discount_percentage: newProductData.discountPercentage,
            category_id: newProductData.categoryId ? new ObjectId(newProductData.categoryId) : null,
            // Remover campos camelCase que no van a MongoDB
            isOnSale: undefined,
            salePrice: undefined,
            discountPercentage: undefined,
            categoryId: undefined,
          };

          const result = await productsCollection.insertOne(productToInsert);
          const insertedProduct = await productsCollection.findOne({ _id: result.insertedId });
          if (!insertedProduct) {
            res.statusCode = 500;
            res.json({ message: 'Error creating product' });
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
            let brand_id_to_update = product.brandId ? new ObjectId(product.brandId) : null;
            let brand_logo_url_to_update = product.brandLogoUrl;

            if (product.brand) {
              const brand = await brandsCollection.findOne({ name: product.brand }) as any;
              if (brand) {
                brand_id_to_update = brand._id;
                brand_logo_url_to_update = brand.logoUrl;
              }
            }

            const { id, ...updateData } = product;
            const dataToUpdate: any = {
              ...updateData,
              brand_id: brand_id_to_update,
              brand_name: product.brand,
              brand_logo_url: brand_logo_url_to_update,
              // Deal/Offer fields - mapear a formato MongoDB
              is_on_sale: product.isOnSale || false,
              sale_price: product.salePrice,
              discount_percentage: product.discountPercentage,
              category_id: product.categoryId ? new ObjectId(product.categoryId) : null,
            };
            delete dataToUpdate.brand;
            delete dataToUpdate.brandLogoUrl;
            delete dataToUpdate.isOnSale;
            delete dataToUpdate.salePrice;
            delete dataToUpdate.discountPercentage;
            delete dataToUpdate.categoryId;

            await productsCollection.updateOne(
              { _id: new ObjectId(id) },
              { $set: dataToUpdate }
            );
          });

          await Promise.all(updatePromises);
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
          const { id: clientSideId, ...updateData } = updatedProductData;

          let brand_id_to_update = updatedProductData.brandId 
            ? new ObjectId(updatedProductData.brandId) 
            : null;
          let brand_logo_url_to_update = updatedProductData.brandLogoUrl;

          if (updatedProductData.brand) {
            const brand = await brandsCollection.findOne({ name: updatedProductData.brand }) as any;
            if (brand) {
              brand_id_to_update = brand._id;
              brand_logo_url_to_update = brand.logoUrl;
            }
          }

          const dataToUpdate: any = {
            ...updateData,
            brand_id: brand_id_to_update,
            brand_name: updatedProductData.brand,
            brand_logo_url: brand_logo_url_to_update,
            // Deal/Offer fields - mapear a formato MongoDB
            is_on_sale: updatedProductData.isOnSale || false,
            sale_price: updatedProductData.salePrice,
            discount_percentage: updatedProductData.discountPercentage,
            category_id: updatedProductData.categoryId ? new ObjectId(updatedProductData.categoryId) : null,
          };
          delete dataToUpdate.brand;
          delete dataToUpdate.brandLogoUrl;
          delete dataToUpdate.isOnSale;
          delete dataToUpdate.salePrice;
          delete dataToUpdate.discountPercentage;
          delete dataToUpdate.categoryId;

          const result = await productsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: dataToUpdate }
          );

          if (result.matchedCount === 0) {
            res.statusCode = 404;
            res.json({ message: 'Product not found' });
            return;
          }

          const updatedProduct = await productsCollection.findOne({ _id: new ObjectId(id) });
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

        const result = await productsCollection.deleteOne({ _id: new ObjectId(idToDelete) });
        if (result.deletedCount === 0) {
          res.statusCode = 404;
          res.json({ message: 'Product not found' });
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
  } catch (error: any) {
    console.error('❌ Error in products API:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    // Verificar si es un error de conexión a MongoDB
    if (!process.env.MONGODB_URI || (error.message && error.message.includes('MONGODB_URI'))) {
      console.error('⚠️ MONGODB_URI no está configurada');
      res.statusCode = 503;
      res.json({ 
        message: 'Servicio no disponible: MongoDB no configurado', 
        error: 'MONGODB_URI environment variable is not set',
        hint: 'Por favor, configura la variable de entorno MONGODB_URI en Vercel'
      });
      return;
    }
    
    // Verificar si es un error de conexión
    if (error.message && (
      error.message.includes('connect') || 
      error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.name === 'MongoServerError' ||
      error.name === 'MongoNetworkError'
    )) {
      console.error('⚠️ Error de conexión a MongoDB');
      res.statusCode = 503;
      res.json({ 
        message: 'Servicio no disponible: Error de conexión a la base de datos', 
        error: error.message,
        hint: 'Verifica la conexión a MongoDB Atlas y la configuración de red'
      });
      return;
    }
    
    res.statusCode = 500;
    res.json({ 
      message: 'Internal server error', 
      error: error.message || 'Error desconocido',
      type: error.name || 'UnknownError'
    });
  }
}

export default allowCors(handler);
