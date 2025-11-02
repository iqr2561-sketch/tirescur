import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseClient } from '../lib/supabase';
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
  const { data: countData } = await supabase.from('menu_items').select('id', { count: 'exact' });
  if (countData?.length === 0) {
    const { error: upsertError } = await supabase
      .from('menu_items')
      .upsert(DEFAULT_MENU_ITEMS, { onConflict: 'name,location' }); // Assuming name+location is unique
    if (upsertError) console.error('Error seeding menu items:', upsertError);
  }

  switch (req.method) {
    case 'GET': {
      const { data, error } = await supabase.from('menu_items').select('*').order('order', { ascending: true });
      if (error) {
        res.statusCode = 500;
        res.json({ message: 'Error fetching menu items', error: error.message });
        return;
      }
      res.statusCode = 200;
      res.json(data);
      break;
    }

    case 'POST': {
      const newMenuData: Omit<MenuItem, 'id'> = await req.json();
      const { data, error } = await supabase.from('menu_items').insert(newMenuData).select('*').single();
      if (error) {
        res.statusCode = 500;
        res.json({ message: 'Error adding menu item', error: error.message });
        return;
      }
      res.statusCode = 201;
      res.json(data);
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
      const { id: clientSideId, ...updateData } = updatedMenuData; // Exclude 'id' from update payload
      
      const { data, error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Supabase error code for "not found"
          res.statusCode = 404;
          res.json({ message: 'Menu item not found', error: error.message });
          return;
        }
        res.statusCode = 500;
        res.json({ message: 'Error updating menu item', error: error.message });
        return;
      }
      res.statusCode = 200;
      res.json(data);
      break;
    }

    case 'DELETE': {
      const idToDelete = req.query.id;
      if (!idToDelete) {
        res.statusCode = 400;
        res.json({ message: 'Menu ID is required for delete' });
        return;
      }
      const { error } = await supabase.from('menu_items').delete().eq('id', idToDelete);
      if (error) {
        if (error.code === 'PGRST116') { // Supabase error code for "not found"
          res.statusCode = 404;
          res.json({ message: 'Menu item not found', error: error.message });
          return;
        }
        res.statusCode = 500;
        res.json({ message: 'Error deleting menu item', error: error.message });
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