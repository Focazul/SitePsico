/**
 * Script para deletar e recriar o admin
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../drizzle/schema';
import { scryptSync, randomBytes } from 'crypto';
import { sql } from 'drizzle-orm';

const adminEmail = process.env.ADMIN_EMAIL || 'marcelopsico07@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Psico@123';
const adminName = process.env.ADMIN_NAME || 'Marcelo';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function recreateAdmin() {
  try {
    console.log('🌱 Recriando admin...');

    const sqlClient = postgres(process.env.DATABASE_URL!);
    const db = drizzle(sqlClient);

    // Deletar admin antigo
    console.log('🗑️  Deletando admin antigo...');
    await db.delete(users).where(sql`email = ${adminEmail}`);

    // Hash da senha
    const hashedPassword = hashPassword(adminPassword);

    // Inserir novo admin
    console.log('➕ Criando novo admin...');
    const result = await db
      .insert(users)
      .values({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        openId: `user_${Date.now()}`,
        loginMethod: 'password',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log('✅ Admin recriado com sucesso!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
    console.log(`👤 Nome: ${adminName}`);

    await sqlClient.end();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

recreateAdmin();
