# ⚠️ Límites de Vercel - Plan Hobby

## Límite de Serverless Functions

**IMPORTANTE**: El plan Hobby de Vercel tiene un límite de **12 Serverless Functions** por deployment.

### Endpoints API Actuales (13 archivos)

1. `/api/auth.ts` - Autenticación
2. `/api/products.ts` - Productos (GET, POST)
3. `/api/products/[id].ts` - Productos individuales (PUT, DELETE)
4. `/api/brands.ts` - Marcas
5. `/api/sales.ts` - Ventas
6. `/api/menus.ts` - Menús
7. `/api/categories.ts` - Categorías
8. `/api/users.ts` - Usuarios
9. `/api/settings.ts` - Configuraciones
10. `/api/popups.ts` - Popups
11. `/api/upload.ts` - Subida de archivos
12. `/api/crane-quote.ts` - Cotización de grúa
13. `/api/create-admin.ts` - Crear admin (verificar si se usa)

**Total: 13 funciones** ⚠️ LÍMITE EXCEDIDO (12 máximo)

### Soluciones para Futuras Implementaciones

#### ✅ Opción 1: Combinar Endpoints Similares (RECOMENDADO)
En lugar de crear nuevos archivos, agregar rutas a endpoints existentes usando query parameters:

**Ejemplo**: Combinar `crane-quote` con `settings`:
```typescript
// /api/settings?type=crane-quote
// /api/settings?key=heroImageUrl (ya existe)
```

#### ✅ Opción 2: Eliminar Endpoints No Utilizados
- Verificar si `/api/create-admin.ts` se usa actualmente
- Si no se usa, eliminarlo para liberar un slot

#### ✅ Opción 3: Usar un Router Unificado
Crear un solo endpoint `/api/data.ts` que maneje múltiples recursos:
```typescript
// /api/data?resource=crane-quote
// /api/data?resource=other-config
// /api/data?resource=another-feature
```

#### Opción 4: Migrar a Plan Pro
El plan Pro de Vercel permite funciones ilimitadas.

#### Opción 5: Usar Client-Side Only
Para funcionalidades que no requieren servidor, usar solo código cliente.

### Recomendaciones Inmediatas

1. **Verificar `create-admin.ts`**: Si no se usa, eliminarlo
2. **Combinar `crane-quote` con `settings`**: Usar query parameter `?type=crane-quote`
3. **Documentar** cada nuevo endpoint antes de crearlo
4. **Revisar** periódicamente si hay endpoints que se pueden combinar

### Notas Importantes

- Cada archivo `.ts` en `/api` cuenta como una función serverless
- Los archivos en subdirectorios también cuentan (ej: `/api/products/[id].ts`)
- Las funciones no utilizadas también cuentan hacia el límite
- **SIEMPRE verificar el límite antes de crear nuevos endpoints**

### Checklist Antes de Crear Nuevo Endpoint

- [ ] ¿Existe un endpoint similar que pueda manejar esto?
- [ ] ¿Puedo usar query parameters en lugar de un nuevo archivo?
- [ ] ¿Hay algún endpoint no utilizado que pueda eliminar?
- [ ] ¿La funcionalidad realmente necesita servidor o puede ser client-side?
- [ ] ¿He documentado el nuevo endpoint en este archivo?

### Historial de Endpoints

- ✅ `crane-quote.ts` - Agregado (último endpoint)
- ⚠️ Verificar si `create-admin.ts` se usa
