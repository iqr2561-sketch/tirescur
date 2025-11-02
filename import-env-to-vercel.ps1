# Script para importar variables de entorno desde .env a Vercel
# Uso: .\import-env-to-vercel.ps1

Write-Host "=== Importador de Variables de Entorno a Vercel ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe archivo .env
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "💡 Crea un archivo .env basado en .env.example" -ForegroundColor Yellow
    exit 1
}

# Verificar que Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Vercel CLI no está instalado" -ForegroundColor Red
    Write-Host "💡 Instálalo con: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Verificar que el proyecto está enlazado
Write-Host ""
Write-Host "📋 Leyendo variables desde .env..." -ForegroundColor Cyan

# Leer el archivo .env
$envContent = Get-Content ".env" | Where-Object { $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' }

$variables = @{}
foreach ($line in $envContent) {
    if ($line -match '^(.+?)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($key -and $value) {
            $variables[$key] = $value
        }
    }
}

Write-Host "✅ Encontradas $($variables.Count) variables" -ForegroundColor Green
Write-Host ""

# Preguntar qué ambientes configurar
Write-Host "¿En qué ambientes deseas configurar las variables?" -ForegroundColor Yellow
Write-Host "1. Production, Preview y Development (Recomendado)"
Write-Host "2. Solo Production"
Write-Host "3. Personalizado"
Write-Host ""
$choice = Read-Host "Selecciona una opción (1-3)"

$environments = @()
switch ($choice) {
    "1" { $environments = @("production", "preview", "development") }
    "2" { $environments = @("production") }
    "3" {
        Write-Host ""
        Write-Host "Selecciona ambientes (múltiples separados por coma):"
        Write-Host "production, preview, development"
        $envInput = Read-Host "Ambientes"
        $environments = $envInput -split ',' | ForEach-Object { $_.Trim() }
    }
    default {
        Write-Host "❌ Opción inválida. Usando todos los ambientes." -ForegroundColor Red
        $environments = @("production", "preview", "development")
    }
}

Write-Host ""
Write-Host "📤 Importando variables..." -ForegroundColor Cyan
Write-Host ""

$imported = 0
$errors = 0

foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    
    foreach ($env in $environments) {
        Write-Host "  📝 Importando $key a $env..." -ForegroundColor Yellow
        
        # Usar echo para pasar el valor a vercel env add
        try {
            $result = echo $value | vercel env add $key $env 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ $key configurado en $env" -ForegroundColor Green
                $imported++
            } else {
                Write-Host "    ⚠️  $key ya existe en $env o hubo un error" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "    ❌ Error importando $key a $env: $_" -ForegroundColor Red
            $errors++
        }
    }
    Write-Host ""
}

Write-Host ""
Write-Host "=== Resumen ===" -ForegroundColor Cyan
Write-Host "✅ Variables importadas exitosamente: $imported" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "❌ Errores: $errors" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Importante: Haz un nuevo deployment después de configurar las variables" -ForegroundColor Yellow
Write-Host "   Usa: vercel --prod" -ForegroundColor Yellow
Write-Host "   O desde el dashboard: Deployments → Redeploy" -ForegroundColor Yellow

