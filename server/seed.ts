/**
 * Script para criar o primeiro usuário admin no banco de dados
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../drizzle/schema';
import { scryptSync, randomBytes } from 'crypto';

const adminEmail = process.env.ADMIN_EMAIL || 'marcelo';
const adminPassword = process.env.ADMIN_PASSWORD || '1234';
const adminName = process.env.ADMIN_NAME || 'Marcelo';

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

    const sql = postgres(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    // Verificar se admin já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(
        // @ts-ignore
        users.email === adminEmail
      )
      .limit(1);

    if (existingUser.length > 0) {
      console.log('✅ Admin já existe no banco de dados');
      const user = existingUser[0];
      if (!user.openId) {
        console.log('🔄 Atualizando openId do admin...');
        await db
          .update(users)
          .set({ openId: `user_${user.id}` })
          .where(users.id === user.id!);
      }
      await sql.end();
      return;
    }

    // Hash da senha
    const hashedPassword = hashPassword(adminPassword);

    // Inserir admin
    const result = await db
      .insert(users)
      .values({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        openId: `user_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log('✅ Admin criado com sucesso!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
    console.log(`👤 Nome: ${adminName}`);
    console.log('\n⚠️  IMPORTANTE: Mude a senha após o primeiro login!');
    console.log('💡 Dica: Use variáveis de ambiente ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME');

    await sql.end();
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  }
}

seed();
