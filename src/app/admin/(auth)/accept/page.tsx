import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthCard, Notice } from "@/components/admin/auth-card";
import { findToken } from "@/lib/server/tokens";
import { PasswordForm } from "../password-form";
import { acceptLink } from "../../actions";

export const metadata: Metadata = { title: "Set your password" };

export default function AcceptPage({ searchParams }: PageProps<"/admin/accept">) {
  return (
    <Suspense fallback={<AuthCard title="one moment…">{null}</AuthCard>}>
      <Gate searchParams={searchParams} />
    </Suspense>
  );
}

async function Gate({ searchParams }: { searchParams: PageProps<"/admin/accept">["searchParams"] }) {
  await connection();
  const raw = (await searchParams).token;
  const token = typeof raw === "string" ? raw : "";
  const t = await findToken(token);
  if (!t)
    return (
      <AuthCard title="link expired">
        <Notice tone="error">This link has expired or was already used. Ask an admin for a new one.</Notice>
        <Link href="/admin/login" className="font-semibold text-primary">
          Go to login
        </Link>
      </AuthCard>
    );
  const invite = t.kind === "invite";
  return (
    <AuthCard
      title={invite ? "welcome, new mod!" : "reset your password"}
      intro={invite ? `You were invited as ${t.role === "admin" ? "an admin" : "an editor"}. Choose your name and password.` : "Choose a new password."}
    >
      <PasswordForm
        action={acceptLink.bind(null, token)}
        fixedEmail={t.email}
        askName={invite}
        submitLabel={invite ? "Create my account" : "Save new password"}
      />
    </AuthCard>
  );
}
