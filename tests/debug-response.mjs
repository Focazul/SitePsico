#!/usr/bin/env node
import axios from 'axios';

console.log('\n🔍 INVESTIGANDO A RESPOSTA DO BACKEND\n');

try {
  const csrfRes = await axios.get('https://backend-production-4a6b.up.railway.app/api/csrf-token');
  const token = csrfRes.data.token;

  const res = await axios.post(
    'https://backend-production-4a6b.up.railway.app/api/trpc/auth.login',
    { json: { email: 'admin@psicologo.local', password: 'Admin@123456' } },
    {
      headers: {
        'x-csrf-token': token,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    }
  );

  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('\nRaw Data:');
  console.log(res.data);
  console.log('\nData Type:', typeof res.data);
  
  if (typeof res.data === 'string') {
    console.log('\n❌ PROBLEMA: Resposta é string em vez de JSON!');
    console.log('Conteúdo:', res.data);
  }

} catch (error) {
  console.error('Erro:', error.message);
}
