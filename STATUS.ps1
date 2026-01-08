#!/usr/bin/env pwsh

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "VERIFICACAO DO SISTEMA - STATUS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# MySQL
Write-Host "[MySQL]" -ForegroundColor Yellow
$mysql = Get-Process mysqld -ErrorAction SilentlyContinue
if ($mysql) {
    Write-Host "  ✅ Rodando (PID: $($mysql.Id))" -ForegroundColor Green
    Write-Host "  📊 Memória: $($mysql.WorkingSet / 1MB)MB" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Não está rodando" -ForegroundColor Red
}
Write-Host ""

# Node.js
Write-Host "[Node.js]" -ForegroundColor Yellow
$nodes = @(Get-Process node -ErrorAction SilentlyContinue)
if ($nodes.Count -gt 0) {
    Write-Host "  ✅ Múltiplos processos: $($nodes.Count)" -ForegroundColor Green
    $totalMem = ($nodes | Measure-Object WorkingSet -Sum).Sum / 1MB
    Write-Host "  📊 Memória total: $($totalMem)MB" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Nenhum processo node rodando" -ForegroundColor Red
}
Write-Host ""

# npm
Write-Host "[npm]" -ForegroundColor Yellow
$npm = npm --version 2>$null
if ($?) {
    Write-Host "  ✅ Versão: $npm" -ForegroundColor Green
} else {
    Write-Host "  ❌ npm não encontrado" -ForegroundColor Red
}
Write-Host ""

# Banco de dados
Write-Host "[Banco de Dados]" -ForegroundColor Yellow
$dbCheck = & "C:\xampp\mysql\bin\mysql.exe" -u root -D site_psicolog -e "SELECT COUNT(*) FROM settings;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Conectado" -ForegroundColor Green
    Write-Host "  📊 Settings encontradas" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Erro ao conectar" -ForegroundColor Red
}
Write-Host ""

# Portas
Write-Host "[Portas TCP]" -ForegroundColor Yellow
$ports = @(
    @{ Port = 3000; Desc = "Backend" },
    @{ Port = 3001; Desc = "Backend (alternativa)" },
    @{ Port = 3002; Desc = "Backend (alternativa)" },
    @{ Port = 5173; Desc = "Frontend" },
    @{ Port = 5174; Desc = "Frontend (alternativa)" },
    @{ Port = 3306; Desc = "MySQL" }
)

foreach ($p in $ports) {
    $listening = Get-NetTCPConnection -LocalPort $p.Port -ErrorAction SilentlyContinue | Where-Object State -eq Listen
    if ($listening) {
        Write-Host "  ✅ Porta $($p.Port) - $($p.Desc)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "ARQUIVOS IMPORTANTES" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$files = @(
    @{ Path = ".env"; Desc = "Configuração ambiente" },
    @{ Path = "package.json"; Desc = "Dependências" },
    @{ Path = "drizzle.config.ts"; Desc = "Config Drizzle ORM" },
    @{ Path = "vite.config.ts"; Desc = "Config Vite" },
    @{ Path = "server/_core/index.ts"; Desc = "Servidor principal" }
)

foreach ($f in $files) {
    if (Test-Path $f.Path) {
        Write-Host "  ✅ $($f.Desc)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($f.Desc) - NÃO ENCONTRADO" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "RESUMO FINAL" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if ($mysql -and $nodes.Count -gt 0) {
    Write-Host "✅ SISTEMA PRONTO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acesse: http://localhost:5173/admin/settings" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  VERIFICAR SERVIDORES" -ForegroundColor Yellow
    if (-not $mysql) { Write-Host "   - Inicie MySQL" }
    if ($nodes.Count -eq 0) { Write-Host "   - Inicie: npm run dev" }
}

Write-Host ""
