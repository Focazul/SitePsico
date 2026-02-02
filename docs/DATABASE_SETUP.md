# Configuração do Banco de Dados

Este projeto foi desenvolvido para utilizar **PostgreSQL**.

## 🚨 Importante sobre Hospedagem Compartilhada (HostGator, Locaweb, etc.)

Os IPs que você forneceu (`74.220...`) pertencem à HostGator. Geralmente, esses planos oferecem bancos de dados **MySQL**.

**Este projeto NÃO funcionará com MySQL.** O código utiliza drivers e sintaxe específicos do PostgreSQL (`drizzle-orm/postgres-js`).

Além disso, conexões remotas em hospedagens compartilhadas costumam ser lentas, instáveis ou bloqueadas por firewall, o que causaria erros na sua aplicação no Render.

## ✅ Recomendação: Supabase ou Render PostgreSQL

Para garantir que o projeto funcione corretamente, você precisa de um banco de dados PostgreSQL na nuvem. As melhores opções gratuitas/baratas são:

### Opção 1: Supabase (Recomendado)
É a opção mais robusta e fácil de gerenciar.

1.  Crie uma conta em [supabase.com](https://supabase.com).
2.  Crie um novo projeto.
3.  Vá em **Project Settings** > **Database**.
4.  Em **Connection String** > **URI**, copie a string de conexão.
    *   Ela se parece com: `postgresql://postgres:[SUA-SENHA]@db.xyz.supabase.co:5432/postgres`
5.  No painel do Render (Environment Variables), defina `DATABASE_URL` com esse valor.

### Opção 2: Render PostgreSQL
O próprio Render oferece PostgreSQL gerenciado.

1.  No painel do Render, clique em **New +** > **PostgreSQL**.
2.  Dê um nome (ex: `sitepsico-db`).
3.  Após criado, copie a **Internal Database URL** (se ambos estiverem no Render) ou **External Database URL**.
4.  Defina a variável `DATABASE_URL` no seu serviço web.

## Resumo

*   **Preciso do Supabase?** Sim (ou outro Postgres).
*   **Os IPs da HostGator ajudam?** Não, pois provavelmente são para MySQL ou exigiriam uma reescrita complexa do código.
