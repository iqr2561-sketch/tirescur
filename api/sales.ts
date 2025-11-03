import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseAdmin } from '../lib/supabase';
import { Sale } from '../types';
import { INITIAL_SALES_DATA } from '../constants';

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

const toClientSale = async (row: any): Promise<Sale> => {
  // Obtener productos de la venta desde sale_products
  const { data: saleProducts } = await supabase
    .from('sale_products')
    .select('*')
    .eq('sale_id', row.id);

  const products = (saleProducts || []).map((sp: any) => ({
    productId: sp.product_id || '',
    name: sp.product_name,
    quantity: sp.quantity,
    price: parseFloat(sp.price),
  }));

  return {
    id: row.id,
    customerName: row.customer_name,
    total: parseFloat(row.total),
    status: row.status,
    date: row.date || row.created_at,
    products,
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
    const supabase = getSupabaseAdmin();
    // Seeding logic
    const { count: saleCount } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true });

    if (saleCount === 0 && INITIAL_SALES_DATA.length > 0) {
      // Insertar ventas iniciales con sus productos
      for (const saleData of INITIAL_SALES_DATA) {
        const { data: insertedSale, error: saleError } = await supabase
          .from('sales')
          .insert({
            customer_name: saleData.customerName,
            total: saleData.total.toString(),
            status: saleData.status,
            date: saleData.date,
          })
          .select()
          .single();

        if (!saleError && insertedSale && saleData.products) {
          // Insertar productos de la venta
          const saleProductsToInsert = saleData.products.map((product) => ({
            sale_id: insertedSale.id,
            product_id: product.productId || null,
            product_name: product.name,
            quantity: product.quantity,
            price: product.price.toString(),
          }));

          await supabase
            .from('sale_products')
            .insert(saleProductsToInsert);
        }
      }
    }

    switch (req.method) {
      case 'GET': {
        const { data: sales, error } = await supabase
          .from('sales')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('[Sales API] Error obteniendo ventas:', error);
          res.statusCode = 500;
          res.json({ message: 'Error obteniendo ventas', error: error.message });
          return;
        }

        const clientSales = await Promise.all((sales || []).map(sale => toClientSale(sale, supabase)));
        res.statusCode = 200;
        res.json(clientSales);
        break;
      }

      case 'POST': {
        const newSaleData: Omit<Sale, 'id'> = await req.json();

        // Insertar la venta
        const { data: insertedSale, error: saleError } = await supabase
          .from('sales')
          .insert({
            customer_name: newSaleData.customerName,
            total: newSaleData.total.toString(),
            status: newSaleData.status || 'Pendiente',
            date: newSaleData.date || new Date().toISOString(),
          })
          .select()
          .single();

        if (saleError) {
          console.error('[Sales API] Error creando venta:', saleError);
          res.statusCode = 500;
          res.json({ message: 'Error creando venta', error: saleError.message });
          return;
        }

        if (!insertedSale) {
          res.statusCode = 500;
          res.json({ message: 'Error creando venta' });
          return;
        }

        // Insertar productos de la venta
        if (newSaleData.products && newSaleData.products.length > 0) {
          const saleProductsToInsert = newSaleData.products.map((product) => ({
            sale_id: insertedSale.id,
            product_id: product.productId || null,
            product_name: product.name,
            quantity: product.quantity,
            price: product.price.toString(),
          }));

          const { error: productsError } = await supabase
            .from('sale_products')
            .insert(saleProductsToInsert);

          if (productsError) {
            console.error('[Sales API] Error insertando productos de venta:', productsError);
            // No fallamos aquí, la venta ya está creada
          }
        }

        const clientSale = await toClientSale(insertedSale, supabase);
        res.statusCode = 201;
        res.json(clientSale);
        break;
      }

      default: {
        res.statusCode = 405;
        res.json({ message: 'Method Not Allowed' });
        break;
      }
    }
  } catch (error: any) {
    console.error('Error in sales API:', error);
    res.statusCode = 500;
    res.json({ message: 'Internal server error', error: error.message });
  }
}

export default allowCors(handler);
