@echo off
chcp 65001 >nul
cls
echo ====================================
echo TESTE SALVAR CONFIGURAÇÕES
echo ====================================
echo.

echo Iniciando servidor...
echo.

cd /d "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"
start "Backend" npm run dev:server
start "Frontend" npm run dev:client

timeout /t 10
cls

echo ====================================
echo TESTE COMPLETO
echo ====================================
echo.
echo 1. Acesse: http://localhost:5173/admin/settings
echo.
echo 2. Preencha:
echo    - Nome: "Maria Silva"
echo    - CRP: "06/123456"
echo    - Especialidade: "Psicodrama"
echo.
echo 3. Clique em "Salvar"
echo.
echo 4. Veja o console aqui com os logs
echo.
pause
