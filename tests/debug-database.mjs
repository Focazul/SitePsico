#!/usr/bin/env node

/**
 * 🔍 DEBUG: Verificar usuários no banco de dados
 * 
 * Conecta direto ao Railway MySQL e verifica
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

console.log('\n' + '='.repeat(70));
console.log('🔍 DEBUG: VERIFICAR BANCO DE DADOS');
console.log('='.repeat(70) + '\n');

try {
  // Conectar ao banco (Railway)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'site_psicolog'
  });

  console.log(`✅ Conectado ao banco: ${process.env.DB_NAME}\n`);

  // 1. Listar todos os usuários
  console.log('1️⃣  USUÁRIOS NO BANCO\n');
  const [users] = await connection.execute('SELECT id, email, name, role FROM users');
  
  if (users.length === 0) {
    console.log('❌ Nenhum usuário encontrado!');
  } else {
    users.forEach(u => {
      console.log(`   ID: ${u.id}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Nome: ${u.name}`);
      console.log(`   Role: ${u.role}`);
      console.log('');
    });
  }

  // 2. Procurar por admin
  console.log('2️⃣  PROCURANDO USUÁRIO ADMIN\n');
  const [admins] = await connection.execute('SELECT id, email, password, name, role FROM users WHERE role = ? ORDER BY id DESC LIMIT 1', ['admin']);
  
  if (admins.length === 0) {
    console.log('❌ Nenhum admin encontrado!');
  } else {
    const admin = admins[0];
    console.log(`✅ Admin encontrado:`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Hash: ${admin.password.substring(0, 50)}...`);
  }

  // 3. Contar registros
  console.log('\n3️⃣  ESTATÍSTICAS DO BANCO\n');
  const [stats] = await connection.execute(`
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM settings) as total_settings,
      (SELECT COUNT(*) FROM bookings) as total_bookings
  `);
  
  console.log(`   Usuários: ${stats[0].total_users}`);
  console.log(`   Configurações: ${stats[0].total_settings}`);
  console.log(`   Agendamentos: ${stats[0].total_bookings}`);

  // 4. Listar settings
  console.log('\n4️⃣  CONFIGURAÇÕES\n');
  const [settings] = await connection.execute('SELECT key, value FROM settings ORDER BY key');
  
  if (settings.length === 0) {
    console.log('⚠️  Nenhuma configuração encontrada');
  } else {
    settings.forEach(s => {
      console.log(`   ${s.key}: ${s.value.substring(0, 50)}${s.value.length > 50 ? '...' : ''}`);
    });
  }

  // 5. Sugestão de ação
  console.log('\n' + '='.repeat(70));
  console.log('📋 AÇÕES SUGERIDAS');
  console.log('='.repeat(70) + '\n');

  if (admins.length === 0) {
    console.log('❌ Nenhum admin existe!');
    console.log('\n✅ Solução: Executar script de inserção:\n');
    console.log('   node scripts/insert_admin_final.mjs\n');
  } else if (admins[0].email === 'adm' || !admins[0].email.includes('@')) {
    console.log('⚠️  Admin com email inválido!');
    console.log('\n✅ Solução: Executar SQL no Railway MySQL:\n');
    console.log(`   UPDATE users SET email = 'admin@psicologo.local' WHERE id = ${admins[0].id};\n`);
  } else {
    console.log('✅ Admin configurado corretamente!');
    console.log(`\n   Email: ${admins[0].email}`);
    console.log(`   Senha: admteste\n`);
  }

  console.log('='.repeat(70) + '\n');

  await connection.end();
} catch (error) {
  console.error(`❌ Erro: ${error.message}\n`);
  console.log('💡 Verifique:');
  console.log('   1. .env configurado com credenciais corretas');
  console.log('   2. MySQL está rodando');
  console.log('   3. Banco de dados existe\n');
}
