import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { db, mongoClient } from "./mongo";

export const MIN_PASSWORD = 10;

export const auth = betterAuth({
  appName: "elisia archive",
  database: mongodbAdapter(db, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
    // Nobody can register themselves. Accounts only come from /admin/setup
    // (first admin) or an invite link made by an admin.
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "editor", input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14, // 14 days
    updateAge: 60 * 60 * 24, // refresh daily while active
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: { "/sign-in/email": { window: 300, max: 8 } },
  },
  plugins: [nextCookies()],
});

export type Role = "admin" | "editor";
