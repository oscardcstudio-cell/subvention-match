import pg from "pg";
import { parse as parseConnString } from "pg-connection-string";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// We parse the URL ourselves and pass discrete host/user/password/port/db
// parameters rather than `connectionString`. This prevents node-postgres
// (v8+) from overriding our `ssl` config when merging the parsed URL.
// Supabase's Supavisor pooler presents a cert chain that Node 20 / OpenSSL 3
// flags as "self-signed in chain", so we explicitly disable cert validation.
const parsed = parseConnString(process.env.DATABASE_URL);
const needsSSL = /supabase\.com|neon\.tech/.test(parsed.host || "") ||
  /sslmode=require/.test(process.env.DATABASE_URL);

export const pool = new Pool({
  host: parsed.host || undefined,
  port: parsed.port ? Number(parsed.port) : undefined,
  user: parsed.user || undefined,
  password: parsed.password || undefined,
  database: parsed.database || undefined,
  ssl: needsSSL
    ? {
        rejectUnauthorized: false,
        // Also skip hostname verification — not relevant here (we trust the
        // connection string) and avoids another failure mode.
        checkServerIdentity: () => undefined,
      }
    : undefined,
});

export const db = drizzle(pool, { schema });
