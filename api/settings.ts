import { IncomingMessage, ServerResponse } from 'http';
import { supabaseAdmin } from '../lib/supabase';
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
    switch (req.method) {
      case 'GET': {
        // Obtener el primer registro de app_settings (singleton)
        const { data: settings, error } = await supabaseAdmin
          .from('app_settings')
          .select('*')
          .limit(1)
          .single();

        // Si no existe, crear con valores por defecto
        if (error && error.code === 'PGRST116') { // No rows returned
          const defaultSettings = {
            hero_image_url: DEFAULT_HERO_IMAGE_URL,
            whatsapp_phone_number: DEFAULT_WHATSAPP_PHONE_NUMBER,
            footer_content: DEFAULT_FOOTER_CONTENT,
            deal_zone_config: DEFAULT_DEAL_ZONE_CONFIG,
          };

          const { data: insertedSettings, error: insertError } = await supabaseAdmin
            .from('app_settings')
            .insert(defaultSettings)
            .select()
            .single();

          if (insertError || !insertedSettings) {
            console.error('[Settings API] Error creando settings:', insertError);
            res.statusCode = 500;
            res.json({ message: 'Error obteniendo configuración', error: insertError?.message });
            return;
          }

          res.statusCode = 200;
          res.json({
            heroImageUrl: insertedSettings.hero_image_url || DEFAULT_HERO_IMAGE_URL,
            whatsappPhoneNumber: insertedSettings.whatsapp_phone_number || DEFAULT_WHATSAPP_PHONE_NUMBER,
            footerContent: insertedSettings.footer_content || DEFAULT_FOOTER_CONTENT,
            dealZoneConfig: insertedSettings.deal_zone_config || DEFAULT_DEAL_ZONE_CONFIG,
          });
          return;
        }

        if (error) {
          console.error('[Settings API] Error obteniendo settings:', error);
          res.statusCode = 500;
          res.json({ message: 'Error obteniendo configuración', error: error.message });
          return;
        }

        if (!settings) {
          res.statusCode = 404;
          res.json({ message: 'Settings not found' });
          return;
        }

        res.statusCode = 200;
        res.json({
          heroImageUrl: settings.hero_image_url || DEFAULT_HERO_IMAGE_URL,
          whatsappPhoneNumber: settings.whatsapp_phone_number || DEFAULT_WHATSAPP_PHONE_NUMBER,
          footerContent: settings.footer_content || DEFAULT_FOOTER_CONTENT,
          dealZoneConfig: settings.deal_zone_config || DEFAULT_DEAL_ZONE_CONFIG,
        });
        break;
      }

      case 'PATCH': {
        const updates: Partial<{
          heroImageUrl: string;
          whatsappPhoneNumber: string;
          footerContent: FooterContent;
          dealZoneConfig: DealZoneConfig;
        }> = await req.json();

        // Obtener el primer registro
        const { data: existingSettings } = await supabaseAdmin
          .from('app_settings')
          .select('*')
          .limit(1)
          .single();

        const settingsToUpdate: any = {};
        
        if (updates.heroImageUrl !== undefined) {
          settingsToUpdate.hero_image_url = updates.heroImageUrl;
        }
        if (updates.whatsappPhoneNumber !== undefined) {
          settingsToUpdate.whatsapp_phone_number = updates.whatsappPhoneNumber;
        }
        if (updates.footerContent !== undefined) {
          settingsToUpdate.footer_content = updates.footerContent;
        }
        if (updates.dealZoneConfig !== undefined) {
          settingsToUpdate.deal_zone_config = updates.dealZoneConfig;
        }

        // Si no existe registro, crearlo; si existe, actualizarlo
        if (!existingSettings) {
          const defaultSettings = {
            hero_image_url: DEFAULT_HERO_IMAGE_URL,
            whatsapp_phone_number: DEFAULT_WHATSAPP_PHONE_NUMBER,
            footer_content: DEFAULT_FOOTER_CONTENT,
            deal_zone_config: DEFAULT_DEAL_ZONE_CONFIG,
            ...settingsToUpdate,
          };

          const { data: insertedSettings, error: insertError } = await supabaseAdmin
            .from('app_settings')
            .insert(defaultSettings)
            .select()
            .single();

          if (insertError || !insertedSettings) {
            console.error('[Settings API] Error creando settings:', insertError);
            res.statusCode = 500;
            res.json({ message: 'Error actualizando configuración', error: insertError?.message });
            return;
          }

          res.statusCode = 200;
          res.json({
            heroImageUrl: insertedSettings.hero_image_url,
            whatsappPhoneNumber: insertedSettings.whatsapp_phone_number,
            footerContent: insertedSettings.footer_content,
            dealZoneConfig: insertedSettings.deal_zone_config,
          });
        } else {
          const { data: updatedSettings, error: updateError } = await supabaseAdmin
            .from('app_settings')
            .update(settingsToUpdate)
            .eq('id', existingSettings.id)
            .select()
            .single();

          if (updateError || !updatedSettings) {
            console.error('[Settings API] Error actualizando settings:', updateError);
            res.statusCode = 500;
            res.json({ message: 'Error actualizando configuración', error: updateError?.message });
            return;
          }

          res.statusCode = 200;
          res.json({
            heroImageUrl: updatedSettings.hero_image_url,
            whatsappPhoneNumber: updatedSettings.whatsapp_phone_number,
            footerContent: updatedSettings.footer_content,
            dealZoneConfig: updatedSettings.deal_zone_config,
          });
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
    console.error('Error in settings API:', error);
    res.statusCode = 500;
    res.json({ message: 'Internal server error', error: error.message });
  }
}

export default allowCors(handler);
