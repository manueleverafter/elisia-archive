"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CONTENT_TAG } from "@/lib/data";
import { isResourceKey, resources, type ResourceKey } from "@/lib/resources";
import { themes } from "@/lib/themes";
import { auth, MIN_PASSWORD, type Role } from "@/lib/server/auth";
import {
  audit,
  col,
  imageKeys,
  oid,
  parseForm,
  readSettings,
  writeSettings,
  type FormState,
} from "@/lib/server/content";
import { db } from "@/lib/server/mongo";
import { deleteKeys, presignPut, publicUrl } from "@/lib/server/r2";
import { requireActionUser } from "@/lib/server/session";
import { consumeToken, createToken, findToken, revokeInvite } from "@/lib/server/tokens";

function resourceOrThrow(key: string): ResourceKey {
  if (!isResourceKey(key)) throw new Error("Unknown section.");
  return key;
}

const titleOf = (key: ResourceKey, data: Record<string, unknown>) =>
  String(data[resources[key].titleField] ?? "").slice(0, 120);

// ---------------- content ----------------

export async function saveItem(key: string, id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser();
  const rk = resourceOrThrow(key);
  const def = resources[rk];
  const { data, fieldErrors } = parseForm(def, fd);
  if (Object.keys(fieldErrors).length) return { error: "Please fix the highlighted fields.", fieldErrors };

  if (rk === "posts" && !id) data.author = user.name;
  const now = new Date();

  if (id) {
    const before = await col(rk).findOne({ _id: oid(id) });
    if (!before) return { error: "This item no longer exists." };
    await col(rk).updateOne({ _id: before._id }, { $set: { ...data, updatedAt: now, updatedBy: user.id } });
    // Remove photos that were replaced or cleared.
    const kept = new Set(imageKeys(def, { ...before, ...data }));
    await deleteKeys(imageKeys(def, before).filter((k) => !kept.has(k)));
    await audit(user, "updated", { resource: rk, id, title: titleOf(rk, data) });
  } else {
    const r = await col(rk).insertOne({ ...data, createdAt: now, createdBy: user.id, updatedAt: now, deletedAt: null });
    await audit(user, "created", { resource: rk, id: String(r.insertedId), title: titleOf(rk, data) });
  }
  updateTag(CONTENT_TAG);
  redirect(`/admin/${rk}?saved=1`);
}

export async function trashItem(key: string, id: string) {
  const user = await requireActionUser();
  const rk = resourceOrThrow(key);
  const doc = await col(rk).findOneAndUpdate({ _id: oid(id), deletedAt: null }, { $set: { deletedAt: new Date(), deletedBy: user.id } });
  if (doc) await audit(user, "moved to trash", { resource: rk, id, title: titleOf(rk, doc) });
  updateTag(CONTENT_TAG);
}

export async function restoreItem(key: string, id: string) {
  const user = await requireActionUser();
  const rk = resourceOrThrow(key);
  const doc = await col(rk).findOneAndUpdate({ _id: oid(id) }, { $set: { deletedAt: null }, $unset: { deletedBy: "" } });
  if (doc) await audit(user, "restored", { resource: rk, id, title: titleOf(rk, doc) });
  updateTag(CONTENT_TAG);
}

export async function purgeItem(key: string, id: string) {
  const user = await requireActionUser("admin");
  const rk = resourceOrThrow(key);
  const doc = await col(rk).findOne({ _id: oid(id), deletedAt: { $ne: null } });
  if (!doc) return;
  await deleteKeys(imageKeys(resources[rk], doc));
  await col(rk).deleteOne({ _id: doc._id });
  await audit(user, "deleted forever", { resource: rk, id, title: titleOf(rk, doc) });
}

// ---------------- uploads ----------------

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const MAX_ORIGINAL = 25 * 1024 * 1024;
const MAX_WEB = 5 * 1024 * 1024;

export type UploadRequest = { variant: "original" | "web"; type: string; size: number };

