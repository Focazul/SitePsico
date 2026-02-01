import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { ENV } from "./env";

/**
 * Run database migrations at runtime using Drizzle migrator.
 * Enable by setting AUTO_MIGRATE=true in environment variables.
 */
export async function runMigrations() {
  if (!ENV.databaseUrl) {
    console.warn("[Migrate] DATABASE_URL not set; skipping migrations");
    return;
  }

  console.log("[Migrate] Applying migrations...");
  const sql = postgres(ENV.databaseUrl, { max: 1 });
  const db = drizzle(sql);
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("[Migrate] ✅ Migrations applied successfully");
  } catch (error) {
    console.error("[Migrate] ❌ Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}
