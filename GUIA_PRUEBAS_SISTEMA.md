# 🧪 Guía de Pruebas del Sistema - WebGomeria

## 🌐 URL Base del Sistema
**https://tirescur.vercel.app/**

## ✅ Pasos para Probar el Sistema Completo

### 1️⃣ **Prueba de Conexión con Supabase**

#### Dirección para Probar:
```
https://tirescur.vercel.app/api/test-connection
```

#### Qué Debe Mostrar:
- ✅ Estado de conexión a Supabase
- ✅ Variables de entorno configuradas
- ✅ Conteo de productos, marcas y categorías
- ✅ Resumen de tests pasados

**Resultado Esperado:**
- Todos los tests deben estar en verde (✅ OK)
- Debe mostrar el número de registros en cada tabla

---

### 2️⃣ **Pruebas de Productos (CRUD)**

#### Ver Todos los Productos:
```
https://tirescur.vercel.app/api/products
```

#### Crear un Producto:
1. Ve a: `https://tirescur.vercel.app/admin/products`
2. Haz clic en **"Agregar Producto"**
3. Completa el formulario:
   - SKU: `TEST-SKU-001`
   - Nombre: `Producto de Prueba`
   - Marca: Selecciona una marca existente
   - Precio: `100.00`
   - Stock: `50`
   - Imagen: URL de una imagen
   - Descripción: `Descripción de prueba`
4. Marca **"En Oferta"** (opcional):
   - Precio de Oferta: `80.00`
   - Descuento: `20`
5. Guarda el producto

#### Actualizar un Producto:
1. En la lista de productos, haz clic en **"Editar"**
2. Modifica cualquier campo
3. Guarda los cambios

#### Eliminar un Producto:
1. En la lista de productos, haz clic en **"Eliminar"**
2. Confirma la eliminación

**Verificación:**
- Los productos deben aparecer en la página principal
- Los productos en oferta deben mostrar el badge "OFERTA"
- Los precios con descuento deben mostrarse correctamente

---

### 3️⃣ **Pruebas de Marcas (CRUD)**

#### Ver Todas las Marcas:
```
https://tirescur.vercel.app/api/brands
```

#### Crear una Marca:
1. Ve a: `https://tirescur.vercel.app/admin/brands`
2. Haz clic en **"Agregar Marca"**
3. Completa:
   - Nombre: `Marca de Prueba`
   - Logo: URL del logo
4. Guarda

#### Actualizar una Marca:
1. Haz clic en **"Editar"** en una marca
2. Modifica el nombre o logo
3. Guarda

#### Eliminar una Marca:
1. Haz clic en **"Eliminar"** en una marca
2. Confirma la eliminación

**Verificación:**
- Las marcas deben aparecer en los filtros de productos
- Los logos deben mostrarse correctamente

---

### 4️⃣ **Pruebas de Categorías (CRUD)**

#### Ver Todas las Categorías:
```
https://tirescur.vercel.app/api/categories
```

#### Crear una Categoría:
1. Ve a: `https://tirescur.vercel.app/admin/categories`
2. Haz clic en **"Agregar Categoría"**
3. Completa:
   - Nombre: `Categoría de Prueba`
   - Tipo de Icono: Selecciona (tire, wheel, accessory, valve)
   - Descripción: `Descripción de prueba`
   - Orden: `10`
4. Guarda

#### Actualizar una Categoría:
1. Haz clic en **"Editar"**
2. Modifica cualquier campo
3. Guarda

#### Eliminar una Categoría:
1. Haz clic en **"Eliminar"**
2. Confirma la eliminación

**Verificación:**
- Las categorías deben aparecer con sus iconos correctos
- El orden debe respetarse según el campo "order"

---

### 5️⃣ **Pruebas de Ventas**

#### Ver Todas las Ventas:
```
https://tirescur.vercel.app/api/sales
```

#### Crear una Venta:
1. Ve a la página principal: `https://tirescur.vercel.app/`
2. Agrega productos al carrito
3. Haz clic en el carrito
4. Completa la información del cliente
5. Finaliza la venta

**Verificación:**
- La venta debe aparecer en el historial
- Los productos de la venta deben estar asociados correctamente

---

### 6️⃣ **Pruebas de Configuración Global**

#### Ver Configuración Actual:
```
https://tirescur.vercel.app/api/settings
```

#### Actualizar Configuración:
1. Ve a: `https://tirescur.vercel.app/admin/settings`
2. Modifica:
   - Imagen Hero
   - Número de WhatsApp
   - Contenido del Footer
   - Configuración de Zona de Ofertas
