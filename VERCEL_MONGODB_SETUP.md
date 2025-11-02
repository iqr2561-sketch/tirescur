# Configuración de MongoDB en Vercel

## Variable de Entorno

Asegúrate de que la variable `MONGODB_URI` esté configurada en Vercel:

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto (tirescur)
3. Ve a Settings → Environment Variables
4. Verifica que exista la variable:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://Vercel-Admin-tires:Efqvml4VDrEQiXKh@tires.4gopjvs.mongodb.net/?retryWrites=true&w=majority`
   - **Environments**: Debe estar marcado para Production, Preview y Development

## Verificar la Configuración

Si la variable no está configurada o está mal configurada:

1. Agrega o actualiza la variable de entorno en Vercel
2. Después de agregar/actualizar, **haz un nuevo deployment**:
   - Ve a Deployments
   - Selecciona el deployment más reciente
   - Haz clic en "Redeploy" o haz un nuevo commit para forzar un nuevo deployment

## Verificar la Conexión

Una vez desplegado, verifica en los logs de Vercel:
- Ve a Deployments → selecciona el deployment → Functions → Logs
- Busca errores relacionados con MongoDB o MONGODB_URI

## Solución de Problemas

### Error: "MONGODB_URI environment variable is not set"
- La variable no está configurada en Vercel
- Solución: Agrega la variable en Settings → Environment Variables

### Error: "Failed to connect to MongoDB database"
- La URI puede ser incorrecta o la base de datos no es accesible
- Solución: Verifica la URI en MongoDB Atlas y que la IP esté en la whitelist

### Error de timeout
- Puede ser que la whitelist de IPs en MongoDB Atlas no incluya las IPs de Vercel
- Solución: En MongoDB Atlas, agrega `0.0.0.0/0` temporalmente para permitir todas las IPs (o configura las IPs específicas de Vercel)

