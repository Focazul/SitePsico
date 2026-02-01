/**
 * Script para criar o primeiro usuário admin no banco de dados
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import { scryptSync, randomBytes } from 'crypto';

const adminEmail = process.env.ADMIN_EMAIL || 'psicólogo@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

// Hash da senha usando scrypt
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function seed() {
  try {
    console.log('🌱 Iniciando seed do admin...');
    console.log(`📧 Email: ${adminEmail}`);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'psicólogo_sp',
    });

    // Verificar se admin já existe
    const [rows] = await connection.execute('SELECT id, openId FROM users WHERE email = ?', [adminEmail]);

    if ((rows as any[]).length > 0) {
      console.log('✅ Admin já existe no banco de dados');
      const user = (rows as any[])[0];
      if (!user.openId) {
        console.log('🔄 Atualizando openId do admin...');
        await connection.execute('UPDATE users SET openId = ? WHERE id = ?', [`user_${user.id}`, user.id]);
      }
      await connection.end();
      return;
    }

    // Hash da senha
    const hashedPassword = hashPassword(adminPassword);

    // Inserir admin
    const [result] = await connection.execute(
      `INSERT INTO users (email, password, name, createdAt, updatedAt) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [adminEmail, hashedPassword, 'Psicólogo']
    );

    // @ts-ignore
    const insertId = result.insertId;
    if (insertId) {
      await connection.execute('UPDATE users SET openId = ? WHERE id = ?', [`user_${insertId}`, insertId]);
    }

    console.log('✅ Admin criado com sucesso!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Mude a senha após o primeiro login!');
    console.log('💡 Dica: Use variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  }
}

seed();
