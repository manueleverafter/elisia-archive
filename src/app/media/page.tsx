import type { Metadata } from "next";
import { FilterGrid } from "@/components/filter-grid";
import { MediaThumb } from "@/components/media";
import { platformLabel } from "@/components/media-shared";
import { Container, PageHeader, Pill, SampleBadge, formatDate } from "@/components/ui";
import { getMedia } from "@/lib/data";

export const metadata: Metadata = { title: "Media" };

const categories = [
  { id: "mv", label: "MVs" },
  { id: "performance", label: "Performances" },
  { id: "variety", label: "Variety" },
  { id: "live", label: "Lives" },
  { id: "fancam", label: "Fancams" },
  { id: "behind", label: "Behind the scenes" },
];

export default async function MediaPage() {
  const media = await getMedia();
  return (
    <Container>
      <PageHeader
        title="media"
        intro="Music videos, stages, variety clips and fancams, embedded from their official sources."
        aside={<span className="text-sm text-muted">{media.length} clips</span>}
      />
      <FilterGrid
        label="Filter by category"
        filters={categories}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        items={media.map((m) => ({
          key: m.id,
          tags: [m.category],
          node: (
            <article className="h-full overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
              <MediaThumb item={m} />
              <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span className="font-semibold text-primary uppercase">{platformLabel[m.platform]}</span>
                  <time dateTime={m.date}>{formatDate(m.date)}</time>
                  {m.sample && <SampleBadge />}
                </div>
                <h2 className="font-semibold leading-snug">{m.title}</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <Pill key={t}>#{t}</Pill>
                  ))}
                </div>
              </div>
            </article>
          ),
        }))}
      />
    </Container>
  );
}
