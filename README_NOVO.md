# 🧠 Site Psicólogo SP - Sistema Completo

Site profissional para consultório de psicologia com sistema de agendamento, blog e painel administrativo.

---

## 🚀 **STACK TECNOLÓGICO 2025**

### **Frontend** 
- React 19 + TypeScript + Vite
- Tailwind CSS 4 + Radix UI
- Animações com Framer Motion

### **Backend**
- Node.js 22 + Express + tRPC
- **PostgreSQL (Supabase)**
- Drizzle ORM

### **Deployment**
- **App (frontend + backend)**: Render (Web Service)
- **Database**: Supabase PostgreSQL

---

## 🔐 **ACESSO RÁPIDO**

| Item | Valor |
|------|-------|
| **GitHub** | https://github.com/Focazul/SitePsico |
| **Email Admin** | marcelo |
| **Senha Admin** | 1234 |
| **Supabase DB** | db.iilroqozupvfxpfzfvtd.supabase.co |

---

## 🏃 **INÍCIO RÁPIDO (5 MINUTOS)**

### 1. Clonar e Instalar

```bash
git clone https://github.com/Focazul/SitePsico.git
cd SitePsico
npm install
```

### 2. Configurar .env

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.iilroqozupvfxpfzfvtd.supabase.co:5432/postgres
RESEND_API_KEY=seu_api_key
ADMIN_EMAIL=marcelo
ADMIN_PASSWORD=1234
```

### 3. Setup Banco de Dados

```bash
npm run db:push        # Aplicar schema
npm run seed           # Criar admin
npm run db:verify      # Testar conexão
```

### 4. Iniciar Desenvolvimento

```bash
npm run dev
# Acesse: http://localhost:5173
# Login: marcelo / 1234
```

---

## 📊 **FEATURES**

✅ Sistema de agendamentos com confirmação por email  
✅ Blog com categorias, tags e busca  
✅ Admin dashboard completo  
✅ Autenticação segura  
✅ Google Calendar integration  
✅ Sistema de contato com notificações  
✅ Análiticas com Google Analytics  

---

## 🔧 **COMANDOS PRINCIPAIS**

```bash
npm run dev              # Frontend + Backend
npm run build           # Build para produção
npm run db:push         # Aplicar schema ao Supabase
npm run db:verify       # Testar conexão DB
npm run seed            # Criar admin marcelo:1234
npm run format          # Formatar código
```

---

## 📚 **DOCUMENTAÇÃO**

- [SUPABASE_RENDER_SETUP.md](docs/SUPABASE_RENDER_SETUP.md) - Guia completo de setup
- [STATUS_PROJETO.md](docs/STATUS_PROJETO.md) - Status do projeto
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Solução de problemas

---

## 🚀 **DEPLOY RENDER**

1. **Conectar GitHub** no painel Render
2. **Criar Web Service** usando o arquivo [render.yaml](render.yaml)
3. **Configurar variáveis de ambiente**:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
   RESEND_API_KEY=seu_api_key
   VITE_API_URL=https://seu-app.onrender.com
   ```
4. **Deploy automático** ao fazer push para `master`

---

## 📞 **SUPORTE**

Verifique [docs/SUPABASE_RENDER_SETUP.md](docs/SUPABASE_RENDER_SETUP.md) para instruções detalhadas de setup e troubleshooting.

---

**Última atualização**: 2025  
**Status**: ✅ Pronto para produção (PostgreSQL + Supabase)  
**Versão**: 1.0.0
