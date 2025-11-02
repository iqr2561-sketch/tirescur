# Guía de Solución de Errores Comunes

## Error 1: "MONGODB_URI environment variable is not set"

**Causa:** La variable de entorno no está configurada en Vercel

**Solución:**
1. Ve a Vercel Dashboard: https://vercel.com/dashboard
2. Selecciona tu proyecto `tirescur`
3. Ve a **Settings** → **Environment Variables**
4. Busca la variable `MONGODB_URI`
5. Si no existe, haz clic en **Add New**:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiXKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority`
   - **Environments:** Marca Production, Preview y Development
6. Guarda y haz un **Redeploy**

## Error 2: "Failed to connect to MongoDB database"

**Causa:** MongoDB Atlas bloquea las conexiones desde Vercel

**Solución:**
1. Ve a MongoDB Atlas: https://cloud.mongodb.com
2. Selecciona tu cluster
3. Ve a **Network Access**
4. Haz clic en **Add IP Address**
5. Agrega `0.0.0.0/0` para permitir todas las IPs (o las IPs específicas de Vercel)
6. Espera unos minutos y prueba de nuevo

## Error 3: Errores de TypeScript/Compilación

**Causa:** Problemas de sintaxis o tipos

**Solución:**
1. Verifica que `mongodb` esté en las dependencias
2. Verifica que no haya errores de sintaxis en las APIs
3. Revisa los logs del build en Vercel

## Error 4: Funciones API no se ejecutan

**Causa:** Vercel no detecta las funciones serverless

**Solución:**
1. Verifica que los archivos estén en `/api`
2. Verifica que exporten `default allowCors(handler)`
3. Verifica que `vercel.json` esté configurado correctamente

## Verificar Logs en Vercel

1. Ve a **Deployments**
2. Selecciona el deployment más reciente
3. Ve a **Functions** → **Logs**
4. Busca errores relacionados con MongoDB o las APIs

