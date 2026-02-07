
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.warn("[Migration] DATABASE_URL not set, skipping auto-migration.");
    return;
  }

  try {
    console.log("[Migration] Running database migrations...");

    // Create a temporary connection specifically for migrations
    const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient);

    // Run migrations from the "drizzle" folder
    await migrate(db, { migrationsFolder: "drizzle" });

    console.log("[Migration] Migrations completed successfully.");

    await migrationClient.end();
  } catch (error) {
    console.error("[Migration] Failed to run migrations:", error);
    // Don't kill the process, let the app start even if migration failed (though it might crash later)
  }
}
