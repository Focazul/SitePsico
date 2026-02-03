#!/usr/bin/env node

/**
 * 🔐 Create Admin User - Supabase Version
 * Use com: node scripts/create-admin-final.mjs
 */

import postgres from 'postgres';
import * as crypto from 'crypto';

// Use DATABASE_URL para conexão com Supabase
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada!');
  process.exit(1);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                  🔐 CREATE ADMIN USER                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    console.log('🔗 Conectando ao Supabase PostgreSQL...\n');

    const sql = postgres(process.env.DATABASE_URL);

    console.log('✅ Conectado!\n');

    // Admin credentials
    const adminEmail = 'admin@psicologo.local';
    const adminPassword = 'Admin@123456';
    const passwordHash = crypto
      .createHash('sha256')
      .update(adminPassword)
      .digest('hex');

    console.log('📝 Dados do admin:\n');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}\n`);

    // Verificar se já existe
    const existing = await sql`
      SELECT id, email FROM users WHERE email = ${adminEmail}
    `;

    if (existing.length > 0) {
      console.log('⚠️ Usuário já existe (ID: ' + existing[0].id + ')');
      console.log('   Atualizando senha...\n');
      
      await sql`
        UPDATE users 
        SET password = ${passwordHash}, role = 'admin', updated_at = NOW() 
        WHERE email = ${adminEmail}
      `;
      
      console.log('✅ Senha atualizada!\n');
    } else {
      console.log('➕ Criando novo usuário...\n');
      
      await sql`
        INSERT INTO users (name, email, password, role, login_method) 
        VALUES ('Admin User', ${adminEmail}, ${passwordHash}, 'admin', 'password')
      `;
      
      console.log('✅ Usuário criado!\n');
    }

    // Verificar no banco
    const users = await sql`
      SELECT id, email, role, created_at FROM users WHERE email = ${adminEmail}
    `;

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Verificado no banco:\n');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Criado em: ${user.created_at}\n`);
    }

    await sql.end();

    console.log('🎉 Sucesso! Agora teste o login:\n');
    console.log('   🌐 URL: https://seu-app.onrender.com/admin/settings');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Senha: ${adminPassword}\n`);
    console.log('   ✅ Você deve ser redirecionado para /admin/dashboard\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message, '\n');
    process.exit(1);
  }
}

main();
