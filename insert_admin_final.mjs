#!/usr/bin/env node

/**
 * Script para inserir admin no banco de dados
 * Suporta tanto CommonJS quanto ES Modules
 * 
 * Uso:
 *   node insert_admin.mjs  (recomendado - ES Modules)
 *   node insert_admin.js   (fallback - CommonJS)
 * 
 * Credenciais padrão:
 *   Email: adm
 *   Senha: admteste
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: './.env' });

const adminEmail = 'adm';
const adminPassword = 'admteste';
// Hash pré-gerado para 'admteste'
const adminHash = 'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6';

async function insertAdmin() {
  let connection;
  try {
    console.log('🔧 Conectando ao banco de dados...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'site_psicolog',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    console.log('✅ Conectado ao banco!');

    // Verificar se admin já existe
    console.log('🔍 Verificando se admin já existe...');
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND role = ?',
      [adminEmail, 'admin']
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin "adm" já existe no banco de dados!');
      console.log('✅ Você pode fazer login com:');
      console.log('   Email: adm');
      console.log('   Senha: admteste');
      console.log('   URL:   http://localhost:5173/admin/login');
      await connection.end();
      return;
    }

    // Inserir admin
    console.log('➕ Inserindo novo admin...');
    await connection.execute(
      'INSERT INTO users (email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [adminEmail, adminHash, 'Admin', 'admin']
    );

    console.log('✅ Admin inserido com sucesso!');
    console.log('\n🔐 Credenciais de Login:');
    console.log('   Email: adm');
    console.log('   Senha: admteste');
    console.log('\n🌐 Acesse: http://localhost:5173/admin/login');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Dicas:');
    console.log('   1. Verifique se MySQL está rodando (XAMPP/WAMP)');
    console.log('   2. Verifique credenciais em .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    console.log('   3. Se tudo estiver ok, execute manualmente o SQL:');
    console.log(`\n   INSERT INTO users (email, password, name, role, createdAt, updatedAt) VALUES ('adm', '${adminHash}', 'Admin', 'admin', NOW(), NOW());`);
    process.exit(1);
  }
}

insertAdmin().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
