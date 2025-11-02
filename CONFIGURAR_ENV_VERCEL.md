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
vercel env add MONGODB_URI production
vercel env add MONGODB_URI preview
vercel env add MONGODB_URI development

# O importar todas desde un archivo .env (requiere script personalizado)
```

**Nota:** El CLI de Vercel no tiene un comando directo para importar un archivo `.env` completo, pero puedes usar este script:

### Script para importar desde .env

Crea un archivo `import-env.js`:

```javascript
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const envFile = readFileSync('.env', 'utf8');
const lines = envFile.split('\n');

lines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      console.log(`Importando ${key}...`);
      try {
        execSync(`vercel env add ${key} production`, { input: value, stdio: 'inherit' });
        execSync(`vercel env add ${key} preview`, { input: value, stdio: 'inherit' });
        execSync(`vercel env add ${key} development`, { input: value, stdio: 'inherit' });
      } catch (error) {
        console.error(`Error importando ${key}:`, error.message);
      }
    }
  }
});
```

## Opción 3: Manualmente (Copiar y Pegar)

1. Copia el contenido de tu archivo `.env`
2. Ve a Vercel Dashboard → Settings → Environment Variables
3. Para cada variable, haz clic en **Add New** y pega el nombre y valor
4. Marca los ambientes necesarios (Production, Preview, Development)
5. Guarda

## Variables Requeridas

### Críticas (Deben estar configuradas):
- `MONGODB_URI` - URI de conexión a MongoDB Atlas

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
   - Visita `/api/test-connection` para verificar MongoDB
   - Revisa la consola del navegador para errores de la API

## Ejemplo de Valores

```env
MONGODB_URI=mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority
VITE_VERCEL_URL=https://tirescur.vercel.app
```

## Importante

⚠️ **Nunca subas tu archivo `.env` a GitHub**. Debe estar en `.gitignore`.

✅ El archivo `.env.example` es solo una plantilla y NO contiene valores reales.

