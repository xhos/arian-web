import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { jwt } from "better-auth/plugins";
import * as schema from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: ["http://localhost:3001", "http://localhost:5001"],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session data for 5 minutes
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [jwt()],
  telemetry: { enabled: false },
});
