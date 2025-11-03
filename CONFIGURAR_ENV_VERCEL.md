# Cómo Configurar Variables de Entorno en Vercel

## Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto (`tirescur`)
3. Ve a **Settings** → **Environment Variables**
4. Haz clic en **Add New** para cada variable
5. Marca **Production**, **Preview** y **Development** según necesites
6. Guarda los cambios
7. **Importante:** Haz un nuevo deployment después de agregar variables

## Opción 2: Usando Vercel CLI (Importar desde .env)

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Iniciar sesión en Vercel
```bash
vercel login
```

### Paso 3: Enlazar tu proyecto
```bash
vercel link
```

### Paso 4: Importar variables desde archivo .env

Si tienes un archivo `.env` local con tus variables:

```bash
# Cargar variables de entorno para todos los ambientes
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

**Nota:** Repite para `preview` y `development` si es necesario.

## Opción 3: Manualmente (Copiar y Pegar)

1. Copia el contenido de tu archivo `.env`
2. Ve a Vercel Dashboard → Settings → Environment Variables
3. Para cada variable, haz clic en **Add New** y pega el nombre y valor
4. Marca los ambientes necesarios (Production, Preview, Development)
5. Guarda

## Variables Requeridas

### Críticas (Deben estar configuradas):
- `VITE_SUPABASE_URL` - URL de tu proyecto en Supabase (https://tu-proyecto.supabase.co)
- `VITE_SUPABASE_ANON_KEY` - Clave pública (anon key) de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio para el backend (bypass RLS)

### Opcionales:
- `VITE_VERCEL_URL` - URL de tu aplicación en Vercel (por defecto: https://tirescur.vercel.app)
- `GEMINI_API_KEY` - API Key de Google Gemini (si usas esta funcionalidad)

## Verificar Configuración

Después de configurar las variables:

1. Haz un nuevo deployment:
   ```bash
   vercel --prod
   ```
   O desde el dashboard: **Deployments** → **Redeploy**

2. Verifica en los logs:
   - Ve a **Deployments** → Selecciona el deployment → **Functions** → **Logs**
   - Busca mensajes de error relacionados con variables de entorno

3. Prueba la conexión:
   - Visita `/api/test-connection` para verificar Supabase
   - Revisa la consola del navegador para errores de la API

## Ejemplo de Valores

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_VERCEL_URL=https://tirescur.vercel.app
GEMINI_API_KEY=tu_api_key_aqui
```

## Importante

⚠️ **Nunca subas tu archivo `.env` a GitHub**. Debe estar en `.gitignore`.

✅ El archivo `.env.example` es solo una plantilla y NO contiene valores reales.

## Configuración de Supabase

Para más detalles sobre cómo configurar Supabase, revisa el archivo `CONFIGURAR_SUPABASE.md`.
