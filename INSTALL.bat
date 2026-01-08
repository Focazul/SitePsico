@echo off
chcp 65001 >nul
cls
echo ====================================
echo INSTALACAO MYSQL - VERSAO SIMPLIFICADA
echo ====================================
echo.
echo Opcoes de instalacao:
echo.
echo [1] Usar XAMPP (mais facil, interface grafica)
echo [2] Instalar MySQL direto (linha de comando)
echo [3] Ja tenho MySQL instalado
echo.
set /p OPCAO="Escolha opcao (1-3): "

if "!OPCAO!"=="1" goto XAMPP
if "!OPCAO!"=="2" goto MYSQL_DIRETO
if "!OPCAO!"=="3" goto USAR_EXISTENTE

REM ====================================
REM OPCAO 1: XAMPP
REM ====================================
:XAMPP
cls
echo ====================================
echo INSTALACAO VIA XAMPP
echo ====================================
echo.
echo XAMPP e o mais facil de usar!
echo.
echo 1. Baixe XAMPP:
echo    https://www.apachefriends.org/download.html
echo.
echo 2. Instale com essas opcoes MARCADAS:
echo    [X] Apache
echo    [X] MySQL
echo    [ ] FileZilla
echo    [ ] Tomcat
echo.
echo 3. Apos instalar, abra XAMPP Control Panel
echo.
echo 4. Clique "Start" no modulo MySQL
echo.
echo 5. Volta aqui e pressione qualquer tecla...
pause
cls
goto CONFIG_DB

REM ====================================
REM OPCAO 2: MYSQL DIRETO
REM ====================================
:MYSQL_DIRETO
cls
echo ====================================
echo INSTALACAO MYSQL DIRETO
echo ====================================
echo.
echo Abrindo link de download...
echo https://dev.mysql.com/downloads/installer/
echo.
echo Por favor:
echo 1. Baixe: mysql-installer-community-8.0.x-0.msi
echo 2. Execute o instalador
echo 3. Use Senha: 123456 (ou outra)
echo 4. Instale na pasta padrao (C:\Program Files\MySQL\MySQL Server 8.0)
echo.
echo Depois volta aqui e pressione qualquer tecla...
pause
cls
goto CONFIG_DB

REM ====================================
REM OPCAO 3: JA TEM MYSQL
REM ====================================
:USAR_EXISTENTE
cls
echo.
echo Verificando MySQL...
where mysql >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ MySQL encontrado!
    mysql --version
    echo.
    goto CONFIG_DB
) else (
    echo ❌ MySQL nao encontrado no PATH
    echo.
    echo O MySQL pode estar instalado mas nao no PATH.
    echo Tente adicionar manualmente ou escolha outra opcao.
    pause
    exit /b 1
)

REM ====================================
REM CONFIGURAR BANCO DE DADOS
REM ====================================
:CONFIG_DB
cls
echo ====================================
echo CONFIGURANDO BANCO DE DADOS
echo ====================================
echo.

REM Aguardar MySQL estar ready
echo [1] Testando conexao MySQL...
timeout /t 2 >nul

:RETRY_CONNECTION
mysql -u root -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Nao consegui conectar sem senha...
    echo.
    set /p MYSQL_ROOT_PASS="Digite senha MySQL root: "
) else (
    set MYSQL_ROOT_PASS=
    echo ✅ Conexao sem senha OK!
)

mysql -u root -p!MYSQL_ROOT_PASS! -e "SHOW DATABASES;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erro: Nao consegui conectar
    echo.
    echo Verifique:
    echo - Servico MySQL esta rodando?
    echo - Senha esta correta?
    echo.
    set /p RETRY="Tentar novamente? (S/N): "
    if /i "!RETRY!"=="S" goto RETRY_CONNECTION
    pause
    exit /b 1
)

echo ✅ Conectado com sucesso!

REM ====================================
REM CRIAR BANCO
REM ====================================
echo.
echo [2] Criando banco de dados 'site_psicolog'...

mysql -u root -p!MYSQL_ROOT_PASS! -e "CREATE DATABASE IF NOT EXISTS site_psicolog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

if %errorlevel% equ 0 (
    echo ✅ Banco criado com sucesso!
) else (
    echo ⚠️  Aviso ao criar banco
)

REM ====================================
REM CONFIGURAR .env
REM ====================================
echo.
echo [3] Configurando arquivo .env...

if not exist ".env" (
    echo ❌ Arquivo .env nao encontrado!
    echo.
    echo Copie .env.example para .env primeiro
    pause
    exit /b 1
)

REM Backup
copy ".env" ".env.backup" >nul 2>&1

REM Criar string de conexao
if "!MYSQL_ROOT_PASS!"=="" (
    set DB_URL=mysql://root@localhost:3306/site_psicolog
) else (
    set DB_URL=mysql://root:!MYSQL_ROOT_PASS!@localhost:3306/site_psicolog
)

REM Substituir em .env usando arquivo temporario
(for /f "delims=" %%A in (.env) do (
    if "%%A"=="" (
        echo.
    ) else if "!%%A:~0,14!"=="DATABASE_URL=" (
        echo DATABASE_URL=!DB_URL!
    ) else (
        echo %%A
    )
)) > ".env.tmp"
move /y ".env.tmp" ".env" >nul 2>&1

echo ✅ .env configurado!

REM ====================================
REM EXECUTAR MIGRATIONS
REM ====================================
echo.
echo [4] Executando migrations...
echo.

call npm run db:push

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migrations executadas com sucesso!
) else (
    echo.
    echo ⚠️  Erro ao executar migrations
    echo.
    echo Tente executar manualmente:
    echo   npm run db:push
)

REM ====================================
REM CRIAR USUARIO ADMIN
REM ====================================
echo.
echo [5] Criando usuario admin...
echo.

call npm run setup:admin

REM ====================================
REM RESUMO FINAL
REM ====================================
cls
echo ====================================
echo ✅ INSTALACAO CONCLUIDA!
echo ====================================
echo.
echo Configuracao do Banco:
echo   Host: localhost
echo   Porta: 3306
echo   Usuario: root
echo   Senha: !MYSQL_ROOT_PASS!
echo   Banco: site_psicolog
echo.
echo Arquivo .env foi configurado e backup salvo em .env.backup
echo.
echo ====================================
echo PROXIMOS PASSOS
echo ====================================
echo.
echo 1. Abra uma janela do CMD (ou use esta)
echo    cd "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"
echo.
echo 2. Inicie o servidor:
echo    npm run dev
echo.
echo    Ou use o script:
echo    START_DEV.bat
echo.
echo 3. Acesse Settings:
echo    http://localhost:5173/admin/settings
echo.
echo 4. Teste salvando dados - devem persistir!
echo.
echo ====================================
echo.
pause
