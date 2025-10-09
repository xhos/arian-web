import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error("AUTH_DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.AUTH_DATABASE_URL!,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
