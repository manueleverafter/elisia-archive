// Exports every collection to backups/<timestamp>/*.json (Extended JSON, so
// dates and ids survive a restore). Free Atlas has no automatic backups,
// so run this before big changes.  Usage: npm run backup
import { mkdir, writeFile } from "node:fs/promises";
import { EJSON } from "bson";
import { MongoClient } from "mongodb";

const SKIP = new Set(["session", "rateLimit", "verification"]); // short-lived, not worth keeping
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB_NAME || "elisia_archive");
const dir = `backups/${new Date().toISOString().replace(/[:.]/g, "-")}`;
await mkdir(dir, { recursive: true });
for (const { name } of await db.listCollections().toArray()) {
  if (SKIP.has(name)) continue;
  const docs = await db.collection(name).find().toArray();
  await writeFile(`${dir}/${name}.json`, EJSON.stringify(docs, null, 2, { relaxed: false }));
  console.log(`${name}: ${docs.length}`);
}
console.log(`saved to ${dir}`);
await client.close();
