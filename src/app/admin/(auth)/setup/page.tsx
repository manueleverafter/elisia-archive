import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthCard } from "@/components/admin/auth-card";
import { db } from "@/lib/server/mongo";
import { PasswordForm } from "../password-form";
import { setupFirstAdmin } from "../../actions";

export const metadata: Metadata = { title: "First-time setup" };

export default function SetupPage() {
  return (
    <AuthCard
      title="first-time setup"
      intro="Create the first admin account. This page only works once, before any account exists."
    >
      <Suspense>
        <Gate />
      </Suspense>
    </AuthCard>
  );
}

async function Gate() {
  await connection(); // always check live, never prerender
  if ((await db.collection("user").countDocuments()) > 0) redirect("/admin/login");
  return <PasswordForm action={setupFirstAdmin} askEmail askName submitLabel="Create admin account" />;
}
