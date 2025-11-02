# Guía de Verificación - Configuración MongoDB Atlas para Vercel

## Paso 1: Verificar Network Access en MongoDB Atlas

### ¿Por qué es importante?
Vercel se conecta desde diferentes IPs, por lo que MongoDB Atlas debe permitir esas conexiones.

### Pasos para verificar y configurar:

1. **Ve a MongoDB Atlas:**
   - https://cloud.mongodb.com
   - Inicia sesión con tu cuenta

2. **Selecciona tu proyecto/cluster:**
   - Busca el cluster `tires` o el que corresponda

3. **Ve a Network Access:**
   - En el menú lateral izquierdo, haz clic en **"Network Access"**
   - O ve directamente a: https://cloud.mongodb.com/v2#/security/network/whitelist

4. **Verifica las IPs permitidas:**
   - Deberías ver una lista de IPs o rangos permitidos
   - **Para Vercel, necesitas una de estas opciones:**

   **Opción A (Más simple - para desarrollo):**
   - Haz clic en **"Add IP Address"**
   - Selecciona **"Allow Access from Anywhere"**
   - O agrega manualmente: `0.0.0.0/0`
   - Esto permite conexiones desde cualquier IP (incluido Vercel)

   **Opción B (Más segura - para producción):**
   - Verifica las IPs específicas de Vercel (requiere mantener actualizada la lista)
   - Menos práctico para desarrollo

5. **Si no hay ninguna IP configurada:**
   - Haz clic en **"Add IP Address"**
   - Selecciona **"Allow Access from Anywhere"** o agrega `0.0.0.0/0`
   - Haz clic en **"Confirm"**
   - Espera 1-2 minutos para que se aplique

## Paso 2: Verificar Database Access (Usuario)

### Pasos:

1. **Ve a Database Access:**
   - En el menú lateral izquierdo, haz clic en **"Database Access"**
   - O ve directamente a: https://cloud.mongodb.com/v2#/security/database/users

2. **Verifica el usuario:**
   - Busca el usuario: `Vercel-Admin-tires`
   - Si no existe, necesitas crearlo:
     - Haz clic en **"Add New Database User"**
     - Selecciona **"Password"** como método de autenticación
     - Username: `Vercel-Admin-tires`
     - Password: `Efqvml4VDrEQiXKh` (o genera una nueva)
     - Database User Privileges: **"Atlas admin"** o **"Read and write to any database"**
     - Haz clic en **"Add User"**

3. **Verifica los permisos:**
   - El usuario debe tener permisos para leer y escribir en la base de datos `tires`

## Paso 3: Verificar la Variable en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto `tirescur`

2. **Ve a Settings → Environment Variables**

3. **Verifica que existe:**
   - Name: `MONGODB_URI`
   - Value: Debe comenzar con `mongodb+srv://Vercel-Admin-tires:...`
   - Environments: Debe estar marcado para **Production**, **Preview** y **Development**

4. **Si necesitas actualizar:**
   - Haz clic en la variable
   - Actualiza el valor si es necesario
   - Guarda
   - **Importante:** Haz un nuevo deployment después de cambiar variables

## Paso 4: Probar la Conexión

### Opción 1: Desde los Logs de Vercel
1. Ve a **Deployments**
2. Selecciona el deployment más reciente
3. Haz clic en **Functions**
4. Intenta acceder a una API (ej: `/api/products`)
5. Ve a **Logs** y busca errores de conexión

### Opción 2: Desde la aplicación
1. Abre tu aplicación desplegada
2. Abre la consola del navegador (F12)
3. Busca errores relacionados con MongoDB o las APIs

## Errores Comunes y Soluciones

### Error: "MongoServerError: IP not whitelisted"
**Causa:** Network Access no está configurado
**Solución:** Agrega `0.0.0.0/0` en Network Access

### Error: "Authentication failed"
**Causa:** Usuario o contraseña incorrectos
**Solución:** Verifica que el usuario `Vercel-Admin-tires` existe y la contraseña es correcta

### Error: "MONGODB_URI environment variable is not set"
**Causa:** Variable no configurada en Vercel
**Solución:** Agrega la variable en Settings → Environment Variables

## Checklist de Verificación

- [ ] Network Access configurado (`0.0.0.0/0` o IPs de Vercel)
- [ ] Usuario de base de datos existe (`Vercel-Admin-tires`)
- [ ] Usuario tiene permisos de lectura/escritura
- [ ] Variable `MONGODB_URI` configurada en Vercel
- [ ] Variable disponible para Production, Preview y Development
- [ ] Nuevo deployment hecho después de configurar variables

