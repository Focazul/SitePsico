import { boolean, date, index, integer, pgEnum, pgTable, serial, text, time, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    // Identidade externa (OAuth/OpenID) e login tradicional
    openId: varchar("openId", { length: 255 }).unique(),
    email: varchar("email", { length: 320 }).unique(),
    password: text("password"),
    name: varchar("name", { length: 255 }),
    loginMethod: pgEnum("loginMethod", ["manus", "oauth", "password"]).default("manus"),
    role: pgEnum("role", ["admin", "user"]).default("user").notNull(),
    lastSignedIn: timestamp("lastSignedIn"),
    resetToken: varchar("resetToken", { length: 255 }),
    resetTokenExpiry: timestamp("resetTokenExpiry"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxOpenId: index("idx_user_openId").on(table.openId!),
    idxEmail: index("idx_user_email").on(table.email!),
    idxResetToken: index("idx_user_resetToken").on(table.resetToken!),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agenda clínica: horários disponíveis por dia da semana.
 */
export const availability = pgTable(
  "availability",
  {
    id: serial("id").primaryKey(),
    dayOfWeek: integer("dayOfWeek").notNull(), // 0=Domingo ... 6=Sábado
    startTime: time("startTime").notNull(),
    endTime: time("endTime").notNull(),
    slotDurationMinutes: integer("slotDurationMinutes").default(60).notNull(),
    isAvailable: boolean("isAvailable").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxDay: index("idx_availability_day").on(table.dayOfWeek),
  })
);

/**
 * Datas bloqueadas (feriados, indisponibilidade pontual).
 */
export const blockedDates = pgTable(
  "blocked_dates",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    reason: varchar("reason", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    idxDate: index("idx_blocked_date").on(table.date),
  })
);

/**
 * Agendamentos de pacientes.
 */
export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    clientName: varchar("clientName", { length: 255 }).notNull(),
    clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
    clientPhone: varchar("clientPhone", { length: 20 }).notNull(),
    appointmentDate: date("appointmentDate").notNull(),
    appointmentTime: time("appointmentTime").notNull(),
    duration: integer("duration").default(60).notNull(),
    modality: pgEnum("modality", ["presencial", "online"]).notNull(),
    subject: text("subject"),
    notes: text("notes"),
    status: pgEnum("status", ["pendente", "confirmado", "cancelado", "concluido"]).default("pendente").notNull(),
    calendarEventId: varchar("calendarEventId", { length: 255 }), // ID do evento no Google Calendar
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxDateTime: index("idx_appointment_datetime").on(table.appointmentDate, table.appointmentTime),
  })
);

/**
 * Categorias de artigos do blog.
 */
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxSlug: index("idx_category_slug").on(table.slug),
  })
);

/**
 * Tags para artigos do blog.
 */
export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    idxSlug: index("idx_tag_slug").on(table.slug),
  })
);

/**
 * Artigos do blog.
 */
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: varchar("coverImage", { length: 500 }),
    categoryId: integer("categoryId"),
    views: integer("views").default(0).notNull(),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxSlug: index("idx_post_slug").on(table.slug),
    idxPublished: index("idx_post_published").on(table.publishedAt),
  })
);

/**
 * Páginas estáticas do site (Sobre, Serviços, etc).
 */
export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    metaTitle: varchar("metaTitle", { length: 255 }),
    metaDescription: text("metaDescription"),
    status: pgEnum("status", ["draft", "published"]).default("draft").notNull(),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxSlug: index("idx_page_slug").on(table.slug),
    idxStatus: index("idx_page_status").on(table.status),
  })
);

/**
 * Associação muitos-para-muitos entre posts e tags.
 */
export const postTags = pgTable(
  "post_tags",
  {
    id: serial("id").primaryKey(),
    postId: integer("postId").notNull(),
    tagId: integer("tagId").notNull(),
  },
  (table) => ({
    idxPostTag: index("idx_post_tag").on(table.postId, table.tagId),
  })
);

/**
 * Mensagens de contato.
 */
export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    subject: varchar("subject", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: pgEnum("status", ["novo", "lido", "respondido", "arquivado"]).default("novo").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxEmail: index("idx_message_email").on(table.email),
    idxStatus: index("idx_message_status").on(table.status),
  })
);

/**
 * Configurações do site (chave-valor).
 */
export const settings = pgTable(
  "settings",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    value: text("value").notNull(),
    type: pgEnum("type", ["string", "number", "boolean", "json"]).default("string").notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    idxKey: index("idx_setting_key").on(table.key),
  })
);

/**
 * Log de emails enviados pelo sistema.
 */
export const emailLogs = pgTable(
  "email_logs",
  {
    id: serial("id").primaryKey(),
    recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 500 }).notNull(),
    emailType: pgEnum("emailType", [
      "appointmentConfirmation",
      "appointmentReminder",
      "newContactNotification",
      "contactAutoReply",
      "passwordReset",
      "custom"
    ]).notNull(),
    status: pgEnum("status", ["sent", "failed"]).notNull(),
    sentAt: timestamp("sentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    idxEmail: index("idx_email_log_recipient").on(table.recipientEmail),
    idxType: index("idx_email_log_type").on(table.emailType),
    idxStatus: index("idx_email_log_status").on(table.status),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;
export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = typeof blockedDates.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;
export type PostTag = typeof postTags.$inferSelect;
export type InsertPostTag = typeof postTags.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
