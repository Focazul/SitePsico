/**
 * Script para Diagnóstico Completo do CSRF Token
 * 
 * Como usar:
 * 1. Abrir browser em https://psicologo-sp-site.vercel.app/admin/settings
 * 2. Abrir Console (F12)
 * 3. Cole este script inteiro
 * 4. Pressione Enter
 * 5. Siga as instruções
 */

console.clear();
console.log("🔐 DIAGNÓSTICO CSRF TOKEN - Site Psicólogo SP");
console.log("=" .repeat(60));

// Teste 1: Verificar se consegue obter CSRF token
console.log("\n📌 TESTE 1: Obter CSRF Token");
console.log("-".repeat(60));

fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(async (response) => {
  console.log("Status:", response.status);
  console.log("Headers:", {
    contentType: response.headers.get('Content-Type'),
    setCookie: response.headers.get('Set-Cookie') ? 'Presente' : 'Ausente',
  });
  
  const data = await response.json();
  console.log("Response:", data);
  
  return data.token;
})
.then((token) => {
  if (!token) {
    console.error("❌ Token vazio!");
    return;
  }
  
  console.log("✅ Token obtido:", token.substring(0, 20) + "...");
  console.log("\n📌 TESTE 2: Fazer Login com CSRF Token");
  console.log("-".repeat(60));
  
  // Teste 2: Fazer login com token
  return fetch('https://backend-production-4a6b.up.railway.app/api/trpc/auth.login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    },
    body: JSON.stringify({
      "0": {
        json: {
          email: "admin@psicologo.local",
          password: "Admin@123456"
        }
      }
    })
  });
})
.then(async (response) => {
  console.log("Status:", response.status);
  console.log("Status Text:", response.statusText);
  
  const text = await response.text();
  console.log("Raw Response:", text.substring(0, 200) + "...");
  
  try {
    const json = JSON.parse(text);
    console.log("Parsed JSON:", json);
    
    if (json.result?.data) {
      console.log("✅ LOGIN SUCESSO!");
      console.log("User:", json.result.data);
    } else if (json.error?.json?.message) {
      console.log("❌ Login falhou:", json.error.json.message);
    }
  } catch (e) {
    console.error("❌ Erro ao parsear response:", e);
  }
})
.catch((error) => {
  console.error("❌ Erro na requisição:", error);
})
.finally(() => {
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS RESULTADOS:");
  console.log("=".repeat(60));
  console.log(`
1. ✅ CSRF Token foi obtido?
2. ✅ Login retornou sucesso?
3. 📸 Se houver erros, copie e cole aqui para diagnóstico
  `);
});

console.log("\n⏳ Aguardando resultados... (este script continuará em background)");
