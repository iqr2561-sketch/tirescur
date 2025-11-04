import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.json({ error: 'Método no permitido. Solo se acepta POST.' });
      return;
    }

    const supabase = ensureSupabase();
    const body = await parseBody(req);
    const { file, fileName, fileType, entityType, entityId } = body;

    if (!file || !fileName) {
      res.statusCode = 400;
      res.json({ error: 'Archivo y nombre de archivo son requeridos' });
      return;
    }

    // Convertir base64 a buffer si viene como base64
    let fileBuffer: Buffer;
    if (typeof file === 'string') {
      // Si viene como base64 data URL
      const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      res.statusCode = 400;
      res.json({ error: 'Formato de archivo no soportado' });
      return;
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    
    // Determinar carpeta según el tipo de entidad
    const folder = entityType || 'general';
    const filePath = `${folder}/${uniqueFileName}`;

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images') // Bucket para imágenes de productos
      .upload(filePath, fileBuffer, {
        contentType: fileType || 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('[Upload API] Error subiendo archivo:', uploadError);
      res.statusCode = 500;
      res.json({ error: `Error al subir archivo: ${uploadError.message}` });
      return;
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Guardar registro en la tabla uploads
    if (entityType && entityId) {
      const { error: dbError } = await supabase
        .from('uploads')
        .insert({
          file_name: fileName,
          file_url: publicUrl,
          file_type: fileType || 'image/jpeg',
          file_size: fileBuffer.length,
          entity_type: entityType,
          entity_id: entityId
        });

      if (dbError) {
        console.error('[Upload API] Error guardando registro:', dbError);
        // No fallar si no se puede guardar el registro, la imagen ya está subida
      }
    }

    res.statusCode = 200;
    res.json({
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: uniqueFileName
    });
  } catch (error: any) {
    console.error('[Upload API] Error:', error);
    res.statusCode = 500;
    res.json({ error: error?.message || 'Error interno del servidor' });
  }
});

async function parseBody(req: any): Promise<any> {
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

