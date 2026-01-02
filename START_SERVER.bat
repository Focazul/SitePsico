@echo off
echo ====================================
echo Iniciando Servidor - Phase 4
echo ====================================

REM Navegar para a pasta do projeto
cd /d "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo.
    echo ⚠️  node_modules não encontrado. Instalando dependências...
    call pnpm install
)

echo.
echo ✅ Iniciando servidor de desenvolvimento...
echo.
echo 🌐 A página será aberta em: http://localhost:3000
echo 📝 Pressione Ctrl+C para parar o servidor
echo.

REM Iniciar o servidor
call pnpm run dev
