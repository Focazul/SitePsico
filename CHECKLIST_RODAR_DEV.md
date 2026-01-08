# Checklist para rodar o projeto em dev

1. MySQL (XAMPP)
   - Verificar se `mysqld.exe` esta rodando (Task Manager ou `tasklist /FI "IMAGENAME eq mysqld.exe"`).
   - Se nao estiver, iniciar pelo XAMPP ou rodar `START_ALL_DEV.bat` (inicia automaticamente).

2. Variaveis de ambiente
   - Garantir que o arquivo `.env` exista e tenha `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, `CSRF_SECRET` e chaves opcionais preenchidas.

3. Backend
   - Rodar `npm run dev:server` na pasta `primeiras ideias`.
   - Backend sobe em `http://localhost:3000/` (log mostra "Server running").

4. Frontend
   - Rodar `npm run dev:client` na pasta `primeiras ideias`.
   - Vite sobe em `http://localhost:5173/` ou `http://localhost:5174/` se 5173 estiver ocupada.

5. Login de teste
   - Acessar `http://localhost:5174/admin` (ou porta usada pelo Vite) e logar com `admin / admin`.

6. Testes rapidos (opcional)
   - Em paralelo, `npm run test` (vitest) para sanity check.

## Comando rapido

Use `START_ALL_DEV.bat` na pasta `primeiras ideias` para abrir MySQL (se preciso), backend e frontend automaticamente.
