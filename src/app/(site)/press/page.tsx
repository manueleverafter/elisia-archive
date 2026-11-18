import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { FilterGrid } from "@/components/filter-grid";
import { Container, PageHeader, SampleBadge, formatDate } from "@/components/ui";
import { getPress } from "@/lib/data";

export const metadata: Metadata = { title: "Press" };

export default async function PressPage() {
  const press = await getPress();
  const eras = [...new Set(press.map((p) => p.era))];
  return (
    <Container>
      <PageHeader
        title="in the press"
        intro="Headlines and mentions from news outlets. Every link opens the original story."
        aside={<span className="text-sm text-muted">{press.length} stories</span>}
      />
      <FilterGrid
        label="Filter by era or coverage"
        filters={[
          ...eras.map((e) => ({ id: e, label: e })),
          { id: "feature", label: "Features" },
          { id: "interview", label: "Interviews" },
          { id: "mention", label: "Mentions" },
        ]}
        className="grid gap-4 md:grid-cols-2"
        items={press.map((p) => ({
          key: p.id,
          tags: [p.era, p.mention],
          node: (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block h-full rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:border-primary"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-primary uppercase">{p.outlet}</span>
                <time dateTime={p.date} className="text-muted">
                  {formatDate(p.date)}
                </time>
                <span className="text-muted uppercase">· {p.mention}</span>
                <span className="ml-auto text-muted uppercase">{p.era}</span>
                {p.sample && <SampleBadge />}
              </div>
              <h2 className="font-semibold leading-snug group-hover:text-primary">
                {p.headline} <ExternalLink className="inline size-3.5" />
              </h2>
            </a>
          ),
        }))}
      />
    </Container>
  );
}