export async function getUploadTargets(folder: string, files: UploadRequest[]) {
  await requireActionUser();
  const rk = resourceOrThrow(folder);
  if (!Array.isArray(files) || files.length === 0 || files.length > 2) throw new Error("Bad upload request.");
  const id = randomUUID();
  const month = new Date().toISOString().slice(0, 7);
  return Promise.all(
    files.map(async (f) => {
      const ext = IMAGE_TYPES[f.type];
      if (!ext) throw new Error("Use a JPG, PNG, WebP, AVIF or GIF image.");
      const limit = f.variant === "web" ? MAX_WEB : MAX_ORIGINAL;
      if (!Number.isInteger(f.size) || f.size <= 0 || f.size > limit)
        throw new Error(`Image is too large (max ${Math.round(MAX_ORIGINAL / 1048576)} MB).`);
      const key = `${rk}/${month}/${id}/${f.variant}.${ext}`;
      return { variant: f.variant, putUrl: await presignPut(key, f.type, f.size), publicUrl: publicUrl(key) };
    }),
  );
}

// ---------------- profile & settings ----------------

export async function saveProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser();
  const labels = fd.getAll("profile.label").map((x) => String(x).trim());
  const values = fd.getAll("profile.value").map((x) => String(x).trim());
  const profile: { label: string; value: string }[] = [];
  for (let i = 0; i < Math.min(labels.length, values.length, 30); i++) {
    if (!labels[i] && !values[i]) continue;
    if (!labels[i] || !values[i]) return { error: "Each fact needs both a label and a value." };
    profile.push({ label: labels[i].slice(0, 40), value: values[i].slice(0, 200) });
  }
  const s = await readSettings();
  await writeSettings({ ...s, profile });
  await audit(user, "updated the profile facts");
  updateTag(CONTENT_TAG);
  return { ok: true };
}

export async function saveSiteSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireActionUser("admin");
  const theme = String(fd.get("defaultTheme") ?? "");
  if (!themes.some((t) => t.id === theme)) return { error: "Pick a theme." };
  const s = await readSettings();
  await writeSettings({ ...s, defaultTheme: theme });
  await audit(user, `set the default theme to ${theme}`);
  updateTag(CONTENT_TAG);
  return { ok: true };
}

// ---------------- mods ----------------

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200;
const roleOf = (v: unknown): Role => (v === "admin" ? "admin" : "editor");

export type LinkState = FormState & { link?: string };

export async function createInvite(_prev: LinkState, fd: FormData): Promise<LinkState> {
  const admin = await requireActionUser("admin");
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const role = roleOf(fd.get("role"));
  if (!emailOk(email)) return { error: "Enter a valid email." };
  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(email)) return { error: "That email already has an account." };
  const token = await createToken({ kind: "invite", email, role, createdBy: admin.id });
  await audit(admin, `invited ${email} as ${role}`);
  revalidatePath("/admin/mods");
  return { ok: true, link: `/admin/accept?token=${token}` };
}

export async function cancelInvite(email: string) {
  const admin = await requireActionUser("admin");
  await revokeInvite(email);
  await audit(admin, `cancelled the invite for ${email}`);
  revalidatePath("/admin/mods");
}

export async function createResetLink(userId: string): Promise<LinkState> {
  const admin = await requireActionUser("admin");
  const ctx = await auth.$context;
  const u = await ctx.internalAdapter.findUserById(userId);
  if (!u) return { error: "User not found." };
  const token = await createToken({ kind: "reset", email: u.email, userId: u.id, createdBy: admin.id });
  await audit(admin, `made a password reset link for ${u.name}`);
  return { ok: true, link: `/admin/accept?token=${token}` };
}

async function adminCount() {
  return db.collection("user").countDocuments({ role: "admin" });
}

export async function setRole(userId: string, role: string) {
  const admin = await requireActionUser("admin");
  if (userId === admin.id) throw new Error("You can't change your own role.");
  const ctx = await auth.$context;
  const u = await ctx.internalAdapter.findUserById(userId);
  if (!u) throw new Error("User not found.");
  const next = roleOf(role);
  await ctx.internalAdapter.updateUser(userId, { role: next });
  await audit(admin, `changed ${u.name}'s role to ${next}`);
  revalidatePath("/admin/mods");
}

