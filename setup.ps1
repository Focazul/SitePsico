# Configurar MySQL via XAMPP
$ErrorActionPreference = "Continue"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "CONFIGURACAO MYSQL - XAMPP" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Encontrar XAMPP
Write-Host "[1/4] Procurando XAMPP..." -ForegroundColor Yellow
$xamppPaths = @("C:\xampp", "D:\xampp", "E:\xampp", "C:\Program Files\xampp")
$xamppPath = $null

foreach ($path in $xamppPaths) {
    if (Test-Path "$path\mysql\bin\mysql.exe") {
        $xamppPath = $path
        Write-Host "✅ Encontrado: $xamppPath" -ForegroundColor Green
        break
    }
}

if (!$xamppPath) {
    Write-Host "❌ XAMPP nao encontrado" -ForegroundColor Red
    Write-Host "Instale em: C:\xampp" -ForegroundColor Yellow
    exit 1
}

# Adicionar ao PATH
$env:Path = "$xamppPath\mysql\bin;" + $env:Path

# Testar conexao
Write-Host ""
Write-Host "[2/4] Testando conexao MySQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$maxRetries = 5
$retryCount = 0
while ($retryCount -lt $maxRetries) {
    $result = & mysql -u root -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL respondendo!" -ForegroundColor Green
        break
    }
    $retryCount++
    if ($retryCount -lt $maxRetries) {
        Write-Host "  Tentativa $retryCount/$maxRetries..."
        Start-Sleep -Seconds 2
    }
}

if ($retryCount -eq $maxRetries) {
    Write-Host "❌ MySQL nao respondeu" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Yellow
    Write-Host "1. XAMPP Control Panel aberto" -ForegroundColor Yellow
    Write-Host "2. MySQL com botao [Start]" -ForegroundColor Yellow
    exit 1
}

# Criar banco
Write-Host ""
Write-Host "[3/4] Criando banco de dados..." -ForegroundColor Yellow
& mysql -u root -e "CREATE DATABASE IF NOT EXISTS site_psicolog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Banco criado!" -ForegroundColor Green
}

# Configurar .env
Write-Host ""
Write-Host "[4/4] Configurando .env..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env criado de .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ Arquivo .env nao encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Atualizar DATABASE_URL
$envContent = Get-Content ".env" -Raw
$envContent = $envContent -replace 'DATABASE_URL=.*', 'DATABASE_URL=mysql://root@localhost:3306/site_psicolog'
$envContent | Set-Content ".env"
Write-Host "✅ .env configurado!" -ForegroundColor Green
Write-Host "   DATABASE_URL=mysql://root@localhost:3306/site_psicolog" -ForegroundColor Gray

# Executar migrations
Write-Host ""
Write-Host "Executando migrations..." -ForegroundColor Yellow
& npm run db:push

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ CONFIGURACAO CONCLUIDA!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "1. Em outra janela PowerShell:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Acesse:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173/admin/settings" -ForegroundColor Cyan
Write-Host ""
