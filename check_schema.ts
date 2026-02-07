
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

async function check() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    return;
  }
  const sql = postgres(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'appointments';
  `;
  console.log("Columns in appointments:", rows.map(r => r.column_name));
  await sql.end();
}

check();
