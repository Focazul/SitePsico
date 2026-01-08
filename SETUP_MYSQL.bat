@echo off
echo ====================================
echo SETUP MYSQL - Psicologo Site
echo ====================================
echo.

REM Verificar se MySQL está instalado
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ MySQL não encontrado!
    echo.
    echo Por favor, instale o MySQL primeiro:
    echo 1. Leia o arquivo INSTALAR_MYSQL.md
    echo 2. Baixe em: https://dev.mysql.com/downloads/installer/
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL encontrado!
echo.

REM Solicitar senha do root
set /p MYSQL_PASSWORD="Digite a senha do root do MySQL: "

echo.
echo [1/3] Criando banco de dados...
echo.

mysql -u root -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS site_psicolog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

if %errorlevel% neq 0 (
    echo ❌ Erro ao criar banco de dados.
    echo Verifique se a senha está correta.
    pause
    exit /b 1
)

echo ✅ Banco de dados 'site_psicolog' criado/verificado!
echo.

echo [2/3] Atualizando .env...
echo.

REM Criar backup do .env
if exist .env (
    copy .env .env.backup >nul
    echo ✅ Backup criado: .env.backup
)

REM Atualizar .env com a senha
powershell -Command "(gc .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=%MYSQL_PASSWORD%' | Out-File -encoding ASCII .env"
powershell -Command "(gc .env) -replace 'DATABASE_URL=mysql://root:.*@localhost', 'DATABASE_URL=mysql://root:%MYSQL_PASSWORD%@localhost' | Out-File -encoding ASCII .env"

echo ✅ Arquivo .env atualizado!
echo.

echo [3/3] Criando tabelas (migrations)...
echo.

call npm run db:push

if %errorlevel% neq 0 (
    echo ❌ Erro ao executar migrations.
    echo Verifique os logs acima.
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✅ SETUP CONCLUÍDO COM SUCESSO!
echo ====================================
echo.
echo Próximos passos:
echo 1. Execute: START_DEV.bat
echo 2. Acesse: http://localhost:5173/admin/settings
echo.
echo Banco de dados pronto! 🎉
echo.
pause
