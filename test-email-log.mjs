import fetch from 'node-fetch';

const data = {
  name: 'Teste Debug',
  email: 'marcelo@teste.com',
  subject: 'Teste de Email Log',
  content: 'Este é um teste para verificar se os logs estão sendo criados corretamente no banco de dados.'
};

console.log('Enviando mensagem de teste...');
fetch('http://localhost:3000/trpc/contact.sendMessage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    json: data,
  })
})
.then(r => r.json())
.then(d => {
  console.log('Response:', JSON.stringify(d, null, 2));
  process.exit(0);
})
.catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
