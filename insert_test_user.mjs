#!/usr/bin/env node

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: './.env' });

const userEmail = 'test@example.com';
const userName = 'Usuário Teste';
const userHash = 'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6';

async function insertUser() {
  let connection;
  try {
    console.log('🔧 Conectando ao banco de dados...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'site_psicolog',
    });

    console.log('✅ Conectado ao banco!');

    // Verificar se usuário já existe
    console.log('🔍 Verificando se usuário já existe...');
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );

    if (existing.length > 0) {
      console.log('⚠️  Usuário "test@example.com" já existe!');
      console.log('✅ Login: test@example.com');
      console.log('✅ Senha: admteste');
      await connection.end();
      return;
    }

    // Inserir usuário
    console.log('➕ Inserindo usuário...');
    await connection.execute(
      'INSERT INTO users (email, password, name, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
      [userEmail, userHash, userName]
    );

    console.log('✅ Usuário criado com sucesso!');
    console.log('\n🔐 Login:');
    console.log('   Email: test@example.com');
    console.log('   Senha: admteste');
    console.log('\n🌐 Acesse: http://localhost:5173/login');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Verifique se o MySQL está rodando (XAMPP/WAMP)');
    process.exit(1);
  }
}

insertUser();
