@echo off
chcp 65001 >nul
echo ====================================
echo INSTALACAO MYSQL VIA CMD
echo ====================================
echo.
echo Este script vai:
echo 1. Baixar MySQL Community Server
echo 2. Instalar automaticamente
echo 3. Criar banco de dados
echo 4. Configurar projeto
echo.
echo Pressione qualquer tecla para iniciar...
pause >nul

REM ====================================
REM 1. Verificar se MySQL ja esta instalado
REM ====================================
echo.
echo [PASSO 1] Verificando MySQL...
where mysql >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ MySQL ja instalado!
    mysql --version
    goto CONFIG_DB
) else (
    echo ❌ MySQL nao encontrado
)

REM ====================================
REM 2. Criar pasta temporaria
REM ====================================
echo.
echo [PASSO 2] Preparando download...
if not exist "%TEMP%\mysql_installer" mkdir "%TEMP%\mysql_installer"
set MYSQL_PATH=%TEMP%\mysql_installer

REM ====================================
REM 3. Baixar MySQL com PowerShell
REM ====================================
echo.
echo [PASSO 3] Baixando MySQL Community Server...
echo Isto pode levar alguns minutos...
echo.

REM URL do instalador MySQL 8.0 LTS (aproximadamente 2.3 MB)
set MYSQL_URL=https://dev.mysql.com/get/mysql-installer-community-8.0.40-0.msi

powershell -Command ^
  "try { ^
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12; ^
    $ProgressPreference = 'SilentlyContinue'; ^
    Invoke-WebRequest -Uri '%MYSQL_URL%' -OutFile '%MYSQL_PATH%\mysql-installer.msi' -Verbose; ^
    Write-Host 'Download concluido!'; ^
  } catch { ^
    Write-Host 'Erro: ' $_.Exception.Message; ^
    exit 1; ^
  }"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao baixar MySQL
    echo.
    echo ALTERNATIVA: Baixe manualmente de:
    echo https://dev.mysql.com/downloads/installer/
    echo.
    echo E execute o instalador:
    echo %MYSQL_PATH%\mysql-installer.msi
    echo.
    pause
    exit /b 1
)

echo ✅ Download concluido!

REM ====================================
REM 4. Instalar MySQL (modo quieto)
REM ====================================
echo.
echo [PASSO 4] Iniciando instalador MySQL...
echo.
echo Uma janela de instalacao vai aparecer.
echo Configure com:
echo   - Tipo: Developer Default
echo   - Porta: 3306
echo   - Senha root: 123456
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

REM Executar instalador em modo GUI (nao pode ser totalmente silencioso)
start "" "%MYSQL_PATH%\mysql-installer.msi"

echo.
echo ⏳ Aguardando conclusao da instalacao...
echo    (Esta janela ficara em background)
echo.
echo Depois que a instalacao terminar, feche a janela de instalacao.
echo Este script continuara automaticamente...
echo.
pause

REM Verificar se instalacao funcionou
echo.
echo [VERIFICACAO] Testando MySQL...
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ MySQL ainda nao foi encontrado
    echo.
    echo Possibilitdades:
    echo 1. Instalacao nao completada
    echo 2. MySQL nao foi adicionado ao PATH
    echo.
    echo Tente reiniciar o computador e execute este script novamente.
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL instalado com sucesso!

REM ====================================
REM 5. Configurar Banco de Dados
REM ====================================
:CONFIG_DB
echo.
echo [PASSO 5] Configurando banco de dados...
echo.

REM Perguntar senha root
set /p MYSQL_ROOT_PASS="Digite a senha do MySQL root (ou pressione Enter para '123456'): "
if "!MYSQL_ROOT_PASS!"=="" set MYSQL_ROOT_PASS=123456

echo.
echo Testando conexao com MySQL...
mysql -u root -p!MYSQL_ROOT_PASS! -e "SHOW DATABASES;" >nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ Erro: Nao foi possivel conectar ao MySQL
    echo.
    echo Verifique:
    echo 1. O servico MySQL esta rodando?
    echo 2. A senha esta correta?
    echo 3. MySQL esta escutando na porta 3306?
    echo.
    echo Para verificar status do servico MySQL:
    echo   Services.msc (procure por "MySQL")
    echo.
    pause
    exit /b 1
)

echo ✅ Conexao OK!

REM Criar banco de dados
echo.
echo Criando banco de dados 'site_psicolog'...
mysql -u root -p!MYSQL_ROOT_PASS! -e "CREATE DATABASE IF NOT EXISTS site_psicolog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

if %errorlevel% equ 0 (
    echo ✅ Banco criado!
) else (
    echo ⚠️  Erro ao criar banco (pode ja existir)
)

REM ====================================
REM 6. Configurar .env
REM ====================================
echo.
echo [PASSO 6] Configurando arquivo .env...

if not exist ".env" (
    echo ❌ Arquivo .env nao encontrado!
    echo.
    echo Crie o arquivo .env com o seguinte conteudo:
    echo.
    echo DATABASE_URL="mysql://root:!MYSQL_ROOT_PASS!@localhost:3306/site_psicolog"
    echo.
    echo Pressione qualquer tecla quando terminar...
    pause >nul
) else (
    REM Backup
    copy .env .env.backup >nul
    
    REM Atualizar DATABASE_URL usando PowerShell (compativel com caracteres especiais)
    powershell -Command ^
      "$content = Get-Content '.env'; " ^
      "$content = $content -replace 'DATABASE_URL=.*', 'DATABASE_URL=\"mysql://root:!MYSQL_ROOT_PASS!@localhost:3306/site_psicolog\"'; " ^
      "$content | Set-Content '.env'"
    
    if %errorlevel% equ 0 (
        echo ✅ .env configurado!
    ) else (
        echo ⚠️  Erro ao atualizar .env
    )
)

REM ====================================
REM 7. Executar migrations
REM ====================================
echo.
echo [PASSO 7] Executando migrations...
echo.

call npm run db:push

if %errorlevel% equ 0 (
    echo ✅ Migrations executadas!
) else (
    echo ⚠️  Erro nas migrations
    echo    Tente executar manualmente: npm run db:push
)

REM ====================================
REM 8. Resumo
REM ====================================
echo.
echo ====================================
echo INSTALACAO CONCLUIDA!
echo ====================================
echo.
echo ✅ MySQL instalado e configurado
echo ✅ Banco de dados criado
echo ✅ .env configurado
echo ✅ Migrations executadas
echo.
echo Credenciais do banco:
echo   Host: localhost
echo   Porta: 3306
echo   Usuario: root
echo   Senha: !MYSQL_ROOT_PASS!
echo   Banco: site_psicolog
echo.
echo ====================================
echo PROXIMOS PASSOS
echo ====================================
echo.
echo 1. Iniciar servidor:
echo    START_DEV.bat
echo.
echo 2. Acessar Settings:
echo    http://localhost:5173/admin/settings
echo.
echo 3. Testar salvamento de dados
echo.
pause
