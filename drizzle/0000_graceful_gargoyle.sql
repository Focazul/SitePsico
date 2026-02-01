CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientName" varchar(255) NOT NULL,
	"clientEmail" varchar(320) NOT NULL,
	"clientPhone" varchar(20) NOT NULL,
	"appointmentDate" date NOT NULL,
	"appointmentTime" time NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"modality" varchar(20) NOT NULL,
	"subject" text,
	"notes" text,
	"status" varchar(20) DEFAULT 'pendente' NOT NULL,
	"calendarEventId" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"startTime" time NOT NULL,
	"endTime" time NOT NULL,
	"slotDurationMinutes" integer DEFAULT 60 NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"reason" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipientEmail" varchar(320) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"emailType" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"sentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'novo' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"metaTitle" varchar(255),
	"metaDescription" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"tagId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"coverImage" varchar(500),
	"categoryId" integer,
	"views" integer DEFAULT 0 NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"type" varchar(20) DEFAULT 'string' NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(255),
	"email" varchar(320),
	"password" text,
	"name" varchar(255),
	"loginMethod" varchar(20) DEFAULT 'manus' NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"lastSignedIn" timestamp,
	"resetToken" varchar(255),
	"resetTokenExpiry" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "idx_appointment_datetime" ON "appointments" USING btree ("appointmentDate","appointmentTime");--> statement-breakpoint
CREATE INDEX "idx_availability_day" ON "availability" USING btree ("dayOfWeek");--> statement-breakpoint
CREATE INDEX "idx_blocked_date" ON "blocked_dates" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_category_slug" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_email_log_recipient" ON "email_logs" USING btree ("recipientEmail");--> statement-breakpoint
CREATE INDEX "idx_email_log_type" ON "email_logs" USING btree ("emailType");--> statement-breakpoint
CREATE INDEX "idx_email_log_status" ON "email_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_message_email" ON "messages" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_message_status" ON "messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_page_slug" ON "pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_page_status" ON "pages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_post_tag" ON "post_tags" USING btree ("postId","tagId");--> statement-breakpoint
CREATE INDEX "idx_post_slug" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_post_published" ON "posts" USING btree ("publishedAt");--> statement-breakpoint
CREATE INDEX "idx_setting_key" ON "settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_tag_slug" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_user_openId" ON "users" USING btree ("openId");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_user_resetToken" ON "users" USING btree ("resetToken");