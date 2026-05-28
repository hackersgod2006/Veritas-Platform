import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Supabase (and most managed Postgres providers) require SSL.
// rejectUnauthorized: false is needed because managed providers use
// certificates that may not be in Node's default CA bundle.
const sslConfig = process.env.NODE_ENV === "production"
  ? { rejectUnauthorized: false }
  : false;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
