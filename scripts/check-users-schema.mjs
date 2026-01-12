#!/usr/bin/env node

import mysql from 'mysql2/promise';

const RAILWAY_CREDENTIALS = {
  host: 'switchyard.proxy.rlwy.net',
  port: 46292,
  user: 'root',
  password: 'itWCIsLfNRxowhpSaQfFGFQFjFutOLEo',
  database: 'railway',
};

async function main() {
  try {
    const connection = await mysql.createConnection(RAILWAY_CREDENTIALS);

    // Ver estrutura da tabela users
    console.log('\n📋 Estrutura da tabela users:\n');
    const [columns] = await connection.execute(
      'DESCRIBE users'
    );

    console.log(columns);
    
    await connection.end();
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

main();
