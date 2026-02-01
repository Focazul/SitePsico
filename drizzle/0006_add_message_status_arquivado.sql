-- Add 'arquivado' status to messages table
ALTER TABLE `messages` MODIFY COLUMN `status` ENUM('novo', 'lido', 'respondido', 'arquivado') NOT NULL DEFAULT 'novo';
