# 🧠 Site Psicólogo SP - Sistema Completo

Site profissional para consultório de psicologia com sistema de agendamento, blog e painel administrativo.

---

## 🚀 **PRODUÇÃO (LIVE)**

### **Frontend** 
🔗 https://psicologo-sp-site.vercel.app

- React 19 + TypeScript + Vite
- Tailwind CSS 4 + Radix UI
- Animações com Framer Motion
- Sistema de autenticação completo
- Admin Dashboard responsivo

### **Backend**
🔗 https://backend-production-4a6b.up.railway.app

- Node.js 22 + Express + tRPC
- MySQL (Railway)
- Drizzle ORM
- Rate Limiting + Helmet Security
- Email via Resend
- Google Calendar integration

---

## 📁 **ESTRUTURA DO PROJETO**

```
primeiras ideias/
├── client/                    # Frontend (React)
│   ├── src/
│   │   ├── pages/            # Páginas públicas + admin
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Context API (Theme, Booking, etc)
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilitários (tRPC client, etc)
│   ├── public/               # Assets estáticos
│   └── index.html
│
├── server/                    # Backend (tRPC API)
│   ├── _core/                # Core logic
│   │   ├── index.ts         # Express server + middleware
│   │   ├── auth.ts          # Sistema de autenticação
│   │   ├── email.ts         # Envio de emails (Resend)
│   │   ├── sanitize.ts      # Sanitização HTML
│   │   └── ...
│   ├── routers/              # tRPC routers (API endpoints)
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   ├── blog.ts
│   │   └── ...
│   ├── db.ts                 # Database queries (Drizzle)
│   └── index.ts              # Entry point
│
├── drizzle/                   # Database
│   ├── schema.ts             # Database schema
│   ├── 0000_*.sql           # Migrations
│   └── ...
│
├── shared/                    # Código compartilhado
│   ├── types.ts              # TypeScript types
│   └── const.ts
│
├── tests/                     # Testes
│   ├── auth.test.ts
│   ├── contact.test.ts
│   └── ...
│
├── .env.example              # Template de variáveis
├── package.json              # Dependências
├── nixpacks.toml             # Configuração Railway
├── vercel.json               # Configuração Vercel
├── drizzle.config.ts         # Configuração Drizzle ORM
├── vite.config.ts            # Configuração Vite
└── tsconfig.json             # TypeScript config
```

---

## ⚙️ **VARIÁVEIS DE AMBIENTE**

### **Backend (.env)**
```bash
# Database
DATABASE_URL=mysql://user:pass@host:port/db

# Auth
JWT_SECRET=your-secret-key
CSRF_SECRET=your-csrf-secret

# Email
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Google Calendar (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# S3 Storage (opcional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=

# Ambiente
NODE_ENV=production
PORT=3000
```

### **Frontend (Vercel)**
```bash
VITE_API_URL=https://backend-production-4a6b.up.railway.app
NODE_ENV=production
```

---

## 🛠️ **DESENVOLVIMENTO LOCAL**

### **1. Clone e Instale**
```bash
cd "primeiras ideias"
npm install
```

### **2. Configure .env**
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

### **3. Database Setup**
```bash
# Aplicar migrations
npm run db:push

# Criar admin (opcional)
node scripts/insert_admin_final.mjs
```

### **4. Iniciar Dev**
```bash
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

## 📦 **DEPLOY**

### **Frontend (Vercel)**
```bash
npm run build
vercel --prod
```

### **Backend (Railway)**
```bash
railway up
# ou via Git push (auto-deploy configurado)
```

---

## 🔐 **SEGURANÇA**

- ✅ **Rate Limiting**: 5 tentativas/15min (login), 3/1hr (password reset)
- ✅ **Helmet**: CSP, HSTS, XSS Protection
- ✅ **CORS**: Apenas domínio Vercel autorizado
- ✅ **Sanitização**: HTML input sanitization
- ✅ **Password Hashing**: Scrypt
- ✅ **Session Cookies**: httpOnly, secure, sameSite

---

## 📄 **PÁGINAS DISPONÍVEIS**

### **Públicas**
- `/` - Home
- `/sobre` - Sobre o psicólogo
- `/servicos` - Serviços oferecidos
- `/blog` - Blog posts
- `/contato` - Formulário de contato
- `/agendamento` - Agendamento de consultas

### **Autenticação**
- `/login` - Login
- `/forgot-password` - Recuperação de senha
- `/reset-password` - Redefinir senha

### **Admin** (Requer login como admin)
- `/admin/dashboard` - Overview
- `/admin/appointments` - Gerenciar agendamentos
- `/admin/posts` - Gerenciar blog
- `/admin/messages` - Mensagens de contato
- `/admin/emails` - Logs de emails
- `/admin/calendar` - Google Calendar
- `/admin/settings` - Configurações do site
- `/admin/pages` - Gerenciar páginas dinâmicas

---

## 🧪 **TESTES**

```bash
# Rodar todos os testes
npm test

# Rodar com coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 📊 **TECNOLOGIAS**

### **Frontend**
- React 19.2
- TypeScript 5.9
- Vite 7.1
- Tailwind CSS 4.1
- Radix UI (43 componentes)
- Framer Motion 12
- TanStack Query 5
- Wouter (routing)
- Zod 4 (validação)

### **Backend**
- Node.js 22
- Express 4.21
- tRPC 11.6
- Drizzle ORM 0.44
- MySQL 3.15
- express-rate-limit
- helmet 8.1
- sanitize-html 2.17

### **DevOps**
- Railway (backend + MySQL)
- Vercel (frontend)
- Nixpacks (build system)
- Drizzle Kit (migrations)

---

## 👤 **USUÁRIO ADMIN PADRÃO**

```
Email: admin@psicologo.com
Senha: [definida durante setup]
Role: admin
```

---

## 📞 **SUPORTE**

Para dúvidas ou problemas, verifique:
- Build logs: https://railway.com/project/[ID]/logs
- Vercel logs: https://vercel.com/[project]/deployments
- Database: Railway MySQL dashboard

---

## 📝 **LICENSE**

MIT License - Livre para uso pessoal e comercial

---

**Desenvolvido com ❤️ para psicólogos profissionais**
