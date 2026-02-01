/**
 * Script para verificar conexão com Supabase PostgreSQL
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../schema';

async function verify() {
  try {
    console.log('🔍 Verificando conexão com Supabase PostgreSQL...\n');

    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não definida em .env');
      process.exit(1);
    }

    console.log('📌 Conectando ao banco de dados...');
    const sql = postgres(process.env.DATABASE_URL, {
      max: 1,
    });

    const db = drizzle(sql);

    // Teste 1: Conexão básica
    const result = await sql`SELECT NOW()`;
    console.log('✅ Conexão estabelecida com sucesso');
    console.log(`   Hora no banco: ${result[0].now}\n`);

    // Teste 2: Listar usuários
    console.log('📋 Verificando usuários no banco de dados...');
    const allUsers = await db.select().from(users);
    console.log(`✅ Total de usuários: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\n📊 Usuários cadastrados:');
      allUsers.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('   ⚠️  Nenhum usuário cadastrado ainda');
    }

    // Teste 3: Verificar admin
    const admin = allUsers.find((u) => u.email === 'marcelo');
    if (admin) {
      console.log('\n✅ Admin "marcelo" encontrado!');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nome: ${admin.name}`);
      console.log('   Pronto para login no Vercel ✨');
    } else {
      console.log('\n⚠️  Admin "marcelo" ainda não foi criado');
      console.log('   Execute: npm run seed');
    }

    await sql.end();
    console.log('\n✅ Verificação concluída com sucesso!');
  } catch (error: any) {
    console.error('\n❌ Erro na verificação:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('password')) {
      console.error('\n💡 Dica: Verifique se a senha em DATABASE_URL está correta');
    }
    
    process.exit(1);
  }
}

verify();
