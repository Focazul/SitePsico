ALTER TABLE "appointments" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "paymentStatus" varchar(20) DEFAULT 'pendente' NOT NULL;