export async function removeMod(userId: string) {
  const admin = await requireActionUser("admin");
  if (userId === admin.id) throw new Error("You can't remove yourself.");
  const ctx = await auth.$context;
  const u = (await ctx.internalAdapter.findUserById(userId)) as { name: string; role?: string } | null;
  if (!u) return;
  if (u.role === "admin" && (await adminCount()) <= 1) throw new Error("Keep at least one admin.");
  await ctx.internalAdapter.deleteUserSessions(userId);
  await ctx.internalAdapter.deleteAccounts(userId);
  await ctx.internalAdapter.deleteUser(userId);
  await audit(admin, `removed ${u.name}`);
  revalidatePath("/admin/mods");
}

// ---------------- first admin / accept link (no login needed) ----------------

function checkPasswords(fd: FormData): string | { password: string } {
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  if (password.length > 128) return "That password is too long.";
  if (password !== confirm) return "The two passwords don't match.";
  return { password };
}

async function createUserWithPassword(email: string, name: string, role: Role, password: string) {
  const ctx = await auth.$context;
  const user = await ctx.internalAdapter.createUser({ email, name, role, emailVerified: true }, { method: "admin" });
  await ctx.internalAdapter.linkAccount({
    providerId: "credential",
    accountId: user.id,
    userId: user.id,
    password: await ctx.password.hash(password),
  });
  return user;
}

export async function setupFirstAdmin(_prev: FormState, fd: FormData): Promise<FormState> {
  const allowed = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const name = String(fd.get("name") ?? "").trim().slice(0, 60);
  if (!allowed) return { error: "ADMIN_EMAIL is not configured on the server." };
  if ((await db.collection("user").countDocuments()) > 0) return { error: "Setup is already finished. Please log in." };
  if (email !== allowed) return { error: "This email isn't the one set up as the first admin." };
  if (!name) return { error: "Enter your display name." };
  const pw = checkPasswords(fd);
  if (typeof pw === "string") return { error: pw };
  const user = await createUserWithPassword(email, name, "admin", pw.password);
  await audit({ id: user.id, name, email, role: "admin" }, "set up the archive as first admin");
  redirect("/admin/login?setup=1");
}

export async function acceptLink(token: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const t = await findToken(token);
  if (!t) return { error: "This link has expired or was already used. Ask an admin for a new one." };
  const pw = checkPasswords(fd);
  if (typeof pw === "string") return { error: pw };
  const ctx = await auth.$context;

  if (t.kind === "invite") {
    const name = String(fd.get("name") ?? "").trim().slice(0, 60);
    if (!name) return { error: "Enter your display name." };
    if (await ctx.internalAdapter.findUserByEmail(t.email)) return { error: "This email already has an account." };
    if (!(await consumeToken(token))) return { error: "This link was already used." };
    const user = await createUserWithPassword(t.email, name, t.role ?? "editor", pw.password);
    await audit({ id: user.id, name, email: t.email, role: t.role ?? "editor" }, "joined as a mod");
  } else {
    if (!t.userId || !(await ctx.internalAdapter.findUserById(t.userId))) return { error: "Account not found." };
    if (!(await consumeToken(token))) return { error: "This link was already used." };
    const hash = await ctx.password.hash(pw.password);
    if (await ctx.internalAdapter.findCredentialAccount(t.userId)) await ctx.internalAdapter.updatePassword(t.userId, hash);
    else
      await ctx.internalAdapter.linkAccount({ providerId: "credential", accountId: t.userId, userId: t.userId, password: hash });
    await ctx.internalAdapter.deleteUserSessions(t.userId); // sign out everywhere
  }
  redirect("/admin/login?welcome=1");
}

export async function signOutAction() {
  const { headers } = await import("next/headers");
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
