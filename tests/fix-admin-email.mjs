#!/usr/bin/env node

/**
 * 🔧 CORREÇÃO: Atualizar usuário admin com email válido
 * 
 * O problema: "adm" não é um email válido
 * Solução: Atualizar para "admin@psicologo.local"
 */

import axios from 'axios';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';

console.log('\n' + '='.repeat(70));
console.log('🔧 CORREÇÃO DE AUTENTICAÇÃO');
console.log('='.repeat(70) + '\n');

console.log('⚠️  Problema encontrado:');
console.log('   Email "adm" não é um email válido (falta @domínio)');
console.log('   O validador Zod rejeita este formato\n');

console.log('✅ Solução:');
console.log('   Mudar email para: admin@psicologo.local\n');

console.log('📝 Novo email: admin@psicologo.local');
console.log('🔐 Senha: admteste\n');

console.log('=' .repeat(70));
console.log('\n1️⃣  TESTE DE LOGIN COM NOVO EMAIL\n');

try {
  // Obter CSRF token
  const csrfRes = await axios.get(`${BACKEND_URL}/api/csrf-token`);
  const csrfToken = csrfRes.data.token;
  
  console.log(`✅ CSRF Token obtido`);

  // Tentar login
  const loginRes = await axios.post(
    `${BACKEND_URL}/api/trpc/auth.login`,
    {
      json: {
        email: 'admin@psicologo.local',
        password: 'admteste'
      }
    },
    {
      headers: {
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    }
  );

  if (loginRes.status === 200 || loginRes.status === 201) {
    console.log(`✅ LOGIN FUNCIONANDO!\n`);
    console.log(`   Email: admin@psicologo.local`);
    console.log(`   Senha: admteste\n`);
  } else {
    console.log(`⚠️  Login falhou com ${loginRes.status}`);
    console.log(`   Mensagem: ${loginRes.data.error?.json?.message || 'Desconhecido'}\n`);
    
    if (loginRes.status === 400 || loginRes.status === 401) {
      console.log(`❌ Usuário não existe ou erro na validação\n`);
      console.log(`💡 É necessário atualizar o usuário no banco de dados:\n`);
      
      console.log(`UPDATE users SET email = 'admin@psicologo.local' WHERE email = 'adm' AND role = 'admin';\n`);
    }
  }
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
}

console.log('\n2️⃣  TESTE DE UPDATE DE SETTINGS\n');

try {
  const csrfRes = await axios.get(`${BACKEND_URL}/api/csrf-token`);
  const csrfToken = csrfRes.data.token;

  // Update com endpoint CORRETO: updateSetting (não update)
  const updateRes = await axios.post(
    `${BACKEND_URL}/api/trpc/settings.updateSetting`,
    {
      json: {
        key: 'psychologist_name',
        value: 'Dr. Teste Atualizado',
        type: 'string'
      }
    },
    {
      headers: {
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    }
  );

  if (updateRes.status === 200) {
    console.log(`✅ UPDATE FUNCIONANDO!\n`);
    console.log(`   Endpoint: /api/trpc/settings.updateSetting`);
    console.log(`   Resposta:`, JSON.stringify(updateRes.data, null, 2).substring(0, 200));
  } else {
    console.log(`⚠️  Update falhou com ${updateRes.status}`);
    console.log(`   Erro: ${updateRes.data.error?.json?.message || 'Desconhecido'}`);
  }
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
}

console.log('\n' + '='.repeat(70));
console.log('📋 RESUMO DE AÇÕES');
console.log('='.repeat(70));
console.log(`
✅ Email válido: admin@psicologo.local
✅ Senha: admteste
✅ Endpoint de update: /api/trpc/settings.updateSetting

💾 Próximos passos:

1. Atualizar usuário no banco de dados (Railway MySQL):
   UPDATE users SET email = 'admin@psicologo.local' WHERE email = 'adm' AND role = 'admin';

2. Acessar admin:
   https://psicologo-sp-site.vercel.app/admin/settings

3. Fazer login com:
   Email: admin@psicologo.local
   Senha: admteste

4. Atualizar configurações e verificar se aparece no frontend

`);
console.log('='.repeat(70) + '\n');
