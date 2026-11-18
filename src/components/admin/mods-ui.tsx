"use client";

import { useActionState, useState } from "react";
import { cancelInvite, createInvite, createResetLink, removeMod, setRole, type LinkState } from "@/app/admin/actions";
import { Notice } from "./auth-card";
import { ActionButton, CopyLink, inputCls, SubmitButton, useKeepValuesSubmit } from "./ui";

export function InviteForm() {
  const [state, action, pending] = useActionState<LinkState, FormData>(createInvite, {});
  const onSubmit = useKeepValuesSubmit(action);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-3">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="invite-email">
          Email
        </label>
        <input id="invite-email" name="email" type="email" required placeholder="mod@email.com" className={inputCls} />
        <label className="sr-only" htmlFor="invite-role">
          Role
        </label>
        <select id="invite-role" name="role" defaultValue="editor" className={`${inputCls} sm:w-40`}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <SubmitButton pending={pending} className="shrink-0">Create invite</SubmitButton>
      </div>
      {state.link && <CopyLink path={state.link} />}
    </form>
  );
}

export function ModRow({
  user,
  isSelf,
}: {
  user: { id: string; name: string; email: string; role: string };
  isSelf: boolean;
}) {
  const [link, setLink] = useState<string | null>(null);
  return (
    <li className="p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {user.name} {isSelf && <span className="text-xs font-normal text-muted">(you)</span>}
          </p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
            user.role === "admin" ? "bg-primary text-primary-fg" : "bg-surface-2"
          }`}
        >
          {user.role}
        </span>
        {!isSelf && (
          <div className="flex flex-wrap gap-2">
            <ActionButton
              action={() => setRole(user.id, user.role === "admin" ? "editor" : "admin")}
              confirm={user.role === "admin" ? "Make editor?" : "Make admin?"}
            >
              {user.role === "admin" ? "Make editor" : "Make admin"}
            </ActionButton>
            <ActionButton
              action={() => createResetLink(user.id)}
              onDone={(r) => setLink((r as LinkState).link ?? null)}
            >
              Reset password
            </ActionButton>
            <ActionButton action={() => removeMod(user.id)} confirm={`Remove ${user.name}?`} tone="danger">
              Remove
            </ActionButton>
          </div>
        )}
      </div>
      {link && (
        <div className="mt-3">
          <CopyLink path={link} />
        </div>
      )}
    </li>
  );
}

export function CancelInviteButton({ email }: { email: string }) {
  return (
    <ActionButton action={() => cancelInvite(email)} confirm="Cancel this invite?" tone="danger">
      Cancel
    </ActionButton>
  );
}
