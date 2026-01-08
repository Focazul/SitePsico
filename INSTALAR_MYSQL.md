# 🗄️ INSTALAÇÃO DO MYSQL - GUIA COMPLETO

## 📥 Passo 1: Download

### Opção A: MySQL Community Server (RECOMENDADO)
1. Acesse: https://dev.mysql.com/downloads/installer/
2. Baixe: **Windows (x86, 32-bit), MSI Installer** (mysql-installer-community-8.X.X.X.msi)
3. Clique em "No thanks, just start my download"

### Opção B: XAMPP (Mais Fácil - Inclui MySQL + phpMyAdmin)
1. Acesse: https://www.apachefriends.org/pt_br/download.html
2. Baixe a versão Windows
3. Instale e inicie o MySQL Control Panel

---

## ⚙️ Passo 2: Instalação (MySQL Community)

1. **Execute o instalador** `.msi` baixado
2. **Escolha**: "Developer Default" (instala tudo necessário)
3. Clique em "Next" → "Execute" (instala dependências)
4. **MySQL Server Configuration:**
   - Type: Development Computer
   - Port: **3306** (padrão)
   - Authentication Method: **Use Strong Password Encryption**
   - Root Password: `123456` (anote essa senha!)
   - Clique em "Add User" (opcional)
   - "Next" → "Execute" → "Finish"

5. **MySQL Router**: Pule esta etapa (Next)
6. **Samples and Examples**: Instale (opcional)
7. **Finish!**

---

## ✅ Passo 3: Verificar Instalação

Abra o **Prompt de Comando** e teste:

```cmd
mysql --version
```

**Deve mostrar algo como:**
```
mysql  Ver 8.0.XX for Win64 on x86_64 (MySQL Community Server - GPL)
```

---

## 🔧 Passo 4: Criar o Banco de Dados

### Opção 1: Via Prompt de Comando

```cmd
mysql -u root -p
```

Digite a senha: `123456` (a que você definiu)

Depois execute:

```sql
CREATE DATABASE site_psicolog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

### Opção 2: Via MySQL Workbench (GUI)

1. Abra o **MySQL Workbench** (instalado junto)
2. Conecte com root/senha
3. Query → New Query
4. Cole e execute:
```sql
CREATE DATABASE site_psicolog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 📝 Passo 5: Configurar .env

Edite o arquivo `.env` na pasta do projeto:

```dotenv
# --- Banco de Dados ---
DATABASE_URL=mysql://root:123456@localhost:3306/site_psicolog
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=site_psicolog
```

⚠️ **IMPORTANTE:** Troque `123456` pela senha que você definiu!

---

## 🚀 Passo 6: Criar as Tabelas (Migrations)

No terminal do projeto, execute:

```cmd
cd "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"
npm run db:push
```

**Deve mostrar:**
```
✓ Generated migrations
✓ Applied migrations
```

---

## ✅ Verificar se Funcionou

```cmd
mysql -u root -p site_psicolog
```

Digite a senha, depois:

```sql
SHOW TABLES;
```

**Deve listar as tabelas:**
```
+---------------------------+
| Tables_in_site_psicolog   |
+---------------------------+
| appointments              |
| availability              |
| blocked_dates             |
| blog_posts                |
| contact_messages          |
| email_logs                |
| pages                     |
| settings                  |
| users                     |
+---------------------------+
```

Digite `EXIT;` para sair.

---

## 🎯 Passo 7: Testar o Sistema

1. Reinicie os servidores:
```cmd
START_DEV.bat
```

2. Acesse: http://localhost:5173/admin/settings

3. Agora deve funcionar sem erros! ✅

---

## 🔧 Resolução de Problemas

### "Access denied for user 'root'@'localhost'"
- Senha incorreta no `.env`
- Verifique: `DB_PASSWORD=SUA_SENHA_AQUI`

### "Can't connect to MySQL server"
- MySQL não está rodando
- Abra "Serviços" (Windows) → MySQL80 → Iniciar
- Ou via XAMPP Control Panel → Start MySQL

### "Unknown database 'site_psicolog'"
- Você pulou o Passo 4
- Execute: `CREATE DATABASE site_psicolog;`

### "Table doesn't exist"
- Você pulou o Passo 6
- Execute: `npm run db:push`

---

## 📋 Checklist Rápido

- [ ] MySQL instalado (`mysql --version` funciona)
- [ ] Banco `site_psicolog` criado
- [ ] `.env` configurado com senha correta
- [ ] Migrations executadas (`npm run db:push`)
- [ ] MySQL rodando (serviço ativo)
- [ ] Servidores reiniciados

---

## 🎉 Próximo Passo

Depois de concluir tudo acima, execute:

```cmd
cd "c:\Users\marce\Music\projeto site\teste 1\primeiras ideias"
START_DEV.bat
```

Acesse: http://localhost:5173/admin/settings

**Agora vai funcionar perfeitamente!** 🚀
