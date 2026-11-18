import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./mongo";
import type { Role } from "./auth";

// One-time links for inviting a mod or resetting a password. Only a hash
// of the token is stored, so a database leak can't be turned into logins.

export type TokenKind = "invite" | "reset";
type TokenDoc = {
  hash: string;
  kind: TokenKind;
  email: string;
  role?: Role;
  userId?: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
};

const tokens = () => db.collection<TokenDoc>("tokens");
const sha = (t: string) => createHash("sha256").update(t).digest("hex");

export const TOKEN_HOURS = { invite: 72, reset: 24 } as const;

export async function createToken(data: Omit<TokenDoc, "hash" | "createdAt" | "expiresAt" | "usedAt">) {
  const raw = randomBytes(32).toString("base64url");
  // A fresh link replaces any older unused one for the same person.
  await tokens().deleteMany({ email: data.email, kind: data.kind, usedAt: null });
  await tokens().insertOne({
    ...data,
    hash: sha(raw),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + TOKEN_HOURS[data.kind] * 3_600_000),
    usedAt: null,
  });
  return raw;
}

export async function findToken(raw: string) {
  if (!raw || raw.length > 100) return null;
  const doc = await tokens().findOne({ hash: sha(raw), usedAt: null, expiresAt: { $gt: new Date() } });
  return doc;
}

/** Marks the token used; returns false if someone else already used it. */
export async function consumeToken(raw: string) {
  const r = await tokens().updateOne(
    { hash: sha(raw), usedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } },
  );
  return r.modifiedCount === 1;
}

export async function pendingInvites() {
  return tokens()
    .find({ kind: "invite", usedAt: null, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function revokeInvite(email: string) {
  await tokens().deleteMany({ email, kind: "invite", usedAt: null });
}
