import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseClient } from '../lib/supabase';
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
  const { data: countData } = await supabase.from('brands').select('id', { count: 'exact' });
  if (countData?.length === 0) {
    const { error: upsertError } = await supabase
      .from('brands')
      .upsert(INITIAL_BRANDS_DATA, { onConflict: 'name' });
    if (upsertError) console.error('Error seeding brands:', upsertError);
  }

  switch (req.method) {
    case 'GET': {
      const { data, error } = await supabase.from('brands').select('*');
      if (error) {
        res.statusCode = 500;
        res.json({ message: 'Error fetching brands', error: error.message });
        return;
      }
      res.statusCode = 200;
      res.json(data);
      break;
    }

    case 'POST': {
      const newBrandData: Omit<Brand, 'id'> = await req.json();
      const { data, error } = await supabase.from('brands').insert(newBrandData).select('*').single();
      if (error) {
        res.statusCode = 500;
        res.json({ message: 'Error adding brand', error: error.message });
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
        res.json({ message: 'Brand ID is required for update' });
        return;
      }
      const updatedBrandData: Brand = await req.json();
      const { id: clientSideId, ...updateData } = updatedBrandData; // Exclude 'id' from update payload
      
      const { data, error } = await supabase
        .from('brands')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Supabase error code for "not found"
          res.statusCode = 404;
          res.json({ message: 'Brand not found', error: error.message });
          return;
        }
        res.statusCode = 500;
        res.json({ message: 'Error updating brand', error: error.message });
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
        res.json({ message: 'Brand ID is required for delete' });
        return;
      }
      const { error } = await supabase.from('brands').delete().eq('id', idToDelete);
      if (error) {
        if (error.code === 'PGRST116') { // Supabase error code for "not found"
          res.statusCode = 404;
          res.json({ message: 'Brand not found', error: error.message });
          return;
        }
        res.statusCode = 500;
        res.json({ message: 'Error deleting brand', error: error.message });
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