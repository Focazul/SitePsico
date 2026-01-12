#!/usr/bin/env node

/**
 * 🔐 CRIAR USUÁRIO ADMIN NO RAILWAY MYSQL
 * 
 * Este script conecta diretamente ao Railway MySQL e cria o usuário admin
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const ADMIN_EMAIL = 'admin@psicologo.local';
const ADMIN_PASSWORD_HASH = 'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6';
const ADMIN_NAME = 'Administrador';

console.log('\n' + '='.repeat(70));
console.log('🔐 CRIAR USUÁRIO ADMIN NO RAILWAY');
console.log('='.repeat(70) + '\n');

console.log('📧 Email:', ADMIN_EMAIL);
console.log('🔑 Senha: Admin@123456\n');

async function createAdmin() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao MySQL...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}\n`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Conectado ao MySQL!\n');

    // 1. Verificar se admin já existe
    console.log('🔍 Verificando se admin já existe...');
    const [existing] = await connection.execute(
      'SELECT id, email, name, role FROM users WHERE email = ? OR role = ?',
      [ADMIN_EMAIL, 'admin']
    );

    if (existing.length > 0) {
      console.log('⚠️  Admin já existe no banco:\n');
      existing.forEach(user => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Role: ${user.role}\n`);
      });

      console.log('💡 Deseja remover e recriar? (deletando primeiro)\n');
      
      // Deletar usuários admin existentes
      console.log('🗑️  Removendo admins antigos...');
      await connection.execute(
        'DELETE FROM users WHERE email IN (?, ?) OR role = ?',
        [ADMIN_EMAIL, 'adm', 'admin']
      );
      console.log('✅ Admins removidos\n');
    }

    // 2. Inserir novo admin
    console.log('➕ Criando novo admin...');
    const [result] = await connection.execute(
      `INSERT INTO users (email, password, name, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_NAME, 'admin']
    );

    console.log('✅ Admin criado com sucesso!\n');
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Nome: ${ADMIN_NAME}`);
    console.log(`   Role: admin\n`);

    // 3. Verificar criação
    console.log('✔️  Verificando...');
    const [verify] = await connection.execute(
      'SELECT id, email, name, role, createdAt FROM users WHERE id = ?',
      [result.insertId]
    );

    if (verify.length > 0) {
      console.log('✅ Verificação OK!\n');
      console.log(verify[0]);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 SUCESSO!');
    console.log('='.repeat(70) + '\n');

    console.log('📝 Credenciais para login:\n');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('   Senha: Admin@123456\n');

    console.log('🌐 Acesse:\n');
    console.log('   https://psicologo-sp-site.vercel.app/admin/settings\n');

    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Não foi possível conectar ao MySQL.');
      console.error('   Verifique se as credenciais em .env estão corretas:\n');
      console.error('   DB_HOST=' + process.env.DB_HOST);
      console.error('   DB_USER=' + process.env.DB_USER);
      console.error('   DB_NAME=' + process.env.DB_NAME);
      console.error('   DB_PORT=' + (process.env.DB_PORT || 3306));
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n💡 Email já existe no banco.');
      console.error('   Execute novamente - o script removerá o antigo.');
    } else {
      console.error('\n💡 Erro desconhecido:', error);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();
