-- Drizzle Migration: Add authentication-related fields to users table
ALTER TABLE `users`
  ADD COLUMN `openId` VARCHAR(255) NULL,
  ADD COLUMN `loginMethod` ENUM('manus','oauth','password') NOT NULL DEFAULT 'manus',
  ADD COLUMN `role` ENUM('admin','user') NOT NULL DEFAULT 'user',
  ADD COLUMN `lastSignedIn` TIMESTAMP NULL,
  ADD COLUMN `resetToken` VARCHAR(255) NULL,
  ADD COLUMN `resetTokenExpiry` TIMESTAMP NULL;

-- Email may already be unique; ensure index exists for openId and resetToken
CREATE INDEX `idx_user_openId` ON `users`(`openId`);
CREATE INDEX `idx_user_email` ON `users`(`email`);
CREATE INDEX `idx_user_resetToken` ON `users`(`resetToken`);
