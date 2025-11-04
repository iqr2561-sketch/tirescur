# 📋 Cómo Ejecutar los Scripts SQL en Supabase

## ⚠️ Error Común: "syntax error at or near '-'"

Este error ocurre cuando se copia el nombre del archivo o comentarios en el SQL Editor.

## ✅ Pasos Correctos para Ejecutar SQL

### Paso 1: Abrir SQL Editor
1. Ve a **Supabase Dashboard** → https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú lateral izquierdo, haz clic en **"SQL Editor"** o **"Editor SQL"**

### Paso 2: Abrir el Archivo SQL
1. Abre el archivo `migrations/VERIFICAR_Y_CORREGIR_TODO.sql` en tu editor de código (VS Code, Notepad++, etc.)
2. **NO copies el nombre del archivo**
3. Solo copia el **CONTENIDO SQL** del archivo

### Paso 3: Copiar el Contenido
1. Selecciona **TODO el contenido** del archivo (Ctrl+A o Cmd+A)
2. Copia el contenido (Ctrl+C o Cmd+C)
3. **Asegúrate de que NO incluyas:**
   - El nombre del archivo
   - Comentarios como "migrations/VERIFICAR_Y_CORREGIR_TODO.sql"
   - Líneas que empiecen con "-" o "["

### Paso 4: Pegar en SQL Editor
1. En Supabase SQL Editor, haz clic en el área de texto
2. Pega el contenido (Ctrl+V o Cmd+V)
3. Verifica que empiece con:
   ```sql
   -- =====================================================
   -- SCRIPT COMPLETO PARA VERIFICAR Y CORREGIR TODO EL ESQUEMA
   ```
   **NO** debe empezar con:
   - `migrations/VERIFICAR_Y_CORREGIR_TODO.sql`
   - `- migrations/VERIFICAR_Y_CORREGIR_TODO.sql`
   - `[archivo]`

### Paso 5: Ejecutar
1. Haz clic en el botón **"Run"** o **"Ejecutar"** o presiona Ctrl+Enter
2. Espera a que se complete
3. Deberías ver un mensaje de éxito

## 🔍 Qué NO Debes Copiar

❌ **INCORRECTO:**
```
- migrations/VERIFICAR_Y_CORREGIR_TODO.sql
-- =====================================================
```

❌ **INCORRECTO:**
```
migrations/VERIFICAR_Y_CORREGIR_TODO.sql
-- =====================================================
```

✅ **CORRECTO:**
```sql
-- =====================================================
-- SCRIPT COMPLETO PARA VERIFICAR Y CORREGIR TODO EL ESQUEMA
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
...
```

## 📝 Ejemplo Visual

### Lo que VES en el archivo:
```
migrations/VERIFICAR_Y_CORREGIR_TODO.sql
-- =====================================================
-- SCRIPT COMPLETO...
```

### Lo que DEBES COPIAR:
```
-- =====================================================
-- SCRIPT COMPLETO...
```

**NO copies la primera línea con el nombre del archivo**

## 🐛 Si Aún Tienes Error

1. **Abre el archivo** en un editor de texto
2. **Selecciona desde la línea 2** (omite la primera línea si tiene el nombre del archivo)
3. O mejor aún, **selecciona TODO** y luego **elimina manualmente** cualquier línea que no sea SQL válido
4. El SQL debe empezar con `--` (comentario) o `CREATE` (comando SQL)

## ✅ Verificación

Antes de ejecutar, verifica que:
- ✅ Empieza con `--` (comentario) o `CREATE` (comando SQL)
- ✅ NO empieza con `- ` (guión con espacio)
- ✅ NO incluye nombres de archivo
- ✅ Todas las líneas son SQL válido o comentarios SQL

