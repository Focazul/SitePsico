-- Script SQL para criar usuário de teste com hash simples
-- Execute isto no phpMyAdmin ou MySQL

-- Hash gerado para senha "123456"
-- Email: test@example.com
INSERT IGNORE INTO users (email, password, name, createdAt, updatedAt) 
VALUES (
    'test@example.com',
    'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6',
    'Usuário Teste',
    NOW(),
    NOW()
);

-- Após inserir, você pode fazer login com:
-- Email: test@example.com
-- Senha: admteste
-- URL: http://localhost:5175/login
