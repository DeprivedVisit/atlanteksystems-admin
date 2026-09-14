# ============================================
# Trading Bot — Setup Automatizado
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Trading Bot — n8n + Telegram + AI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar .env
$envContent = Get-Content .env -Raw
if ($envContent -match "TU_TOKEN_NGROK") {
    Write-Host "[!] Primero editá el archivo .env con tus tokens:" -ForegroundColor Yellow
    Write-Host "    NGROK_AUTHTOKEN   → https://dashboard.ngrok.com" -ForegroundColor DarkGray
    Write-Host "    OPENAI_API_KEY    → https://platform.openai.com" -ForegroundColor DarkGray
    Write-Host "    TELEGRAM_BOT_TOKEN → @BotFather en Telegram" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Luego ejecutá de nuevo: .\setup.ps1" -ForegroundColor Yellow
    exit 1
}

# 2. Levantar contenedores
Write-Host "[1/3] Levantando n8n + ngrok..." -ForegroundColor Green
docker compose up -d
Start-Sleep -Seconds 8

# 3. Obtener URL de ngrok
Write-Host "[2/3] Obteniendo URL pública..." -ForegroundColor Green
$ngrokUrl = $null
for ($i = 1; $i -le 12; $i++) {
    try {
        $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 5
        $ngrokUrl = $tunnels.tunnels[0].public_url
        break
    } catch {
        Write-Host "    Esperando ngrok... ($i/12)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 3
    }
}

if (-not $ngrokUrl) {
    Write-Host "[X] Error: ngrok no respondió. Verificá el token en .env" -ForegroundColor Red
    Write-Host "    docker logs n8n_ngrok" -ForegroundColor DarkGray
    exit 1
}

Write-Host "    URL: $ngrokUrl" -ForegroundColor Cyan

# 4. Actualizar .env
Write-Host "[3/3] Configurando webhook..." -ForegroundColor Green
$envContent = $envContent -replace "https://TU_URL_NGROK\.ngrok-free\.app", $ngrokUrl
Set-Content .env $envContent

# 5. Reiniciar n8n
docker compose restart n8n | Out-Null
Start-Sleep -Seconds 5

# 6. Listo
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  LISTO — Bot corriendo" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  n8n:      http://localhost:5678" -ForegroundColor White
Write-Host "  ngrok:    http://localhost:4040" -ForegroundColor White
Write-Host "  Webhook:  $ngrokUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "  1. Abrí http://localhost:5678" -ForegroundColor White
Write-Host "  2. Creá tu usuario admin" -ForegroundColor White
Write-Host "  3. Credentials > Telegram API > pegá tu bot token" -ForegroundColor White
Write-Host "  4. Credentials > OpenAI API > pegá tu API key" -ForegroundColor White
Write-Host "  5. Importá telegram-bot-ai.json" -ForegroundColor White
Write-Host "  6. Asigná credenciales a cada nodo (REEMPLAZAR)" -ForegroundColor White
Write-Host "  7. Activá el workflow" -ForegroundColor White
Write-Host ""
Write-Host "Comandos:" -ForegroundColor DarkGray
Write-Host "  docker logs -f n8n_trading" -ForegroundColor DarkGray
Write-Host "  docker compose down" -ForegroundColor DarkGray
