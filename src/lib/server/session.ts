import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth, type Role } from "./auth";

export type SessionUser = { id: string; name: string; email: string; role: Role };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as typeof session.user & { role?: string };
  return { id: u.id, name: u.name, email: u.email, role: u.role === "admin" ? "admin" : "editor" };
}

/** For pages: sends visitors without access to the login page. */
export async function requirePageUser(role?: Role) {
  await connection();
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin");
  return user;
}

/** For server actions: throws instead of redirecting. Call first, every time. */
export async function requireActionUser(role?: Role) {
  const user = await getSessionUser();
  if (!user) throw new Error("You are signed out. Please log in again.");
  if (role === "admin" && user.role !== "admin") throw new Error("Only admins can do that.");
  return user;
}
