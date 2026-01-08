# 🧪 CHECKLIST DE TESTE - Configurações Dinâmicas

## ✅ TESTES OBRIGATÓRIOS

### 1. PAINEL ADMIN - SALVAMENTO
- [ ] Acessar `http://localhost:5173/admin/settings`
- [ ] Preencher todos os campos:
  ```
  Nome: Dr. Marcelo Silva
  CRP: 06/123456
  Email: contato@marcelopsi.com.br
  Telefone: (11) 98765-4321
  WhatsApp: 5511987654321
  Endereço: Rua Exemplo, 123 - Pinheiros, São Paulo - SP
  Instagram: https://instagram.com/marcelo.psi
  LinkedIn: https://linkedin.com/in/marcelo-silva
  Horários: Seg a Sex — 9h às 18h
  Preço: R$ 180,00
  Sobre (texto): Sou psicólogo com 10 anos de experiência em atendimento clínico...
  ```
- [ ] Clicar em "Salvar Configurações"
- [ ] Verificar mensagem de sucesso

---

### 2. HOME PAGE - Verificações

#### 2.1 Seção Hero
- [ ] Nome "Dr. Marcelo Silva" aparece no título ou texto principal
- [ ] Texto "Sobre" personalizado aparece
- [ ] Badge mostra "06/123456 Ativo"

#### 2.2 Seção "Sobre Mim"
- [ ] Foto de perfil com nome "Dr. Marcelo Silva"
- [ ] CRP "06/123456" abaixo do nome
- [ ] Biografia completa aparece (HTML renderizado)
- [ ] Card "Registro Profissional" mostra "06/123456"

---

### 3. PÁGINA DE CONTATO
- [ ] Card "Endereço" mostra "Rua Exemplo, 123 - Pinheiros, São Paulo - SP"
- [ ] Card "Email" mostra "contato@marcelopsi.com.br"
- [ ] Card "Telefone" mostra "(11) 98765-4321"
- [ ] Card "Horários" mostra "Seg a Sex — 9h às 18h"

---

### 4. PÁGINA DE SERVIÇOS
- [ ] Seção "Valores" mostra "R$ 180,00"
- [ ] Texto não está mais "placeholder"

---

### 5. HEADER (Todas as páginas)
- [ ] Logo mostra "Psicologia"
- [ ] Nome "Dr. Marcelo Silva" aparece ao lado do logo
- [ ] CRP "06/123456" abaixo do nome

---

### 6. FOOTER (Todas as páginas)
- [ ] Nome "Dr. Marcelo Silva" na primeira coluna
- [ ] CRP "06/123456" na primeira coluna
- [ ] Telefone "(11) 98765-4321" clicável
- [ ] Email "contato@marcelopsi.com.br" clicável
- [ ] Endereço completo aparece
- [ ] Ícone Instagram aparece e redireciona para https://instagram.com/marcelo.psi
- [ ] Ícone LinkedIn aparece e redireciona para https://linkedin.com/in/marcelo-silva

---

### 7. BOTÃO FLUTUANTE WHATSAPP
- [ ] Botão verde aparece no canto inferior direito
- [ ] Clicar no botão → abre WhatsApp Web
- [ ] Número correto: +55 11 98765-4321
- [ ] Mensagem pré-preenchida (se configurada)

**Teste de desabilitação:**
- [ ] No admin, desmarcar "Habilitar botão WhatsApp"
- [ ] Salvar
- [ ] Recarregar site público
- [ ] Botão NÃO deve aparecer

---

### 8. TÍTULO DA PÁGINA (Aba do Navegador)
- [ ] Abrir DevTools (F12)
- [ ] Verificar `document.title`
- [ ] Deve mostrar valor salvo em "Título do Site"
- [ ] Se não preenchido, mostra "Site Profissional - Psicólogo SP"

---

## 🔍 TESTES AVANÇADOS

### Teste 1: Atualização em Tempo Real
1. Abrir site em uma aba
2. Abrir admin em outra aba
3. Alterar nome para "Dra. Ana Costa"
4. Salvar
5. **Recarregar** aba do site público
6. Verificar se nome mudou para "Dra. Ana Costa"

### Teste 2: Campos Vazios (Fallback)
1. No admin, limpar campo "Nome"
2. Salvar
3. Recarregar site
4. Verificar se aparece "Psicólogo(a)" (valor padrão)

### Teste 3: Links Condicionais
1. No admin, apagar Instagram URL
2. Manter LinkedIn URL preenchido
3. Salvar
4. Recarregar site
5. Footer: Instagram NÃO deve aparecer, apenas LinkedIn

### Teste 4: HTML no Texto "Sobre"
1. No admin, campo "Sobre", inserir:
   ```html
   <p>Sou <strong>psicólogo clínico</strong> com experiência em:</p>
   <ul>
     <li>Ansiedade</li>
     <li>Depressão</li>
     <li>Autoestima</li>
   </ul>
   ```
2. Salvar
3. Recarregar Home
4. Verificar se lista aparece formatada na seção "Sobre Mim"

---

## 🐛 TROUBLESHOOTING

### Problema: "Configurações não atualizam no site"
**Solução:**
1. Verificar se backend está rodando (porta 3000)
2. Verificar console do browser (F12)
3. Limpar cache do browser (Ctrl+Shift+R)
4. Verificar se salvamento foi bem-sucedido no admin

### Problema: "Botão WhatsApp não redireciona corretamente"
**Solução:**
1. Verificar formato do número: `5511999999999` (sem espaços, parênteses ou traços)
2. Verificar se `whatsapp_button_enabled` está `true`
3. Testar link manualmente: `https://wa.me/5511987654321`

### Problema: "Nome do psicólogo não aparece no Header"
**Solução:**
1. Verificar se campo "Nome do Psicólogo" foi preenchido no admin
2. Verificar se salvamento foi bem-sucedido
3. Fazer hard refresh (Ctrl+F5)
4. Verificar console por erros de API

### Problema: "Instagram/LinkedIn não aparecem no Footer"
**Solução:**
- Campos vazios no banco → Ícones não renderizam (comportamento esperado)
- Preencher URLs completas: `https://instagram.com/...`

---

## 📊 RESULTADO ESPERADO

✅ **Todas as 25+ verificações passam**  
✅ **Nenhum placeholder `[...]` aparece no site público**  
✅ **Todas as informações vêm do banco de dados**  
✅ **Botão WhatsApp funciona corretamente**  
✅ **Redes sociais aparecem condicionalmente**  
✅ **Site atualiza após mudanças no admin**

---

## 📸 EVIDÊNCIAS RECOMENDADAS

- [ ] Screenshot do admin com campos preenchidos
- [ ] Screenshot da Home com nome correto
- [ ] Screenshot do Footer com contatos dinâmicos
- [ ] Screenshot do WhatsApp abrindo com número correto
- [ ] Video curto mostrando fluxo completo (admin → site público)

---

**Status:** ✅ PRONTO PARA TESTE  
**Tempo estimado:** 10-15 minutos  
**Última atualização:** 04/01/2025
