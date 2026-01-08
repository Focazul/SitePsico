#!/usr/bin/env pwsh

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "VERIFICACAO DO SISTEMA - STATUS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[MySQL]" -ForegroundColor Yellow
$mysql = Get-Process mysqld -ErrorAction SilentlyContinue
if ($mysql) {
    Write-Host "  OK - Rodando (PID: $($mysql.Id))" -ForegroundColor Green
    Write-Host "  Memoria: $($mysql.WorkingSet / 1MB)MB" -ForegroundColor Gray
} else {
    Write-Host "  ERRO - Nao esta rodando" -ForegroundColor Red
}
Write-Host ""

Write-Host "[Node.js]" -ForegroundColor Yellow
$nodes = @(Get-Process node -ErrorAction SilentlyContinue)
if ($nodes.Count -gt 0) {
    Write-Host "  OK - Processos: $($nodes.Count)" -ForegroundColor Green
    $totalMem = ($nodes | Measure-Object WorkingSet -Sum).Sum / 1MB
    Write-Host "  Memoria: $($totalMem)MB" -ForegroundColor Gray
} else {
    Write-Host "  ERRO - Nenhum processo node" -ForegroundColor Red
}
Write-Host ""

Write-Host "[npm]" -ForegroundColor Yellow
$npm = npm --version 2>$null
if ($?) {
    Write-Host "  OK - Versao: $npm" -ForegroundColor Green
} else {
    Write-Host "  ERRO - npm nao encontrado" -ForegroundColor Red
}
Write-Host ""

Write-Host "[Banco de Dados]" -ForegroundColor Yellow
$result = & "C:\xampp\mysql\bin\mysql.exe" -u root -D site_psicolog -e "SELECT COUNT(*) FROM settings;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - Conectado" -ForegroundColor Green
} else {
    Write-Host "  ERRO - Nao conecta" -ForegroundColor Red
}
Write-Host ""

Write-Host "[Portas TCP]" -ForegroundColor Yellow
$check = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object LocalPort -in @(3000, 3001, 3002, 5173, 5174, 3306) | Where-Object State -eq Listen
if ($check) {
    Write-Host "  OK - Portas ativas:" -ForegroundColor Green
    foreach ($c in $check) {
        Write-Host "    - Porta $($c.LocalPort)" -ForegroundColor Gray
    }
} else {
    Write-Host "  AVISO - Nenhuma porta escutando" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if ($mysql -and $nodes.Count -gt 0 -and $check) {
    Write-Host "SISTEMA PRONTO PARA USAR!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acesse: http://localhost:5173/admin/settings" -ForegroundColor Cyan
} else {
    Write-Host "ERROS DETECTADOS - REVISAR ACIMA" -ForegroundColor Red
}

Write-Host ""
