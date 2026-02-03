/**
 * Executar seed da tabela settings via API
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('🌱 Executando seed da tabela settings...\n');

try {
  // Obter CSRF token
  console.log('🔐 Obtendo CSRF token...');
  const csrfResponse = await fetch(`${BACKEND_URL}/api/csrf-token`);
  const { token } = await csrfResponse.json();
  console.log('✅ Token obtido\n');

  // Executar seed
  console.log('📊 Executando seed...');
  const response = await fetch(`${BACKEND_URL}/api/seed-settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token,
    },
  });

  const data = await response.json();

  if (data.ok) {
    console.log('✅ Seed executado com sucesso!');
    console.log(`   Mensagem: ${data.message}`);
    console.log(`   Registros: ${data.count || 'N/A'}`);
    
    console.log('\n📍 Próximos passos:');
    console.log('   1. Acesse: https://psicologo-sp-site.vercel.app/admin/settings');
    console.log('   2. Faça login com admin@psicologo.com / Admin@123456');
    console.log('   3. Personalize as configurações com seus dados reais');
    console.log('   4. Atualize: Nome, CRP, endereço, telefone, valores, etc.');
  } else {
    console.log('❌ Erro ao executar seed:');
    console.log(`   ${data.error}`);
  }
} catch (error) {
  console.log('❌ Erro na requisição:');
  console.log(`   ${error.message}`);
}
