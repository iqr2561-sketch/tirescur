# Guía para Verificar Credenciales de MongoDB

## 🔍 Método 1: Verificar desde MongoDB Atlas (Más Confiable)

### Paso 1: Verificar el Usuario en MongoDB Atlas

1. **Accede a MongoDB Atlas:**
   - Ve a https://cloud.mongodb.com
   - Inicia sesión con tu cuenta

2. **Ve a Database Access:**
   - En el menú lateral, haz clic en **"Security"** → **"Database Access"**

3. **Busca el usuario:**
   - Busca el usuario: `Vercel-Admin-tires`
   - Si NO existe, créalo:
     - Haz clic en **"Add New Database User"**
     - Método: **"Password"**
     - Username: `Vercel-Admin-tires`
     - Password: `Efqvml4VDrEQiXKh` (o genera una nueva y actualiza la URI)
     - Privileges: **"Atlas admin"** o **"Read and write to any database"**
     - Haz clic en **"Add User"**

4. **Si el usuario EXISTE:**
   - Verifica que la contraseña sea correcta
   - Si olvidaste la contraseña, haz clic en **"Edit"** y genera una nueva
   - **IMPORTANTE:** Si cambias la contraseña, actualiza la variable `MONGODB_URI` en Vercel

### Paso 2: Verificar Network Access (Acceso de Red)

1. **Ve a Network Access:**
   - En el menú lateral, haz clic en **"Security"** → **"Network Access"**

2. **Verifica las IPs permitidas:**
   - Debe haber al menos una entrada que permita conexiones
   - Opción recomendada para Vercel:
     - Haz clic en **"Add IP Address"**
     - Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
     - O agrega las IPs específicas de Vercel si las conoces
     - Haz clic en **"Confirm"**

3. **Espera a que se aplique:**
   - Los cambios pueden tardar 1-2 minutos en aplicarse

### Paso 3: Obtener la URI de Conexión

1. **Ve a Database:**
   - En el menú lateral, haz clic en **"Database"**
   - Selecciona tu cluster (por ejemplo: `tires`)

2. **Conecta tu aplicación:**
   - Haz clic en **"Connect"**
   - Selecciona **"Connect your application"**
   - Copia la URI que muestra
   - Asegúrate de reemplazar `<password>` con la contraseña real del usuario

3. **Formato correcto:**
   ```
   mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiXKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority
   ```

---

## 🧪 Método 2: Probar Localmente con el Script

### Paso 1: Crear archivo .env local (OPCIONAL)

Crea un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiXKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **IMPORTANTE:** Este archivo NO se sube a Git (está en `.gitignore`)

### Paso 2: Ejecutar el script de verificación

```bash
node verificar-mongodb-credentials.js
```

El script verificará:
- ✅ Que la URI esté presente
- ✅ Que el formato sea correcto
- ✅ Que pueda conectarse a MongoDB
- ✅ Que pueda acceder a la base de datos "tires"
- ✅ Que pueda listar colecciones
- ✅ Que pueda realizar operaciones de lectura

---

## 🌐 Método 3: Verificar desde Vercel

### Paso 1: Revisar Variables de Entorno en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto (`tirescur`)

2. **Ve a Settings → Environment Variables:**
   - Busca la variable `MONGODB_URI`
   - Verifica que el valor sea correcto
   - Verifica que esté marcada para **Production**, **Preview** y **Development**

3. **Si necesitas actualizar:**
   - Haz clic en la variable
   - Actualiza el valor
   - Guarda
   - **IMPORTANTE:** Haz un nuevo deployment después de cambiar variables

### Paso 2: Revisar los Logs de Vercel

1. **Ve a Deployments:**
   - Selecciona el deployment más reciente
   - Haz clic en **"Functions"**

2. **Selecciona una función API:**
   - Por ejemplo: `api/products` o `api/test-connection`
   - Haz clic en **"Logs"**

3. **Busca estos mensajes:**

   ✅ **Si la conexión funciona:**
   ```
   ✅ Conectado exitosamente a la base de datos "tires"
   [Products API] GET request recibida
   ```

   ❌ **Si hay errores:**
   ```
   ❌ Error connecting to MongoDB: ...
   Error details: { name: '...', message: '...', code: ... }
   ```

### Paso 3: Usar el Endpoint de Prueba

Visita esta URL en tu navegador:
```
https://tirescur.vercel.app/api/test-connection
```

Verás un JSON con información detallada sobre:
- Si `MONGODB_URI` está configurada
- Si la conexión funciona
- Cuántas colecciones hay
- Cuántos documentos hay en cada colección

---

## 🔧 Solución de Problemas Comunes

### Error: "Authentication failed"

**Causa:** Usuario o contraseña incorrectos

**Solución:**
1. Ve a MongoDB Atlas → Database Access
2. Verifica que el usuario `Vercel-Admin-tires` existe
3. Si no existe, créalo con la contraseña correcta
4. Si existe, verifica que la contraseña en la URI coincida
5. Si cambias la contraseña, actualiza la variable en Vercel y haz un nuevo deployment

### Error: "IP not whitelisted" o "Timeout"

**Causa:** Tu IP no está en la lista de Network Access

**Solución:**
1. Ve a MongoDB Atlas → Network Access
2. Haz clic en **"Add IP Address"**
3. Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Espera 1-2 minutos
5. Intenta de nuevo

### Error: "MONGODB_URI environment variable is not set"

**Causa:** La variable no está configurada en Vercel

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Agrega la variable `MONGODB_URI` con tu URI completa
3. Marca Production, Preview y Development
4. Haz un nuevo deployment

### Error: "Failed to connect to MongoDB database"

**Causa:** Puede ser varios problemas

**Verificación paso a paso:**
1. ✅ Verifica que la URI sea correcta (formato)
2. ✅ Verifica que el usuario exista en MongoDB Atlas
3. ✅ Verifica que la contraseña sea correcta
4. ✅ Verifica que Network Access permita conexiones
5. ✅ Verifica que la variable esté en Vercel
6. ✅ Verifica que hayas hecho un nuevo deployment después de cambiar variables

---

## ✅ Checklist de Verificación

Antes de considerar que las credenciales están correctas:

- [ ] Usuario `Vercel-Admin-tires` existe en MongoDB Atlas
- [ ] Contraseña del usuario es correcta y coincide con la URI
- [ ] Network Access permite conexiones (0.0.0.0/0 o IPs específicas)
- [ ] Variable `MONGODB_URI` está configurada en Vercel
- [ ] Variable está disponible para Production, Preview y Development
- [ ] Se hizo un nuevo deployment después de configurar/actualizar variables
- [ ] El endpoint `/api/test-connection` muestra conexión exitosa
- [ ] Los logs de Vercel no muestran errores de conexión

---

## 📞 Siguiente Paso

Si después de seguir estos pasos sigues teniendo errores:

1. **Comparte los logs de Vercel** - Los mensajes de error específicos ayudan a diagnosticar
2. **Comparte el resultado del endpoint de prueba** - Visita `/api/test-connection` y comparte el JSON
3. **Verifica en MongoDB Atlas** - Toma capturas de pantalla de Database Access y Network Access (sin mostrar contraseñas)

Esto ayudará a identificar el problema exacto.

