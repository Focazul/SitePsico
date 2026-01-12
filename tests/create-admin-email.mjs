#!/usr/bin/env node

/**
 * 🔐 CRIAR NOVO USUÁRIO ADMIN COM EMAIL VÁLIDO
 * 
 * Email: admin@psicologo.local
 * Senha: Admin@123456
 */

import axios from 'axios';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';

console.log('\n' + '='.repeat(70));
console.log('🔐 CRIAR NOVO ADMIN COM EMAIL VÁLIDO');
console.log('='.repeat(70) + '\n');

console.log('📧 Email: admin@psicologo.local');
console.log('🔑 Senha: Admin@123456\n');

console.log('=' .repeat(70));
console.log('\n💾 PARA CRIAR ESTE USUÁRIO NO RAILWAY MySQL:\n');

console.log('1. Acesse: https://railway.app/');
console.log('2. Vá em: psicologo-sp-site → MySQL → Connect');
console.log('3. Abra o MySQL CLI ou use TablePlus/DBeaver\n');

console.log('4. Execute este SQL:\n');

// Hash para "Admin@123456"
const hash = 'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6';

console.log(`\`\`\`sql
-- Remover admin antigo
DELETE FROM users WHERE email = 'adm' AND role = 'admin';

-- Criar novo admin com email válido
INSERT INTO users (email, password, name, role, createdAt, updatedAt) 
VALUES (
  'admin@psicologo.local',
  '${hash}',
  'Administrador',
  'admin',
  NOW(),
  NOW()
);

-- Verificar
SELECT id, email, name, role FROM users WHERE role = 'admin';
\`\`\`\n`);

console.log('=' .repeat(70));
console.log('\n✅ APÓS EXECUTAR O SQL:\n');

console.log('1. Acesse: https://psicologo-sp-site.vercel.app/admin/settings');
console.log('2. Faça login com:');
console.log('   Email: admin@psicologo.local');
console.log('   Senha: Admin@123456\n');

console.log('3. Teste atualizando uma configuração');
console.log('4. Verifique se aparecem no frontend\n');

console.log('=' .repeat(70));

// Testar se consegue fazer login com novo email
console.log('\n🧪 TESTE: Verificar estado atual\n');

try {
  const csrfRes = await axios.get(`${BACKEND_URL}/api/csrf-token`);
  const csrfToken = csrfRes.data.token;

  const loginRes = await axios.post(
    `${BACKEND_URL}/api/trpc/auth.login`,
    { json: { email: 'admin@psicologo.local', password: 'Admin@123456' } },
    {
      headers: {
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    }
  );

  if (loginRes.status === 200 || loginRes.status === 201) {
    console.log('✅ NOVO ADMIN JÁ EXISTE!');
    console.log('   Você pode fazer login agora!\n');
  } else if (loginRes.status === 500 || loginRes.data?.error?.json?.message?.includes('Email ou senha')) {
    console.log('⚠️  Novo admin ainda não existe');
    console.log('   Execute o SQL acima no Railway MySQL\n');
  }
} catch (error) {
  console.log(`⚠️  Erro ao testar: ${error.message}\n`);
}

console.log('=' .repeat(70) + '\n');
