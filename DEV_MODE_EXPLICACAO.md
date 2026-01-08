# 🔧 MODO DESENVOLVEDOR (DEV MODE)

## ✅ Ativado Agora!

```
DEV_SKIP_AUTH=true
```

O sistema está em **modo desenvolvedor** com autenticação **desativada**.

---

## 📋 O Que Significa:

### ✅ Agora você pode:
- ✅ Acessar Admin Panel **SEM FAZER LOGIN**
- ✅ Testar todas as funcionalidades
- ✅ Editar Settings livremente
- ✅ Usar tRPC endpoints sem credentials
- ✅ Desenvolvimento rápido e sem barreiras

### ⚠️ Limitações (por enquanto):
- Dados em memória (não persistem sem MySQL)
- Sem autenticação real (segurança desativada)
- Modo DEV apenas

---

## 🔐 Como Ativar Segurança/Login

### **Passo 1: Editar .env**

```dotenv
# MODO DEV (atual)
DEV_SKIP_AUTH=true

# MUDAR PARA:
DEV_SKIP_AUTH=false
```

### **Passo 2: Reiniciar Servidor**
```bash
# Parar: Ctrl+C
# Iniciar: npm run dev
```

### **Passo 3: Login Obrigatório**
Você precisará fazer login em:
```
http://localhost:5173/login
```

Credenciais padrão:
```
Email: adm
Senha: admteste
```

---

## 📊 Configurações de Autenticação

| Configuração | Valor | Efeito |
|-------------|-------|--------|
| `DEV_SKIP_AUTH=true` | ✅ ON | Acesso sem login (DEV) |
| `DEV_SKIP_AUTH=false` | ❌ OFF | Requer login (SEGURO) |

---

## 🗄️ Sobre o MySQL

### **Você PRECISA de MySQL para:**
- ✅ Dados persistirem (salvar Settings)
- ✅ Testes de produção
- ✅ Sistema real

### **Você NÃO precisa de MySQL para:**
- ❌ Testes básicos do UI
- ❌ Verificar funcionalidades
- ❌ Desenvolvimento inicial

---

## 📋 Recomendação Atual:

```
┌──────────────────────────────────────────┐
│  CONTINUAR SEM MySQL                     │
│                                          │
│  ✅ DEV_SKIP_AUTH=true (agora)          │
│  ✅ Teste todas as funcionalidades      │
│  ✅ Sem dados persistentes (OK por agora)
│                                          │
│  QUANDO PRECISAR:                        │
│  → Instale MySQL                         │
│  → Atualize DATABASE_URL em .env         │
│  → Execute: npm run db:push              │
│  → Mude DEV_SKIP_AUTH=false             │
└──────────────────────────────────────────┘
```

---

## 🚀 Próximas Ações:

1. **Agora:** Recarregue http://localhost:5173/admin/settings
2. **Teste:** Edite um campo e clique "Salvar"
3. **Verifique:** Se o toast de sucesso aparece
4. **Depois (opcional):** Instale MySQL quando necessário

---

## 📞 Status Atual:

- ✅ Autenticação: Desativada (DEV MODE)
- ✅ Admin Panel: Acessível sem login
- ⏳ Dados: Em memória (não persistem)
- ⚠️ MySQL: NÃO necessário agora

**Tudo pronto para testar!** 🎉
