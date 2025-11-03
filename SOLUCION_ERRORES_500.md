# 🔧 Solución de Errores 500 en la Consola

## 📋 Errores Comunes

Los errores 500 que estás viendo pueden deberse a:

1. **MONGODB_URI no configurada en Vercel**
2. **Problemas de conexión con MongoDB Atlas**
3. **Campos faltantes en la base de datos**

## ✅ Solución 1: Verificar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Verifica que exista la variable `MONGODB_URI` con tu cadena de conexión:
   ```
   mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiXKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority
   ```
5. Si no existe, agrégala:
   - **Key**: `MONGODB_URI`
   - **Value**: Tu cadena de conexión completa
   - **Environment**: Selecciona `Production`, `Preview`, y `Development`
6. **Importante**: Después de agregar/actualizar variables, haz un **redeploy** del proyecto

## ✅ Solución 2: Verificar MongoDB Atlas

1. Ve a MongoDB Atlas: https://cloud.mongodb.com
2. Verifica que tu cluster esté **activo** (no pausado)
3. Ve a **Network Access**:
   - Asegúrate de que `0.0.0.0/0` esté en la lista (permite todas las IPs)
   - O agrega las IPs de Vercel específicamente
4. Ve a **Database Access**:
   - Verifica que el usuario `Vercel-Admin-tires` exista
   - Verifica que tenga permisos de lectura y escritura

## ✅ Solución 3: Probar la Conexión Localmente

Puedes usar el script que creamos para verificar:

```bash
node verificar-mongodb-credentials.js
```

O crear un archivo `.env.local` con:
```env
MONGODB_URI=mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiXKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority
```

## ✅ Solución 4: Verificar Logs de Vercel

1. Ve a tu proyecto en Vercel
2. Ve a **Deployments** → Selecciona el último deployment
3. Ve a **Functions** → Busca `/api/products` o `/api/brands`
4. Revisa los logs para ver el error específico

## 🔍 Mejoras Implementadas

He mejorado el manejo de errores en:

### `api/products.ts`
- ✅ Ahora incluye campos de ofertas en `toClientProduct`
- ✅ Mapeo correcto de campos camelCase a snake_case para MongoDB
- ✅ Manejo de errores mejorado con códigos 503 para problemas de conexión
- ✅ Mensajes de error más descriptivos

### `api/brands.ts`
- ✅ Manejo de errores mejorado igual que en products
- ✅ Verificación de MONGODB_URI
- ✅ Mensajes de error más descriptivos

## 📝 Mensajes de Error Esperados

Con las mejoras implementadas, ahora verás:

### Si MONGODB_URI no está configurada:
```
Status: 503
Message: "Servicio no disponible: MongoDB no configurado"
Hint: "Por favor, configura la variable de entorno MONGODB_URI en Vercel"
```

### Si hay problemas de conexión:
```
Status: 503
Message: "Servicio no disponible: Error de conexión a la base de datos"
Hint: "Verifica la conexión a MongoDB Atlas y la configuración de red"
```

## 🚀 Pasos Recomendados

1. **Verifica las variables de entorno en Vercel**
2. **Haz un redeploy** después de actualizar variables
3. **Revisa los logs** en Vercel para ver el error específico
4. **Prueba la conexión localmente** si es posible

## ⚠️ Nota sobre Migración a Supabase

Si planeas migrar a Supabase, los errores de MongoDB desaparecerán una vez que:
1. Ejecutes el esquema SQL en Supabase (`supabase-schema.sql`)
2. Actualices las rutas API para usar Supabase en lugar de MongoDB
3. Configures las variables de entorno de Supabase

## 🆘 Si los Errores Persisten

1. Revisa los logs completos en Vercel Functions
2. Verifica que el nombre de la base de datos sea correcto (`tires`)
3. Asegúrate de que las colecciones existan en MongoDB
4. Verifica que no haya límites de cuota alcanzados en MongoDB Atlas

