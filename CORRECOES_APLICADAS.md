# Correções Aplicadas

## 1. Horários não aparecem na tela de agendamento

**Problema identificado:**
A configuração de `availability` estava sendo salva como JSON string, mas sem especificar o tipo como "json" no banco de dados. Isso fazia com que a função `getSettingValue` não fizesse o parse automático do JSON, retornando uma string ao invés de um array.

**Solução aplicada:**
- Arquivo: `client/src/pages/admin/Settings.tsx` (linha 94)
- Alteração: Adicionado `type: "json"` ao salvar a configuração de availability
- Antes: `{ key: "availability", value: JSON.stringify(availability) }`
- Depois: `{ key: "availability", value: JSON.stringify(availability), type: "json" }`

**Resultado:**
Agora quando o servidor buscar os horários disponíveis através da função `getAvailableSlots`, a configuração será corretamente parseada como JSON e os horários configurados aparecerão na tela de agendamento.

---

## 2. Quadrado azul na seção de boas-vindas

**Problema identificado:**
Os pseudo-elementos `::before` e `::after` da classe `.hero-shell` estavam criando formas decorativas (um quadrado azul e um círculo) sobre toda a seção hero, quando deveriam estar apenas em volta da imagem.

**Solução aplicada:**
- Arquivo: `client/src/index.css` (linhas 367-387)
- Alteração: Removidos os pseudo-elementos `::before` e `::after` da classe `.hero-shell`
- As decorações visuais agora ficam apenas em volta da imagem através das classes `.hero-orb--primary` e `.hero-orb--accent` dentro do `.hero-media-frame`

**Resultado:**
A seção de boas-vindas agora não tem mais o quadrado azul indesejado. As formas decorativas ficam apenas em volta da imagem na direita, como esperado.

---

## Como aplicar as correções

As alterações foram commitadas no repositório local. Para aplicá-las ao repositório remoto:

```bash
cd /home/ubuntu/SitePsico
git push origin master
```

Após o push, faça o deploy da aplicação para que as correções entrem em produção.

---

## Observações importantes

1. **Configurações existentes**: Se já existem configurações de availability salvas no banco de dados com tipo "string", será necessário atualizá-las manualmente ou salvá-las novamente através do painel admin para que o tipo seja atualizado para "json".

2. **Cache**: Após o deploy, pode ser necessário limpar o cache do navegador para ver as alterações visuais da remoção do quadrado azul.

3. **Teste**: Recomenda-se testar a funcionalidade de agendamento após o deploy para confirmar que os horários estão aparecendo corretamente.
