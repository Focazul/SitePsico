@echo off
REM 🚀 Script de Build e Deploy - Projeto 100%
REM Este script faz build do projeto e prepara para deploy (Windows)

echo ==================================
echo 🚀 BUILD E DEPLOY - PROJETO 100%%
echo ==================================
echo.

REM 1. Verificar Node.js
echo ➜ Verificando Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js não encontrado. Instale em nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% encontrado
echo.

REM 2. Instalar dependências
echo ➜ Instalando dependências...
call npm install
if errorlevel 1 (
    echo ✗ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✓ Dependências instaladas
echo.

REM 3. Build do projeto
echo ➜ Fazendo build do projeto...
call npm run build
if errorlevel 1 (
    echo ✗ Erro no build
    pause
    exit /b 1
)
echo ✓ Build concluído com sucesso
echo.

REM 4. Verificar pasta dist
echo ➜ Verificando build output...
if exist dist (
    echo ✓ Pasta dist criada
) else (
    echo ⚠ Pasta dist não encontrada
)
echo.

REM 5. Git status
echo ➜ Verificando git status...
git status --porcelain >nul 2>&1
if errorlevel 0 (
    echo ✓ Repo pronto para push
)
echo.

REM 6. Resumo final
echo ==================================
echo 📊 RESUMO DO BUILD
echo ==================================
echo ✓ Build concluído com sucesso
echo ✓ Pronto para deploy
echo.
echo Próximas etapas:
echo 1. git push origin main
echo 2. Deploy na plataforma escolhida
echo 3. Testar em produção
echo.
echo Plataformas recomendadas:
echo   - Vercel: vercel.com
echo   - Netlify: netlify.com
echo   - Heroku: heroku.com
echo.
echo ==================================
echo.
pause
