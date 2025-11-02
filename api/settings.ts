import { IncomingMessage, ServerResponse } from 'http';
import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb';
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

interface GlobalSettingsDoc {
  _id?: ObjectId;
  id: string;
  hero_image_url: string;
  whatsapp_phone_number: string;
  footer_content: FooterContent;
  deal_zone_config: DealZoneConfig;
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
    const settingsCollection = await getCollection<GlobalSettingsDoc>('settings');
    const SETTINGS_DOC_ID = 'app_settings';

    switch (req.method) {
      case 'GET': {
        let settings = await settingsCollection.findOne({ id: SETTINGS_DOC_ID });

        // If no settings exist, create with defaults
        if (!settings) {
          const defaultSettings: GlobalSettingsDoc = {
            id: SETTINGS_DOC_ID,
            hero_image_url: DEFAULT_HERO_IMAGE_URL,
            whatsapp_phone_number: DEFAULT_WHATSAPP_PHONE_NUMBER,
            footer_content: DEFAULT_FOOTER_CONTENT,
            deal_zone_config: DEFAULT_DEAL_ZONE_CONFIG,
          };
          await settingsCollection.insertOne(defaultSettings);
          settings = await settingsCollection.findOne({ id: SETTINGS_DOC_ID });
        }

        // Map MongoDB document to client-side format
        const clientSettings = {
          heroImageUrl: settings.hero_image_url,
          whatsappPhoneNumber: settings.whatsapp_phone_number,
          footerContent: settings.footer_content,
          dealZoneConfig: settings.deal_zone_config,
        };

        res.statusCode = 200;
        res.json(clientSettings);
        break;
      }

      case 'PUT': {
        const updatedClientSettings = await req.json();

        // Map client-side names to MongoDB document format
        const settingsToUpdate: Partial<GlobalSettingsDoc> = {
          hero_image_url: updatedClientSettings.heroImageUrl,
          whatsapp_phone_number: updatedClientSettings.whatsappPhoneNumber,
          footer_content: updatedClientSettings.footerContent,
          deal_zone_config: updatedClientSettings.dealZoneConfig,
        };

        const result = await settingsCollection.updateOne(
          { id: SETTINGS_DOC_ID },
          { $set: settingsToUpdate },
          { upsert: true }
        );

        if (result.matchedCount === 0 && result.upsertedCount === 0) {
          res.statusCode = 500;
          res.json({ message: 'Error updating settings' });
          return;
        }

        const updatedSettings = await settingsCollection.findOne({ id: SETTINGS_DOC_ID });

        // Map back to client-side format
        const clientSettings = {
          heroImageUrl: updatedSettings.hero_image_url,
          whatsappPhoneNumber: updatedSettings.whatsapp_phone_number,
          footerContent: updatedSettings.footer_content,
          dealZoneConfig: updatedSettings.deal_zone_config,
        };

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
  } catch (error: any) {
    console.error('Error in settings API:', error);
    res.statusCode = 500;
    res.json({ message: 'Internal server error', error: error.message });
  }
}

export default allowCors(handler);
