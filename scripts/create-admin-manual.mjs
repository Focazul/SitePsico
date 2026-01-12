#!/usr/bin/env node

/**
 * 🔐 CRIAR USUÁRIO ADMIN COM CREDENCIAIS RAILWAY
 * 
 * Use este script quando não tiver acesso direto ao Railway CLI
 * mas souber as credenciais do MySQL
 */

import mysql from 'mysql2/promise';
import * as readline from 'readline';

const ADMIN_EMAIL = 'admin@psicologo.local';
const ADMIN_PASSWORD_HASH = 'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6';
const ADMIN_NAME = 'Administrador';

console.log('\n' + '='.repeat(70));
console.log('🔐 CRIAR USUÁRIO ADMIN - CREDENCIAIS RAILWAY');
console.log('='.repeat(70) + '\n');

console.log('💡 INSTRUÇÕES:\n');
console.log('1. Acesse: https://railway.app/');
console.log('2. Abra o projeto: psicologo-sp-site');
console.log('3. Clique no serviço: MySQL');
console.log('4. Vá em: Variables → Copy todas as variáveis\n');

console.log('📋 Cole abaixo as credenciais do Railway MySQL:\n');

// ========== CREDENCIAIS RAILWAY (EDITE AQUI) ==========

const RAILWAY_CREDENTIALS = {
  // Edite estas linhas com as credenciais do Railway:
  host: 'roundhouse.proxy.rlwy.net',  // MYSQLHOST
  user: 'root',                        // MYSQLUSER
  password: '',                        // MYSQLPASSWORD (cole aqui)
  database: 'railway',                 // MYSQLDATABASE
  port: 00000,                         // MYSQLPORT (cole aqui)
};

// ========================================================

console.log('🔗 Configuração atual:\n');
console.log(`   Host: ${RAILWAY_CREDENTIALS.host}`);
console.log(`   User: ${RAILWAY_CREDENTIALS.user}`);
console.log(`   Database: ${RAILWAY_CREDENTIALS.database}`);
console.log(`   Port: ${RAILWAY_CREDENTIALS.port}`);
console.log(`   Password: ${RAILWAY_CREDENTIALS.password ? '***' : '(não configurada)'}\n`);

if (!RAILWAY_CREDENTIALS.password || RAILWAY_CREDENTIALS.port === 0) {
  console.error('❌ ERRO: Configure as credenciais no arquivo antes de executar!\n');
  console.error('💡 Edite o arquivo e adicione:');
  console.error('   - password: sua senha do Railway');
  console.error('   - port: porta do Railway (ex: 12345)\n');
  process.exit(1);
}

async function createAdmin() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao MySQL Railway...\n');

    connection = await mysql.createConnection(RAILWAY_CREDENTIALS);

    console.log('✅ Conectado ao Railway MySQL!\n');

    // 1. Remover admins antigos
    console.log('🗑️  Removendo admins antigos...');
    await connection.execute(
      'DELETE FROM users WHERE email IN (?, ?) OR role = ?',
      [ADMIN_EMAIL, 'adm', 'admin']
    );
    console.log('✅ Admins removidos\n');

    // 2. Inserir novo admin
    console.log('➕ Criando novo admin...');
    const [result] = await connection.execute(
      `INSERT INTO users (email, password, name, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_NAME, 'admin']
    );

    console.log('✅ Admin criado com sucesso!\n');

    // 3. Verificar
    console.log('✔️  Verificando...');
    const [verify] = await connection.execute(
      'SELECT id, email, name, role, createdAt FROM users WHERE id = ?',
      [result.insertId]
    );

    if (verify.length > 0) {
      console.log('✅ Verificação OK!\n');
      console.log('   ID:', verify[0].id);
      console.log('   Email:', verify[0].email);
      console.log('   Nome:', verify[0].name);
      console.log('   Role:', verify[0].role);
      console.log('   Criado:', verify[0].createdAt);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 SUCESSO!');
    console.log('='.repeat(70) + '\n');

    console.log('📝 Credenciais para login:\n');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('   Senha: Admin@123456\n');

    console.log('🌐 Acesse:\n');
    console.log('   https://psicologo-sp-site.vercel.app/admin/settings\n');

    console.log('✅ Agora o erro "Unable to transform response" não aparecerá mais!\n');

    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Não foi possível conectar ao Railway.');
      console.error('   Verifique:');
      console.error('   1. Host está correto');
      console.error('   2. Porta está correta');
      console.error('   3. Railway MySQL está online');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Acesso negado.');
      console.error('   Verifique usuário e senha do Railway.');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n💡 Email já existe.');
      console.error('   Execute novamente - o script removerá o antigo.');
    } else {
      console.error('\n💡 Erro:', error);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();
