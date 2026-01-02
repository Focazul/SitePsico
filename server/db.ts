import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  appointments,
  availability,
  blockedDates,
  categories,
  tags,
  posts,
  postTags,
  messages,
  settings,
  emailLogs,
  InsertAppointment,
  InsertBlockedDate,
  InsertAvailability,
  InsertUser,
  Appointment,
  Availability,
  BlockedDate,
  Category,
  InsertCategory,
  Tag,
  InsertTag,
  Post,
  InsertPost,
  PostTag,
  InsertPostTag,
  Message,
  InsertMessage,
  Setting,
  InsertSetting,
  EmailLog,
  InsertEmailLog,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// --- Admin auth helpers ---

export async function getUserByEmail(email: string): Promise<Awaited<ReturnType<typeof getUserByOpenId>> | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPassword(id: number, hashedPassword: string): Promise<void> {
  const db = await ensureDb();
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
}

export async function setPasswordResetToken(userId: number, token: string, expiryMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const db = await ensureDb();
  const expiry = new Date(Date.now() + expiryMs);
  await db.update(users).set({ resetToken: token, resetTokenExpiry: expiry }).where(eq(users.id, userId));
}

export async function getUserByResetToken(token: string): Promise<Awaited<ReturnType<typeof getUserByOpenId>> | null> {
  const db = await ensureDb();
  const [row] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.resetToken, token),
        sql`${users.resetTokenExpiry} > NOW()`
      )
    )
    .limit(1);
  return row ?? null;
}

export async function clearPasswordResetToken(userId: number): Promise<void> {
  const db = await ensureDb();
  await db.update(users).set({ resetToken: null, resetTokenExpiry: null }).where(eq(users.id, userId));
}

// --- Booking domain helpers ---
const BOOKED_STATUSES = ["pendente", "confirmado", "concluido"] as const;
const ALLOWED_STATUSES = [...BOOKED_STATUSES, "cancelado"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

const dailyLimit =
  typeof ENV.appointmentsPerDayLimit === "number" &&
  Number.isFinite(ENV.appointmentsPerDayLimit) &&
  ENV.appointmentsPerDayLimit > 0
    ? ENV.appointmentsPerDayLimit
    : null;

function toSqlTime(time: string): string {
  // Accept HH:mm or HH:mm:ss, normalize to HH:mm:00
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
  throw new Error("Horário inválido (esperado HH:mm)");
}

function combineDateTime(dateStr: string, timeStr: string): Date {
  const iso = `${dateStr}T${timeStr.length === 5 ? timeStr : timeStr.slice(0, 5)}:00.000Z`;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) throw new Error("Data ou horário inválido");
  return dt;
}

function assertBusinessRules(dateStr: string, timeStr: string) {
  const now = new Date();
  const when = combineDateTime(dateStr, timeStr);
  const min = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (when < min) {
    throw new Error("Agendamento precisa ser com pelo menos 24h de antecedência.");
  }

  const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
  const minutes = h * 60 + m;
  const start = 8 * 60; // 08:00
  const end = 19 * 60; // 19:00 limite superior
  if (minutes < start || minutes > end) {
    throw new Error("Horário fora do expediente (08:00-19:00).");
  }
}

async function getBookedCountByDate(db: Awaited<ReturnType<typeof ensureDb>>, date: Date): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(
      and(
        eq(appointments.appointmentDate, date),
        inArray(appointments.status, BOOKED_STATUSES as unknown as AllowedStatus[])
      )
    );

  return row?.count ? Number(row.count) : 0;
}

async function ensureDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// --- CRUD & queries ---

