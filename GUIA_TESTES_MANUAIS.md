# 📋 **GUIA DE TESTES MANUAIS - PRODUÇÃO**

## ✅ **CHECKLIST DE TESTES**

### **1️⃣ BACKEND STATUS**
- [ ] Backend responde: https://backend-production-4a6b.up.railway.app/
- [ ] Status: 200 OK
- [ ] Versão: Nova (com password reset)

---

### **2️⃣ AUTENTICAÇÃO BÁSICA**

#### **Login**
1. Acesse: https://psicologo-sp-site.vercel.app/login
2. Tente login com credenciais erradas (5x)
   - Email: `teste@teste.com`
   - Senha: `senhaerrada`
   - **Esperado**: Depois de 5 tentativas, deve mostrar "Too many requests"
3. Aguarde 15 minutos e tente novamente
   - **Esperado**: Deve permitir novo login

#### **Login Admin**
1. Email: `admin@psicologo.com`
2. Senha: `[sua senha de admin]`
3. **Esperado**: Redireciona para `/admin/dashboard`

---

### **3️⃣ PASSWORD RESET FLOW**

#### **Solicitar Reset**
1. Acesse: https://psicologo-sp-site.vercel.app/login
2. Clique em "Esqueceu a senha?"
3. Digite: `admin@psicologo.com`
4. Clique em "Enviar"
5. **Esperado**: Mensagem de sucesso + email enviado

#### **Verificar Email**
1. Abra o email em: `admin@psicologo.com`
2. **Esperado**: Email com assunto "Recuperação de Senha"
3. **Conteúdo esperado**:
   - Link de reset: `https://psicologo-sp-site.vercel.app/reset-password?token=...&email=...`
   - Validade: 24 horas

#### **Resetar Senha**
1. Clique no link do email
2. Digite nova senha (mínimo 8 caracteres)
3. Confirme a senha
4. Clique em "Alterar Senha"
5. **Esperado**: Mensagem de sucesso + redirect para `/login`

#### **Testar Nova Senha**
1. Faça login com a nova senha
2. **Esperado**: Login bem-sucedido

---

### **4️⃣ ADMIN DASHBOARD**

#### **Navegação**
- [ ] `/admin/dashboard` - Overview carrega
- [ ] `/admin/appointments` - Lista de agendamentos
- [ ] `/admin/posts` - Gerenciar blog posts
- [ ] `/admin/messages` - Mensagens de contato
- [ ] `/admin/emails` - Logs de emails
- [ ] `/admin/settings` - Configurações do site
- [ ] `/admin/calendar` - Google Calendar
- [ ] `/admin/pages` - Páginas dinâmicas

#### **Funcionalidades Settings**
1. Acesse: `/admin/settings`
2. Altere o nome do site
3. Clique em "Salvar"
4. **Esperado**: Mensagem de sucesso
5. Recarregue a página
6. **Esperado**: Nova configuração aparece

---

### **5️⃣ PÁGINAS PÚBLICAS**

#### **Home**
- [ ] Acesse: https://psicologo-sp-site.vercel.app/
- [ ] Carrega em <3 segundos
- [ ] Todas as imagens aparecem
- [ ] WhatsApp flutuante aparece no canto inferior direito

#### **Blog**
- [ ] Acesse: `/blog`
- [ ] Lista de posts aparece
- [ ] Clique em um post
- [ ] **Esperado**: Carrega página do post

#### **Contato**
1. Acesse: `/contato`
2. Preencha o formulário:
   - Nome: Teste
   - Email: teste@teste.com
   - Mensagem: Testando formulário de contato
3. Clique em "Enviar"
4. **Esperado**: Mensagem de sucesso
5. Vá para `/admin/messages`
6. **Esperado**: Nova mensagem aparece

#### **Agendamento**
1. Acesse: `/agendamento`
2. Preencha os dados:
   - Nome: Teste
   - Email: teste@teste.com
   - Data: [próxima semana]
   - Horário: 10:00
3. Clique em "Agendar"
4. **Esperado**: Mensagem de sucesso
5. Vá para `/admin/appointments`
6. **Esperado**: Novo agendamento aparece

