import { IncomingMessage, ServerResponse } from 'http';
import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb';
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

const toClientSale = (doc: any): Sale => {
  return {
    id: doc._id.toString(),
    customerName: doc.customerName,
    total: doc.total,
    status: doc.status,
    date: doc.date,
    products: doc.products,
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
    const salesCollection = await getCollection('sales');

    // Seeding logic
    const saleCount = await salesCollection.countDocuments();
    if (saleCount === 0 && INITIAL_SALES_DATA.length > 0) {
      await salesCollection.insertMany(INITIAL_SALES_DATA);
    }

    switch (req.method) {
      case 'GET': {
        const sales = await salesCollection.find({}).sort({ date: -1 }).toArray();
        const clientSales = sales.map(toClientSale);
        res.statusCode = 200;
        res.json(clientSales);
        break;
      }

      case 'POST': {
        const newSaleData: Omit<Sale, 'id'> = await req.json();
        const result = await salesCollection.insertOne(newSaleData);
        const insertedSale = await salesCollection.findOne({ _id: result.insertedId });
        const clientSale = toClientSale(insertedSale);
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
