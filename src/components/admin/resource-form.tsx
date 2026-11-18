"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { saveItem } from "@/app/admin/actions";
import type { Field, ResourceDef } from "@/lib/resources";
import type { FormState } from "@/lib/server/content";
import { ImageField } from "./image-field";
import { inputCls, SubmitButton, useKeepValuesSubmit } from "./ui";

type Values = Record<string, unknown>;

export function ResourceForm({ def, id, initial }: { def: ResourceDef; id: string | null; initial: Values }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveItem.bind(null, def.key, id), {});
  const onSubmit = useKeepValuesSubmit(action);
  return (
    <form method="post" onSubmit={onSubmit} className="space-y-5">
      {state.error && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      {def.fields.map((f) => (
        <FieldRow key={f.name} field={f} folder={def.key} value={initial[f.name]} error={state.fieldErrors?.[f.name]} />
      ))}
      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <SubmitButton pending={pending}>{id ? "Save changes" : `Add ${def.singular}`}</SubmitButton>
        <Link href={`/admin/${def.key}`} className="rounded-full border border-border px-5 py-2.5 font-semibold hover:bg-surface-2">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function FieldRow({ field: f, folder, value, error }: { field: Field; folder: string; value: unknown; error?: string }) {
  const id = `f-${f.name}`;
  const describedBy = [f.help && `${id}-help`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  const common = { id, name: f.name, "aria-invalid": !!error || undefined, "aria-describedby": describedBy };
  const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
  const today = new Date().toISOString().slice(0, 10);

  let control: React.ReactNode;
  switch (f.type) {
    case "textarea":
      control = <textarea {...common} rows={5} defaultValue={str(value)} className={inputCls} />;
      break;
    case "select":
      control = (
        <select {...common} defaultValue={str(value) || f.options?.[0]?.value} className={inputCls}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "date":
      control = <input {...common} type="date" defaultValue={str(value) || (f.required ? today : "")} className={inputCls} />;
      break;
    case "number":
      control = <input {...common} type="text" inputMode="numeric" defaultValue={str(value)} placeholder={f.placeholder} className={inputCls} />;
      break;
    case "tags":
      control = (
        <input {...common} defaultValue={Array.isArray(value) ? value.join(", ") : ""} placeholder={f.placeholder} className={inputCls} />
      );
      break;
    case "boolean":
      return (
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2 p-4">
          <input type="checkbox" name={f.name} defaultChecked={!!value} className="mt-1 size-5 accent-[var(--primary)]" />
          <span>
            <span className="font-medium">{f.label}</span>
            {f.help && <span className="mt-0.5 block text-sm text-muted">{f.help}</span>}
          </span>
        </label>
      );
    case "links":
      control = <LinksInput name={f.name} initial={Array.isArray(value) ? (value as { label: string; url: string }[]) : []} />;
      break;
    case "image":
      control = (
        <ImageField name={f.name} folder={folder} defaultValue={value as never} keepOriginal={f.name === "image"} />
      );
      break;
    default:
      control = (
        <input {...common} type={f.type === "url" ? "url" : "text"} defaultValue={str(value)} placeholder={f.placeholder} className={inputCls} />
      );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {f.label} {f.required && <span className="text-primary" aria-hidden>*</span>}
      </label>
      {control}
      {f.help && (
        <p id={`${id}-help`} className="mt-1 text-sm text-muted">
          {f.help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function LinksInput({ name, initial }: { name: string; initial: { label: string; url: string }[] }) {
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : [{ label: "", url: "" }]).map((r, i) => ({ ...r, k: i })),
  );
  const [next, setNext] = useState(rows.length);
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.k} className="flex gap-2">
          <input name={`${name}.label`} defaultValue={r.label} placeholder="Spotify" aria-label="Link name" className={`${inputCls} w-36 shrink-0`} />
          <input name={`${name}.url`} defaultValue={r.url} placeholder="https://…" aria-label="Link URL" type="url" className={inputCls} />
          <button
            type="button"
            aria-label="Remove link"
            onClick={() => setRows((x) => x.filter((y) => y.k !== r.k))}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-border hover:bg-surface-2"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows((x) => [...x, { label: "", url: "", k: next }]);
          setNext((n) => n + 1);
        }}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Plus className="size-4" /> Add link
      </button>
    </div>
  );
}
