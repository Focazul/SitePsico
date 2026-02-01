# 🚀 GUIA: CONFIGURAÇÃO FINAL SUPABASE + VERCEL

## ✅ O que foi feito

1. ✅ **Schema PostgreSQL Completo**
   - Convertido de MySQL para PostgreSQL (pgTable, serial(), pgEnum)
   - Removidos .onUpdateNow() incompatíveis com PostgreSQL
   - Todas as 8 tabelas atualizadas

2. ✅ **Backend Convertido**
   - server/db.ts: Agora usa postgres-js driver
   - server/_core/migrate.ts: Migra para drizzle-orm/postgres-js
   - server/seed.ts: Cria admin "marcelo" com senha "1234"

3. ✅ **Ambiente de Produção**
   - .env.production: Configurado para Supabase PostgreSQL
   - Removidos scripts antigos de MySQL

4. ✅ **GitHub**
   - Repositório atualizado: https://github.com/Focazul/SitePsico
   - Commit 3c16dd4 com todas mudanças

## 🔧 PRÓXIMOS PASSOS (5 MINUTOS)

### 1️⃣ Configurar variáveis de ambiente no Supabase

Vá para: **Supabase Project > Settings > Database > Connection string**

```bash
# Copie a connection string padrão e extraia a senha:
# postgresql://postgres:[PASSWORD]@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres
```

### 2️⃣ Executar migrations no Supabase (LOCAL)

```bash
# 1. Atualize .env com sua senha real do Supabase:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres

# 2. Execute as migrations:
npm run db:push

# 3. Crie o admin 'marcelo:1234':
npm run seed

# 4. Verifique criação do usuário:
npm run db:verify
```

### 3️⃣ Configurar Vercel (Deploy Frontend)

```bash
# 1. No painel Vercel, configure variáveis de ambiente:
VITE_API_URL=https://seu-site.vercel.app
VITE_APP_URL=https://seu-site.vercel.app
VITE_GOOGLE_ANALYTICS_ID=seu_id

# 2. Frontend vai fazer deploy automaticamente
```

### 4️⃣ Configurar Backend em Vercel (API Routes)

```bash
# 1. Configure variáveis de ambiente no Vercel:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres
RESEND_API_KEY=seu_api_key
ADMIN_EMAIL=marcelopsico07@gmail.com
ADMIN_PASSWORD=1234
JWT_SECRET=gere_novo_secret

# 2. Backend faz deploy como API Route (/api/*)
```

## 🧪 TESTE LOCAL

```bash
# 1. Instale dependências
npm install

# 2. Configure .env com senha Supabase
# DATABASE_URL=postgresql://postgres:PASSWORD@...

# 3. Execute migrations
npm run db:push

# 4. Crie admin
npm run seed

# 5. Inicie servidor de desenvolvimento
npm run dev

# 6. Acesse http://localhost:5173
# Login: marcelo
# Senha: 1234
```

## 📋 CHECKLIST FINAL

- [ ] Supabase PostgreSQL está online
- [ ] .env local contém DATABASE_URL correto do Supabase
- [ ] npm run db:push executado com sucesso
- [ ] npm run seed criou usuário 'marcelo:1234'
- [ ] npm run dev funciona localmente
- [ ] Login com marcelo/1234 funciona
- [ ] GitHub repositório está atualizado (commit 3c16dd4)
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy no Vercel iniciado
- [ ] Teste login em produção

## 🔐 SENHAS E CONFIGURAÇÕES IMPORTANTES

**Usuario Padrão:**
- Email: marcelo
- Senha: 1234

**Supabase Connection String:**
```
postgresql://postgres:[PASSWORD]@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres
```

**GitHub Repository:**
```
https://github.com/Focazul/SitePsico
```

## ⚠️ IMPORTANTE

- A senha do usuário admin está em `.env` - mude após primeiro login em produção
- Gere um novo JWT_SECRET com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Configure RESEND_API_KEY para enviar emails
- Configure Google Calendar API para agendamentos

## ❓ TROUBLESHOOTING

**Se npm run db:push falhar:**
- Verifique DATABASE_URL tem a senha correta
- Teste conexão: `npm run db:verify`
- Verifique firewall/VPN

**Se login não funcionar:**
- Verifique se npm run seed foi executado
- Cheque se usuário 'marcelo' existe: `npm run db:list-users`

**Se emails não enviam:**
- Configure RESEND_API_KEY
- Cheque logs em: server/routers/contact.ts

---

**Status:** ✅ Pronto para deploy
**Último commit:** 3c16dd4 (PostgreSQL migration complete)
**Branch:** master
