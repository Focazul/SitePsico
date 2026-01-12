# ⚡ START HERE - COMECE AQUI

## 🎯 Resumo em 30 segundos

Você tem um **site pronto mas com um bug na autenticação CSRF token**. 

- ✅ O código já foi **corrigido**
- ✅ Já foi **deployado** em produção
- ⏳ Agora precisa **testar** e **confirmar que funciona**

---

## 🚀 O QUE FAZER AGORA (15-20 minutos)

### PASSO 1: Abrir a página de login

```
URL: https://psicologo-sp-site.vercel.app/admin/settings
```

Você verá um formulário de login com Email e Senha.

---

### PASSO 2: Abrir DevTools (Ferramentas de Desenvolvedor)

```
Tecla: F12
ou:   Ctrl + Shift + I (Windows/Linux)
ou:   Cmd + Option + I (Mac)
```

Você verá um painel na parte inferior/lado da tela.

---

### PASSO 3: Ir para Console

```
No painel do DevTools, clique em: "Console"
```

---

### PASSO 4: Rodar teste rápido

Cole isso no console (depois de colar, pressione Enter):

```javascript
// Teste rápido CSRF
(async () => {
  try {
    const resp = await fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {
      credentials: 'include',
    });
    const data = await resp.json();
    console.log('✅ CSRF Token:', data.token ? 'OK (' + data.token.substring(0, 15) + '...)' : 'VAZIO');
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
})();
```

---

### PASSO 5: Verificar resultado

Procure no console por uma linha que diz:

```
✅ CSRF Token: OK (primeiros-15-chars...)
```

Se vir isso → **Parabéns! ✅ O CSRF está funcionando!**

Se vir erro → Procure em [Troubleshooting](#troubleshooting)

---

## 📝 CHECKLIST DE CONFIRMAÇÃO

Marque conforme você faz:

- [ ] Conseguiu abrir a URL de login?
- [ ] Conseguiu abrir DevTools (F12)?
- [ ] Conseguiu ver a aba Console?
- [ ] Conseguiu colar o script?
- [ ] O script rodou sem erros de sintaxe?
- [ ] Viu a mensagem "✅ CSRF Token: OK"?

Se todas foram ✅ → **CSRF está funcionando! 🎉**

---

## 🔧 Troubleshooting

### ❌ Script diz "VAZIO"

**Significa**: Token não está sendo gerado

**Solução**:
1. Recarregar página (F5)
2. Rodar o teste novamente
3. Se continuar vazio, ir para próximo item

---

### ❌ Erro: "CORS" ou "403" ou algo similar

**Significa**: Problema de comunicação entre frontend e backend

**Solução**:
1. Recarregar página (Ctrl+F5)
2. Testar em aba **incógnita** (Ctrl+Shift+N)
3. Se ainda falhar, verificar em [Diagnóstico Avançado](#diagnóstico-avançado)

---

### ❌ Console vazio (nada apareceu)

**Significa**: Pode ser erro de sintaxe no script

**Solução**:
1. Verificar se foi colado corretamente
2. Copiar novamente do documento
3. Se ainda não funcionar, usar [Script Alternativo](#scripts-alternativos)

---

## 📊 Se CSRF Está OK - Próximo Passo

Após confirmar que CSRF funciona:

```bash
1. Abrir: Node.js terminal na pasta do projeto
2. Executar: node scripts/create-admin-manual.mjs
3. Isso criará um usuário admin no banco de dados
```

Credenciais padrão:
- 📧 Email: `admin@psicologo.local`
- 🔑 Senha: `Admin@123456`

---

## 🔍 Diagnóstico Avançado

Se você quer mais detalhes, use o **Guia Completo**:

📄 [GUIA_TESTE_RAPIDO.md](./GUIA_TESTE_RAPIDO.md)

Este arquivo tem:
- ✅ Testes detalhados com 3 opções
- ✅ O que procurar na aba Network
- ✅ Como interpretar respostas
- ✅ Checklist completo de diagnóstico
- ✅ Todos os cenários possíveis

---

## 🛠️ Scripts Alternativos

Se o script acima não funcionar, tente estes:

### Alternativa 1 - Super simples

```javascript
fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {credentials: 'include'}).then(r => r.json()).then(d => console.log(d));
```

### Alternativa 2 - Com mais info

```javascript
const url = 'https://backend-production-4a6b.up.railway.app/api/csrf-token';
const opts = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };
fetch(url, opts).then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', Object.fromEntries(r.headers));
  return r.json();
}).then(d => {
  console.log('Data:', d);
  if (d.token) console.log('✅ Token OK');
  else console.log('❌ Sem token');
}).catch(e => console.error('🔴 Erro:', e));
```

### Alternativa 3 - Teste completo

```javascript
async function testarCSRF() {
  console.log('🧪 Iniciando teste...');
  try {
    // 1. Obter token
    const t1 = await fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {credentials: 'include'});
    const d1 = await t1.json();
    console.log('1️⃣ Token:', d1.token?.substring(0,10) + '...');
    
    // 2. Tentar login com ele
    const t2 = await fetch('https://backend-production-4a6b.up.railway.app/api/trpc/auth.login', {
      method: 'POST',
      credentials: 'include',
      headers: {'X-CSRF-Token': d1.token, 'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'admin@psicologo.local', password: 'Admin@123456'})
    });
    console.log('2️⃣ Response:', t2.status);
    console.log('3️⃣ Resultado:', await t2.json());
  } catch(e) {
    console.error('❌ Erro:', e.message);
  }
}
testarCSRF();
```

---

## 📞 Contato/Suporte

Se encontrar problema não listado aqui:

1. **Salvar screenshot** do erro
2. **Copiar** a mensagem de erro exata
3. **Reportar** com os dados do item [Diagnóstico Avançado](#diagnóstico-avançado)

---

## ✅ Status Atual do Projeto

```
AUTENTICAÇÃO:
├─ Backend: ✅ Respondendo (csrf-token endpoint)
├─ Frontend: ✅ Enviando (X-CSRF-Token header)
├─ Validação: ✅ Implementada (server/_core/csrf.ts)
└─ Teste: ⏳ Aguardando sua confirmação (AGORA!)

ADMIN USER:
├─ Existência: ❌ Precisa criar
├─ Script: ✅ Pronto (scripts/create-admin-manual.mjs)
└─ Próximo: Após CSRF estar OK

DEPLOYMENT:
├─ Frontend: ✅ Vercel (c4de741, 1735d1c, 1d2b9be)
├─ Backend: ✅ Railway
└─ Banco: ✅ MySQL

PRÓXIMA FASE:
├─ Google Calendar sync
├─ Email automation
├─ Blog search
└─ Admin panels
```

---

## ⏱️ Tempo Total

- **Este teste**: 5-10 minutos
- **Criar admin**: 10 minutos (se CSRF OK)
- **Testar login**: 5 minutos
- **Total**: ~20-25 minutos

---

## 🎓 Para Entender Melhor

Se você quer aprender o que foi feito:

📚 [AUDITORIA_COMPLETA.md](./AUDITORIA_COMPLETA.md) - Visão geral completa do projeto

🔧 [PLANO_CSRF_TOKEN.md](./PLANO_CSRF_TOKEN.md) - Plano técnico detalhado

📝 [STATUS_PROJETO.md](./STATUS_PROJETO.md) - Status executivo

---

**🟢 Você está pronto para começar!**

Abra seu navegador, vá para a URL e teste agora! 🚀
