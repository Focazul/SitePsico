-- Drizzle Migration: Re-add authentication fields to users table
-- Previous migrations (0002) dropped these columns. Now re-adding them properly.

ALTER TABLE `users`
  ADD COLUMN `openId` VARCHAR(255) NULL UNIQUE,
  ADD COLUMN `loginMethod` ENUM('password') NOT NULL DEFAULT 'password',
  ADD COLUMN `role` ENUM('admin','user') NOT NULL DEFAULT 'user',
  ADD COLUMN `lastSignedIn` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `resetToken` VARCHAR(255) NULL,
  ADD COLUMN `resetTokenExpiry` TIMESTAMP NULL;

-- Create indexes for faster lookups
CREATE INDEX `idx_user_openId` ON `users`(`openId`);
CREATE INDEX `idx_user_email` ON `users`(`email`);
CREATE INDEX `idx_user_resetToken` ON `users`(`resetToken`);
