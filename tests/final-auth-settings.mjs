#!/usr/bin/env node

/**
 * ✅ TESTE FINAL: Login com "adm" + Update de Settings
 * 
 * Após ajuste no backend para aceitar email customizado
 */

import axios from 'axios';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';
const FRONTEND_URL = 'https://psicologo-sp-site.vercel.app';

console.log('\n' + '='.repeat(70));
console.log('✅ TESTE FINAL: FLUXO COMPLETO');
console.log('='.repeat(70) + '\n');

let cookies = [];

// ============= PASSO 1: CSRF Token =============
console.log('1️⃣  OBTER CSRF TOKEN\n');

let csrfToken = null;

try {
  const res = await axios.get(`${BACKEND_URL}/api/csrf-token`);
  csrfToken = res.data.token;
  
  // Capturar cookies de resposta
  const setCookie = res.headers['set-cookie'];
  if (setCookie) {
    cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  }
  
  console.log(`✅ CSRF Token obtido: ${csrfToken.substring(0, 20)}...`);
  console.log(`✅ Cookies obtidos: ${cookies.length > 0 ? 'Sim' : 'Não'}\n`);
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
  process.exit(1);
}

// ============= PASSO 2: LOGIN =============
console.log('2️⃣  FAZER LOGIN COM adm/admteste\n');

let sessionCookie = null;

try {
  const res = await axios.post(
    `${BACKEND_URL}/api/trpc/auth.login`,
    {
      json: {
        email: 'adm',
        password: 'admteste'
      }
    },
    {
      headers: {
        'x-csrf-token': csrfToken,
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; ')
      },
      validateStatus: () => true
    }
  );

  console.log(`Status: ${res.status}\n`);

  if (res.status === 200 || res.status === 201) {
    console.log(`✅ LOGIN FUNCIONANDO!\n`);
    console.log(`Resposta:`, JSON.stringify(res.data.result?.data?.json, null, 2));
    
    // Capturar cookie de sessão
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
      sessionCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      console.log(`\n✅ Cookie de sessão obtido`);
    }
  } else {
    console.error(`❌ Erro ${res.status}:`);
    console.error(JSON.stringify(res.data, null, 2).substring(0, 300));
  }
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
}

// ============= PASSO 3: UPDATE SETTING =============
console.log('\n3️⃣  ATUALIZAR CONFIGURAÇÃO\n');

try {
  // Obter novo CSRF token para mutação
  const csrfRes = await axios.get(`${BACKEND_URL}/api/csrf-token`);
  const newCsrfToken = csrfRes.data.token;

  // Preparar headers com cookie de sessão se disponível
  const headers = {
    'x-csrf-token': newCsrfToken,
    'Content-Type': 'application/json'
  };

  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }

  const updateValue = `Dr. Teste Atualizado ${Date.now()}`;

  const res = await axios.post(
    `${BACKEND_URL}/api/trpc/settings.updateSetting`,
    {
      json: {
        key: 'psychologist_name',
        value: updateValue,
        type: 'string'
      }
    },
    {
      headers,
      validateStatus: () => true
    }
  );

  console.log(`Status: ${res.status}\n`);

  if (res.status === 200) {
    console.log(`✅ UPDATE FUNCIONANDO!\n`);
    console.log(`Novo valor: "${updateValue}"\n`);
    console.log(`Resposta:`, JSON.stringify(res.data.result?.data?.json, null, 2).substring(0, 200));
  } else {
    console.error(`❌ Erro ${res.status}:`);
    const errorMsg = res.data.error?.json?.message || 'Desconhecido';
    console.error(errorMsg);
    
    if (res.status === 403) {
      console.log('\n💡 Dica: Erro 403 pode significar');
      console.log('   - Login não funcionou');
      console.log('   - Usuário não tem permissão de admin');
      console.log('   - Cookie de sessão expirou');
    }
  }
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
}

// ============= PASSO 4: VERIFICAR MUDANÇA =============
console.log('\n4️⃣  VERIFICAR MUDANÇA NO BANCO\n');

try {
  // Aguardar processamento
  await new Promise(r => setTimeout(r, 1000));

  const res = await axios.get(`${BACKEND_URL}/api/trpc/settings.getPublic`);
  const settings = res.data.result?.data?.json;

  if (Array.isArray(settings)) {
    const psychName = settings.find(s => s.key === 'psychologist_name');
    console.log(`Valor atual: "${psychName?.value}"\n`);
    
    if (psychName?.value.includes('Teste Atualizado')) {
      console.log(`✅ MUDANÇA SALVA NO BANCO!`);
    } else {
      console.log(`⚠️  Mudança não foi salva`);
    }
  }
} catch (error) {
  console.error(`❌ Erro: ${error.message}`);
}

// ============= RESUMO FINAL =============
console.log('\n' + '='.repeat(70));
console.log('📋 RESUMO');
console.log('='.repeat(70) + '\n');

console.log('Se todos os testes passaram:');
console.log('  ✅ Login funciona com "adm" / "admteste"');
console.log('  ✅ Settings podem ser atualizadas');
console.log('  ✅ Mudanças são salvas no banco\n');

console.log('Próxima etapa:');
console.log(`  1. Acesse: ${FRONTEND_URL}`);
console.log('  2. Vá para /admin/settings');
console.log('  3. Faça login e atualize as configurações');
console.log('  4. Verifique se aparecem no frontend\n');

console.log('='.repeat(70) + '\n');
