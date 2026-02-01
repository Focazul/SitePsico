-- Seed: Configurações de Google Maps para Fase 6.5
-- Este arquivo popula as configurações necessárias para exibir o mapa na página de contato

INSERT INTO settings (key, value, type, description, createdAt, updatedAt) VALUES
  ('map_enabled', 'true', 'boolean', 'Se o mapa do Google Maps está habilitado na página de contato', NOW(), NOW()),
  ('map_latitude', '-23.5505', 'number', 'Latitude da localização do consultório', NOW(), NOW()),
  ('map_longitude', '-46.6333', 'number', 'Longitude da localização do consultório', NOW(), NOW()),
  ('map_title', 'Consultório de Psicologia', 'string', 'Título que aparece no marcador do mapa', NOW(), NOW()),
  ('map_address', 'São Paulo, SP', 'string', 'Endereço completo para exibir no mapa', NOW(), NOW()),
  ('map_phone_number', '(11) 99999-9999', 'string', 'Número de telefone na info window do mapa', NOW(), NOW()),
  ('map_hours', 'Seg-Sex: 09:00 - 18:00', 'string', 'Horário de funcionamento na info window do mapa', NOW(), NOW()),
  ('map_zoom', '15', 'number', 'Nível de zoom inicial do mapa', NOW(), NOW())
ON DUPLICATE KEY UPDATE value=VALUES(value), updatedAt=NOW();
