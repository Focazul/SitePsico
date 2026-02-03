# 🚀 GUIA: CONFIGURAÇÃO FINAL SUPABASE + RENDER

## ✅ O que foi feito

1. ✅ **Schema PostgreSQL Completo**
   - Todas as tabelas estão prontas para Supabase

2. ✅ **Backend Convertido**
   - server/db.ts: usa postgres-js
   - server/_core/migrate.ts: drizzle-orm/postgres-js
   - server/seed.ts: cria admin

3. ✅ **Ambiente de Produção**
   - .env.production preparado para Supabase

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

# 3. Crie o admin:
npm run seed

# 4. Verifique conexão:
npm run db:verify
```

### 3️⃣ Configurar Render (Deploy do App)

```bash
# No painel Render, configure variáveis de ambiente:
VITE_API_URL=https://seu-app.onrender.com
VITE_APP_URL=https://seu-app.onrender.com
VITE_GOOGLE_ANALYTICS_ID=seu_id
```

### 4️⃣ Configurar Backend no Render (Web Service)

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres
RESEND_API_KEY=seu_api_key
ADMIN_EMAIL=seu_email
ADMIN_PASSWORD=sua_senha
JWT_SECRET=gere_novo_secret
```

## 📋 CHECKLIST FINAL

- [ ] Supabase PostgreSQL está online
- [ ] .env local contém DATABASE_URL correto do Supabase
- [ ] npm run db:push executado com sucesso
- [ ] npm run seed criou usuário admin
- [ ] npm run dev funciona localmente
- [ ] Deploy no Render iniciado
- [ ] Variáveis de ambiente configuradas no Render

## ⚠️ IMPORTANTE

- Gere um novo JWT_SECRET antes de produção.
- Configure RESEND_API_KEY para envio de emails.
- Configure Google Calendar se usar agendamentos integrados.
