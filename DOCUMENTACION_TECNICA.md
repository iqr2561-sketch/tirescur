# 📚 Documentación Técnica - Sistema WebGomeria

## 📋 Índice

1. [Arquitectura General](#arquitectura-general)
2. [Sistema de Autenticación](#sistema-de-autenticación)
3. [Modal de Login Moderno](#modal-de-login-moderno)
4. [Panel de Control y Transiciones](#panel-de-control-y-transiciones)
5. [Sistema de Gestión de Usuarios](#sistema-de-gestión-de-usuarios)
6. [Estructura de Archivos](#estructura-de-archivos)
7. [APIs y Endpoints](#apis-y-endpoints)
8. [Base de Datos](#base-de-datos)
9. [Flujo de Datos](#flujo-de-datos)
10. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)

---

## 🏗️ Arquitectura General

### Stack Tecnológico

- **Frontend**: React 19.2.0 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Vercel Serverless Functions (TypeScript)
- **Base de Datos**: Supabase (PostgreSQL)
- **Routing**: React Router DOM v7
- **Estado**: React Hooks (useState, useCallback, useEffect)

### Estructura de la Aplicación

```
webgomeria/
├── api/                    # Serverless Functions (Vercel)
│   ├── auth.ts            # API de autenticación
│   ├── users.ts           # API de gestión de usuarios
│   ├── products.ts        # API de productos
│   ├── brands.ts          # API de marcas
│   └── ...
├── components/             # Componentes React
│   ├── AdminLoginModal.tsx # Modal de login moderno
│   ├── AdminSidebar.tsx   # Sidebar del panel admin
│   └── ...
├── pages/                  # Páginas/Views
│   ├── AdminDashboardPage.tsx      # Panel principal
│   ├── AdminUsersManagementPage.tsx # Gestión de usuarios
│   └── ...
├── config/                 # Configuración
│   └── auth.ts            # Credenciales admin por defecto
├── lib/                    # Utilidades
│   ├── supabase.js        # Cliente Supabase
│   └── cors.js            # Configuración CORS
├── types.ts               # Interfaces TypeScript
└── App.tsx                # Componente principal
```

---

## 🔐 Sistema de Autenticación

### Credenciales por Defecto

**Archivo**: `config/auth.ts`

```typescript
export const ADMIN_USERNAME = 'admin'  // Valor por defecto
export const ADMIN_PASSWORD = '1234'  // Valor por defecto
export const ADMIN_DISPLAY_NAME = 'Administrador'
```

**Variables de entorno** (opcionales):
- `VITE_ADMIN_USERNAME` - Override del usuario
- `VITE_ADMIN_PASSWORD` - Override de la contraseña
- `VITE_ADMIN_DISPLAY_NAME` - Override del nombre

### Flujo de Autenticación

1. **Usuario accede a `/account` o ruta `/admin/*`**
   - Si no está autenticado, se muestra el modal de login

2. **Usuario ingresa credenciales**
   - Frontend envía POST a `/api/auth`
   - API verifica credenciales en dos niveles:
     a. **Credenciales estáticas** (admin/1234)
     b. **Base de datos** (`admin_users` table)

3. **Autenticación exitosa**
   - Se guarda `admin-authenticated: true` en `sessionStorage`
   - Usuario es redirigido a `/admin`
   - Se muestra mensaje de bienvenida

4. **Persistencia de sesión**
   - Sesión se mantiene mientras el navegador esté abierto
   - Al cerrar el navegador, la sesión se pierde (sessionStorage)

### API de Autenticación

**Endpoint**: `POST /api/auth`

**Request Body**:
```json
{
  "username": "admin",
  "password": "1234"
}
```

**Response (éxito)**:
```json
{
  "success": true,
  "user": {
    "username": "admin",
    "display_name": "Administrador",
    "role": "admin"
  }
}
```

**Response (error)**:
```json
{
  "error": "Usuario o contraseña incorrectos"
}
```

**Archivo**: `api/auth.ts`

```typescript
// Lógica de verificación:
1. Verifica credenciales estáticas (admin/1234)
2. Si no coincide, consulta tabla admin_users en Supabase
3. Compara contraseña (texto plano - solo desarrollo)
4. Retorna usuario sin exponer contraseña
```

---

## 🎨 Modal de Login Moderno

### Características de Diseño

**Archivo**: `components/AdminLoginModal.tsx`

#### Características Visuales

1. **Diseño Moderno**
   - Gradientes: `from-gray-900 via-gray-800 to-gray-900`
   - Header con gradiente rojo: `from-red-600 via-red-500 to-red-600`
   - Efecto de brillo decorativo con animación pulse
   - Backdrop blur para efecto glassmorphism

2. **Animaciones**
   - Entrada: `scale-100 opacity-100 translate-y-0` (duración 500ms)
   - Salida: `scale-95 opacity-0 translate-y-4`
   - Backdrop: fade in/out (300ms)
   - Botón de envío: hover scale `[1.02]`, active scale `[0.98]`

3. **Funcionalidades**
   - Botón para mostrar/ocultar contraseña
   - Validación en tiempo real
   - Estados de carga (spinner durante verificación)
   - Mensajes de error con animación shake

4. **Estados del Componente**
   ```typescript
   - username: string
   - password: string
   - isSubmitting: boolean
   - formError: string | null
   - showPassword: boolean
   - isAnimating: boolean
   ```

### Estructura del Modal

```tsx
<div className="fixed inset-0 z-50">
  {/* Backdrop con blur */}
  <div className="backdrop-blur-sm bg-black/80" />
  
  {/* Modal Container */}
  <div className="modal-container">
    {/* Header con gradiente */}
    <div className="gradient-header">
      - Icono de candado
      - Título "Acceso Administrativo"
      - Botón cerrar
    </div>
    
    {/* Formulario */}
    <form>
      - Campo usuario (con icono)
      - Campo contraseña (con icono y botón mostrar/ocultar)
      - Mensaje de error (si existe)
      - Botón de envío con spinner
    </form>
  </div>
</div>
```

### Animaciones CSS Personalizadas

**Archivo**: `index.css`

```css
/* Shake animation para errores */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Fade in para páginas */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide in from right para panel */
@keyframes slideInFromRight {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}
```

---

## 🎭 Panel de Control y Transiciones

### Efectos de Transición

**Archivo**: `pages/AdminDashboardPage.tsx`

#### Lógica de Transición

```typescript
const [isTransitioning, setIsTransitioning] = useState(true);

useEffect(() => {
  // Simular transición de entrada
  const timer = setTimeout(() => {
    setIsTransitioning(false);
  }, 100);
  return () => clearTimeout(timer);
}, []);
```

#### Elementos con Transiciones

1. **Contenedor Principal**
   - Clase: `transition-all duration-700`
   - Estado inicial: `opacity-0 translate-x-10`
   - Estado final: `opacity-100 translate-x-0`

2. **Título y Fecha**
   - Delay: `delay-100`
   - Efecto: `translate-y-4` → `translate-y-0`

3. **Tarjetas de Estadísticas**
   - Delay: `delay-200`
   - Efecto: `translate-y-4` → `translate-y-0`

4. **Sección de Actividades**
   - Delay: `delay-300`
   - Efecto: `translate-y-4` → `translate-y-0`

### Estructura de Transiciones

```tsx
<div className={`transition-all duration-700 ${
  isTransitioning 
    ? 'opacity-0 translate-x-10' 
    : 'opacity-100 translate-x-0'
}`}>
  {/* Título con delay-100 */}
  <div className={`delay-100 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
    ...
  </div>
  
  {/* Tarjetas con delay-200 */}
  <div className={`delay-200 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
    ...
  </div>
</div>
```

---

## 👥 Sistema de Gestión de Usuarios

### Estructura de Datos

**Interface**: `types.ts`

```typescript
export interface AdminUser {
  id: string;                    // UUID de Supabase
  username: string;               // Nombre de usuario único
  display_name?: string;         // Nombre para mostrar
  role: 'admin' | 'editor' | 'viewer';  // Rol del usuario
  is_active: boolean;            // Estado activo/inactivo
  created_at?: string;           // Fecha de creación
  updated_at?: string;           // Fecha de actualización
}
```

### Roles de Usuario

1. **admin** - Administrador completo
   - Acceso total al panel
   - Puede gestionar usuarios
   - Puede modificar todo

2. **editor** - Editor
   - Puede editar productos, marcas, categorías
   - No puede gestionar usuarios

3. **viewer** - Visualizador
   - Solo lectura
   - No puede modificar nada

### API de Usuarios

**Archivo**: `api/users.ts`

#### Endpoints

1. **GET /api/users**
   - Obtiene todos los usuarios
   - **No expone contraseñas**
   - Ordena por fecha de creación descendente

2. **POST /api/users**
   - Crea nuevo usuario
   - Valida que el username sea único
   - Body: `{ username, password, display_name, role, is_active }`

3. **PUT /api/users**
   - Actualiza usuario existente
   - Body debe incluir `id`
   - Contraseña opcional (si no se envía, no se modifica)

4. **DELETE /api/users?id={userId}**
   - Elimina usuario
   - Query parameter: `id`

### Página de Gestión

**Archivo**: `pages/AdminUsersManagementPage.tsx`

#### Funcionalidades

1. **Listado de Usuarios**
   - Tabla con información completa
   - Badges de rol y estado
   - Acciones: Editar / Eliminar

2. **Modal de Crear/Editar**
   - Formulario con validación
   - Campo contraseña opcional en edición
   - Selector de rol
   - Checkbox de estado activo

3. **Operaciones CRUD**
   ```typescript
   - fetchUsers()      // Obtener todos
   - handleSubmit()    // Crear/Actualizar
   - handleDeleteUser() // Eliminar
   ```

#### Flujo de Datos

```
Usuario → Modal Form → API Call → Supabase → Response → Update State → Re-render
```

---

## 📁 Estructura de Archivos

### Archivos Principales

#### Frontend

```
components/
├── AdminLoginModal.tsx       # Modal de login moderno
├── AdminSidebar.tsx          # Navegación lateral admin
├── AdminNavbar.tsx           # Barra superior admin
└── ...

pages/
├── AdminDashboardPage.tsx    # Panel principal con transiciones
├── AdminUsersManagementPage.tsx # Gestión de usuarios
├── AdminProductManagementPage.tsx
├── AdminBrandManagementPage.tsx
└── ...

App.tsx                       # Componente raíz con routing
types.ts                      # Interfaces TypeScript
index.css                     # Estilos globales y animaciones
```

#### Backend (Serverless Functions)

```
api/
├── auth.ts                  # POST - Autenticación
├── users.ts                 # CRUD - Gestión de usuarios
├── products.ts              # CRUD - Productos
├── brands.ts                # CRUD - Marcas
├── settings.ts              # Configuración global
└── ...

lib/
├── supabase.js              # Cliente Supabase
├── cors.js                  # Configuración CORS
└── ...
```

#### Configuración

```
config/
└── auth.ts                  # Credenciales admin por defecto

supabase-schema.sql          # Esquema completo de BD
```

---

## 🔌 APIs y Endpoints

### Endpoints de Autenticación y Usuarios

#### 1. Autenticación

**POST /api/auth**
- **Descripción**: Verifica credenciales de usuario
- **Body**: `{ username: string, password: string }`
- **Response**: `{ success: boolean, user: {...} }`
- **Archivo**: `api/auth.ts`

#### 2. Usuarios

**GET /api/users**
- **Descripción**: Lista todos los usuarios (sin contraseñas)
- **Response**: `AdminUser[]`

**POST /api/users**
- **Descripción**: Crea nuevo usuario
- **Body**: `{ username, password, display_name?, role?, is_active? }`
- **Response**: `AdminUser` (sin contraseña)

**PUT /api/users**
- **Descripción**: Actualiza usuario existente
- **Body**: `{ id, username?, password?, display_name?, role?, is_active? }`
- **Response**: `AdminUser` (sin contraseña)

**DELETE /api/users?id={userId}**
- **Descripción**: Elimina usuario
- **Query**: `id` (UUID)
- **Response**: `{ success: true, message: string }`

**Archivo**: `api/users.ts`

### Otros Endpoints Existentes

- `GET/POST/PUT/DELETE /api/products`
- `GET/POST/PUT/DELETE /api/brands`
- `GET/POST/PUT /api/settings`
- `GET/POST /api/sales`
- `GET/POST/PUT/DELETE /api/menus`
- `GET /api/categories`

---

## 🗄️ Base de Datos

### Esquema de Tablas

#### Tabla: `admin_users`

**Archivo**: `supabase-schema.sql`

```sql
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- En producción: usar hash
    display_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' 
        CHECK (role IN ('admin', 'editor', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Índices**:
- `idx_admin_users_username` - Búsqueda por username
- `idx_admin_users_role` - Filtrado por rol
- `idx_admin_users_is_active` - Filtrado por estado

**Trigger**:
- `update_admin_users_updated_at` - Actualiza `updated_at` automáticamente

**Usuario Inicial**:
```sql
INSERT INTO admin_users (username, password, display_name, role, is_active)
VALUES ('admin', '1234', 'Administrador', 'admin', true)
ON CONFLICT (username) DO NOTHING;
```

### Otras Tablas Existentes

- `products` - Productos del catálogo
- `brands` - Marcas de productos
- `categories` - Categorías de productos
- `sales` - Ventas/pedidos
- `menu_items` - Elementos de menú
- `app_settings` - Configuración global

---

## 🔄 Flujo de Datos

### Flujo de Autenticación

```
1. Usuario accede a /admin/* o /account
   ↓
2. App.tsx detecta isAdminRoute && !isAdminAuthenticated
   ↓
3. Se abre AdminLoginModal
   ↓
4. Usuario ingresa credenciales
   ↓
5. handleAdminAuthenticate() → POST /api/auth
   ↓
6. API verifica:
   a. Credenciales estáticas (admin/1234)
   b. Tabla admin_users en Supabase
   ↓
7. Si éxito:
   - setIsAdminAuthenticated(true)
   - sessionStorage.setItem('admin-authenticated', 'true')
   - Redirige a /admin
   ↓
8. AdminDashboardPage se monta con transiciones
```

### Flujo de Gestión de Usuarios

```
1. Usuario accede a /admin/users
   ↓
2. AdminUsersManagementPage se monta
   ↓
3. useEffect → fetchUsers() → GET /api/users
   ↓
4. API consulta Supabase → admin_users
   ↓
5. Filtra contraseñas en respuesta
   ↓
6. setUsers(data) → Re-render tabla
   ↓
7. Usuario hace acción (crear/editar/eliminar)
   ↓
8. Modal Form → handleSubmit()
   ↓
9. POST/PUT/DELETE /api/users
   ↓
10. Supabase actualiza datos
    ↓
11. Response → Actualiza estado local
    ↓
12. Re-render con nuevos datos
```

### Flujo de Transiciones

```
1. Usuario autenticado → navigate('/admin')
   ↓
2. AdminDashboardPage se monta
   ↓
3. useState({ isTransitioning: true })
   ↓
4. useEffect → setTimeout(() => setIsTransitioning(false), 100)
   ↓
5. CSS transitions se activan:
   - Contenedor: opacity-0 → opacity-100
   - Elementos: translate-y-4 → translate-y-0
   - Delays escalonados: 100ms, 200ms, 300ms
   ↓
6. Transición completa en ~700ms
```

---

## ⚙️ Configuración y Variables de Entorno

### Variables de Entorno Requeridas

#### Supabase (Backend)

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

#### Supabase (Frontend - opcional)

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

#### Autenticación (opcional)

```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=1234
VITE_ADMIN_DISPLAY_NAME=Administrador
```

#### Vercel (para proxy local)

```env
VITE_VERCEL_URL=https://tirescur.vercel.app
```

### Configuración de Vite

**Archivo**: `vite.config.ts`

```typescript
// Proxy para desarrollo local
proxy: {
  '/api': {
    target: env.VITE_VERCEL_URL || 'https://tirescur.vercel.app',
    changeOrigin: true,
    secure: true,
  }
}
```

### Configuración de Vercel

**Archivo**: `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔒 Seguridad

### Notas Importantes

1. **Contraseñas en Texto Plano**
   - ⚠️ **ACTUALMENTE**: Las contraseñas se almacenan en texto plano
   - ✅ **PRODUCCIÓN**: Debe implementarse hashing (bcrypt, argon2, etc.)

2. **Autenticación**
   - Sesión se mantiene en `sessionStorage` (no persiste)
   - No hay tokens JWT (solo verificación de sesión)
   - Cada ruta admin verifica `isAdminAuthenticated`

3. **API Security**
   - CORS configurado en `lib/cors.js`
   - Validación de entrada en todos los endpoints
   - No se exponen contraseñas en responses

### Mejoras Recomendadas para Producción

1. **Hashing de Contraseñas**
   ```typescript
   // Usar bcrypt o similar
   import bcrypt from 'bcrypt';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Tokens JWT**
   - Implementar sistema de tokens
   - Refresh tokens
   - Expiración de sesión

3. **Rate Limiting**
   - Limitar intentos de login
   - Protección contra brute force

4. **Validación Robusta**
   - Validación de entrada más estricta
   - Sanitización de datos
   - Validación de roles en cada endpoint

---

## 📝 Notas de Desarrollo

### Comandos Útiles

```bash
# Desarrollo local
npm run dev          # Puerto 3000

# Build
npm run build        # Genera dist/

# Preview
npm run preview      # Previsualiza build
```

### Estructura de Commits

```
feat: Modal de login moderno, transiciones y gestión de usuarios
- Modal de login elegante con animaciones y gradientes
- Efectos de transición al entrar al panel de control
- Sistema completo de gestión de usuarios (CRUD)
- API de autenticación y usuarios
- Tabla admin_users en schema SQL
- Usuario inicial admin/1234 configurado
```

### Rutas Importantes

- `/` - Página principal (tienda)
- `/shop` - Catálogo de productos
- `/account` - Página de cuenta (login admin)
- `/admin` - Panel de control principal
- `/admin/products` - Gestión de productos
- `/admin/brands` - Gestión de marcas
- `/admin/users` - Gestión de usuarios ⭐ NUEVO
- `/admin/prices` - Gestión de precios
- `/admin/sales` - Ventas/pedidos
- `/admin/settings` - Configuración global

---

## 🚀 Próximos Pasos

### Pendientes de Implementar

1. **Seguridad**
   - [ ] Hashing de contraseñas
   - [ ] Tokens JWT
   - [ ] Rate limiting
   - [ ] Validación de roles en APIs

2. **Funcionalidades**
   - [ ] Permisos por rol (editor, viewer)
   - [ ] Historial de cambios de usuarios
   - [ ] Recuperación de contraseña
   - [ ] Cambio de contraseña desde panel

3. **Mejoras**
   - [ ] Paginación en tabla de usuarios
   - [ ] Búsqueda y filtros
   - [ ] Exportación de usuarios
   - [ ] Logs de actividad

---

## 📞 Contacto y Soporte

Para problemas o dudas sobre el sistema:
1. Revisar logs en Vercel Dashboard
2. Verificar variables de entorno
3. Revisar esquema SQL en Supabase
4. Consultar esta documentación

---

**Última actualización**: 2024
**Versión del sistema**: 1.0.0
**Mantenedor**: Equipo de desarrollo

