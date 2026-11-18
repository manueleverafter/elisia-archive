"use client";

import { useActionState } from "react";
import { Notice } from "@/components/admin/auth-card";
import { inputCls, SubmitButton, useKeepValuesSubmit } from "@/components/admin/ui";
import type { FormState } from "@/lib/server/content";

export function PasswordForm({
  action,
  askEmail = false,
  askName = false,
  fixedEmail,
  submitLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  askEmail?: boolean;
  askName?: boolean;
  fixedEmail?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const onSubmit = useKeepValuesSubmit(formAction);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {fixedEmail && (
        <div>
          <span className="mb-1.5 block font-medium">Email</span>
          <input value={fixedEmail} readOnly autoComplete="username" className={`${inputCls} bg-surface-2`} aria-label="Email" />
        </div>
      )}
      {askEmail && (
        <div>
          <label htmlFor="email" className="mb-1.5 block font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
        </div>
      )}
      {askName && (
        <div>
          <label htmlFor="name" className="mb-1.5 block font-medium">
            Display name
          </label>
          <input id="name" name="name" required maxLength={60} autoComplete="nickname" className={inputCls} />
          <p className="mt-1 text-sm text-muted">Shown on posts you write, e.g. your mod name.</p>
        </div>
      )}
      <div>
        <label htmlFor="password" className="mb-1.5 block font-medium">
          New password
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} className={inputCls} />
        <p className="mt-1 text-sm text-muted">At least 10 characters. A short sentence works well.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block font-medium">
          Type it again
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputCls} />
      </div>
      <SubmitButton pending={pending} className="w-full py-3">{submitLabel}</SubmitButton>
    </form>
  );
}
