import { IncomingMessage, ServerResponse } from 'http';
import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb';
import { Brand } from '../types';
import { INITIAL_BRANDS_DATA } from '../constants';

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

const toClientBrand = (doc: any): Brand => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    logoUrl: doc.logoUrl || doc.logo_url,
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
    const brandsCollection = await getCollection('brands');

    // Seeding logic
    const brandCount = await brandsCollection.countDocuments();
    if (brandCount === 0) {
      const brandsToInsert = INITIAL_BRANDS_DATA.map(brand => ({
        name: brand.name,
        logoUrl: brand.logoUrl,
      }));
      await brandsCollection.insertMany(brandsToInsert);
    }

    switch (req.method) {
      case 'GET': {
        const brands = await brandsCollection.find({}).toArray();
        const clientBrands = brands.map(toClientBrand);
        res.statusCode = 200;
        res.json(clientBrands);
        break;
      }

      case 'POST': {
        const newBrandData: Omit<Brand, 'id'> = await req.json();
        const result = await brandsCollection.insertOne({
          name: newBrandData.name,
          logoUrl: newBrandData.logoUrl,
        });
        const insertedBrand = await brandsCollection.findOne({ _id: result.insertedId });
        const clientBrand = toClientBrand(insertedBrand);
        res.statusCode = 201;
        res.json(clientBrand);
        break;
      }

      case 'PUT': {
        const id = req.query.id;
        if (!id) {
          res.statusCode = 400;
          res.json({ message: 'Brand ID is required for update' });
          return;
        }
        const updatedBrandData: Brand = await req.json();
        const { id: clientSideId, ...updateData } = updatedBrandData;

        const result = await brandsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          res.statusCode = 404;
          res.json({ message: 'Brand not found' });
          return;
        }

        const updatedBrand = await brandsCollection.findOne({ _id: new ObjectId(id) });
        const clientBrand = toClientBrand(updatedBrand);
        res.statusCode = 200;
        res.json(clientBrand);
        break;
      }

      case 'DELETE': {
        const idToDelete = req.query.id;
        if (!idToDelete) {
          res.statusCode = 400;
          res.json({ message: 'Brand ID is required for delete' });
          return;
        }

        const result = await brandsCollection.deleteOne({ _id: new ObjectId(idToDelete) });
        if (result.deletedCount === 0) {
          res.statusCode = 404;
          res.json({ message: 'Brand not found' });
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
    console.error('Error in brands API:', error);
    res.statusCode = 500;
    res.json({ message: 'Internal server error', error: error.message });
  }
}

export default allowCors(handler);
