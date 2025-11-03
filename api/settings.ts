import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';
import {
  DEFAULT_HERO_IMAGE_URL,
  DEFAULT_WHATSAPP_PHONE_NUMBER,
  DEFAULT_FOOTER_CONTENT,
  DEFAULT_DEAL_ZONE_CONFIG
} from '../constants';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();
    const { method } = req;

    if (method === 'GET') {
      const settings = await getOrCreateSettings(supabase);
      res.statusCode = 200;
      res.json(settings);
      return;
    }

    if (method === 'PATCH') {
      const body = await parseBody(req);
      const updated = await updateSettings(supabase, body);
      res.statusCode = 200;
      res.json(updated);
      return;
    }

    res.statusCode = 405;
    res.json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('[Settings API] Error en endpoint:', error);
    res.statusCode = 500;
    res.json({ message: error?.message || 'Error interno del servidor' });
  }
});

async function getOrCreateSettings(supabase: any) {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  if (!data) {
    const defaults = mapSettingsForStorage({});
    const { data: inserted, error: insertError } = await supabase
      .from('app_settings')
      .insert(defaults)
      .select()
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message || 'Error creando configuración inicial');
    }

    return mapSettingsForClient(inserted);
  }

  return mapSettingsForClient(data);
}

async function updateSettings(supabase: any, payload: any) {
  const { data: existing } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (!existing) {
    const defaults = mapSettingsForStorage(payload);
    const { data, error } = await supabase
      .from('app_settings')
      .insert(defaults)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Error creando configuración');
    }

    return mapSettingsForClient(data);
  }

  const updates = mapSettingsForStorage(payload, false);
  const { data: updated, error: updateError } = await supabase
    .from('app_settings')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || 'Error actualizando configuración');
  }

  return mapSettingsForClient(updated);
}

function mapSettingsForStorage(settings: any, fillDefaults = true) {
  const base = fillDefaults
    ? {
        hero_image_url: DEFAULT_HERO_IMAGE_URL,
        whatsapp_phone_number: DEFAULT_WHATSAPP_PHONE_NUMBER,
        footer_content: DEFAULT_FOOTER_CONTENT,
        deal_zone_config: DEFAULT_DEAL_ZONE_CONFIG
      }
    : {};

  if (settings.heroImageUrl !== undefined) {
    base.hero_image_url = settings.heroImageUrl;
  }
  if (settings.whatsappPhoneNumber !== undefined) {
    base.whatsapp_phone_number = settings.whatsappPhoneNumber;
  }
  if (settings.footerContent !== undefined) {
    base.footer_content = settings.footerContent;
  }
  if (settings.dealZoneConfig !== undefined) {
    base.deal_zone_config = settings.dealZoneConfig;
  }

  return base;
}

function mapSettingsForClient(settings: any) {
  return {
    heroImageUrl: settings.hero_image_url || DEFAULT_HERO_IMAGE_URL,
    whatsappPhoneNumber: settings.whatsapp_phone_number || DEFAULT_WHATSAPP_PHONE_NUMBER,
    footerContent: settings.footer_content || DEFAULT_FOOTER_CONTENT,
    dealZoneConfig: settings.deal_zone_config || DEFAULT_DEAL_ZONE_CONFIG
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