---

### **6️⃣ RATE LIMITING**

#### **Login Rate Limit (5/15min)**
1. Tente login com credenciais erradas 6 vezes seguidas
2. **Esperado**: 
   - Tentativas 1-5: "Credenciais inválidas"
   - Tentativa 6: "Muitas tentativas, aguarde 15 minutos"

#### **Password Reset Rate Limit (3/1hr)**
1. Solicite reset de senha 4 vezes seguidas
2. **Esperado**:
   - Tentativas 1-3: Email enviado
   - Tentativa 4: "Muitas tentativas, aguarde 1 hora"

---

### **7️⃣ SEGURANÇA**

#### **Headers de Segurança**
1. Abra DevTools (F12)
2. Vá para Network
3. Recarregue a página
4. Clique em qualquer request
5. Vá para Headers
6. **Verificar**:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Strict-Transport-Security: max-age=...`
   - `X-XSS-Protection: 1; mode=block`

#### **HTTPS**
- [ ] URL começa com `https://`
- [ ] Cadeado aparece no navegador
- [ ] Certificado válido

---

### **8️⃣ PERFORMANCE**

#### **Lighthouse Audit** (Chrome DevTools)
1. Abra DevTools (F12)
2. Vá para "Lighthouse"
3. Selecione:
   - [x] Performance
   - [x] Accessibility
   - [x] Best Practices
   - [x] SEO
4. Clique em "Analyze page load"
5. **Meta**: Todos os scores > 85

#### **Core Web Vitals**
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

---

### **9️⃣ RESPONSIVIDADE**

#### **Mobile**
1. Abra DevTools (F12)
2. Clique no ícone de mobile (Ctrl+Shift+M)
3. Teste dispositivos:
   - iPhone 12/13/14
   - Samsung Galaxy S20/S21
   - iPad
4. **Verificar**:
   - Menu hamburger funciona
   - Formulários são usáveis
   - Botões têm tamanho adequado
   - Texto legível sem zoom

---

### **🔟 EMAIL SENDING**

#### **Resend Integration**
1. Vá para: https://resend.com/emails
2. Verifique emails recentes
3. **Esperado**:
   - Email de password reset enviado
   - Email de confirmação de contato
   - Email de novo agendamento

#### **Logs de Email**
1. Acesse: `/admin/emails`
2. **Verificar**:
   - Todos os emails enviados aparecem
   - Status: "sent" ou "delivered"
   - Sem erros de envio

---

## 📊 **RESUMO DE APROVAÇÃO**

### **Critérios para passar:**
- ✅ Todas as páginas carregam sem erro 404/500
- ✅ Login funciona com admin
- ✅ Password reset completo funciona (solicitar + resetar + login)
- ✅ Rate limiting bloqueia após limite
- ✅ Settings podem ser editados
- ✅ Formulários salvam no database
- ✅ Lighthouse score > 85
- ✅ Emails sendo enviados
- ✅ Sem erros no console do navegador
- ✅ Responsivo em mobile

---

## 🐛 **REPORTAR BUGS**

Ao encontrar um bug, registre:
1. **URL** onde ocorreu
2. **Ação** que estava fazendo
3. **Erro** que apareceu (screenshot)
4. **Browser** e versão
5. **Console logs** (F12 > Console)

---

## ✅ **STATUS DOS TESTES**

| Categoria | Status | Notas |
|-----------|--------|-------|
| Backend Online | ⏳ | Deploy em andamento |
| Login | ⏳ | Aguardando backend |
| Password Reset | ⏳ | Aguardando backend |
| Admin Dashboard | ✅ | Funcionando |
| Páginas Públicas | ✅ | Funcionando |
| Rate Limiting | ⏳ | Aguardando backend |
| Emails | ⏳ | Aguardando teste |
| Lighthouse | 🔜 | Próximo |
| Responsividade | 🔜 | Próximo |

---

**Última atualização**: 10/01/2026
**Deploy em andamento**: Railway backend (npm ci + build)
