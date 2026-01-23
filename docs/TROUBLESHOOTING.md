# 🔧 **TROUBLESHOOTING GUIDE**

## 🐛 **PROBLEMA IDENTIFICADO E CORRIGIDO**

### **Erro**: Backend servindo HTML ao invés da API

#### **Sintomas**:
- ❌ Monitoring dashboard mostra Backend: "Failed to fetch"
- ❌ Auth API retorna `---`
- ❌ Password Reset API retorna `---`
- ✅ Frontend funcionando normalmente (HTTP 200)

#### **Diagnóstico**:
```bash
# Testar backend manualmente:
curl https://backend-production-4a6b.up.railway.app/

# Resultado: Retornava HTML do frontend ao invés de API
```

#### **Causa Raiz**:
1. **Script `start` no package.json usava sintaxe Windows**:
   ```json
   "start": "set NODE_ENV=production&& node dist/index.js"  ❌ Windows only
   ```
   - O comando `set` não existe no Linux/Railway
   - Deploy falhava silenciosamente

2. **Procfile apontava para npm start**:
   ```
   web: npm start  ❌ Executava script com erro
   ```

#### **Solução Aplicada**:
```diff
# package.json
- "start": "set NODE_ENV=production&& node dist/index.js"
+ "start": "NODE_ENV=production node dist/index.js"

# Procfile  
- web: npm start
+ web: node dist/index.js
```

#### **Deploy Corrigido**:
```bash
git add package.json Procfile
git commit -m "fix: correct start script for Linux"
railway up
```

---

## 📊 **COMO ACESSAR LOGS DE ERRO**

### **1. Railway CLI (Local)**
```bash
# Ver logs em tempo real
railway logs

# Ver últimos 100 logs
railway logs --limit 100

# Salvar logs em arquivo
railway logs > logs.txt

# Filtrar apenas erros
railway logs | findstr /I "error failed exception"
```

### **2. Railway Dashboard (Web)**
1. Acesse: https://railway.com/project/90b11734-cb26-4f40-8b9f-9310b4fdaf1e
2. Clique em "backend" service
3. Vá para aba "Deployments"
4. Clique no deployment mais recente
5. Veja "Build Logs" e "Deploy Logs"

### **3. Monitoring Dashboard (Local)**
- Abra: `monitoring-dashboard.html`
- Atualiza a cada 30s automaticamente
- Mostra status de:
  - Frontend (Vercel)
  - Backend (Railway)
  - Auth API
  - Password Reset API

---

## 🔍 **ERROS COMUNS E SOLUÇÕES**

### **Erro: "Failed to fetch" no Backend**

**Possíveis causas**:
1. ✅ Backend offline → Aguardar deploy
2. ✅ CORS bloqueando → Verificar ALLOWED_ORIGINS
3. ✅ Script start errado → Corrigido (NODE_ENV)
4. ⚠️ Port não configurado → Verificar se PORT está no env

**Como verificar**:
```bash
# Testar se backend responde
curl https://backend-production-4a6b.up.railway.app/

# Deve retornar: API tRPC (não HTML)
```

---

### **Erro: "HTTP 404" nos endpoints tRPC**

**Causa**: Código antigo deployado (sem password reset)

**Solução**:
```bash
# 1. Verificar se último commit foi deployado
git log --oneline -1

# 2. Forçar novo deploy
railway up

# 3. Aguardar build (~3-5 minutos)

# 4. Testar novamente
node tests/test-password-reset-prod.mjs
```

---

### **Erro: "Database connection failed"**

**Como verificar**:
```bash
railway logs | grep -i "database\|mysql\|connection"
```

**Possíveis causas**:
1. DATABASE_URL não configurada
2. MySQL service offline
3. Credenciais expiradas

**Solução**:
1. Acesse Railway dashboard
2. Vá em Variables
3. Verifique DATABASE_URL está presente
4. Copie de MySQL service → Variáveis do backend

---

### **Erro: Rate Limiting não funciona**

