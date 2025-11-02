import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseClient } from '../lib/supabase';
import { DEFAULT_HERO_IMAGE_URL, DEFAULT_WHATSAPP_PHONE_NUMBER, DEFAULT_FOOTER_CONTENT, DEFAULT_DEAL_ZONE_CONFIG } from '../constants';
import { FooterContent, DealZoneConfig } from '../types';

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

// Fix: Added allowCors function
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

// Fix: Defined GlobalSettingsDoc interface to mirror the Supabase table schema
interface GlobalSettingsDoc {
  id: string;
  hero_image_url: string;
  whatsapp_phone_number: string;
  footer_content: FooterContent;
  deal_zone_config: DealZoneConfig;
}

async function handler(req: CustomRequest, res: CustomResponse) {
  const supabase = getSupabaseClient();
  const SETTINGS_DOC_ID = 'app_settings';

  switch (req.method) {
    case 'GET': {
      let { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', SETTINGS_DOC_ID)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found", which is expected if not seeded
        res.statusCode = 500;
        res.json({ message: 'Error fetching settings', error: error.message });
        return;
      }

      // If no settings exist, create with defaults
      if (!settings) {
        const defaultSettings: GlobalSettingsDoc = {
          id: SETTINGS_DOC_ID,
          hero_image_url: DEFAULT_HERO_IMAGE_URL,
          whatsapp_phone_number: DEFAULT_WHATSAPP_PHONE_NUMBER,
          footer_content: DEFAULT_FOOTER_CONTENT,
          deal_zone_config: DEFAULT_DEAL_ZONE_CONFIG,
        };
        const { data: insertedSettings, error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select('*')
          .single();

        if (insertError) {
          res.statusCode = 500;
          res.json({ message: 'Error seeding default settings', error: insertError.message });
          return;
        }
        settings = insertedSettings;
      }
      // Map SQL names back to client-side names
      const clientSettings = {
        ...settings,
        heroImageUrl: settings.hero_image_url,
        whatsappPhoneNumber: settings.whatsapp_phone_number,
        footerContent: settings.footer_content,
        dealZoneConfig: settings.deal_zone_config,
      };
      // Clean up SQL-specific fields if necessary before sending to client
      delete clientSettings.hero_image_url;
      delete clientSettings.whatsapp_phone_number;
      delete clientSettings.footer_content;
      delete clientSettings.deal_zone_config;

      res.statusCode = 200;
      res.json(clientSettings);
      break;
    }

    case 'PUT': {
      const updatedClientSettings = await req.json();

      // Map client-side names to SQL schema names
      const settingsToUpdate: Partial<GlobalSettingsDoc> = {
        hero_image_url: updatedClientSettings.heroImageUrl,
        whatsapp_phone_number: updatedClientSettings.whatsappPhoneNumber,
        footer_content: updatedClientSettings.footerContent,
        deal_zone_config: updatedClientSettings.dealZoneConfig,
      };

      const { data, error } = await supabase
        .from('settings')
        .update(settingsToUpdate)
        .eq('id', SETTINGS_DOC_ID)
        .select('*')
        .single();

      if (error) {
        res.statusCode = 500;
        res.json({ message: 'Error updating settings', error: error.message });
        return;
      }

      // Map SQL names back to client-side names before responding
      const clientSettings = {
        ...data,
        heroImageUrl: data.hero_image_url,
        whatsappPhoneNumber: data.whatsapp_phone_number,
        footerContent: data.footer_content,
        dealZoneConfig: data.deal_zone_config,
      };
      delete clientSettings.hero_image_url;
      delete clientSettings.whatsapp_phone_number;
      delete clientSettings.footer_content;
      delete clientSettings.deal_zone_config;

      res.statusCode = 200;
      res.json(clientSettings);
      break;
    }

    default: {
      res.statusCode = 405;
      res.json({ message: 'Method Not Allowed' });
      break;
    }
  }
}

// Fix: Applied allowCors to the handler function
export default allowCors(handler);