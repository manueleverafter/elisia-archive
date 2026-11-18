"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { saveProfile, saveSiteSettings } from "@/app/admin/actions";
import { themes } from "@/lib/themes";
import type { FormState } from "@/lib/server/content";
import { Notice } from "./auth-card";
import { inputCls, SubmitButton, useKeepValuesSubmit } from "./ui";

export function ProfileForm({ initial }: { initial: { label: string; value: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, {});
  const onSubmit = useKeepValuesSubmit(action);
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : [{ label: "", value: "" }]).map((r, k) => ({ ...r, k })),
  );
  const [next, setNext] = useState(rows.length);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-3">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.ok && <Notice tone="ok">Profile saved.</Notice>}
      {rows.map((r) => (
        <div key={r.k} className="flex gap-2">
          <input name="profile.label" defaultValue={r.label} placeholder="Birthday" aria-label="Fact label" className={`${inputCls} w-40 shrink-0`} />
          <input name="profile.value" defaultValue={r.value} placeholder="March 3" aria-label="Fact value" className={inputCls} />
          <button
            type="button"
            aria-label="Remove fact"
            onClick={() => setRows((x) => x.filter((y) => y.k !== r.k))}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-border hover:bg-surface-2"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            setRows((x) => [...x, { label: "", value: "", k: next }]);
            setNext((n) => n + 1);
          }}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <Plus className="size-4" /> Add fact
        </button>
        <SubmitButton pending={pending} className="ml-auto">Save profile</SubmitButton>
      </div>
    </form>
  );
}

export function ThemeForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSiteSettings, {});
  const onSubmit = useKeepValuesSubmit(action);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.ok && <Notice tone="ok">Default theme saved. New visitors will see it.</Notice>}
      <fieldset>
        <legend className="mb-2 font-medium">Default theme for new visitors</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {themes.map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-surface-2">
              <input type="radio" name="defaultTheme" value={t.id} defaultChecked={t.id === current} className="accent-[var(--primary)]" />
              <span
                className="size-6 rounded-full border border-border"
                style={{ background: t.swatch.length > 1 ? `linear-gradient(120deg, ${t.swatch.join(", ")})` : t.swatch[0] }}
              />
              <span className="font-medium">{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <SubmitButton pending={pending}>Save theme</SubmitButton>
    </form>
  );
}