export async function createAppointment(data: InsertAppointment): Promise<Appointment> {
  const db = await ensureDb();

  const dateStr = typeof data.appointmentDate === "string"
    ? data.appointmentDate
    : data.appointmentDate.toISOString().slice(0, 10);
  const timeStr = typeof data.appointmentTime === "string"
    ? data.appointmentTime
    : data.appointmentTime.toISOString().slice(11, 16);

  assertBusinessRules(dateStr, timeStr);

  const normalizedTime = toSqlTime(timeStr);
  const normalizedDate = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(normalizedDate.getTime())) throw new Error("Data inválida");

  if (dailyLimit) {
    const bookedCount = await getBookedCountByDate(db, normalizedDate);
    if (bookedCount >= dailyLimit) {
      throw new Error(`Limite diário de ${dailyLimit} agendamentos atingido para esta data.`);
    }
  }

  const conflict = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.appointmentDate, normalizedDate),
        eq(appointments.appointmentTime, normalizedTime),
        inArray(appointments.status, BOOKED_STATUSES as unknown as AllowedStatus[])
      )
    )
    .limit(1);

  if (conflict.length) {
    throw new Error("Horário indisponível. Escolha outro horário ou data.");
  }

  const [created] = await db
    .insert(appointments)
    .values({
      ...data,
      appointmentDate: normalizedDate,
      appointmentTime: normalizedTime,
      status: data.status ?? "pendente",
    })
    .returning();

  return created;
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const db = await ensureDb();
  return await db
    .select()
    .from(appointments)
    .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime));
}

export async function getAppointmentsByStatus(status: AllowedStatus): Promise<Appointment[]> {
  const db = await ensureDb();
  if (!ALLOWED_STATUSES.includes(status)) throw new Error("Status inválido");
  return await db
    .select()
    .from(appointments)
    .where(eq(appointments.status, status));
}

export async function getAppointmentsInRange(start?: Date, end?: Date): Promise<Appointment[]> {
  const db = await ensureDb();
  const clauses = [] as any[];
  if (start) clauses.push(gte(appointments.appointmentDate, start));
  if (end) clauses.push(lte(appointments.appointmentDate, end));

  return await db
    .select()
    .from(appointments)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime));
}

export async function updateAppointmentStatus(id: number, status: AllowedStatus): Promise<void> {
  const db = await ensureDb();
  if (!ALLOWED_STATUSES.includes(status)) throw new Error("Status inválido");
  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
}

export async function cancelAppointment(id: number): Promise<void> {
  return updateAppointmentStatus(id, "cancelado");
}

/**
 * Atualiza o ID do evento do Google Calendar de um agendamento
 */
export async function updateAppointmentCalendarEventId(
  appointmentId: number,
  calendarEventId: string
): Promise<void> {
  const db = await ensureDb();
  await db
    .update(appointments)
    .set({ calendarEventId })
    .where(eq(appointments.id, appointmentId));
}

/**
 * Obtém agendamento por ID com calendarEventId
 */
export async function getAppointmentById(id: number): Promise<Appointment | null> {
  const db = await ensureDb();
  const [row] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  return row ?? null;
}

export async function getAvailabilityByDay(dayOfWeek: number): Promise<Availability | null> {
  const db = await ensureDb();
  const [row] = await db
    .select()
    .from(availability)
    .where(eq(availability.dayOfWeek, dayOfWeek))
    .limit(1);
  return row ?? null;
}

export async function upsertAvailability(row: InsertAvailability): Promise<void> {
  const db = await ensureDb();
  await db
    .insert(availability)
    .values(row)
    .onDuplicateKeyUpdate({
      set: {
        startTime: row.startTime,
        endTime: row.endTime,
        slotDurationMinutes: row.slotDurationMinutes,
        isAvailable: row.isAvailable,
      },
    });
}

export async function addBlockedDate(row: InsertBlockedDate): Promise<void> {
  const db = await ensureDb();
  await db.insert(blockedDates).values(row).onDuplicateKeyUpdate({ set: { reason: row.reason } });
}

export async function getBlockedDate(dateValue: Date): Promise<BlockedDate | null> {
  const db = await ensureDb();
  const [row] = await db.select().from(blockedDates).where(eq(blockedDates.date, dateValue)).limit(1);
  return row ?? null;
}

