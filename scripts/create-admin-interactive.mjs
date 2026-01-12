#!/usr/bin/env node

/**
 * 🔐 Create Admin User - Interactive Version
 * 
 * Este script cria um usuário admin no banco de dados Railway.
 * 
 * Antes de rodar, você precisa ter as credenciais do Railway:
 * - MYSQLHOST
 * - MYSQLPORT
 * - MYSQLUSER
 * - MYSQLPASSWORD
 * - MYSQLDATABASE
 * 
 * Você pode encontrar em: Railway Dashboard → Project → MySQL Plugin
 */

import mysql from 'mysql2/promise';
import * as crypto from 'crypto';
import readline from 'readline';

// Criar interface de entrada
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                  🔐 CREATE ADMIN USER                           ║');
  console.log('║              Railway MySQL - Admin User Creation                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Coletar credenciais
    console.log('📝 Digite as credenciais do Railway MySQL:\n');
    
    const host = await question('   MYSQLHOST (ex: roundhouse.proxy.rlwy.net): ');
    const port = await question('   MYSQLPORT (ex: 3306): ');
    const user = await question('   MYSQLUSER (ex: root): ');
    const password = await question('   MYSQLPASSWORD (sua senha): ');
    const database = await question('   MYSQLDATABASE (ex: railway): ');

    // Validar entradas
    if (!host || !port || !user || !password || !database) {
      console.error('\n❌ ERRO: Todas as credenciais são obrigatórias!');
      process.exit(1);
    }

    console.log('\n🔗 Conectando ao banco de dados...\n');

    // Conectar ao banco
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    console.log('✅ Conexão estabelecida!\n');

    // Hash da senha padrão
    const adminPassword = 'Admin@123456';
    const passwordHash = crypto
      .createHash('sha256')
      .update(adminPassword)
      .digest('hex');

    // Admin user data
    const adminUser = {
      email: 'admin@psicologo.local',
      password_hash: passwordHash,
      role: 'admin',
      status: 'active',
      name: 'Admin User',
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log('📝 Dados do usuário admin:\n');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Status: ${adminUser.status}\n`);

    // Verificar se já existe
    console.log('🔍 Verificando se usuário já existe...\n');
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminUser.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️ Usuário já existe! ID:', existingUsers[0].id);
      console.log('\n📝 Opções:');
      console.log('   1. Atualizar senha do usuário existente');
      console.log('   2. Sair\n');

      const choice = await question('Digite sua opção (1 ou 2): ');

      if (choice === '1') {
        console.log('\n🔄 Atualizando senha...\n');
        await connection.execute(
          'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
          [passwordHash, adminUser.email]
        );
        console.log('✅ Senha atualizada com sucesso!\n');
      } else {
        console.log('Operação cancelada.\n');
      }
    } else {
      // Inserir novo usuário
      console.log('➕ Criando novo usuário admin...\n');

      try {
        await connection.execute(
          'INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [
            adminUser.email,
            adminUser.password_hash,
            adminUser.name,
            adminUser.role,
            adminUser.status,
          ]
        );

        console.log('✅ Usuário admin criado com sucesso!\n');
      } catch (error) {
        console.error('❌ Erro ao criar usuário:', error.message);
        throw error;
      }
    }

    // Verificar se foi criado/atualizado
    console.log('🔍 Verificando usuário no banco...\n');
    
    const [users] = await connection.execute(
      'SELECT id, email, role, status FROM users WHERE email = ?',
      [adminUser.email]
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ Usuário encontrado no banco!\n');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}\n`);
    }

    // Fechar conexão
    await connection.end();

    console.log('✨ Processo finalizado com sucesso!\n');
    console.log('📝 Próximas etapas:\n');
    console.log('   1. Abra: https://psicologo-sp-site.vercel.app/admin/settings');
    console.log('   2. Login com:');
    console.log(`      Email: ${adminUser.email}`);
    console.log(`      Senha: ${adminPassword}\n`);
    console.log('   3. Você deve ser redirecionado para /admin/dashboard\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nDicas:');
    console.error('   - Verifique se as credenciais estão corretas');
    console.error('   - Verifique se a conexão com Railway está ativa');
    console.error('   - Verifique se a tabela "users" existe no banco\n');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
