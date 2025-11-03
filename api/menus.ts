import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseAdmin } from '../lib/supabase';
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

const toClientMenuItem = (row: any): MenuItem => {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    location: row.location,
    order: row.order,
    isExternal: row.is_external || false,
    type: row.type,
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
    // Seeding logic
    const { count: menuCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true });

    if (menuCount === 0) {
      const menuItemsToInsert = DEFAULT_MENU_ITEMS.map(item => ({
        name: item.name,
        path: item.path,
        is_external: item.isExternal || false,
        order: item.order || 0,
        location: item.location,
        type: item.type,
      }));

      const { error } = await supabase
        .from('menu_items')
        .insert(menuItemsToInsert);

      if (error) {
        console.error('[Menus API] Error en seeding:', error);
      }
    }

    switch (req.method) {
      case 'GET': {
        const { data: menus, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          console.error('[Menus API] Error obteniendo menús:', error);
          res.statusCode = 500;
          res.json({ message: 'Error obteniendo menús', error: error.message });
          return;
        }

        const clientMenus = (menus || []).map(toClientMenuItem);
        res.statusCode = 200;
        res.json(clientMenus);
        break;
      }

      case 'POST': {
        const newMenuData: Omit<MenuItem, 'id'> = await req.json();
        
        const menuToInsert = {
          name: newMenuData.name,
          path: newMenuData.path,
          is_external: newMenuData.isExternal || false,
          order: newMenuData.order || 0,
          location: newMenuData.location,
          type: newMenuData.type,
        };

        const { data: insertedMenu, error } = await supabase
          .from('menu_items')
          .insert(menuToInsert)
          .select()
          .single();

        if (error) {
          console.error('[Menus API] Error creando menú:', error);
          res.statusCode = 500;
          res.json({ message: 'Error creando menú', error: error.message });
          return;
        }

        if (!insertedMenu) {
          res.statusCode = 500;
          res.json({ message: 'Error creando menú' });
          return;
        }

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

        const menuToUpdate = {
          name: updateData.name,
          path: updateData.path,
          is_external: updateData.isExternal || false,
          order: updateData.order || 0,
          location: updateData.location,
          type: updateData.type,
        };

        const { data: updatedMenu, error } = await supabase
          .from('menu_items')
          .update(menuToUpdate)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('[Menus API] Error actualizando menú:', error);
          res.statusCode = 500;
          res.json({ message: 'Error actualizando menú', error: error.message });
          return;
        }

        if (!updatedMenu) {
          res.statusCode = 404;
          res.json({ message: 'Menu item not found' });
          return;
        }

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

        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', idToDelete);

        if (error) {
          console.error('[Menus API] Error eliminando menú:', error);
          res.statusCode = 500;
          res.json({ message: 'Error eliminando menú', error: error.message });
          return;
        }

        // Verificar si se eliminó
        const { count } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact', head: true })
          .eq('id', idToDelete);

        if (count === 0) {
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 404;
          res.json({ message: 'Menu item not found' });
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
    console.error('Error in menus API:', error);
    res.statusCode = 500;
    res.json({ message: 'Internal server error', error: error.message });
  }
}

export default allowCors(handler);
