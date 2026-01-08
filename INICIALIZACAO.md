# Inicialização Rápida do Sistema

## Uso

Execute o arquivo **INICIAR.bat** clicando duas vezes nele.

Esse arquivo único vai:

1. ✅ Verificar e iniciar o MySQL (via serviço Windows ou XAMPP)
2. ✅ Verificar e instalar dependências (node_modules)
3. ✅ Verificar arquivo .env
4. ✅ Iniciar o Backend (porta 3000)
5. ✅ Iniciar o Frontend (porta 5173)

## Acessos

Após iniciar:
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:5173
- **Admin:** http://localhost:5173/admin

## Parar o Sistema

Para parar, basta fechar as janelas dos servidores (Backend e Frontend).

## Outros Arquivos Úteis

- `VERIFICAR_SISTEMA.bat` - Verifica se tudo está instalado
- `INSTALL.bat` - Ajuda a instalar MySQL/XAMPP
- `TESTE_SETTINGS.bat` - Testa configurações

## Observações

- Se o MySQL não iniciar, você pode precisar instalar o XAMPP ou MySQL primeiro
- O arquivo .env precisa estar configurado corretamente
