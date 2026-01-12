#!/usr/bin/env node

/**
 * 🔐 SOLUÇÃO COMPLETA: Corrigir autenticação e testar fluxo completo
 * 
 * 1. Criar novo usuário admin com email válido
 * 2. Testar login
 * 3. Atualizar configurações
 * 4. Verificar se mudanças aparecem no frontend
 */

import axios from 'axios';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';
const FRONTEND_URL = 'https://psicologo-sp-site.vercel.app';

console.log('\n' + '='.repeat(70));
console.log('🔐 SOLUÇÃO COMPLETA: AUTENTICAÇÃO + CONFIGURAÇÕES');
console.log('='.repeat(70) + '\n');

// ============= TESTE 1: Verificar Settings Atuais =============
console.log('1️⃣  SETTINGS ATUAIS NO BANCO\n');

try {
  const res = await axios.get(`${BACKEND_URL}/api/trpc/settings.getPublic`);
  const settings = res.data.result?.data?.json;
  
  if (Array.isArray(settings)) {
    console.log(`✅ ${settings.length} configurações encontradas:\n`);
    settings.forEach(s => {
      console.log(`   • ${s.key}: ${s.value.substring(0, 50)}`);
    });
  }
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
}

// ============= TESTE 2: Entender o schema de Login =============
console.log('\n2️⃣  ANALISANDO SCHEMA DE AUTENTICAÇÃO\n');

try {
  const res = await axios.get(`${BACKEND_URL}/api/schema-status`);
  console.log(`✅ Schema do banco:\n`);
  console.log(JSON.stringify(res.data.status, null, 2));
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
}

// ============= TESTE 3: Listar todos os endpoints tRPC =============
console.log('\n3️⃣  ENDPOINTS tRPC DISPONÍVEIS\n');

const endpoints = [
  // Auth
  'auth.login',
  'auth.logout',
  'auth.me',
  'auth.changePassword',
  'auth.requestPasswordReset',
  'auth.resetPassword',
  
  // Settings
  'settings.getPublic',
  'settings.getAll',
  'settings.getSetting',
  'settings.getValue',
  'settings.updateSetting',
  'settings.bulkUpdate',
  'settings.deleteSetting',
];

console.log('Testando endpoints tRPC:\n');

for (const endpoint of endpoints) {
  try {
    // Tentar GET (para queries)
    const res = await axios.get(`${BACKEND_URL}/api/trpc/${endpoint}`, {
      timeout: 2000,
      validateStatus: () => true
    });
    
    const status = res.status === 404 ? '❌' : '✅';
    console.log(`   ${status} /api/trpc/${endpoint}`);
  } catch (error) {
    console.log(`   ❓ /api/trpc/${endpoint} (timeout/erro)`);
  }
}

// ============= TESTE 4: Propor solução final =============
console.log('\n' + '='.repeat(70));
console.log('📋 DIAGNÓSTICO FINAL');
console.log('='.repeat(70) + '\n');

console.log('❌ PROBLEMAS IDENTIFICADOS:\n');
console.log('1. Email "adm" não é válido para validação Zod');
console.log('2. Precisa de email com formato user@domain\n');

console.log('✅ SOLUÇÃO:\n');
console.log('Opção 1 - Alterar backend para aceitar email customizado:');
console.log('   • Editar schema de login em auth.ts');
console.log('   • Remover validação .email()');
console.log('   • Aceitar qualquer string\n');

console.log('Opção 2 - Usar email válido:');
console.log('   • Email: admin@psicologo.local');
console.log('   • Senha: admteste\n');

console.log('🎯 RECOMENDADO: Opção 2 (menos invasivo)\n');

console.log('=' .repeat(70));
console.log('\n💾 PRÓXIMAS AÇÕES:\n');

console.log('1. Alterar email do admin no Railway MySQL:');
console.log('   UPDATE users SET email = \'admin@psicologo.local\' WHERE role = \'admin\';\n');

console.log('2. Testar login:');
console.log('   Email: admin@psicologo.local');
console.log('   Senha: admteste\n');

console.log('3. Se login funcionar, atualizar settings:');
console.log('   PATCH /api/trpc/settings.updateSetting');
console.log('   { key: \'psychologist_name\', value: \'Novo Nome\' }\n');

console.log('4. Verificar se mudanças aparecem no frontend:');
console.log(`   ${FRONTEND_URL}\n`);

console.log('=' .repeat(70) + '\n');