export type AvailableSlot = { time: string };

export async function getAvailableSlots(dateStr: string): Promise<AvailableSlot[]> {
  const db = await getDb();
  // Fallback placeholders when DB is not configured
  const fallback = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => ({ time }));

  const dateValue = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(dateValue.getTime())) return fallback;
  const dayOfWeek = dateValue.getUTCDay();

  if (!db) return fallback;

  const avail = await getAvailabilityByDay(dayOfWeek);
  if (!avail || !avail.isAvailable) return [];

  const blocked = await getBlockedDate(dateValue);
  if (blocked) return [];

  const existing = await db
    .select({ time: appointments.appointmentTime })
    .from(appointments)
    .where(
      and(
        eq(appointments.appointmentDate, dateValue),
        inArray(appointments.status, BOOKED_STATUSES as unknown as AllowedStatus[])
      )
    );

  if (dailyLimit && existing.length >= dailyLimit) return [];
  const bookedTimes = new Set(
    existing.map((r) => {
      const t = r.time instanceof Date ? r.time.toISOString().slice(11, 16) : String(r.time).slice(0, 5);
      return t;
    })
  );

  const slots: AvailableSlot[] = [];
  const slotMinutes = avail.slotDurationMinutes ?? 60;

  const parseTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const formatTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const startM = parseTime(String(avail.startTime).slice(0, 5));
  const endM = parseTime(String(avail.endTime).slice(0, 5));

  for (let m = startM; m + slotMinutes <= endM; m += slotMinutes) {
    const label = formatTime(m);
    if (!bookedTimes.has(label)) slots.push({ time: label });
  }

  return slots;
}
// --- Blog domain helpers ---

export async function createCategory(data: InsertCategory): Promise<Category> {
  const db = await ensureDb();
  const [created] = await db.insert(categories).values(data).returning();
  return created;
}

export async function getCategories(): Promise<Category[]> {
  const db = await ensureDb();
  return await db.select().from(categories).orderBy(asc(categories.name));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = await ensureDb();
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function createTag(data: InsertTag): Promise<Tag> {
  const db = await ensureDb();
  const [created] = await db.insert(tags).values(data).returning();
  return created;
}

export async function getTags(): Promise<Tag[]> {
  const db = await ensureDb();
  return await db.select().from(tags).orderBy(asc(tags.name));
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const db = await ensureDb();
  const [row] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return row ?? null;
}

export async function createPost(data: InsertPost, tagIds?: number[]): Promise<Post> {
  const db = await ensureDb();
  const [created] = await db.insert(posts).values(data).returning();

  if (tagIds && tagIds.length > 0) {
    const postTagValues = tagIds.map((tagId) => ({ postId: created.id, tagId }));
    await db.insert(postTags).values(postTagValues);
  }

  return created;
}

export async function getPostBySlug(slug: string): Promise<(Post & { tags: Tag[]; category: Category | null }) | null> {
  const db = await ensureDb();
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  if (!post) return null;

  const tagRows = await db
    .select({ tag: tags })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, post.id));

  const category = post.categoryId
    ? await db.select().from(categories).where(eq(categories.id, post.categoryId)).limit(1).then((rows) => rows[0] ?? null)
    : null;

  // Increment views
  await db.update(posts).set({ views: (post.views ?? 0) + 1 }).where(eq(posts.id, post.id));

  return {
    ...post,
    tags: tagRows.map((r) => r.tag),
    category,
  };
}

export async function postExists(slug: string): Promise<boolean> {
  const db = await ensureDb();
  const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
  return !!post;
}

export type PostWithRelations = Post & { tags: Tag[]; category: Category | null };

