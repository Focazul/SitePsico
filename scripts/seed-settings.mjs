/**
 * Script para popular tabela settings
 * Use com Supabase PostgreSQL
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurada!');
  console.log('Configure DATABASE_URL com string de conexão Supabase');
  process.exit(1);
}

async function seedSettings() {
  console.log('🌱 Iniciando seed da tabela settings...\n');
  
  try {
    // Conectar ao banco
    console.log('📡 Conectando ao banco de dados...');
    const sql = postgres(DATABASE_URL);
    console.log('✅ Conectado!\n');
    
    // Ler arquivos SQL
    const psychologistSeedPath = join(__dirname, '..', 'drizzle', 'seed_psychologist_settings.sql');
    const mapSeedPath = join(__dirname, '..', 'drizzle', 'seed_map_settings.sql');
    
    console.log('📄 Carregando arquivos SQL...');
    const psychologistSql = readFileSync(psychologistSeedPath, 'utf-8');
    const mapSql = readFileSync(mapSeedPath, 'utf-8');
    
    // Limpar comentários e quebras de linha
    const cleanSql = (sql) => {
      return sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
        .join('\n')
        .trim();
    };
    
    const psychologistQuery = cleanSql(psychologistSql);
    const mapQuery = cleanSql(mapSql);
    
    // Verificar estado atual
    console.log('\n📊 Verificando estado atual da tabela settings...');
    const rows = await sql`SELECT COUNT(*) as count FROM settings`;
    const currentCount = rows[0].count;
    console.log(`   Registros atuais: ${currentCount}`);
    
    // Executar seed de configurações do psicólogo
    console.log('\n🔧 Populando configurações do psicólogo...');
    await sql.unsafe(psychologistQuery);
    console.log('✅ Configurações do psicólogo inseridas!');
    
    // Executar seed de configurações do mapa
    console.log('\n🗺️  Populando configurações do mapa...');
    await sql.unsafe(mapQuery);
    console.log('✅ Configurações do mapa inseridas!');
    
    // Verificar resultado
    console.log('\n📊 Verificando resultado...');
    const newRows = await sql`SELECT COUNT(*) as count FROM settings`;
    const newCount = newRows[0].count;
    console.log(`   Registros após seed: ${newCount}`);
    console.log(`   Novos registros: ${newCount - currentCount}`);
    
    // Listar algumas configurações inseridas
    console.log('\n📋 Exemplos de configurações inseridas:');
    const settings = await sql`
      SELECT key, value, type FROM settings LIMIT 10
    `;
    
    settings.forEach(setting => {
      const value = setting.value.length > 50 
        ? setting.value.substring(0, 50) + '...' 
        : setting.value;
      console.log(`   • ${setting.key} (${setting.type}): ${value}`);
    });
    
    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\n📍 Próximos passos:');
    console.log('   1. Acesse o painel admin: https://seu-app.onrender.com/admin/settings');
    console.log('   2. Personalize as configurações com seus dados');
    console.log('   3. Configure nome, CRP, endereço, telefone, etc.');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar seed:', error.message);
    if (error.query) {
      console.error('\n📄 Query que causou o erro:');
      console.error(error.query.substring(0, 500));
    }
    process.exit(1);
  } finally {
    await sql.end();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar
seedSettings();
