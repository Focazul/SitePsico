/**
 * Script para criar o usuário admin solicitado
 * Email: admin@psicologo.com
 * Senha: Admin@123456
 */

import 'dotenv/config';
import { getDb } from '../server/db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../server/_core/auth';

async function setupAdmin() {
  const targetEmail = 'admin@psicologo.com';
  const targetPassword = 'Admin@123456';

  console.log('🌱 Configurando admin...');
  console.log(`📧 Alvo: ${targetEmail}`);

  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Banco de dados não disponível');
    }

    // Verificar se usuário existe
    const existing = await db.select().from(users).where(eq(users.email, targetEmail)).limit(1);

    const hashedPassword = hashPassword(targetPassword);

    if (existing.length > 0) {
      console.log('🔄 Atualizando senha do admin existente...');
      await db.update(users)
        .set({
          password: hashedPassword,
          role: 'admin',
          name: 'Administrador'
        })
        .where(eq(users.email, targetEmail));
    } else {
      console.log('✨ Criando novo admin...');
      await db.insert(users).values({
        email: targetEmail,
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        openId: `local_admin_${  Date.now()}`,
        loginMethod: 'local'
      });
    }

    console.log('✅ Admin configurado com sucesso!');
    console.log(`📧 Email: ${targetEmail}`);
    console.log(`🔑 Senha: ${targetPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

setupAdmin();