export async function getPublishedPosts(
  limit: number = 10,
  offset: number = 0,
  categoryId?: number | null
): Promise<PostWithRelations[]> {
  const db = await ensureDb();
  const clauses = [sql`${posts.publishedAt} IS NOT NULL`];
  if (categoryId) clauses.push(eq(posts.categoryId, categoryId));

  const results = await db
    .select()
    .from(posts)
    .where(and(...clauses))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);

  return Promise.all(
    results.map(async (post) => {
      const tagRows = await db
        .select({ tag: tags })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, post.id));

      const category = post.categoryId
        ? await db.select().from(categories).where(eq(categories.id, post.categoryId)).limit(1).then((rows) => rows[0] ?? null)
        : null;

      return { ...post, tags: tagRows.map((r) => r.tag), category };
    })
  );
}

export async function searchPosts(query: string, limit: number = 10, offset: number = 0): Promise<PostWithRelations[]> {
  const db = await ensureDb();
  const searchPattern = `%${query}%`;

  const results = await db
    .select()
    .from(posts)
    .where(
      and(
        sql`${posts.publishedAt} IS NOT NULL`,
        sql`(${posts.title} LIKE ${searchPattern} OR ${posts.excerpt} LIKE ${searchPattern} OR ${posts.content} LIKE ${searchPattern})`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);

  return Promise.all(
    results.map(async (post) => {
      const tagRows = await db
        .select({ tag: tags })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, post.id));

      const category = post.categoryId
        ? await db.select().from(categories).where(eq(categories.id, post.categoryId)).limit(1).then((rows) => rows[0] ?? null)
        : null;

      return { ...post, tags: tagRows.map((r) => r.tag), category };
    })
  );
}

export async function getRelatedPosts(postId: number, limit: number = 3): Promise<PostWithRelations[]> {
  const db = await ensureDb();
  const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1).then((rows) => rows[0]);
  if (!post) return [];

  const postTagIds = await db
    .select({ tagId: postTags.tagId })
    .from(postTags)
    .where(eq(postTags.postId, postId));

  if (postTagIds.length === 0) return [];

  const relatedIds = await db
    .select({ postId: postTags.postId })
    .from(postTags)
    .where(and(inArray(postTags.tagId, postTagIds.map((pt) => pt.tagId)), sql`${postTags.postId} != ${postId}`))
    .limit(limit);

  if (relatedIds.length === 0) return [];

  const related = await db
    .select()
    .from(posts)
    .where(
      and(
        inArray(posts.id, relatedIds.map((r) => r.postId)),
        sql`${posts.publishedAt} IS NOT NULL`
      )
    )
    .limit(limit);

  return Promise.all(
    related.map(async (p) => {
      const tagRows = await db
        .select({ tag: tags })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, p.id));

      const category = p.categoryId
        ? await db.select().from(categories).where(eq(categories.id, p.categoryId)).limit(1).then((rows) => rows[0] ?? null)
        : null;

      return { ...p, tags: tagRows.map((r) => r.tag), category };
    })
  );
}

export async function updatePost(id: number, data: Partial<InsertPost>, tagIds?: number[]): Promise<void> {
  const db = await ensureDb();
  await db.update(posts).set(data).where(eq(posts.id, id));

  if (tagIds !== undefined) {
    await db.delete(postTags).where(eq(postTags.postId, id));
    if (tagIds.length > 0) {
      const postTagValues = tagIds.map((tagId) => ({ postId: id, tagId }));
      await db.insert(postTags).values(postTagValues);
    }
  }
}

export async function deletePost(id: number): Promise<void> {
  const db = await ensureDb();
  await db.delete(postTags).where(eq(postTags.postId, id));
  await db.delete(posts).where(eq(posts.id, id));
}

// --- Contact domain helpers ---

export async function createMessage(data: InsertMessage): Promise<Message> {
  const db = await ensureDb();
  const [created] = await db.insert(messages).values(data).returning();
  return created;
}

export async function getMessages(status?: "novo" | "lido" | "respondido"): Promise<Message[]> {
  const db = await ensureDb();
  const whereClause = status ? eq(messages.status, status) : undefined;
  return await db
    .select()
    .from(messages)
    .where(whereClause)
    .orderBy(desc(messages.createdAt));
}

