import "server-only";
import { MongoClient, type Db } from "mongodb";

// One client per server process. In dev, hot reload would otherwise open a
// new connection pool on every edit, so the client is parked on globalThis.
const g = globalThis as unknown as { _mongo?: MongoClient };

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return v;
}

export const mongoClient: MongoClient =
  g._mongo ?? new MongoClient(env("MONGODB_URI"), { appName: "elisia-archive", maxPoolSize: 10 });
if (process.env.NODE_ENV !== "production") g._mongo = mongoClient;

export const db: Db = mongoClient.db(process.env.MONGODB_DB_NAME || "elisia_archive");
