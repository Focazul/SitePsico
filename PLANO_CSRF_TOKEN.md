# 🔐 PLANO DE AÇÃO: RESOLVER AUTENTICAÇÃO COM CSRF TOKEN

**Data**: 11 de janeiro de 2026  
**Status**: 🔧 Em Implementação  
**Prioridade**: 🔴 CRÍTICA

---

## 📋 CHECKLIST DE RESOLUÇÃO

### ✅ PARTE 1: VERIFICAR IMPLEMENTAÇÃO ATUAL

- [x] Frontend obtém CSRF token automaticamente
  - Arquivo: `client/src/main.tsx`
  - Função: `getCsrfToken()`
  - Status: ✅ Implementado

- [x] Frontend envia token no header
  - Header: `X-CSRF-Token`
  - Status: ✅ Implementado (lines 39-45)

- [x] Backend valida CSRF token
  - Middleware: `csrfProtectionMiddleware`
  - Arquivo: `server/_core/csrf.ts`
  - Status: ✅ Implementado

- [x] Middleware aplicado na rota `/api/trpc`
  - Arquivo: `server/_core/index.ts` (line 212)
  - Status: ✅ Aplicado

### ⏳ PARTE 2: DIAGNÓSTICO DO PROBLEMA

**Problema Reportado nos Logs do Railway**:
```
[Auth] Missing session cookie
❌ CSRF: No token provided
```

**Possíveis Causas**:

1. **❌ CSRF token não está sendo obtido**
   - Frontend não conseguiu GET /api/csrf-token
   - Possível erro na requisição

2. **❌ CSRF token não está sendo enviado**
   - Header X-CSRF-Token não está no request
   - Valor do token está vazio

3. **❌ Sessão não está sendo mantida**
   - Cookie sessionId não persiste
   - Diferentes cookies entre requisições

4. **❌ Token expirou**
   - Token válido por 1 hora (conforme schema)
   - Validação acontece antes de expiração

---

## 🛠️ PARTE 3: TESTES PARA DIAGNOSTICAR

### Teste 1: Verificar se CSRF token é obtido
```bash
curl -X GET https://backend-production-4a6b.up.railway.app/api/csrf-token \
  -H "Content-Type: application/json" \
  -v

Esperado:
Status: 200 OK
Body: { "token": "..." }
Headers: Set-Cookie (sessionId)
```

### Teste 2: Verificar se token é enviado no header
```javascript
// No console do browser
fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('Token:', data.token);
  return fetch('https://backend-production-4a6b.up.railway.app/api/trpc/auth.login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': data.token
    },
    body: JSON.stringify({
      "0": {
        json: {
          email: "admin@psicologo.local",
          password: "Admin@123456"
        }
      }
    })
  });
})
.then(r => r.json())
.then(data => console.log('Response:', data))
```

### Teste 3: Verificar sesão/cookies
```javascript
// DevTools → Application → Cookies
// Verificar:
// - sessionId cookie está presente?
// - HttpOnly flag?
// - Secure flag?
// - Domain correto?
```

---

## 🔧 PARTE 4: POSSÍVEIS SOLUÇÕES

### Solução 1: Melhorar Logging no Backend
**Objetivo**: Ver exatamente o que está chegando

Adicionar logs detalhados em `server/_core/csrf.ts`:

```typescript
export function csrfProtectionMiddleware(
  req: Request,
  res: Response,
  next: () => void
) {
  console.log("[CSRF Middleware]", {
    method: req.method,
    path: req.path,
    sessionId: req.cookies?.sessionId,
    headerToken: req.headers["x-csrf-token"],
    bodyToken: req.body?.csrfToken,
    cookies: req.cookies,
  });

  // ... resto do código
}
```

### Solução 2: Melhorar Logging no Frontend
**Objetivo**: Ver se token está sendo obtido corretamente

Verificar console do browser:
```
[CSRF] Token obtained successfully
[tRPC Client] Fetching: https://backend-.../api/trpc
[tRPC Client] Response status: 200 (ou erro)
```

### Solução 3: Verificar Cookie Jar
**Problema**: Session cookie pode não estar sendo mantido

```typescript
// Em client/src/main.tsx
async fetch(input, init) {
  console.log("[tRPC] Credentials policy:", init?.credentials);
  // Deve ser: "include"
  
  return globalThis.fetch(input, {
    ...(init ?? {}),
    credentials: "include",  // ← CRÍTICO!
    headers: {
      ...(init?.headers ?? {}),
      "X-CSRF-Token": token,
    },
  });
}
```

### Solução 4: Sincronizar Token entre Requisições
**Problema**: Token pode expirar ou cache pode estar sujo

```typescript
// Invalidar token após cada erro 403
if (response.status === 403) {
  csrfToken = null;  // ← Forçar novo token
}
```

---

## 📝 PARTE 5: AÇÕES A EXECUTAR HOJE

### 1️⃣ Verificar Console do Browser
```
1. Abrir: https://psicologo-sp-site.vercel.app/admin/settings
2. Abrir DevTools (F12)
3. Aba Console
4. Procurar por:
   - "[CSRF] Token obtained successfully"
   - "[tRPC Client]" logs
   - Erros vermelhos
5. Screenshot dos logs
```

### 2️⃣ Verificar Network Tab
```
1. DevTools → Network
2. Tentar fazer login
3. Procurar requisição POST para auth.login
4. Verificar headers:
   - "X-CSRF-Token: [tem valor?]"
   - "Content-Type: application/json"
   - "Cookies: sessionId=..."
```

### 3️⃣ Testar CSRF Token Manualmente
```javascript
// Cole no console do browser:

fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => {
  console.log('✅ CSRF Token:', d.token);
  return d.token;
})
.catch(e => console.error('❌ Erro:', e))
```

### 4️⃣ Verificar Railway Logs
```bash
railway logs | grep -i csrf
railway logs | grep -i auth
```

### 5️⃣ Deploy de Melhorias
Se necessário:
```bash
git add -A
git commit -m "debug: improve CSRF token logging"
npm run build
vercel --prod
```

---

## 🎯 RESULTADO ESPERADO

### ✅ Login Funciona
```
1. Usuário acessa /admin/settings
2. Backend retorna /api/csrf-token com sucesso
3. Frontend inclui X-CSRF-Token no header
4. Backend valida token
5. Login aceito ✓
6. Redirect para /admin/dashboard
```

### ❌ Login Falha (Diagnóstico)
```
Se aparecer erro "CSRF: No token provided":
└─ Token não está sendo enviado no header
   └─ Verificar se `getCsrfToken()` foi chamado
   └─ Verificar se token não é vazio
   └─ Verificar se header está no request
```

---

## 📊 TIMELINE

```
Agora (15 min)    → Coletar logs do browser
+15 min           → Testar CSRF manualmente
+30 min           → Verificar Railway logs
+30 min           → Implementar correções (se necessário)
+15 min           → Testar novamente
+10 min           → Documentar resultado
─────────────────
Total: ~2 horas até resolução
```

---

## 📞 PRÓXIMO PASSO

1. Execute os testes acima
2. Cole os resultados aqui:
   - ✅ Ou ❌ CSRF token foi obtido?
   - ✅ Ou ❌ Header X-CSRF-Token está no request?
   - ✅ Ou ❌ Backend retornou sucesso ou erro?
   - 📸 Screenshot dos logs

3. Com base nos resultados, vou:
   - Ativar logging melhorado no backend
   - Sincronizar token entre requisições
   - Testar novamente
   - Fazer deploy

---

**Vamos resolver isso passo a passo! 🚀**
