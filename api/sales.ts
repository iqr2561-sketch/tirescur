import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';
import { INITIAL_SALES_DATA } from '../constants';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();
    await seedSalesIfNeeded(supabase);

    const { query } = parse(req.url ?? '', true);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('sales')
        .select('*, sale_products(*)')
        .order('date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const formatted = (data || []).map((row: any) => toClientSale(row));
      res.statusCode = 200;
      res.json(formatted);
      return;
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);

      if (!body?.customerName) {
        res.statusCode = 400;
        res.json({ error: 'El nombre del cliente es obligatorio' });
        return;
      }

      const salePayload = {
        customer_name: body.customerName,
        total: Number(body.total || 0).toString(),
        status: body.status || 'Pendiente',
        date: body.date || new Date().toISOString()
      };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(salePayload)
        .select()
        .single();

      if (saleError || !sale) {
        throw new Error(saleError?.message || 'Error creando la venta');
      }

      if (Array.isArray(body.products) && body.products.length > 0) {
        const productsPayload = body.products.map((product: any) => mapSaleProductForInsert(product, sale.id));
        const { error: productsError } = await supabase
          .from('sale_products')
          .insert(productsPayload);

        if (productsError) {
          console.warn('[Sales API] Error insertando productos de la venta:', productsError.message);
        }
      }

      const { data: saleWithProducts, error: fetchError } = await supabase
        .from('sales')
        .select('*, sale_products(*)')
        .eq('id', sale.id)
        .single();

      if (fetchError || !saleWithProducts) {
        throw new Error(fetchError?.message || 'Error obteniendo la venta creada');
      }

      res.statusCode = 201;
      res.json(toClientSale(saleWithProducts));
      return;
    }

    res.statusCode = 405;
    res.json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('[Sales API] Error en endpoint:', error);
    res.statusCode = 500;
    res.json({ message: error?.message || 'Error interno del servidor' });
  }
});

async function seedSalesIfNeeded(supabase: any) {
  const { count, error } = await supabase
    .from('sales')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  if ((count || 0) > 0 || INITIAL_SALES_DATA.length === 0) {
    return;
  }

  for (const sale of INITIAL_SALES_DATA) {
    const { data: saleRecord, error: saleError } = await supabase
      .from('sales')
      .insert({
        customer_name: sale.customerName,
        total: sale.total.toString(),
        status: sale.status,
        date: sale.date
      })
      .select()
      .single();

    if (saleError || !saleRecord) {
      throw new Error(saleError?.message || 'Error insertando venta inicial');
    }

    if (sale.products?.length) {
      const payload = sale.products.map((product) => mapSaleProductForInsert(product, saleRecord.id));
      const { error: productsError } = await supabase
        .from('sale_products')
        .insert(payload);

      if (productsError) {
        throw new Error(productsError.message);
      }
    }
  }
}

function mapSaleProductForInsert(product: any, saleId: string) {
  return {
    sale_id: saleId,
    product_id: product.productId || null,
    product_name: product.name,
    quantity: Number(product.quantity || 0),
    price: Number(product.price || 0).toString()
  };
}

function toClientSale(row: any) {
  const saleProducts = row.sale_products || row.products || [];
  return {
    id: row.id,
    customerName: row.customer_name,
    total: Number(row.total),
    status: row.status,
    date: row.date || row.created_at,
    products: saleProducts.map((item: any) => ({
      productId: item.product_id || '',
      name: item.product_name,
      quantity: item.quantity,
      price: Number(item.price)
    }))
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
