# Solución para Error de Permisos en GitHub

El error indica que necesitas autenticarte correctamente. Aquí tienes las opciones:

## Opción 1: Usar Token de Acceso Personal (Recomendado)

### 1. Crear un Token de Acceso Personal en GitHub:

1. Ve a: https://github.com/settings/tokens
2. Haz clic en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre descriptivo (ej: "tirescur-access")
4. Selecciona los permisos: **repo** (necesario para push/pull)
5. Haz clic en "Generate token"
6. **COPIA EL TOKEN INMEDIATAMENTE** (solo se muestra una vez)

### 2. Usar el token para hacer push:

En lugar de usar tu contraseña, usa el token como contraseña:

```bash
git push -u origin main
```

Cuando te pida:
- **Username**: `iqr2561-sketch` (o tu usuario de GitHub)
- **Password**: Pega el **token de acceso personal** (NO tu contraseña)

## Opción 2: Configurar SSH (Alternativa más segura)

### 1. Generar clave SSH:

```bash
ssh-keygen -t ed25519 -C "tu-email@example.com"
```

Presiona Enter para aceptar la ubicación predeterminada.

### 2. Copiar la clave pública:

```bash
cat ~/.ssh/id_ed25519.pub
```

### 3. Agregar la clave en GitHub:

1. Ve a: https://github.com/settings/ssh/new
2. Pega tu clave pública
3. Haz clic en "Add SSH key"

### 4. Cambiar la URL del remote a SSH:

```bash
git remote set-url origin git@github.com:iqr2561-sketch/tirescur.git
git push -u origin main
```

## Opción 3: Verificar que eres colaborador

Si el repositorio pertenece a otra cuenta/organización, asegúrate de que:
- Tengas permisos de escritura en el repositorio
- O uses el usuario correcto que tiene acceso

## Verificar configuración actual:

```bash
git config user.name
git config user.email
git remote -v
```

