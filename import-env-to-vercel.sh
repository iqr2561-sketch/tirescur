#!/bin/bash
# Script para importar variables de entorno desde .env a Vercel
# Uso: ./import-env-to-vercel.sh

echo "=== Importador de Variables de Entorno a Vercel ==="
echo ""

# Verificar que existe archivo .env
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "💡 Crea un archivo .env basado en .env.example"
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI no está instalado"
    echo "💡 Instálalo con: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI encontrado: $(vercel --version)"
echo ""
echo "📋 Leyendo variables desde .env..."
echo ""

# Leer y procesar variables
imported=0
errors=0

while IFS='=' read -r key value || [ -n "$key" ]; do
    # Ignorar comentarios y líneas vacías
    if [[ "$key" =~ ^[[:space:]]*# ]] || [[ -z "$key" ]]; then
        continue
    fi
    
    # Eliminar espacios en blanco
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [ -z "$key" ] || [ -z "$value" ]; then
        continue
    fi
    
    echo "📝 Importando $key..."
    
    # Preguntar por ambientes (simplificado - puedes ajustarlo)
    echo "   ¿En qué ambientes? (production/preview/development o 'all')"
    read -p "   Ambientes (all por defecto): " envs
    
    if [ -z "$envs" ] || [ "$envs" = "all" ]; then
        envs="production preview development"
    fi
    
    for env in $envs; do
        echo "   📤 Configurando $key en $env..."
        echo "$value" | vercel env add "$key" "$env" 2>&1
        
        if [ $? -eq 0 ]; then
            echo "      ✅ $key configurado en $env"
            ((imported++))
        else
            echo "      ⚠️  $key ya existe en $env o hubo un error"
            ((errors++))
        fi
    done
    echo ""
done < .env

echo ""
echo "=== Resumen ==="
echo "✅ Variables importadas exitosamente: $imported"
if [ $errors -gt 0 ]; then
    echo "❌ Errores: $errors"
fi

echo ""
echo "💡 Importante: Haz un nuevo deployment después de configurar las variables"
echo "   Usa: vercel --prod"
echo "   O desde el dashboard: Deployments → Redeploy"

