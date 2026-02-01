#!/bin/bash

# 🚀 Script de Build e Deploy - Projeto 100%
# Este script faz build do projeto e prepara para deploy

echo "=================================="
echo "🚀 BUILD E DEPLOY - PROJETO 100%"
echo "=================================="
echo ""

# Cores para terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${BLUE}➜ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. Verificar Node.js
print_status "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale em nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION encontrado"

# 2. Instalar dependências
print_status "Instalando dependências..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependências instaladas"
else
    print_error "Erro ao instalar dependências"
    exit 1
fi

# 3. Build do projeto
print_status "Fazendo build do projeto..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build concluído com sucesso"
else
    print_error "Erro no build"
    exit 1
fi

# 4. Verificar pasta dist
print_status "Verificando build output..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    print_success "Pasta dist criada ($DIST_SIZE)"
else
    print_warning "Pasta dist não encontrada"
fi

# 5. Git status
print_status "Verificando git status..."
git_status=$(git status --porcelain)
if [ -z "$git_status" ]; then
    print_success "Repo clean (pronto para push)"
else
    print_warning "Há mudanças não commitadas"
    echo "$git_status"
fi

# 6. Resumo final
echo ""
echo "=================================="
echo "📊 RESUMO DO BUILD"
echo "=================================="
echo -e "${GREEN}✓ Build concluído com sucesso${NC}"
echo -e "${GREEN}✓ Pronto para deploy${NC}"
echo ""
echo "Próximas etapas:"
echo "1. git push origin main"
echo "2. Deploy na plataforma escolhida"
echo "3. Testar em produção"
echo ""
echo "Plataformas recomendadas:"
echo "  • Vercel: vercel.com"
echo "  • Netlify: netlify.com"
echo "  • Heroku: heroku.com"
echo ""
echo "=================================="
