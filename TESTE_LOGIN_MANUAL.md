# 🧪 Teste Manual de Login

Abra o console do navegador (F12) na página de login e cole este script:

```javascript
// Teste de Login - Cole no console
(async () => {
  console.log('🧪 Iniciando teste de login...');
  
  try {
    // 1. Obter CSRF token
    console.log('📍 Passo 1: Obtendo CSRF token...');
    const csrfResp = await fetch('https://backend-production-4a6b.up.railway.app/api/csrf-token', {
      credentials: 'include',
    });
    const csrfData = await csrfResp.json();
    const token = csrfData.token;
    console.log('✅ Token:', token.substring(0, 20) + '...');
    
    // 2. Fazer login
    console.log('📍 Passo 2: Tentando login...');
    const loginResp = await fetch('https://backend-production-4a6b.up.railway.app/api/trpc/auth.login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify({
        "0": {
          email: 'admin@psicologo.local',
          password: 'Admin@123456',
        }
      }),
    });
    
    console.log('📊 Status:', loginResp.status);
    const result = await loginResp.json();
    console.log('📊 Resultado:', result);
    
    if (loginResp.ok && result.ok) {
      console.log('✅ LOGIN SUCESSO!');
      console.log('👤 Usuário:', result.result.data);
    } else {
      console.log('❌ Erro:', result);
    }
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
})();
```

**Instruções:**
1. Abra: https://psicologo-sp-site.vercel.app/admin/settings
2. Abra DevTools (F12)
3. Vá para Console
4. Cole o script acima
5. Pressione ENTER
6. Verifique o resultado nos logs

---

## ✅ Se vir "✅ LOGIN SUCESSO!"
Significa que o backend está respondendo corretamente e você pode fazer login no navegador.

## ❌ Se vir erro
Me envie o resultado exato que apareceu nos logs para diagnosticarmos.
