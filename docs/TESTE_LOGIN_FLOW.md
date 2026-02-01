## 🧪 TESTE DE FLUXO DE LOGIN -> ADMIN

### Pré-requisitos
- Servidor rodando: `npm run dev`
- Admin criado: `marcelopsico07@gmail.com` / `Psico@123`
- Browser com DevTools aberto

### Passo 1: Verificar rota pública
**URL:** `http://localhost:5173/login`
**Esperado:**
- [ ] Página de login carrega sem erros
- [ ] Campos de email/senha vazios
- [ ] Botão "Entrar" está habilitado
- [ ] Console deveria ter logs do tipo `[Login] Verificando autenticação...`

### Passo 2: Fazer login
**Ação:** 
- Email: `marcelopsico07@gmail.com`
- Senha: `Psico@123`
- Clicar "Entrar"

**Esperado:**
- [ ] Botão muda para "Entrando..." com spinner
- [ ] Console mostra: `[Login] Attempting login with email: marcelopsico07@gmail.com`
- [ ] Após 1-2 segundos, redireciona para `/admin/dashboard`
- [ ] Console mostra: `[Login] Login successful, redirecting to /admin/dashboard`

### Passo 3: Verificar Dashboard carrega
**URL:** `http://localhost:5173/admin/dashboard`
**Esperado:**
- [ ] Dashboard carrega sem erro (não redireciona de volta para login)
- [ ] Console mostra: `[ProtectedRoute] User authenticated and authorized, allowing access`
- [ ] Métricas aparecem na tela:
  - Agendamentos
  - Pendentes
  - Confirmados
  - Mensagens

### Passo 4: Testar navegação
**Ação:** Clicar em links de navegação (Agendamentos, Posts, Mensagens, etc)

**Esperado:**
- [ ] Cada página carrega corretamente
- [ ] Não há redirecionamentos para `/login`
- [ ] URL muda (ex: `/admin/posts`, `/admin/messages`)
- [ ] Conteúdo da página é diferente para cada rota

### Passo 5: Testar acesso não-autenticado
**Ação:** Abrir nova aba anônima e ir para `/admin/dashboard`

**Esperado:**
- [ ] Redireciona para `/login` imediatamente
- [ ] Console mostra: `[ProtectedRoute] No user data, redirecting to /login`

### Passo 6: Testar logout
**Ação:** Procurar botão de logout (provavelmente no Settings ou top menu)
- Clique no botão de logout

**Esperado:**
- [ ] Redireciona para `/login`
- [ ] Tentando acessar `/admin/dashboard` novamente redireciona para `/login`

### Passo 7: Verificar cookies
**DevTools → Application → Cookies**

**Esperado:**
- [ ] Após login: existe cookie com nome similar a `next-auth` ou configurado
- [ ] Cookie tem atributos: `HttpOnly`, `Secure` (em HTTPS), `SameSite=None`
- [ ] Após logout: cookie é deletado ou vazio

---

## 📊 Roteamento Esperado

```
LOGIN FLOW:
/login (público)
  ↓ (autenticado)
/admin/dashboard (protegido)
  → /admin/appointments
  → /admin/posts
  → /admin/messages
  → /admin/calendar
  → /admin/emails
  → /admin/communication
  → /admin/pages
  → /admin/settings

NÃO AUTENTICADO:
qualquer /admin/* → redireciona para /login
```

---

## 🔍 Debug

Se tiver problemas, verificar:

1. **Console do Browser**
   - Procurar por `[ProtectedRoute]`, `[Login]` logs
   - Procurar por erros de rede (404, 500)

2. **DevTools → Network**
   - Chamar `/trpc/auth.me` e verificar se retorna user data
   - Verificar se login mutation (`/trpc/auth.login`) retorna sucesso

3. **DevTools → Application → Cookies**
   - Verificar se cookie está sendo criado após login
   - Verificar if cookie está sendo enviado em próximas requisições

4. **Backend Logs**
   - Procurar por erros de banco de dados
   - Verificar se sessão está sendo salva

---

## ✅ Checklist de Sucesso

- [ ] Login → Dashboard funciona
- [ ] Navegação entre admin pages funciona
- [ ] Não autenticado redireciona para login
- [ ] Build compila sem erros
- [ ] Código foi commitado no GitHub
