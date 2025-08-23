import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error("AUTH_DATABASE_URL is not set");
}

const client = new Client({
  connectionString: process.env.AUTH_DATABASE_URL!,
});

await client.connect();
export const db = drizzle(client, { schema });
