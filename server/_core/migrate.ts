import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { migrate } from "drizzle-orm/mysql2/migrator";
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
  const pool = mysql.createPool({ uri: ENV.databaseUrl, connectionLimit: 2 });
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("[Migrate] ✅ Migrations applied successfully");
  } catch (error) {
    console.error("[Migrate] ❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
