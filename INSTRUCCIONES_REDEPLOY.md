# 🚀 Instrucciones para Redeploy en Vercel

## ✅ Estado Actual

Todas las variables de entorno están configuradas correctamente en Vercel:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔧 Pasos para Redeploy

### Paso 1: Ir a Vercel Dashboard
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `tirescur`

### Paso 2: Redeploy
1. Ve a la pestaña **Deployments**
2. Encuentra el último deployment (debería tener el commit más reciente)
3. Haz clic en los **tres puntos** (`...`) del último deployment
4. Selecciona **Redeploy**
5. Confirma el redeploy

**Alternativa rápida:**
- Si tienes integración con GitHub, simplemente haz un push vacío o espera a que se despliegue automáticamente

### Paso 3: Esperar el Deploy
- El deploy puede tardar 1-3 minutos
- Verás el progreso en tiempo real
- Cuando termine, debería decir "Ready"

## ✅ Verificación Después del Deploy

### 1. Probar Conexión
Visita: `https://tirescur.vercel.app/api/test-connection`

Deberías ver un JSON con:
```json
{
  "timestamp": "...",
  "supabaseUrl": "✅ Configurada",
  "supabaseKey": "✅ Configurada",
  "tests": [
    {
      "test": "SUPABASE_URL variable (servidor)",
      "status": "✅ OK"
    },
    {
      "test": "SUPABASE_ANON_KEY variable (servidor)",
      "status": "✅ OK"
    },
    {
      "test": "Conexión a Supabase",
      "status": "✅ OK"
    },
    ...
  ]
}
```

### 2. Probar Agregar Datos
1. Ve a la aplicación: `https://tirescur.vercel.app`
2. Intenta agregar una marca desde el panel de administración
3. Debería funcionar sin errores 500

### 3. Revisar Logs (Si Hay Errores)
1. Ve a **Deployments** → Último deployment
2. Haz clic en **Functions** → **Logs**
3. Busca logs con `[Brands API]` para ver detalles del proceso

## 🔍 Si Aún Hay Problemas

Si después del redeploy sigues teniendo errores 500:

1. **Verificar que las tablas existan en Supabase:**
   - Ve a: https://mpmqnmtlfocgxhyufgas.supabase.co
   - **Table Editor** → Verifica que existan: `brands`, `categories`, `products`, etc.

2. **Verificar RLS (Row Level Security):**
   - En Supabase → **Authentication** → **Policies**
   - RLS debe estar **DESHABILITADO** (o usar `SUPABASE_SERVICE_ROLE_KEY` que ya tienes)

3. **Revisar logs en Vercel:**
   - Los logs ahora muestran más detalles sobre qué está fallando
   - Busca mensajes con `[Brands API]` para ver el error específico

## 📝 Notas

- El código ahora busca variables con múltiples nombres (por compatibilidad)
- Prioriza variables estándar en inglés
- También reconoce variantes alternativas como respaldo
- Todas las variables necesarias están configuradas

¡Todo debería funcionar después del redeploy! 🎉

