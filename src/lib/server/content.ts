import "server-only";
import { ObjectId, type Document, type Filter } from "mongodb";
import { parseMediaUrl, resources, type Field, type ResourceDef, type ResourceKey } from "@/lib/resources";
import { db } from "./mongo";
import { PUBLIC_URL, deleteKeys, keyFromUrl } from "./r2";
import type { SessionUser } from "./session";

export const TRASH_DAYS = 30;

export type ImageValue = { url: string; originalUrl?: string; width?: number; height?: number };
export type LinkValue = { label: string; url: string };
export type Item = Record<string, unknown> & { id: string };
export type FormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export const col = (key: ResourceKey) => db.collection(key);

/** Mongo document → plain object safe to pass to client components. */
export function toPlain(doc: Document): Item {
  const out: Item = { id: String(doc._id) };
  for (const [k, v] of Object.entries(doc)) {
    if (k === "_id") continue;
    out[k] = v instanceof Date ? v.toISOString() : v instanceof ObjectId ? String(v) : v;
  }
  return out;
}

export function oid(id: string) {
  if (!ObjectId.isValid(id)) throw new Error("Item not found.");
  return new ObjectId(id);
}

// ---------- form parsing / validation ----------

function isHttpUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const isOurUpload = (v: string) => !!PUBLIC_URL && v.startsWith(PUBLIC_URL + "/");

function readField(f: Field, fd: FormData): { value?: unknown; error?: string } {
  const raw = (n = f.name) => String(fd.get(n) ?? "").trim();
  const empty = (v: unknown) =>
    v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
  let value: unknown;

  switch (f.type) {
    case "text":
    case "textarea": {
      const v = raw();
      const max = f.type === "text" ? 300 : 5000;
      if (v.length > max) return { error: `Keep this under ${max} characters.` };
      value = v;
      break;
    }
    case "url": {
      const v = raw();
      if (v && !isHttpUrl(v)) return { error: "Enter a full link starting with https://" };
      value = v;
      break;
    }
    case "date": {
      const v = raw();
      if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: "Pick a date." };
      value = v;
      break;
    }
    case "select": {
      const v = raw();
      if (v && !f.options?.some((o) => o.value === v)) return { error: "Pick one of the options." };
      value = v;
      break;
    }
    case "tags":
      value = [
        ...new Set(
          raw()
            .split(/[,#]/)
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
        ),
      ].slice(0, 20);
      break;
    case "number": {
      const v = raw().replace(/,/g, "");
      if (v && !/^\d+$/.test(v)) return { error: "Whole numbers only." };
      value = v ? Number(v) : undefined;
      break;
    }
    case "boolean":
      value = fd.get(f.name) === "on";
      break;
    case "links": {
      const labels = fd.getAll(`${f.name}.label`).map((x) => String(x).trim());
      const urls = fd.getAll(`${f.name}.url`).map((x) => String(x).trim());
      const links: LinkValue[] = [];
      for (let i = 0; i < Math.min(labels.length, urls.length, 20); i++) {
        if (!labels[i] && !urls[i]) continue;
        if (!labels[i] || !isHttpUrl(urls[i])) return { error: "Each link needs a name and a full https:// link." };
        links.push({ label: labels[i].slice(0, 60), url: urls[i] });
      }
      value = links;
      break;
    }
    case "image": {
      const url = raw(`${f.name}.url`);
      if (!url) {
        value = undefined;
        break;
      }
      const originalUrl = raw(`${f.name}.originalUrl`);
      if (!isOurUpload(url) || (originalUrl && !isOurUpload(originalUrl)))
        return { error: "Upload the photo again." };
      value = {
        url,
        originalUrl: originalUrl || undefined,
        width: Number(raw(`${f.name}.width`)) || undefined,
        height: Number(raw(`${f.name}.height`)) || undefined,
      } satisfies ImageValue;
      break;
    }
  }
  if (f.required && empty(value) && f.type !== "boolean") return { error: "Required." };
  return { value };
}

export function parseForm(def: ResourceDef, fd: FormData) {
  const data: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  for (const f of def.fields) {
    const { value, error } = readField(f, fd);
    if (error) fieldErrors[f.name] = error;
    else data[f.name] = value;
  }
  if (def.key === "media" && typeof data.url === "string" && data.url) {
    const p = parseMediaUrl(data.url);
    if (!p.platform) fieldErrors.url = "Use a YouTube, X, TikTok or Instagram link.";
    else {
      data.platform = p.platform;
      data.youtubeId = p.youtubeId;
    }
  }
  return { data, fieldErrors };
}

// ---------- images held by an item ----------

export function imageKeys(def: ResourceDef, item: Document | null | undefined) {
  if (!item) return [];
  return def.fields
    .filter((f) => f.type === "image")
    .flatMap((f) => {
      const img = item[f.name] as ImageValue | undefined;
      return [keyFromUrl(img?.url), keyFromUrl(img?.originalUrl)];
    })
    .filter((k): k is string => !!k);
}

// ---------- audit log ----------

export async function audit(
  user: SessionUser,
  action: string,
  target: { resource?: string; id?: string; title?: string } = {},
) {
  await db.collection("audit").insertOne({
    at: new Date(),
    userId: user.id,
    userName: user.name,
    action,
    ...target,
  });
}

export async function recentActivity(limit = 50) {
  const docs = await db.collection("audit").find().sort({ at: -1 }).limit(limit).toArray();
  return docs.map(toPlain);
}

// ---------- queries for the admin ----------

export async function listItems(key: ResourceKey, opts: { trashed?: boolean; q?: string } = {}) {
  const def = resources[key];
  const filter: Filter<Document> = { deletedAt: opts.trashed ? { $ne: null } : null };
  if (opts.q) {
    const rx = new RegExp(opts.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter[def.titleField] = rx;
  }
  const docs = await col(key)
    .find(filter)
    .sort(opts.trashed ? { deletedAt: -1 } : def.defaultSort)
    .limit(500)
    .toArray();
  return docs.map(toPlain);
}

export async function getItem(key: ResourceKey, id: string) {
  const doc = await col(key).findOne({ _id: oid(id) });
  return doc ? toPlain(doc) : null;
}

/** Deletes trash older than TRASH_DAYS, including its photos in R2. */
export async function purgeExpiredTrash() {
  const cutoff = new Date(Date.now() - TRASH_DAYS * 86_400_000);
  for (const def of Object.values(resources)) {
    const old = await col(def.key).find({ deletedAt: { $lt: cutoff } }).toArray();
    if (!old.length) continue;
    await deleteKeys(old.flatMap((d) => imageKeys(def, d)));
    await col(def.key).deleteMany({ _id: { $in: old.map((d) => d._id) } });
  }
}

// ---------- site settings (single document) ----------

export type SiteSettings = {
  profile: { label: string; value: string }[];
  defaultTheme: string;
};

const DEFAULT_SETTINGS: SiteSettings = { profile: [], defaultTheme: "bunny" };

export async function readSettings(): Promise<SiteSettings> {
  const doc = await db.collection<{ _id: string } & SiteSettings>("settings").findOne({ _id: "site" });
  return { ...DEFAULT_SETTINGS, ...(doc ? { profile: doc.profile ?? [], defaultTheme: doc.defaultTheme } : {}) };
}

export async function writeSettings(s: SiteSettings) {
  await db
    .collection<{ _id: string } & SiteSettings>("settings")
    .updateOne({ _id: "site" }, { $set: { ...s, updatedAt: new Date() } }, { upsert: true });
}
