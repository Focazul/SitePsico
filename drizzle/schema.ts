import { boolean, date, index, int, mysqlEnum, mysqlTable, text, time, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agenda clínica: horários disponíveis por dia da semana.
 */
export const availability = mysqlTable(
  "availability",
  {
    id: int("id").autoincrement().primaryKey(),
    dayOfWeek: int("dayOfWeek").notNull(), // 0=Domingo ... 6=Sábado
    startTime: time("startTime").notNull(),
    endTime: time("endTime").notNull(),
    slotDurationMinutes: int("slotDurationMinutes").default(60).notNull(),
    isAvailable: boolean("isAvailable").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxDay: index("idx_availability_day").on(table.dayOfWeek),
  })
);

/**
 * Datas bloqueadas (feriados, indisponibilidade pontual).
 */
export const blockedDates = mysqlTable(
  "blocked_dates",
  {
    id: int("id").autoincrement().primaryKey(),
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
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("id").autoincrement().primaryKey(),
    clientName: varchar("clientName", { length: 255 }).notNull(),
    clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
    clientPhone: varchar("clientPhone", { length: 20 }).notNull(),
    appointmentDate: date("appointmentDate").notNull(),
    appointmentTime: time("appointmentTime").notNull(),
    duration: int("duration").default(60).notNull(),
    modality: mysqlEnum("modality", ["presencial", "online"]).notNull(),
    subject: text("subject"),
    notes: text("notes"),
    status: mysqlEnum("status", ["pendente", "confirmado", "cancelado", "concluido"]).default("pendente").notNull(),
    calendarEventId: varchar("calendarEventId", { length: 255 }), // ID do evento no Google Calendar
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxDateTime: index("idx_appointment_datetime").on(table.appointmentDate, table.appointmentTime),
  })
);

/**
 * Categorias de artigos do blog.
 */
export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxSlug: index("idx_category_slug").on(table.slug),
  })
);

/**
 * Tags para artigos do blog.
 */
export const tags = mysqlTable(
  "tags",
  {
    id: int("id").autoincrement().primaryKey(),
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
export const posts = mysqlTable(
  "posts",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: varchar("coverImage", { length: 500 }),
    categoryId: int("categoryId"),
    views: int("views").default(0).notNull(),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxSlug: index("idx_post_slug").on(table.slug),
    idxPublished: index("idx_post_published").on(table.publishedAt),
  })
);

/**
 * Páginas estáticas do site (Sobre, Serviços, etc).
 */
export const pages = mysqlTable(
  "pages",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    metaTitle: varchar("metaTitle", { length: 255 }),
    metaDescription: text("metaDescription"),
    status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
    order: int("order").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxSlug: index("idx_page_slug").on(table.slug),
    idxStatus: index("idx_page_status").on(table.status),
  })
);

/**
 * Associação muitos-para-muitos entre posts e tags.
 */
export const postTags = mysqlTable(
  "post_tags",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("postId").notNull(),
    tagId: int("tagId").notNull(),
  },
  (table) => ({
    idxPostTag: index("idx_post_tag").on(table.postId, table.tagId),
  })
);

/**
 * Mensagens de contato.
 */
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    subject: varchar("subject", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: mysqlEnum("status", ["novo", "lido", "respondido", "arquivado"]).default("novo").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxEmail: index("idx_message_email").on(table.email),
    idxStatus: index("idx_message_status").on(table.status),
  })
);

/**
 * Configurações do site (chave-valor).
 */
export const settings = mysqlTable(
  "settings",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    value: text("value").notNull(),
    type: mysqlEnum("type", ["string", "number", "boolean", "json"]).default("string").notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxKey: index("idx_setting_key").on(table.key),
  })
);

/**
 * Log de emails enviados pelo sistema.
 */
export const emailLogs = mysqlTable(
  "email_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 500 }).notNull(),
    emailType: mysqlEnum("emailType", [
      "appointmentConfirmation",
      "appointmentReminder",
      "newContactNotification",
      "contactAutoReply",
      "passwordReset",
      "custom"
    ]).notNull(),
    status: mysqlEnum("status", ["sent", "failed"]).notNull(),
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