3. Guarda los cambios

**Verificación:**
- Los cambios deben reflejarse inmediatamente en la página principal
- El footer debe actualizarse con el nuevo contenido

---

### 7️⃣ **Pruebas de Menús**

#### Ver Todos los Menús:
```
https://tirescur.vercel.app/api/menus
```

#### Gestión de Menús:
1. Ve a: `https://tirescur.vercel.app/admin/menus`
2. Crea, edita o elimina items de menú
3. Verifica que aparezcan en:
   - Header desktop
   - Menú móvil
   - Footer

---

### 8️⃣ **Pruebas de Funcionalidades Especiales**

#### Zona de Ofertas:
1. Ve a: `https://tirescur.vercel.app/`
2. Verifica que los productos en oferta aparezcan en la sección "Deal Zone"
3. El contador debe funcionar correctamente
4. El botón debe llevar a la tienda

#### Tienda Completa:
1. Ve a: `https://tirescur.vercel.app/shop`
2. Prueba los filtros:
   - Por marca
   - Por categoría
   - Por precio
   - Búsqueda rápida
3. Verifica que los productos se filtren correctamente

#### Vista de Lista vs Grid (Productos):
1. Ve a: `https://tirescur.vercel.app/admin/products`
2. Prueba cambiar entre vista de cuadrícula y lista
3. Verifica que la tabla responsive funcione en móvil

---

## 🔍 Verificación de Errores en Consola

### Abrir Consola del Navegador:
1. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux)
2. O `Cmd+Option+I` (Mac)
3. Ve a la pestaña **Console**

### Qué Buscar:
- ✅ No debe haber errores 500
- ✅ No debe haber errores de conexión a Supabase
- ✅ Las peticiones a `/api/*` deben retornar 200 o 201
- ✅ No debe haber advertencias sobre variables de entorno

### Si Ves Errores:

#### Error 500 en APIs:
- Verifica que las variables de entorno estén configuradas en Vercel
- Revisa los logs en Vercel Dashboard → Deployments → Functions → Logs

#### Error "Supabase no configurado":
- Verifica en Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

#### Error "API no disponible":
- Verifica que el deployment esté activo
- Revisa que las funciones de Vercel estén desplegadas correctamente

---

## 📊 Endpoints de Prueba Rápida

### Salud del Sistema:
```
✅ Conexión: https://tirescur.vercel.app/api/test-connection
✅ Productos: https://tirescur.vercel.app/api/products
✅ Marcas: https://tirescur.vercel.app/api/brands
✅ Categorías: https://tirescur.vercel.app/api/categories
✅ Ventas: https://tirescur.vercel.app/api/sales
✅ Configuración: https://tirescur.vercel.app/api/settings
✅ Menús: https://tirescur.vercel.app/api/menus
```

---

## 🎯 Checklist de Pruebas Completas

- [ ] Conexión a Supabase funciona
- [ ] Productos: Crear, Leer, Actualizar, Eliminar
- [ ] Marcas: Crear, Leer, Actualizar, Eliminar
- [ ] Categorías: Crear, Leer, Actualizar, Eliminar
- [ ] Ventas: Crear y ver historial
- [ ] Configuración global se actualiza
- [ ] Menús aparecen correctamente
- [ ] Zona de ofertas muestra productos en oferta
- [ ] Tienda con filtros funciona
- [ ] Vista lista/grid de productos funciona
- [ ] Notificaciones (Toasts) aparecen correctamente
- [ ] Modales de confirmación funcionan
- [ ] No hay errores en consola del navegador

---

## 📝 Notas Importantes

1. **Primera vez:** El sistema hará seeding automático si las tablas están vacías
2. **Variables de entorno:** Deben estar configuradas en Vercel, no solo localmente
3. **Logs:** Revisa siempre la consola del navegador y los logs de Vercel
4. **Base de datos:** Asegúrate de que el esquema SQL esté ejecutado en Supabase

---

## 🚨 Si Algo No Funciona

1. Abre la consola del navegador (F12)
2. Copia el error completo
3. Revisa los logs en Vercel Dashboard
4. Verifica que las variables de entorno estén configuradas
5. Verifica que el esquema SQL esté creado en Supabase

---

## ✅ Sistema Listo para Usar

Una vez que todas las pruebas pasen, el sistema está listo para producción.

**URL del Sistema:** https://tirescur.vercel.app/

