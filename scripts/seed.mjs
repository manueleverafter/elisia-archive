// Adds the starting content, only where a collection is still empty.
// Safe to run more than once.  Usage: npm run seed
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db(process.env.MONGODB_DB_NAME || "elisia_archive");
const now = new Date();
const today = now.toISOString().slice(0, 10);
const base = { createdAt: now, updatedAt: now, deletedAt: null };

async function seed(name, docs) {
  if (await db.collection(name).countDocuments()) return console.log(`${name}: already has data, skipped`);
  await db.collection(name).insertMany(docs.map((d) => ({ ...d, ...base })));
  console.log(`${name}: added ${docs.length}`);
}

await seed("posts", [
  {
    title: "Welcome to the burrow, ELFORT!",
    body: "This is the new home for everything Elisia. Mods are filling it in, so check back often.",
    tag: "announcement",
    date: today,
    pinned: true,
    author: "ELFORT admins",
  },
]);
await seed("socials", [
  { label: "UNIS Instagram", handle: "@unis_offcl", url: "https://www.instagram.com/unis_offcl/", platform: "instagram", owner: "group", order: 10 },
]);

const settings = db.collection("settings");
if (!(await settings.findOne({ _id: "site" }))) {
  await settings.insertOne({
    _id: "site",
    defaultTheme: "bunny",
    profile: [
      { label: "Name", value: "Elisia" },
      { label: "Nicknames", value: "Bunny, Elmandu" },
      { label: "Fandom", value: "Elysian Fortress (ELFORT)" },
      { label: "Favorite color", value: "Pink" },
    ],
    updatedAt: now,
  });
  console.log("settings: added");
} else console.log("settings: already set, skipped");

// Indexes for the queries the site runs.
for (const name of ["media", "polaroids", "releases", "posts", "ads", "press", "feed"])
  await db.collection(name).createIndex({ deletedAt: 1, date: -1 });
await db.collection("socials").createIndex({ deletedAt: 1, order: 1 });
await db.collection("audit").createIndex({ at: -1 });
await db.collection("tokens").createIndex({ hash: 1 }, { unique: true });
await db.collection("tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 7 * 86400 });
console.log("indexes: ok");
await client.close();
