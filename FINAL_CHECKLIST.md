# ✅ CHECKLIST - DEPLOY RENDER + SUPABASE

## 📋 O QUE FOI FEITO

- ✅ **Schema PostgreSQL Completo**: Todas 8 tabelas convertidas (pgTable, serial(), pgEnum)
- ✅ **Backend Convertido**: server/db.ts, migrate.ts, seed.ts aguardando Supabase
- ✅ **Ambiente de Produção**: .env.production configurado para Supabase
- ✅ **Documentação**: SUPABASE_RENDER_SETUP.md com instruções passo a passo
- ✅ **Scripts de Setup**: npm run db:verify, npm run seed, npm run setup:supabase
- ✅ **GitHub Atualizado**: Repositório com commits 3c16dd4 e 3b3ba4a
- ✅ **Build Validado**: npm run build compila sem erros (154.8 KB backend + 1.6 MB frontend)

---

## 🎯 PRÓXIMOS PASSOS (PARA VOCÊ)

### ⏱️ TEMPO ESTIMADO: 15 MINUTOS

### 1️⃣ **SUPABASE: Conectar e Criar Tabelas** (3 min)

```bash
# Na raiz do projeto, atualizar .env:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres

# Depois executar:
npm run db:push    # Cria todas as tabelas no Supabase

# Verificar conexão:
npm run db:verify  # Deve mostrar "✅ Conexão estabelecida"
```

**O que fazer:**
1. Ir em Supabase > Settings > Database > Copy Connection String
2. Extrair a senha (entre : e @)
3. Colocar no .env local
4. Executar `npm run db:push`

---

### 2️⃣ **CRIAR ADMIN: marcelo/1234** (2 min)

```bash
# Criar usuário admin
npm run seed

# Verificar criação
npm run db:verify

# Esperado na saída:
# ✅ Admin "marcelo" encontrado!
# Pronto para login no Render ✨
```

---

### 3️⃣ **TESTAR LOCALMENTE** (3 min)

```bash
# Iniciar servidor local
npm run dev

# Acessar http://localhost:5173
# Login com:
#   Email: marcelo
#   Senha: 1234

# Testar funcionalidades:
# - Admin Dashboard
# - Agendamentos
# - Blog
# - Contato
```

---

### 4️⃣ **RENDER: Conectar GitHub** (5 min)

1. Ir em https://dashboard.render.com
2. Selecionar repositório: `Focazul/SitePsico`
3. Criar Web Service usando [render.yaml](render.yaml)
4. Configurar variáveis de ambiente:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres
   RESEND_API_KEY=seu_api_key_real
   VITE_API_URL=https://seu-app.onrender.com
   VITE_APP_URL=https://seu-app.onrender.com
   VITE_GOOGLE_ANALYTICS_ID=seu_id
   ```
5. Iniciar Deploy
6. Aguardar 2-3 minutos para deploy completar

---

### 5️⃣ **TESTAR EM PRODUÇÃO** (2 min)

- Acessar: https://seu-app.onrender.com
- Login com: marcelo / 1234
- Testar todas funcionalidades
- Verificar logs em Render > Logs

---

## 🛠️ CONFIGURAÇÕES IMPORTANTES

### Variáveis de Ambiente OBRIGATÓRIAS

```env
# Supabase (ESSENCIAL)
DATABASE_URL=postgresql://postgres:PASSWORD@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres

# Email (para notificações)
RESEND_API_KEY=re_xxxxxxxxxxxxxx

# Admin (padrão)
ADMIN_EMAIL=marcelo
ADMIN_PASSWORD=1234

# Frontend URLs
VITE_API_URL=https://seu-app.onrender.com
VITE_APP_URL=https://seu-app.onrender.com
```

### Variáveis de Ambiente OPCIONAIS

```env
# Google Calendar (agendamentos)
GOOGLE_CALENDAR_ID=seu@google.com
GOOGLE_PRIVATE_KEY=chave_json

# Google Analytics (estatísticas)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## 🆘 TROUBLESHOOTING

### ❌ npm run db:push falha com erro de senha

```bash
# Solução:
# 1. Copiar connection string do Supabase
# 2. Extrair a senha com cuidado (entre : e @)
# 3. Colocar no .env exato como está
# 4. Tentar novamente
```

### ❌ Login não funciona após deploy

```bash
# Verificar se admin foi criado:
npm run db:verify

# Se não existir, executar localmente:
npm run seed

# Depois fazer deploy novamente
```

### ❌ Emails não estão sendo enviados

```bash
# Verificar RESEND_API_KEY em Render
# Settings > Environment Variables > RESEND_API_KEY

# Testar enviando email via admin dashboard
# Se falhar, verificar logs em Render
```

---

## 📊 STATUS FINAL

| Item | Status | Link |
|------|--------|------|
| **GitHub** | ✅ Pronto | https://github.com/Focazul/SitePsico |
| **Código** | ✅ Compilado | Build 154.8 KB |
| **Schema** | ✅ PostgreSQL | Pronto para push |
| **Admin** | ⏳ Aguardando | npm run seed |
| **Render** | ⏳ Aguardando | Configure env vars |
| **Supabase** | ⏳ Aguardando | npm run db:push |

---

## 🚀 RESUMO DO PROCESSO

```
1. npm run db:push          → Criar tabelas no Supabase
2. npm run seed             → Criar admin marcelo:1234
3. npm run dev              → Testar localmente
4. Conectar GitHub no Render → Deploy automático
5. Configurar env vars      → DATABASE_URL + RESEND_API_KEY
6. Acessar seu-app.onrender.com → Usar marcelo:1234
```

---

## ✨ VOCÊ ESTÁ A 15 MINUTOS DE LANÇAR!

Siga os passos acima e seu site estará em produção.

**Última atualização:** 2025
**Commits:** 3c16dd4, 3b3ba4a
**Branch:** master
**Pronto?** Comece pelo passo 1️⃣!