**Como testar**:
```bash
# Fazer 7 tentativas de login
node tests/test-rate-limiting-prod.mjs

# Esperado: 
# - Tentativas 1-5: HTTP 401 (credenciais inválidas)
# - Tentativas 6-7: HTTP 429 (rate limit)
```

**Se não funcionar**:
1. Verificar se `express-rate-limit` está instalado:
   ```bash
   npm list express-rate-limit
   ```
2. Verificar se middleware está aplicado:
   ```bash
   grep -r "rateLimit" server/_core/index.ts
   ```

---

### **Erro: Emails não sendo enviados**

**Como verificar logs**:
```bash
railway logs | grep -i "email\|resend"
```

**Checklist**:
- [ ] RESEND_API_KEY está configurada no Railway
- [ ] RESEND_FROM_EMAIL está configurada
- [ ] Email de destino é válido
- [ ] Resend dashboard mostra tentativas: https://resend.com/emails

**Testar manualmente**:
```bash
# Via frontend
1. Acesse /forgot-password
2. Digite admin@psicologo.com
3. Clique em "Enviar"
4. Verifique inbox do email
```

---

## 🚨 **ALERTAS CONFIGURADOS**

### **Uptime Monitoring** (Recomendado)
Use serviços gratuitos para alertas:

1. **UptimeRobot** (gratuito):
   - URL: https://uptimerobot.com
   - Monitor: https://backend-production-4a6b.up.railway.app/
   - Alertas: Email quando offline >5 min

2. **Railway Notifications**:
   - Railway dashboard → Settings → Notifications
   - Ativar: Deployment failed, Service crashed

3. **Vercel Notifications**:
   - Vercel dashboard → Settings → Notifications
   - Ativar: Deployment failed

---

## 📝 **LOGS DE DEBUGGING**

### **Ativar modo debug**:
```bash
# Adicionar no Railway Variables
LOG_LEVEL=debug

# Ver logs detalhados
railway logs
```

### **Logs personalizados no código**:
```typescript
// server/_core/index.ts
console.log('🚀 Server started on port:', process.env.PORT);
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔐 CORS allowed origins:', process.env.ALLOWED_ORIGINS);
```

---

## 🎯 **CHECKLIST DE DEPLOY**

Antes de fazer deploy, verificar:

- [ ] `npm run build` passa localmente
- [ ] `npm run check` (TypeScript) sem erros
- [ ] `.env.example` atualizado com novas variáveis
- [ ] Railway Variables sincronizadas
- [ ] Script `start` usa sintaxe Linux (`NODE_ENV=` não `set NODE_ENV=`)
- [ ] Procfile aponta para `node dist/index.js`
- [ ] Git commit + push feito
- [ ] Aguardar build completo (~3-5 min)
- [ ] Testar monitoring dashboard
- [ ] Executar testes automatizados

---

## 📞 **SUPORTE E RECURSOS**

### **Railway**
- Dashboard: https://railway.com/project/90b11734-cb26-4f40-8b9f-9310b4fdaf1e
- Docs: https://docs.railway.app
- Status: https://railway.statuspage.io
- Discord: https://discord.gg/railway

### **Vercel**
- Dashboard: https://vercel.com/focazuls-projects/psicologo-sp-site
- Docs: https://vercel.com/docs
- Status: https://vercel-status.com

### **Resend (Email)**
- Dashboard: https://resend.com/emails
- Docs: https://resend.com/docs
- Status: https://resend.com/status

---

## ✅ **STATUS ATUAL**

| Item | Status | Ação |
|------|--------|------|
| **Script start corrigido** | ✅ | Commit f218add |
| **Procfile corrigido** | ✅ | node dist/index.js |
| **Deploy em andamento** | ⏳ | Aguardando build |
| **Monitoring dashboard** | ✅ | monitoring-dashboard.html |
| **Testes automatizados** | ✅ | tests/*.mjs |
| **Guia de troubleshooting** | ✅ | Este documento |

---

**Última atualização**: 10/01/2026 - 01:45
**Próxima ação**: Aguardar deploy Railway terminar e testar endpoints
