"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inputCls } from "@/components/admin/ui";
import { Notice } from "@/components/admin/auth-card";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      rememberMe: true,
    });
    if (error) {
      setPending(false);
      setError(
        error.status === 429
          ? "Too many attempts. Wait a few minutes and try again."
          : "Wrong email or password.",
      );
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <div>
        <label htmlFor="email" className="mb-1.5 block font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-medium">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-primary-fg transition hover:brightness-110 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Log in
      </button>
      <p className="text-center text-sm text-muted">Forgot your password? Ask an admin for a reset link.</p>
    </form>
  );
}
