# 🚀 CRIAR ADMIN - INSTRUÇÕES COMPLETAS

## ⚡ Método Rápido (Recomendado)

### 1️⃣ Obter Credenciais do Railway

1. Acesse: https://railway.app/
2. Faça login
3. Abra o projeto: **psicologo-sp-site**
4. Clique no serviço: **MySQL**
5. Vá em: **Variables**

Você verá algo assim:
```
MYSQLHOST=roundhouse.proxy.rlwy.net
MYSQLPORT=12345
MYSQLUSER=root
MYSQLPASSWORD=abc123xyz
MYSQLDATABASE=railway
```

### 2️⃣ Editar Script

Abra o arquivo: `scripts/create-admin-manual.mjs`

Edite estas linhas (por volta da linha 25):

```javascript
const RAILWAY_CREDENTIALS = {
  host: 'roundhouse.proxy.rlwy.net',  // ← Cole MYSQLHOST aqui
  user: 'root',                        // ← Cole MYSQLUSER aqui
  password: 'abc123xyz',               // ← Cole MYSQLPASSWORD aqui
  database: 'railway',                 // ← Cole MYSQLDATABASE aqui
  port: 12345,                         // ← Cole MYSQLPORT aqui (número sem aspas)
};
```

### 3️⃣ Executar Script

```bash
cd "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"
node scripts/create-admin-manual.mjs
```

### 4️⃣ Fazer Login

Acesse: https://psicologo-sp-site.vercel.app/admin/settings

**Credenciais:**
- Email: `admin@psicologo.local`
- Senha: `Admin@123456`

---

## 🔧 Método Alternativo (SQL Direto)

Se preferir executar SQL manualmente no Railway:

### 1️⃣ Acessar MySQL CLI

No Railway Dashboard:
1. MySQL → **Connect**
2. Clique em **MySQL CLI**
3. Cole e execute este SQL:

```sql
-- Remover admins antigos
DELETE FROM users WHERE email IN ('adm', 'admin@psicologo.local') OR role = 'admin';

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
SELECT id, email, name, role FROM users WHERE role = 'admin';
```

---

## ✅ Testar

Após criar o usuário:

```bash
node tests/test-login-detailed.mjs
```

Deve retornar:
```
Status: 200
✅ LOGIN FUNCIONANDO!
```

---

## 📝 Resumo

**Email:** `admin@psicologo.local`  
**Senha:** `Admin@123456`

Após criar o usuário, o erro **"Unable to transform response from server"** desaparecerá!

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se as credenciais do Railway estão corretas
- Confirme que o MySQL está online no Railway

### Erro: "Access denied"
- Verifique o MYSQLUSER e MYSQLPASSWORD
- Tente recopiar do Railway

### Erro: "Duplicate entry"
- O usuário já existe
- Execute novamente - o script remove o antigo

---

## 💡 Dúvidas?

Execute para verificar status do banco:
```bash
node tests/diagnose-backend.mjs
```
