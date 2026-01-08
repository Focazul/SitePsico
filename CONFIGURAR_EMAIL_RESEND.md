# Como Configurar Email Próprio no Resend

## Problema Atual

O email está configurado como `onboarding@resend.dev` (domínio de teste) que só envia para o email cadastrado na conta Resend.

**Resultado:** Emails para outros destinatários falham.

## Solução 1: Domínio Próprio (Recomendado)

### 1. Acesse o Resend Dashboard
https://resend.com/domains

### 2. Adicione seu domínio
- Clique em "Add Domain"
- Digite seu domínio (ex: `seunome.com.br`)

### 3. Configure DNS
Adicione os registros DNS fornecidos pelo Resend:
- TXT para verificação
- MX para recebimento
- CNAME para envio (SPF/DKIM)

### 4. Verifique o domínio
- Aguarde propagação DNS (5-30 minutos)
- Clique em "Verify" no dashboard

### 5. Atualize o .env
```env
RESEND_FROM_EMAIL=contato@seudominio.com.br
# ou
RESEND_FROM_EMAIL=noreply@seudominio.com.br
```

## Solução 2: Usar Email Verificado (Temporário)

Se não tiver domínio próprio ainda:

### 1. Verifique seu email pessoal
- Acesse https://resend.com/emails
- Clique em "Verify Email Address"
- Digite seu email (ex: marcelopsico07@gmail.com)
- Confirme no email recebido

### 2. Atualize o .env
```env
RESEND_FROM_EMAIL=marcelopsico07@gmail.com
```

**⚠️ Limitação:** Com email verificado você pode enviar para qualquer um, mas:
- Limite de 100 emails/dia
- Pode cair em spam
- Não é profissional

## Solução 3: Subdomínio Gratuito do Resend (Para Testes)

Durante desenvolvimento, o `onboarding@resend.dev` funciona apenas para:
- O email cadastrado na sua conta
- Emails que você adicionar em "Sandbox Recipients"

### Adicionar Recipients para Teste:
1. Acesse https://resend.com/settings/audiences
2. Adicione emails de teste (ex: marcelo_junho.891012@live.com)
3. Esses emails poderão receber durante desenvolvimento

## Recomendação

**Para produção:** Use Solução 1 (domínio próprio)
**Para testes:** Use Solução 3 (adicionar recipients)
**Para MVP rápido:** Use Solução 2 (email verificado)

## Após Configurar

Reinicie o servidor:
```bash
# Feche as janelas do Backend/Frontend
# Execute novamente:
INICIAR.bat
```

## Verificar se Funcionou

1. Envie um email de teste pelo formulário de contato
2. Verifique nos Logs de Emails do admin
3. Status deve aparecer como "Enviado" ✅
