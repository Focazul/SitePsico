#!/usr/bin/env node

/**
 * 🔐 Create Admin User - Via Backend API
 * 
 * Usa o endpoint do backend para criar admin user
 * Sem precisar de credenciais diretas do MySQL
 */

import crypto from 'crypto';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';
const ADMIN_EMAIL = 'admin@psicologo.local';
const ADMIN_PASSWORD = 'Admin@123456';

async function createAdminViaBackend() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          🔐 CREATE ADMIN USER - Via Backend API                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Get CSRF token
    console.log('📝 Passo 1: Obtendo CSRF token...\n');
    
    const csrfResp = await fetch(`${BACKEND_URL}/api/csrf-token`, {
      credentials: 'include',
    });

    if (!csrfResp.ok) {
      throw new Error(`CSRF token endpoint failed: ${csrfResp.status}`);
    }

    const csrfData = await csrfResp.json();
    const csrfToken = csrfData.token;

    console.log(`✅ CSRF Token obtido: ${csrfToken.substring(0, 20)}...\n`);

    // Step 2: Call admin creation endpoint
    console.log('📝 Passo 2: Criando usuário admin...\n');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}\n`);

    const createResp = await fetch(`${BACKEND_URL}/api/trpc/admin.createUser`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: 'Admin User',
        role: 'admin',
      }),
    });

    const createData = await createResp.json();

    if (createResp.ok && createData.ok) {
      console.log('✅ Usuário admin criado com sucesso!\n');
      console.log('📊 Resposta do servidor:\n');
      console.log(JSON.stringify(createData.result, null, 2));
    } else if (createResp.status === 404) {
      console.log('⚠️ Endpoint não encontrado');
      console.log('   Isso significa que o backend ainda não tem o endpoint para criar admin\n');
      console.log('💡 Alternativa: Use SQL direto no Railway\n');
      showSQLAlternative();
    } else {
      console.log('❌ Erro ao criar usuário:\n');
      console.log(JSON.stringify(createData, null, 2));
    }

    // Step 3: Test login
    console.log('\n✨ Próximo passo: Testar login\n');
    console.log('   🌐 URL: https://psicologo-sp-site.vercel.app/admin/settings');
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);
    console.log(`   🔑 Senha: ${ADMIN_PASSWORD}\n`);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message, '\n');
    showSQLAlternative();
  }
}

function showSQLAlternative() {
  const passwordHash = crypto
    .createHash('sha256')
    .update('Admin@123456')
    .digest('hex');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('💡 SOLUÇÃO ALTERNATIVA: SQL Direto no Railway\n');
  console.log('Cole este comando no Railway MySQL Console:\n');
  console.log('INSERT INTO users (');
  console.log('  email,');
  console.log('  password_hash,');
  console.log('  name,');
  console.log('  role,');
  console.log('  status,');
  console.log('  created_at,');
  console.log('  updated_at');
  console.log(') VALUES (');
  console.log(`  'admin@psicologo.local',`);
  console.log(`  '${passwordHash}',`);
  console.log(`  'Admin User',`);
  console.log(`  'admin',`);
  console.log(`  'active',`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(');\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

createAdminViaBackend();
