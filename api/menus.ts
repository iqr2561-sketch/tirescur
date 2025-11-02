import { IncomingMessage, ServerResponse } from 'http';
import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb';
import { MenuItem } from '../types';
import { DEFAULT_MENU_ITEMS } from '../constants';

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

const toClientMenuItem = (doc: any): MenuItem => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    path: doc.path,
    location: doc.location,
    order: doc.order,
    isExternal: doc.isExternal || false,
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
    const menusCollection = await getCollection('menu_items');

    // Seeding logic
    const menuCount = await menusCollection.countDocuments();
    if (menuCount === 0) {
      await menusCollection.insertMany(DEFAULT_MENU_ITEMS);
    }

    switch (req.method) {
      case 'GET': {
        const menus = await menusCollection.find({}).sort({ order: 1 }).toArray();
        const clientMenus = menus.map(toClientMenuItem);
        res.statusCode = 200;
        res.json(clientMenus);
        break;
      }

      case 'POST': {
        const newMenuData: Omit<MenuItem, 'id'> = await req.json();
        const result = await menusCollection.insertOne(newMenuData);
        const insertedMenu = await menusCollection.findOne({ _id: result.insertedId });
        const clientMenu = toClientMenuItem(insertedMenu);
        res.statusCode = 201;
        res.json(clientMenu);
        break;
      }

      case 'PUT': {
        const id = req.query.id;
        if (!id) {
          res.statusCode = 400;
          res.json({ message: 'Menu ID is required for update' });
          return;
        }
        const updatedMenuData: MenuItem = await req.json();
        const { id: clientSideId, ...updateData } = updatedMenuData;

        const result = await menusCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          res.statusCode = 404;
          res.json({ message: 'Menu item not found' });
          return;
        }

        const updatedMenu = await menusCollection.findOne({ _id: new ObjectId(id) });
        const clientMenu = toClientMenuItem(updatedMenu);
        res.statusCode = 200;
        res.json(clientMenu);
        break;
      }

      case 'DELETE': {
        const idToDelete = req.query.id;
        if (!idToDelete) {
          res.statusCode = 400;
          res.json({ message: 'Menu ID is required for delete' });
          return;
        }

        const result = await menusCollection.deleteOne({ _id: new ObjectId(idToDelete) });
        if (result.deletedCount === 0) {
          res.statusCode = 404;
          res.json({ message: 'Menu item not found' });
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
    console.error('Error in menus API:', error);
    res.statusCode = 500;
    res.json({ message: 'Internal server error', error: error.message });
  }
}

export default allowCors(handler);
