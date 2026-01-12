#!/usr/bin/env node

/**
 * ✅ TESTE FINAL SIMPLIFICADO
 * Sem muitas tentativas - apenas uma
 */

import axios from 'axios';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';

console.log('\n' + '='.repeat(70));
console.log('✅ TESTE: LOGIN + UPDATE (SEM RATE LIMIT)');
console.log('='.repeat(70) + '\n');

try {
  // 1. CSRF
  console.log('1️⃣  Obter CSRF Token...');
  const csrfRes = await axios.get(`${BACKEND_URL}/api/csrf-token`);
  const csrfToken = csrfRes.data.token;
  console.log(`   ✅ Token: ${csrfToken.substring(0, 20)}...\n`);

  // 2. LOGIN
  console.log('2️⃣  Fazer login com adm/admteste...');
  const loginRes = await axios.post(
    `${BACKEND_URL}/api/trpc/auth.login`,
    { json: { email: 'adm', password: 'admteste' } },
    {
      headers: {
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    }
  );

  console.log(`   Status: ${loginRes.status}`);

  if (loginRes.status === 200 || loginRes.status === 201) {
    console.log(`   ✅ LOGIN FUNCIONANDO!\n`);

    // 3. Capturar cookie
    const setCookie = loginRes.headers['set-cookie'];
    let cookie = '';
    if (setCookie) {
      cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      console.log(`3️⃣  Cookie de sessão obtido\n`);
    }

    // 4. UPDATE
    console.log('4️⃣  Atualizar configuração...');
    
    const updateRes = await axios.post(
      `${BACKEND_URL}/api/trpc/settings.updateSetting`,
      {
        json: {
          key: 'psychologist_name',
          value: `Dr. ${Date.now()}`,
          type: 'string'
        }
      },
      {
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json',
          'Cookie': cookie
        },
        validateStatus: () => true
      }
    );

    console.log(`   Status: ${updateRes.status}`);

    if (updateRes.status === 200) {
      console.log(`   ✅ UPDATE FUNCIONANDO!\n`);
      console.log('🎉 FLUXO COMPLETO FUNCIONANDO!\n');
    } else {
      console.log(`   ❌ Erro: ${updateRes.data.error?.json?.message || updateRes.status}\n`);
    }
  } else if (loginRes.status === 429) {
    console.log(`   ⏳ Rate limit ativo (429). Tente em 15 minutos.\n`);
  } else {
    const msg = loginRes.data.error?.json?.message || 'Erro desconhecido';
    console.log(`   ❌ Erro: ${msg.substring(0, 100)}\n`);
  }

  // 5. Verificar settings
  console.log('5️⃣  Verificar settings atuais...');
  const settingsRes = await axios.get(`${BACKEND_URL}/api/trpc/settings.getPublic`);
  const settings = settingsRes.data.result?.data?.json;

  if (Array.isArray(settings)) {
    const pname = settings.find(s => s.key === 'psychologist_name');
    console.log(`   Nome: ${pname?.value}\n`);
  }

} catch (error) {
  console.error(`❌ Erro: ${error.message}\n`);
}

console.log('=' .repeat(70) + '\n');