export async function getMessageById(id: number): Promise<Message | null> {
  const db = await ensureDb();
  const [row] = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  return row ?? null;
}

export async function updateMessageStatus(
  id: number,
  status: "novo" | "lido" | "respondido"
): Promise<void> {
  const db = await ensureDb();
  await db.update(messages).set({ status }).where(eq(messages.id, id));
}

export async function deleteMessage(id: number): Promise<void> {
  const db = await ensureDb();
  await db.delete(messages).where(eq(messages.id, id));
}

export async function getUnreadMessageCount(): Promise<number> {
  const db = await ensureDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(eq(messages.status, "novo"));
  return row?.count ? Number(row.count) : 0;
}

// --- Settings domain helpers ---

export async function getSetting(key: string): Promise<Setting | null> {
  const db = await ensureDb();
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return row ?? null;
}

export async function getAllSettings(): Promise<Setting[]> {
  const db = await ensureDb();
  return await db.select().from(settings).orderBy(asc(settings.key));
}

export async function getSettingValue(key: string): Promise<unknown> {
  const setting = await getSetting(key);
  if (!setting) return null;

  try {
    if (setting.type === "json") return JSON.parse(setting.value);
    if (setting.type === "number") return Number(setting.value);
    if (setting.type === "boolean") return setting.value === "true";
    return setting.value;
  } catch {
    return setting.value;
  }
}

export async function updateSetting(key: string, value: unknown, type?: string): Promise<Setting> {
  const db = await ensureDb();
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  const resolvedType = type ?? (typeof value === "string" ? "string" : typeof value === "number" ? "number" : "json");

  const [updated] = await db
    .insert(settings)
    .values({ key, value: stringValue, type: resolvedType as any })
    .onDuplicateKeyUpdate({
      set: { value: stringValue, type: resolvedType as any },
    })
    .returning();

  return updated;
}

export async function bulkUpdateSettings(
  updates: Array<{ key: string; value: unknown; type?: string }>
): Promise<void> {
  const db = await ensureDb();
  for (const update of updates) {
    await updateSetting(update.key, update.value, update.type);
  }
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await ensureDb();
  await db.delete(settings).where(eq(settings.key, key));
}

// ========================================
// Email Logs Functions
// ========================================

export async function insertEmailLog(data: {
  recipientEmail: string;
  subject: string;
  emailType: string;
  status: "sent" | "failed";
  sentAt?: Date | null;
}): Promise<EmailLog> {
  const db = await ensureDb();
  const [created] = await db.insert(emailLogs).values(data).returning();
  return created;
}

export async function getEmailLogs(
  filters?: {
    emailType?: string;
    status?: "sent" | "failed";
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<EmailLog[]> {
  const db = await ensureDb();
  
  let query = db.select().from(emailLogs);
  
  const conditions = [];
  
  if (filters?.emailType) {
    conditions.push(eq(emailLogs.emailType, filters.emailType as any));
  }
  
  if (filters?.status) {
    conditions.push(eq(emailLogs.status, filters.status));
  }
  
  if (filters?.startDate) {
    conditions.push(gte(emailLogs.createdAt, filters.startDate));
  }
  
  if (filters?.endDate) {
    conditions.push(lte(emailLogs.createdAt, filters.endDate));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  query = query.orderBy(desc(emailLogs.createdAt)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return await query;
}

export async function getEmailLogStats(): Promise<{
  total: number;
  sent: number;
  failed: number;
  byType: Record<string, number>;
}> {
  const db = await ensureDb();
  
  const all = await db.select().from(emailLogs);
  
  const stats = {
    total: all.length,
    sent: all.filter(log => log.status === "sent").length,
    failed: all.filter(log => log.status === "failed").length,
    byType: {} as Record<string, number>,
  };
  
  for (const log of all) {
    stats.byType[log.emailType] = (stats.byType[log.emailType] || 0) + 1;
  }
  
  return stats;
}
