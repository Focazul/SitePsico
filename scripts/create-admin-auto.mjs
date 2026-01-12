#!/usr/bin/env node

/**
 * 🔐 Create Admin User - Railway API Version
 * Obtém credenciais via railway.json se existir, caso contrário tenta conexões
 */

import mysql from 'mysql2/promise';
import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';

async function getCredentialsFromEnv() {
  // Tentar ler do .env ou variáveis de ambiente do Railway
  const railwayVars = {
    host: process.env.MYSQLHOST || 'switchyard.proxy.rlwy.net',
    port: parseInt(process.env.MYSQLPORT) || 5432, // Tenta ENV primeiro
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'itWCIsLfNRxowhpSaQfFGFQFjFutOLEo',
    database: process.env.MYSQLDATABASE || 'railway',
  };

  return railwayVars;
}

async function tryConnection(host, port, user, password, database) {
  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
      connectTimeout: 5000,
    });
    return connection;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          🔐 CREATE ADMIN USER - Railway MySQL                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Obter credenciais
    const creds = await getCredentialsFromEnv();

    console.log('🔍 Testando portas comuns do Railway...\n');
    
    const commonPorts = [
      3306,    // MySQL padrão
      33063,   // Porta típica Railway
      5432,    // PostgreSQL (tenta mesmo assim)
      15432,   // Railway PostgreSQL alt
    ];

    let connection = null;
    let usedPort = null;

    for (const port of commonPorts) {
      process.stdout.write(`   Tentando porta ${port}... `);
      const conn = await tryConnection(
        creds.host,
        port,
        creds.user,
        creds.password,
        creds.database
      );

      if (conn) {
        console.log('✅ Conectado!');
        connection = conn;
        usedPort = port;
        break;
      } else {
        console.log('❌');
      }
    }

    if (!connection) {
      console.error('\n❌ ERRO: Não conseguiu conectar em nenhuma porta comum');
      console.error('\n💡 Solução:');
      console.error('   1. Vá para: https://railway.app');
      console.error('   2. Abra seu projeto');
      console.error('   3. Clique em MySQL');
      console.error('   4. Vá em "Connect"');
      console.error('   5. Procure por MYSQLPORT (número entre parênteses)');
      console.error('   6. Me diga qual é a porta\n');
      process.exit(1);
    }

    console.log(`\n✅ Conectado na porta ${usedPort}!\n`);

    // Dados do admin
    const adminEmail = 'admin@psicologo.local';
    const adminPassword = 'Admin@123456';
    const passwordHash = crypto
      .createHash('sha256')
      .update(adminPassword)
      .digest('hex');

    console.log('📝 Criando admin user:\n');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}\n`);

    // Verificar se existe
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

    // Verificar no banco
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

    console.log('✨ Sucesso! Agora teste o login:\n');
    console.log('   🌐 URL: https://psicologo-sp-site.vercel.app/admin/settings');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Senha: ${adminPassword}\n`);
    console.log('   Você deve ser redirecionado para /admin/dashboard\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message, '\n');
    process.exit(1);
  }
}

main();
