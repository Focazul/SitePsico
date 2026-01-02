-- Seed inicial de configurações do psicólogo
-- Execute este SQL após criar o banco de dados

INSERT INTO settings (`key`, `value`, `type`, `description`) VALUES
-- Informações do Psicólogo
('psychologist_name', 'Dr. [Nome do Psicólogo]', 'string', 'Nome completo do psicólogo'),
('psychologist_crp', 'CRP 06/123456', 'string', 'Número do CRP'),
('psychologist_phone', '(11) 99999-9999', 'string', 'Telefone para contato'),
('psychologist_email', 'contato@psicologo.com.br', 'string', 'Email profissional'),

-- Endereço do Consultório
('office_address_street', 'Rua Exemplo, 123', 'string', 'Endereço do consultório'),
('office_address_complement', 'Sala 45', 'string', 'Complemento do endereço'),
('office_address_district', 'Jardim Paulista', 'string', 'Bairro'),
('office_address_city', 'São Paulo', 'string', 'Cidade'),
('office_address_state', 'SP', 'string', 'Estado'),
('office_address_zip', '01310-100', 'string', 'CEP'),

-- Links de Reunião Online
('meeting_link_base', 'https://meet.google.com/', 'string', 'URL base para reuniões online'),
('meeting_provider', 'Google Meet', 'string', 'Provedor de videochamadas (Google Meet, Zoom, etc)'),

-- Redes Sociais
('social_instagram', '', 'string', 'URL do Instagram'),
('social_linkedin', '', 'string', 'URL do LinkedIn'),
('social_facebook', '', 'string', 'URL do Facebook'),
('social_whatsapp', '5511999999999', 'string', 'Número do WhatsApp (com DDI e DDD)'),

-- WhatsApp Floating Button
('whatsapp_enabled', 'true', 'boolean', 'Exibir botão flutuante de WhatsApp'),
('whatsapp_default_message', 'Olá! Gostaria de saber mais sobre os atendimentos.', 'string', 'Mensagem padrão ao abrir WhatsApp'),

-- Horários de Atendimento
('office_hours_weekdays', 'Segunda a Sexta: 8h às 18h', 'string', 'Horários em dias úteis'),
('office_hours_saturday', 'Sábado: 8h às 12h', 'string', 'Horários aos sábados'),
('office_hours_sunday', 'Fechado', 'string', 'Horários aos domingos'),

-- Valores
('session_price_presential', 'R$ 200,00', 'string', 'Valor da sessão presencial'),
('session_price_online', 'R$ 180,00', 'string', 'Valor da sessão online'),
('session_duration', '60', 'number', 'Duração da sessão em minutos'),

-- Configurações de Email
('email_signature', 'Atenciosamente,\nDr. [Nome]', 'string', 'Assinatura padrão dos emails'),
('email_reply_time', 'até 24 horas em dias úteis', 'string', 'Tempo de resposta esperado'),

-- Features Toggles
('feature_online_booking', 'true', 'boolean', 'Permitir agendamento online'),
('feature_blog_comments', 'false', 'boolean', 'Permitir comentários no blog'),
('feature_newsletter', 'false', 'boolean', 'Exibir formulário de newsletter'),

-- Google Analytics
('google_analytics_enabled', 'false', 'boolean', 'Ativar Google Analytics 4'),
('google_analytics_id', '', 'string', 'ID de Medição do GA4 (G-XXXXXXXXXX)')

ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `description` = VALUES(`description`),
  `updatedAt` = CURRENT_TIMESTAMP;
