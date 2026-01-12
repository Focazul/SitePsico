#!/usr/bin/env node

/**
 * 🔐 Create Admin User - Final Version
 * Com schema correto da tabela users
 */

import mysql from 'mysql2/promise';
import * as crypto from 'crypto';

const RAILWAY_CREDENTIALS = {
  host: 'switchyard.proxy.rlwy.net',
  port: 46292,
  user: 'root',
  password: 'itWCIsLfNRxowhpSaQfFGFQFjFutOLEo',
  database: 'railway',
};

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                  🔐 CREATE ADMIN USER                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    console.log('🔗 Conectando ao Railway MySQL...\n');

    const connection = await mysql.createConnection(RAILWAY_CREDENTIALS);

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
    const [existing] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length > 0) {
      console.log('⚠️ Usuário já existe (ID: ' + existing[0].id + ')');
      console.log('   Atualizando senha...\n');
      
      await connection.execute(
        'UPDATE users SET password = ?, role = ?, updatedAt = NOW() WHERE email = ?',
        [passwordHash, 'admin', adminEmail]
      );
      
      console.log('✅ Senha atualizada!\n');
    } else {
      console.log('➕ Criando novo usuário...\n');
      
      await connection.execute(
        'INSERT INTO users (name, email, password, role, loginMethod) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', adminEmail, passwordHash, 'admin', 'password']
      );
      
      console.log('✅ Usuário criado!\n');
    }

    // Verificar no banco
    const [users] = await connection.execute(
      'SELECT id, email, role, createdAt FROM users WHERE email = ?',
      [adminEmail]
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Verificado no banco:\n');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Criado em: ${user.createdAt}\n`);
    }

    await connection.end();

    console.log('🎉 Sucesso! Agora teste o login:\n');
    console.log('   🌐 URL: https://psicologo-sp-site.vercel.app/admin/settings');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Senha: ${adminPassword}\n`);
    console.log('   ✅ Você deve ser redirecionado para /admin/dashboard\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message, '\n');
    process.exit(1);
  }
}

main();
