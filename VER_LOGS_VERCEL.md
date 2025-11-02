# Cómo Ver los Logs en Vercel

## Método 1: Ver Logs de Funciones (API Routes)

1. **Abre tu Dashboard de Vercel:**
   - Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecciona tu proyecto (`tirescur`)

2. **Ve a la pestaña "Deployments":**
   - En el menú superior, haz clic en **"Deployments"**
   - Selecciona el deployment más reciente (el que tiene el commit más nuevo)

3. **Accede a los Logs de Funciones:**
   - En la página del deployment, haz clic en la pestaña **"Functions"**
   - Verás una lista de todas las funciones serverless (APIs)
   - Haz clic en cualquiera de ellas (por ejemplo: `api/products`)
   - Luego haz clic en **"Logs"** o **"View Logs"**

4. **Busca los mensajes:**
   - Deberías ver mensajes como:
     - `✅ Conectado exitosamente a la base de datos "tires"`
     - `[Products API] GET request recibida`
     - `[Products API] Productos en base de datos: 0`
     - `[Products API] Iniciando seeding de datos...`
     - `[Products API] ✅ X productos insertados`

## Método 2: Ver Logs en Tiempo Real (Function Logs)

1. **En la pestaña "Functions":**
   - Haz clic en cualquier función API
   - Busca el botón **"View Logs"** o **"Real-time Logs"**
   - Los logs aparecerán en tiempo real cuando se ejecute la función

## Método 3: Usar el Endpoint de Prueba

He creado un endpoint especial para diagnosticar problemas: `/api/test-connection`

### Cómo usarlo:

1. **Desde el navegador:**
   - Abre: `https://tu-app.vercel.app/api/test-connection`
   - Verás un JSON con información detallada sobre:
     - Si `MONGODB_URI` está configurada
     - Si la conexión a MongoDB funciona
     - Cuántas colecciones existen
     - Cuántos documentos hay en cada colección

2. **Desde la terminal (con curl):**
   ```bash
   curl https://tu-app.vercel.app/api/test-connection
   ```

## ¿Qué buscar en los logs?

### ✅ Mensajes de éxito:
- `✅ Conectado exitosamente a la base de datos "tires"`
- `[Products API] ✅ X productos insertados`
- `[Brands API] ✅ X marcas insertadas`

### ❌ Mensajes de error:
- `❌ Error connecting to MongoDB:`
- `MONGODB_URI no está configurada`
- `Failed to connect to MongoDB database`
- `Internal server error`

## Problema común: Las APIs no se están ejecutando

Si no ves ningún log, significa que las APIs no se están llamando. Esto puede pasar porque:

1. **La aplicación no está llamando a las APIs automáticamente:**
   - Abre la aplicación en el navegador
   - Abre la consola del navegador (F12 → Console)
   - Busca errores de red o mensajes sobre APIs

2. **Las APIs están fallando silenciosamente:**
   - Usa el endpoint `/api/test-connection` para verificar
   - Verifica que `MONGODB_URI` esté configurada en Vercel

## Solución Rápida

1. **Llama manualmente a las APIs desde el navegador:**
   - Abre: `https://tu-app.vercel.app/api/products`
   - Abre: `https://tu-app.vercel.app/api/brands`
   - Esto activará el seeding automático

2. **Verifica el resultado:**
   - Abre: `https://tu-app.vercel.app/api/test-connection`
   - Deberías ver datos después de llamar a las APIs

