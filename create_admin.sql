-- Script SQL para criar admin
-- Copie e execute este comando no phpMyAdmin ou na linha de comando do MySQL

INSERT INTO users (email, password, name, role, createdAt, updatedAt) 
VALUES (
    'adm', 
    'a3dd8a0326059440e49b24d069da3535:a8aacd84dfeb69861c11613903b77e7a4c16216ad803367d5d1223145a62ff40e2043f93ac18ff62444e9f43a5898fdb77cd232129233171735392661c139f9a6', 
    'Admin', 
    'admin', 
    NOW(), 
    NOW()
);

-- Depois de executar, você pode fazer login com:
-- Email: adm
-- Senha: admteste
-- URL: http://localhost:5175/admin/login
