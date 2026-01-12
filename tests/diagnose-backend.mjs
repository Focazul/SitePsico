#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO COMPLETO DO BACKEND
 * 
 * Verifica:
 * 1. Conectividade com Railway MySQL
 * 2. Status do servidor backend
 * 3. Endpoints tRPC
 * 4. Logs de erro
 * 5. Variáveis de ambiente
 */

import axios from 'axios';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';

console.log('\n' + '='.repeat(70));
console.log('🔍 DIAGNÓSTICO COMPLETO DO BACKEND');
console.log('='.repeat(70) + '\n');

const tests = [];

async function test(name, fn) {
  console.log(`\n${name}`);
  console.log('-'.repeat(70));
  try {
    await fn();
  } catch (error) {
    console.error(`❌ ERRO: ${error.message}`);
  }
}

// Test 1: Health Check
await test('1️⃣  HEALTH CHECK', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 5000
    });
    console.log(`✅ Status: ${res.status}`);
    console.log(`📄 Response:`, JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error(`❌ Falhou: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.error('Data:', error.response.data);
    }
  }
});

// Test 2: Schema Status
await test('2️⃣  SCHEMA STATUS', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/schema-status`, {
      timeout: 5000
    });
    console.log(`✅ Status: ${res.status}`);
    console.log(`📄 Response:`, JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error(`❌ Falhou: ${error.response?.status || error.message}`);
  }
});

// Test 3: CSRF Token
await test('3️⃣  CSRF TOKEN GENERATION', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/csrf-token`, {
      timeout: 5000
    });
    console.log(`✅ Status: ${res.status}`);
    console.log(`🔐 Token gerado: ${res.data.token ? '✅ Sim' : '❌ Não'}`);
    console.log(`📄 Response:`, JSON.stringify(res.data, null, 2).substring(0, 200));
  } catch (error) {
    console.error(`❌ Falhou: ${error.response?.status || error.message}`);
  }
});

// Test 4: tRPC Settings Endpoint
await test('4️⃣  tRPC SETTINGS ENDPOINT', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/trpc/settings.getPublic`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log(`✅ Status: ${res.status}`);
    
    if (res.data.result) {
      const data = res.data.result.data?.json;
      console.log(`✅ Dados retornados: ${Array.isArray(data) ? `${data.length} items` : typeof data}`);
      console.log(`📄 Exemplo:`, JSON.stringify(data).substring(0, 200));
    }
  } catch (error) {
    console.error(`❌ Falhou: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data).substring(0, 300));
    }
  }
});

// Test 5: Check Connection to Backend
await test('5️⃣  CONNECTIVITY TEST', async () => {
  try {
    const start = Date.now();
    const res = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      validateStatus: () => true
    });
    const duration = Date.now() - start;
    
    console.log(`✅ Conectado`);
    console.log(`   Status: ${res.status}`);
    console.log(`   Tempo de resposta: ${duration}ms`);
    console.log(`   Headers:`, {
      'content-type': res.headers['content-type'],
      'x-powered-by': res.headers['x-powered-by'],
      'cache-control': res.headers['cache-control']
    });
  } catch (error) {
    console.error(`❌ Conexão falhou: ${error.message}`);
  }
});

// Test 6: Test with Different Endpoints
await test('6️⃣  ENDPOINTS DISPONÍVEIS', async () => {
  const endpoints = [
    '/api/health',
    '/api/csrf-token',
    '/api/schema-status',
    '/api/trpc/settings.getPublic',
    '/'
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(`${BACKEND_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: () => true
      });
      console.log(`   ${endpoint.padEnd(30)} → ${res.status} ${res.statusText}`);
    } catch (error) {
      console.log(`   ${endpoint.padEnd(30)} → ❌ ${error.code || error.message}`);
    }
  }
});

// Test 7: Check MySQL Connection (via backend)
await test('7️⃣  DATABASE CONNECTION (via backend)', async () => {
  try {
    // Try to get settings which requires DB
    const res = await axios.get(`${BACKEND_URL}/api/trpc/settings.getPublic`, {
      timeout: 5000,
      validateStatus: () => true
    });

    if (res.status === 200) {
      console.log(`✅ Banco de dados: Conectado`);
      const data = res.data.result?.data?.json;
      if (Array.isArray(data)) {
        console.log(`   Registros encontrados: ${data.length}`);
      }
    } else if (res.status === 500) {
      console.error(`❌ Erro 500 - Possível erro de conexão com MySQL`);
      if (res.data?.error) {
        console.error(`   Erro: ${JSON.stringify(res.data.error).substring(0, 200)}`);
      }
    } else {
      console.log(`⚠️  Status inesperado: ${res.status}`);
    }
  } catch (error) {
    console.error(`❌ Falhou: ${error.message}`);
  }
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('📋 RESUMO DE DIAGNÓSTICO');
console.log('='.repeat(70));
console.log(`
🔗 Backend URL: ${BACKEND_URL}
⏰ Timestamp: ${new Date().toISOString()}

💡 PRÓXIMAS AÇÕES:
   1. Se Health Check falha → Backend não está respondendo
   2. Se CSRF Token falha → Middleware de CSRF está com erro
   3. Se Settings falha → Erro de conexão com MySQL ou query
   4. Acesse https://psicologo-sp-site.vercel.app/admin/settings para testar frontend
   5. Verifique logs no Railway: https://railway.app/

📞 SUPORTE:
   • Verifique variáveis de ambiente no Railway
   • Confirme que MySQL está rodando
   • Verifique banco de dados 'site_psicolog' existe
`);
console.log('='.repeat(70) + '\n');
