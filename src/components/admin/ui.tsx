"use client";

import { Check, Copy, Loader2 } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

export const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-base outline-none transition focus:border-primary aria-[invalid=true]:border-red-500";

/**
 * React resets a <form action={…}> after every submit, which wipes what a
 * mod typed when validation fails. Submitting through this handler keeps
 * the fields as they are.
 */
export function useKeepValuesSubmit(dispatch: (fd: FormData) => void) {
  const [, start] = useTransition();
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(() => dispatch(fd));
  };
}

export function SubmitButton({
  children,
  className = "",
  pending: pendingProp,
}: {
  children: ReactNode;
  className?: string;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-fg transition hover:brightness-110 disabled:opacity-60 ${className}`}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

/**
 * A button that runs a server action, asking first with an inline
 * "are you sure" step (no browser pop-ups).
 */
export function ActionButton({
  action,
  children,
  confirm,
  tone = "default",
  onDone,
}: {
  action: () => Promise<unknown>;
  children: ReactNode;
  confirm?: string;
  tone?: "default" | "danger";
  onDone?: (result: unknown) => void;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60";
  const tones = {
    default: "border border-border hover:bg-surface-2",
    danger: "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950",
  };
  const run = () =>
    start(async () => {
      setError(null);
      try {
        const r = await action();
        setAsking(false);
        onDone?.(r);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });

  if (asking)
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="text-sm">{confirm}</span>
        <button type="button" disabled={pending} onClick={run} className={`${base} ${tones[tone]}`}>
          {pending && <Loader2 className="size-3.5 animate-spin" />} Yes
        </button>
        <button type="button" onClick={() => setAsking(false)} className={`${base} ${tones.default}`}>
          No
        </button>
      </span>
    );
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        disabled={pending}
        onClick={() => (confirm ? setAsking(true) : run())}
        className={`${base} ${tones[tone]}`}
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </button>
      {error && <span className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</span>}
    </span>
  );
}

export function CopyLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? path : window.location.origin + path;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-3">
      <p className="mb-2 text-sm text-muted">Send this link privately (Discord / Messenger). It works once.</p>
      <div className="flex gap-2">
        <input readOnly value={url} onFocus={(e) => e.target.select()} className={`${inputCls} font-mono text-xs`} aria-label="Link" />
        <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 font-semibold text-primary-fg">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
