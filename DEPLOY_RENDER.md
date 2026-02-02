# Instruções para Deploy no Render

Este projeto utiliza **npm** como gerenciador de pacotes.

O erro `ERR_PNPM_NO_LOCKFILE` ocorre porque o Render detectou ou foi configurado para usar `pnpm`, mas o projeto utiliza `npm`.

## SOLUÇÃO CRÍTICA (O que você deve fazer)

Se você já conectou o repositório ao Render, você **DEVE** alterar manualmente o comando de build no painel do Render. As alterações no código deste repositório não sobrescrevem as configurações manuais existentes no painel.

1. Acesse o [Dashboard do Render](https://dashboard.render.com/).
2. Selecione o serviço `sitepsico`.
3. Vá em **Settings** > **Build & Deploy**.
4. Procure o campo **Build Command**.
5. Altere o valor para:
   ```bash
   ./scripts/render-build.sh
   ```
6. Salve as alterações.
7. Faça um novo deploy (Manual Deploy > Clear build cache & deploy).

> **Nota:** Se você não quiser usar o script, pode usar o comando completo:
> `npm install --include=dev --legacy-peer-deps && npm run build`

## Por que isso acontece?

O Render tenta adivinhar o comando de build. Se ele escolheu `pnpm`, ele vai falhar. Além disso, em produção (`NODE_ENV=production`), o `npm install` padrão não instala o `vite` (que é uma dependência de desenvolvimento), causando o erro `vite: not found`.

O script `scripts/render-build.sh` resolve ambos os problemas:
1. Garante o uso de `npm`.
2. Garante que as dependências de desenvolvimento sejam instaladas antes do build.
