import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthCard, Notice } from "@/components/admin/auth-card";
import { db } from "@/lib/server/mongo";
import { getSessionUser } from "@/lib/server/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <AuthCard title="mod login" intro="For archive mods only.">
      <Suspense>
        <Gate searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function Gate({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  await connection();
  if (await getSessionUser()) redirect("/admin");
  if ((await db.collection("user").countDocuments()) === 0) redirect("/admin/setup");
  const sp = await searchParams;
  return (
    <>
      {sp.setup && <Notice tone="ok">Your admin account is ready. Log in to start.</Notice>}
      {sp.welcome && <Notice tone="ok">Password saved. Log in with your new password.</Notice>}
      <LoginForm />
    </>
  );
}
