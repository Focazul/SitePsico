#!/bin/bash
# Script de build para o Render
# Garante que as dependências de desenvolvimento sejam instaladas e o build seja executado corretamente

# Habilita log de comandos
set -x

echo "==> Iniciando script de build personalizado para o Render"

# Instala dependências usando npm, garantindo que devDependencies sejam incluídas
# Isso é necessário porque o Render define NODE_ENV=production, o que faz o npm pular devDependencies por padrão
echo "==> Instalando dependências (incluindo devDependencies)..."
npm install --include=dev --legacy-peer-deps

# Executa o build
echo "==> Executando build..."
npm run build

echo "==> Build concluído com sucesso!"
