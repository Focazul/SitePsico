@echo off
chcp 65001 >nul
cls
echo ====================================
echo INICIALIZACAO RAPIDA - SISTEMA COMPLETO
echo ====================================
echo.

cd /d "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"

echo [1/4] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>nul | find /I "mysqld.exe" >nul
if %errorlevel% equ 0 (
    echo MySQL ja esta rodando
) else (
    echo MySQL nao encontrado. Iniciando...
    net start MySQL80 >nul 2>&1
    if %errorlevel% equ 0 (
        echo MySQL iniciado via servico
    ) else (
        if exist C:\xampp\mysql\bin\mysqld.exe (
            echo Iniciando via XAMPP...
            cd /d C:\xampp\mysql\bin
            start "MySQL" mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini
            cd /d "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"
            timeout /t 5 >nul
            echo MySQL iniciado via XAMPP
        ) else (
            echo ERRO: MySQL nao encontrado!
            echo Instale MySQL ou XAMPP primeiro
            pause
            exit /b 1
        )
    )
)
echo.

echo [2/4] Verificando dependencias...
if not exist node_modules (
    echo node_modules nao encontrado
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo Erro ao instalar dependencias
        pause
        exit /b 1
    )
    echo Dependencias instaladas
) else (
    echo Dependencias OK
)
echo.

echo [3/4] Verificando configuracoes...
if not exist .env (
    echo Arquivo .env nao encontrado
    if exist .env.example (
        copy .env.example .env >nul
        echo .env criado - Configure antes de usar!
        notepad .env
    ) else (
        echo .env.example nao encontrado
        pause
        exit /b 1
    )
) else (
    echo .env encontrado
)
echo.

echo [4/4] Iniciando servidores...
echo.

echo Iniciando Backend (porta 3000)...
start "Backend Server" cmd /k "cd /d c:\Users\marce\Music\projeto site\teste 1\primeiras ideias && npm run dev:server"

echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando Frontend (porta 5173)...
start "Frontend Vite" cmd /k "cd /d c:\Users\marce\Music\projeto site\teste 1\primeiras ideias && npm run dev:client"

echo.
echo ====================================
echo SISTEMA INICIADO COM SUCESSO!
echo ====================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo Admin:    http://localhost:5173/admin
echo.
echo Para parar: Feche as janelas dos servidores
echo.
pause
