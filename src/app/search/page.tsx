import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container, EmptyState, PageHeader, Pill, formatDate } from "@/components/ui";
import { searchAll } from "@/lib/data";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Container>
      <PageHeader title="search the archive" />
      <Suspense fallback={<p className="text-muted">Searching…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 100) ?? "";
  const results = await searchAll(q);

  return (
    <>
      <form action="/search" role="search" className="mb-6">
        <label className="sr-only" htmlFor="q">
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="find a clip, date, or photo…"
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-base outline-none focus:border-primary"
        />
      </form>
      {!q ? (
        <EmptyState>Type something to search videos, polaroids, posts and press.</EmptyState>
      ) : results.length === 0 ? (
        <EmptyState>No results for “{q}”.</EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-3xl border border-border bg-surface">
          {results.map((r, i) => (
            <li key={i}>
              <Link href={r.href} className="flex items-center gap-3 p-4 hover:bg-surface-2">
                <Pill>{r.kind}</Pill>
                <span className="flex-1 font-medium">{r.title}</span>
                <time dateTime={r.date} className="text-xs text-muted">
                  {formatDate(r.date)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
