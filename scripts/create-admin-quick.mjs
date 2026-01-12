#!/usr/bin/env node

/**
 * 🔐 Create Admin User - Quick Version
 * Cria usuário admin com credenciais hardcoded
 */

import mysql from 'mysql2/promise';
import * as crypto from 'crypto';

// CREDENCIAIS DO RAILWAY:
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
    console.log(`   Host: ${RAILWAY_CREDENTIALS.host}`);
    console.log(`   Port: ${RAILWAY_CREDENTIALS.port}`);
    console.log(`   User: ${RAILWAY_CREDENTIALS.user}`);
    console.log(`   Database: ${RAILWAY_CREDENTIALS.database}\n`);

    const connection = await mysql.createConnection(RAILWAY_CREDENTIALS);

    console.log('✅ Conectado!\n');

    // Admin credentials
    const adminEmail = 'admin@psicologo.local';
    const adminPassword = 'Admin@123456';
    const passwordHash = crypto
      .createHash('sha256')
      .update(adminPassword)
      .digest('hex');

    console.log('📝 Criando admin user:\n');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}\n`);

    // Verificar se já existe
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length > 0) {
      console.log('⚠️ Usuário já existe! Atualizando senha...\n');
      await connection.execute(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
        [passwordHash, adminEmail]
      );
      console.log('✅ Senha atualizada!\n');
    } else {
      console.log('➕ Criando novo usuário...\n');
      await connection.execute(
        'INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [adminEmail, passwordHash, 'Admin User', 'admin', 'active']
      );
      console.log('✅ Usuário criado!\n');
    }

    // Verificar
    const [users] = await connection.execute(
      'SELECT id, email, role, status FROM users WHERE email = ?',
      [adminEmail]
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Verificado no banco:\n');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}\n`);
    }

    await connection.end();

    console.log('✨ Sucesso! Agora você pode fazer login:\n');
    console.log('   🌐 URL: https://psicologo-sp-site.vercel.app/admin/settings');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Senha: ${adminPassword}\n`);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Dica: Verifique se o host/port estão corretos');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Dica: Credenciais incorretas (user/password)');
    }
    
    process.exit(1);
  }
}

main();
