@echo off
echo ====================================
echo VERIFICACAO COMPLETA DO SISTEMA
echo ====================================
echo.

set "MISSING="
set "WARNINGS="

REM ====================================
REM 1. Node.js
REM ====================================
echo [1/5] Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js NAO INSTALADO
    set MISSING=1
    echo    Download: https://nodejs.org/
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js !NODE_VERSION! instalado
)
echo.

REM ====================================
REM 2. npm
REM ====================================
echo [2/5] Verificando npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm NAO INSTALADO
    set MISSING=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm !NPM_VERSION! instalado
)
echo.

REM ====================================
REM 3. MySQL
REM ====================================
echo [3/5] Verificando MySQL...
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ MySQL NAO INSTALADO
    set MISSING=1
    echo    Instale seguindo: INSTALAR_MYSQL.md
    echo    Download: https://dev.mysql.com/downloads/installer/
) else (
    for /f "tokens=*" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
    echo ✅ MySQL instalado: !MYSQL_VERSION!
)
echo.

REM ====================================
REM 4. Git (opcional mas recomendado)
REM ====================================
echo [4/5] Verificando Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Git NAO INSTALADO (opcional)
    set WARNINGS=1
    echo    Download: https://git-scm.com/
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo ✅ !GIT_VERSION! instalado
)
echo.

REM ====================================
REM 5. Dependencias do Projeto
REM ====================================
echo [5/5] Verificando dependencias do projeto...
if not exist "node_modules" (
    echo ⚠️  node_modules NAO ENCONTRADO
    echo    Instalando agora...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependencias
        set MISSING=1
    ) else (
        echo ✅ Dependencias instaladas com sucesso!
    )
) else (
    echo ✅ node_modules encontrado
    echo    Verificando atualizacoes...
    call npm outdated
)
echo.

REM ====================================
REM RESUMO
REM ====================================
echo ====================================
echo RESUMO DA VERIFICACAO
echo ====================================
echo.

if defined MISSING (
    echo ❌ COMPONENTES OBRIGATORIOS FALTANDO!
    echo.
    echo Instale os itens marcados com ❌ acima.
    echo.
    pause
    exit /b 1
)

if defined WARNINGS (
    echo ⚠️  Alguns componentes opcionais faltando
    echo    O sistema funcionara, mas recomenda-se instalar.
    echo.
)

echo ✅ TODOS OS COMPONENTES OBRIGATORIOS OK!
echo.

REM ====================================
REM Verificar MySQL Database
REM ====================================
if exist ".env" (
    echo ====================================
    echo VERIFICANDO BANCO DE DADOS
    echo ====================================
    echo.
    
    findstr /C:"DB_PASSWORD=" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ Arquivo .env configurado
        echo.
        echo Deseja verificar a conexao com MySQL? (S/N)
        set /p VERIFY_DB=
        if /i "!VERIFY_DB!"=="S" (
            echo.
            echo Digite a senha do MySQL root:
            set /p MYSQL_PASS=
            mysql -u root -p!MYSQL_PASS! -e "SHOW DATABASES LIKE 'site_psicolog';" >nul 2>&1
            if %errorlevel% equ 0 (
                echo ✅ Banco 'site_psicolog' encontrado!
                echo.
                echo Deseja executar migrations? (S/N)
                set /p RUN_MIGRATIONS=
                if /i "!RUN_MIGRATIONS!"=="S" (
                    call npm run db:push
                )
            ) else (
                echo ❌ Banco 'site_psicolog' NAO encontrado
                echo    Execute: SETUP_MYSQL.bat
            )
        )
    ) else (
        echo ⚠️  .env nao configurado com senha do MySQL
        echo    Execute: SETUP_MYSQL.bat
    )
) else (
    echo ⚠️  Arquivo .env nao encontrado
    echo    Copie .env.example para .env
)

echo.
echo ====================================
echo PRONTO PARA INICIAR!
echo ====================================
echo.
echo Execute: START_DEV.bat
echo Acesse: http://localhost:5173/admin/settings
echo.
pause
