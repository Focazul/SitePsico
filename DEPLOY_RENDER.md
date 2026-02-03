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
   npm install --include=dev --legacy-peer-deps && npm run build
   ```
   *(Ou use `./scripts/render-build.sh` se o arquivo existir, mas o comando acima é mais garantido).*

6. Salve as alterações.
7. Faça um novo deploy (Manual Deploy > Clear build cache & deploy).

## Sobre Erros de Conexão com Banco de Dados (IPv6)

Se você ver erros como `ENETUNREACH` ou falha ao conectar no banco:
Isso acontece porque o Node.js tenta conectar via IPv6 e alguns provedores (Supabase/Render) podem ter problemas com isso em certas regiões.

O projeto já foi atualizado para forçar IPv4 (`NODE_OPTIONS='--dns-result-order=ipv4first'`), mas certifique-se de que sua `DATABASE_URL` está correta e é acessível publicamente (não use localhost ou IPs privados).
