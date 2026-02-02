# Instruções para Deploy no Render

Este projeto utiliza **npm** como gerenciador de pacotes.

O erro `ERR_PNPM_NO_LOCKFILE` ocorre porque o Render detectou ou foi configurado para usar `pnpm`, mas o projeto utiliza `npm` (possui `package-lock.json`).

## Solução Rápida

Se você conectou o repositório ao Render e obteve o erro acima:

1. Acesse o dashboard do seu serviço no Render.
2. Vá em **Settings** > **Build & Deploy**.
3. Em **Build Command**, altere para:
   ```bash
   npm install --include=dev --legacy-peer-deps && npm run build
   ```
4. Em **Start Command**, certifique-se de que está:
   ```bash
   npm start
   ```
5. Salve e faça um novo deploy (Manual Deploy > Clear build cache & deploy se possível).

## Uso de Blueprints (`render.yaml`)

O repositório já contém um arquivo `render.yaml` configurado corretamente. Recomenda-se criar um **Blueprint** no Render apontando para este repositório, em vez de criar um Web Service manualmente. Isso garantirá que todas as configurações (versão do Node, comandos de build e start, variáveis de ambiente) sejam aplicadas automaticamente.

## Detalhes Importantes

*   **Gerenciador de Pacotes:** `npm` (não use `pnpm` ou `yarn`).
*   **Versão do Node:** 22.22.0 ou superior (definido em `.node-version` e `package.json`).
*   **Dependências de Build:** O comando de build inclui `--include=dev` para garantir que o `vite` e `esbuild` sejam instalados mesmo em ambiente de produção (`NODE_ENV=production`), evitando o erro `vite: not found`.
