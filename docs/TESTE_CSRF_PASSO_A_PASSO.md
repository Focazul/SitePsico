# 🔧 INSTRUÇÕES PASSO A PASSO - TESTAR AUTENTICAÇÃO COM CSRF

**Data**: 11 de janeiro de 2026  
**Status**: ✅ Deploy com logging melhorado realizado  
**Versão**: c4de741 → 1735d1c (logging aprimorado)

---

## 📋 PASSO 1: PREPARAR O AMBIENTE

### 1.1 Abrir o Browser
```
URL: https://psicologo-sp-site.vercel.app/admin/settings
```

### 1.2 Abrir DevTools
```
Tecla: F12 (ou Ctrl+Shift+I / Cmd+Option+I no Mac)
```

### 1.3 Ir para a Aba "Console"
```
DevTools → Console (aba)
```

**Esperado**: Você verá a página de login com campo de email/senha

---

## 📊 PASSO 2: COLETAR LOGS - TESTE 1

### Objetivo
Verificar se o CSRF token está sendo **obtido** corretamente

### Instruções
1. Na aba **Console**, cole este comando:

```javascript
console.log('🔍 Verificando CSRF token...');
fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => {
  console.log('✅ Status:', r.status);
  console.log('✅ Headers:', { contentType: r.headers.get('Content-Type') });
  return r.json();
})
.then(data => {
  console.log('✅ Token recebido:', data.token ? data.token.substring(0, 20) + '...' : 'VAZIO');
  window.csrfToken = data.token;
})
.catch(e => console.error('❌ Erro:', e));
```

2. Pressione **Enter**

### Esperado
```
✅ Status: 200
✅ Token recebido: [primeiros 20 caracteres]...
```

### Se Retornar Erro
```
❌ Erro: [mensagem]
```
→ **Reportar o erro** para diagnóstico

---

## 📊 PASSO 3: COLETAR LOGS - TESTE 2

### Objetivo
Verificar se o **Network Tab** mostra o header `X-CSRF-Token`

### Instruções
1. Na aba **DevTools** → escolha **Network**
2. **Limpe** os logs clicando no ícone de "lixo"
3. Na página de login, **preencha** os campos:
   - Email: `admin@psicologo.local`
   - Senha: `Admin@123456`
4. Clique em **Entrar**
5. Procure na lista de requisições por `auth.login`

### O Que Procurar
```
Requisição: auth.login (ou similar)
Aba: Headers
Procure por: X-CSRF-Token

Esperado:
✅ X-CSRF-Token: [valor com muitos caracteres hexadecimais]
✅ Content-Type: application/json
✅ Cookies: sessionId=...
```

### Se não encontrar o header
```
❌ X-CSRF-Token ausente
→ Frontend não está enviando o token
```

---

## 📊 PASSO 4: COLETAR LOGS - TESTE 3

### Objetivo
Ver o **console.log** que mostra os detalhes do CSRF

### Instruções
1. Na aba **Console**, procure por linhas iniciadas com:
   ```
   [CSRF] Token obtained successfully
   [tRPC Client] Fetching: 
   [tRPC Client] CSRF token included:
   [tRPC Client] Credentials: include
   [tRPC Client] Final headers:
   ```

### Esperado
```
[CSRF] Token obtained successfully
[tRPC Client] Fetching: https://backend-.../api/trpc
[tRPC Client] CSRF token included: [primeiros 10 chars]...
[tRPC Client] Credentials: include
[tRPC Client] Final headers: X-CSRF-Token,Content-Type,...
[tRPC Client] Response status: 200
```

### Se Retornar Erro
```
[CSRF] Error getting token: Error: Failed to get CSRF token: [status]
→ Não conseguiu obter CSRF token
```

---

## 🎯 PASSO 5: FAZER O LOGIN

### Instruções
1. Se ainda não fez, preencha no formulário de login:
   - **Email**: `admin@psicologo.local`
   - **Senha**: `Admin@123456`

2. Clique em **Entrar**

### Esperado (SUCESSO)
```
✅ Redirect para /admin/dashboard
✅ Painel admin carrega
✅ Sem erros no console
```

### Se Retornar Erro (DIAGNÓSTICO)
Procure no console por erros como:

#### Erro 1: "CSRF: No token provided"
```
❌ Status: 403
❌ Erro: { error: "CSRF token missing" }

Possível causa:
- Frontend não enviou X-CSRF-Token no header
- Token está vazio

Solução: Verificar TESTE 2 acima
```

#### Erro 2: "Email ou senha inválidos"
```
❌ Status: 500
❌ Erro: { message: "Email ou senha inválidos" }

Possível causa:
- ✅ CSRF token funcionando!
- ❌ Admin user não existe no banco

Solução: Executar script para criar admin
```

#### Erro 3: "Unable to transform response"
```
❌ Erro genérico do frontend

Possível causa:
- Response não é JSON válido
- Transformer (superjson) falhou

Solução: Verificar console.error logs
```

---

## 📸 PASSO 6: COLETAR SCREENSHOT

Se houver erro, tire screenshot de:

### Screenshot 1: Console
```
DevTools → Console
Mostra todos os [CSRF], [tRPC], [error] logs
```

### Screenshot 2: Network
```
DevTools → Network
Req POST auth.login → Headers
Mostra se X-CSRF-Token está presente
```

### Screenshot 3: Response
```
DevTools → Network
Req POST auth.login → Response
Mostra exatamente qual é o erro
```

---

## ✅ CHECKLIST DE DIAGNÓSTICO

```
□ Conseguiu obter CSRF token? (Status 200)
□ Token foi recebido (não vazio)?
□ Header X-CSRF-Token aparece no Network?
□ Logs do console mostram [CSRF] e [tRPC]?
□ Login retorna 200 ou 500?
□ Se 500: "Email ou senha" ou outro erro?
```

---

## 🚀 RESULTADO ESPERADO FINAL

### Cenário 1: ✅ TUDO OK
```
1. Abrir https://psicologo-sp-site.vercel.app/admin/settings
2. Preencher email: admin@psicologo.local
3. Preencher senha: Admin@123456
4. Clicar Entrar
5. Redirect para /admin/dashboard ✅
6. Dashboard aparece com dados
```

### Cenário 2: ⚠️ CSRF OK, MAS USUÁRIO NÃO EXISTE
```
1. CSRF token enviado com sucesso ✅
2. Backend retorna: "Email ou senha inválidos"
3. Causa: Admin user não existe no banco
4. Solução: Executar scripts/create-admin-manual.mjs
```

### Cenário 3: ❌ CSRF FALHA
```
1. Backend retorna: "CSRF token missing" (403)
2. Causa: Header não está sendo enviado
3. Solução: Investigar frontend logs
```

---

## 📞 PRÓXIMO PASSO

Após executar os testes acima, me envie:

1. **Qual foi o resultado?**
   - ✅ Funcionando (chegou no admin)?
   - ⚠️ CSRF OK, mas usuário não existe?
   - ❌ Erro de CSRF?

2. **Screenshots dos logs**
   - Console do browser
   - Network tab com request auth.login
   - Response da requisição

3. **Mensagens de erro**
   - Copiar exatamente o que aparece

Com isso poderei:
- Confirmar se a solução funcionou
- Ou fazer ajustes finais
- E passar para próxima fase (criar admin user)

---

**Vamos resolver isso! 🔧**
