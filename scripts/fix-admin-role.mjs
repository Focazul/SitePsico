import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdminRole() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('[Admin Fix] DATABASE_URL não definida');
    process.exit(1);
  }

  console.log('[Admin Fix] Conectando ao banco de dados PostgreSQL...');

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('[Admin Fix] ✅ Conectado ao banco de dados');

    // Listar todos os usuários
    console.log('[Admin Fix] Listando usuários...');
    const result = await client.query('SELECT id, email, name, role FROM users ORDER BY id');
    const users = result.rows;
    console.log('[Admin Fix] Usuários encontrados:', users);

    if (users.length === 0) {
      console.log('[Admin Fix] Nenhum usuário encontrado');
      await client.end();
      return;
    }

    // Atualizar todos os usuários para admin
    console.log('[Admin Fix] Atualizando todos os usuários para role=admin...');
    const updateResult = await client.query('UPDATE users SET role = $1 WHERE role != $2', ['admin', 'admin']);
    console.log('[Admin Fix] Usuários atualizados:', updateResult.rowCount);

    // Verificar resultado
    const verifyResult = await client.query('SELECT id, email, name, role FROM users ORDER BY id');
    console.log('[Admin Fix] Usuários após atualização:', verifyResult.rows);

    console.log('[Admin Fix] ✅ Sucesso! Todos os usuários agora têm role=admin');
    
    await client.end();
  } catch (error) {
    console.error('[Admin Fix] ❌ Erro:', error.message);
    process.exit(1);
  }
}

fixAdminRole().catch(console.error);

fixAdminRole().catch(console.error);
