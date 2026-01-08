@echo off
chcp 65001 >nul
cls
echo ====================================
echo CONFIGURACAO AUTOMATICA - XAMPP
echo ====================================
echo.

REM Encontrar pasta XAMPP
echo [1/5] Procurando instalacao XAMPP...
set XAMPP_PATH=
for %%D in (C:\xampp D:\xampp E:\xampp C:\Program Files\xampp) do (
    if exist "%%D\mysql\bin\mysql.exe" (
        set XAMPP_PATH=%%D
        echo ✅ Encontrado: !XAMPP_PATH!
    )
)

if "!XAMPP_PATH!"=="" (
    echo ❌ XAMPP nao encontrado
    echo.
    echo Instale XAMPP em uma destas localizacoes:
    echo   C:\xampp
    echo   D:\xampp
    echo   C:\Program Files\xampp
    echo.
    pause
    exit /b 1
)

REM Adicionar XAMPP ao PATH temporariamente
set PATH=!XAMPP_PATH!\mysql\bin;!PATH!

echo.
echo [2/5] Testando conexao MySQL...
mysql -u root -e "SELECT 1;" >nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ MySQL nao respondeu
    echo.
    echo Verifique:
    echo 1. XAMPP Control Panel aberto
    echo 2. Clique "Start" em MySQL
    echo 3. Aguarde alguns segundos
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL respondendo!

REM Criar banco de dados
echo.
echo [3/5] Criando banco de dados...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS site_psicolog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

if %errorlevel% equ 0 (
    echo ✅ Banco criado!
) else (
    echo ⚠️  Erro ao criar banco
)

REM Verificar .env
echo.
echo [4/5] Configurando .env...

if not exist ".env" (
    echo ⚠️  .env nao encontrado
    echo    Copiando de .env.example...
    
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ Arquivo criado
    ) else (
        echo ❌ .env.example tambem nao encontrado!
        pause
        exit /b 1
    )
)

REM Substituir DATABASE_URL (sem senha no XAMPP)
(for /f "delims=" %%A in (.env) do (
    if "%%A"=="" (
        echo.
    ) else if "!%%A:~0,14!"=="DATABASE_URL=" (
        echo DATABASE_URL=mysql://root@localhost:3306/site_psicolog
    ) else (
        echo %%A
    )
)) > ".env.tmp"
move /y ".env.tmp" ".env" >nul 2>&1

echo ✅ .env configurado!
echo    DATABASE_URL=mysql://root@localhost:3306/site_psicolog

REM Executar migrations
echo.
echo [5/5] Executando migrations...
echo    (isto pode levar 1-2 minutos)
echo.

call npm run db:push

if %errorlevel% equ 0 (
    echo ✅ Migrations OK!
) else (
    echo ⚠️  Erro nas migrations
    echo    Tente: npm run db:push
)

REM Criar admin
echo.
echo Criando usuario admin...
call npm run setup:admin

cls
echo ====================================
echo ✅ TUDO CONFIGURADO!
echo ====================================
echo.
echo Banco de Dados: site_psicolog
echo Usuario: root (sem senha)
echo Host: localhost:3306
echo.
echo ====================================
echo PROXIMOS PASSOS
echo ====================================
echo.
echo 1. XAMPP Control Panel:
echo    - MySQL: [Start]
echo    - Apache: [Start] (opcional)
echo.
echo 2. Em outra janela do CMD, execute:
echo    npm run dev
echo.
echo 3. Acesse:
echo    http://localhost:5173/admin/settings
echo.
echo 4. Teste preenchendo campos e salvando
echo.
echo ====================================
pause
