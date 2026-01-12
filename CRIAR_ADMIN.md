# 🔐 CRIAR USUÁRIO ADMIN NO RAILWAY

## 📝 Passo a Passo:

### 1️⃣  Acessar Railway MySQL

1. Acesse: https://railway.app/
2. Entre no projeto **psicologo-sp-site**
3. Clique no serviço **MySQL**
4. Vá em **Connect** → **MySQL CLI**

---

### 2️⃣  Executar SQL

Cole e execute este SQL:

```sql
-- Remover usuário antigo (se existir)
DELETE FROM users WHERE email IN ('adm', 'admin@psicologo.local') AND role = 'admin';

-- Criar novo admin
INSERT INTO users (email, password, name, role, createdAt, updatedAt) 
VALUES (
  'admin@psicologo.local',
  'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6',
  'Administrador',
  'admin',
  NOW(),
  NOW()
);

-- Verificar
SELECT id, email, name, role, createdAt FROM users WHERE role = 'admin';
```

---

### 3️⃣  Credenciais

Após executar o SQL, use:

- **Email:** `admin@psicologo.local`
- **Senha:** `Admin@123456`

---

### 4️⃣  Testar

1. Acesse: https://psicologo-sp-site.vercel.app/admin/settings
2. Faça login
3. Teste alterando uma configuração
4. Verifique se aparece no frontend

---

## ⚠️ IMPORTANTE

O erro **"Unable to transform response from server"** que você está vendo é porque:

1. **O usuário não existe no banco** → Backend retorna erro 500
2. O frontend tenta fazer parse mas mostra erro genérico

Após criar o usuário no banco, o login funcionará normalmente!

---

## 🔧 Alternativa: Testar com Endpoint de Debug

Se preferir testar antes de criar o usuário, execute:

```bash
cd "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"
node tests/test-login-detailed.mjs
```

Isso mostrará exatamente o que o backend está retornando.
