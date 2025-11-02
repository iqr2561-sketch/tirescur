# Instrucciones para conectar con GitHub

## 1. Crear repositorio en GitHub

1. Ve a: https://github.com/new
2. Ingresa un nombre para el repositorio (ej: `webgomeria`)
3. **NO marques** "Initialize this repository with a README"
4. Haz clic en "Create repository"

## 2. Conectar repositorio local con GitHub

Una vez creado el repositorio en GitHub, copia la URL que te muestra (algo como: `https://github.com/tu-usuario/webgomeria.git`)

Luego ejecuta estos comandos:

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

## 3. Alternativa: Si ya tienes el repositorio creado

Si ya creaste el repositorio, reemplaza `TU-USUARIO` y `TU-REPOSITORIO` con tus valores reales y ejecuta:

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

## Nota sobre configuración de Git

Si quieres cambiar tu nombre y email de Git (para este repositorio o globalmente):

```bash
# Solo para este repositorio:
git config user.name "Tu Nombre"
git config user.email "tu-email@example.com"

# Para todos los repositorios:
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@example.com"
```

