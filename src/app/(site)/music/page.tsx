import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { GoalMeter } from "@/components/goal-meter";
import { Placeholder } from "@/components/media-shared";
import { Card, Container, EmptyState, PageHeader, Pill, SampleBadge, formatDate } from "@/components/ui";
import { getReleases } from "@/lib/data";

export const metadata: Metadata = { title: "Music" };

export default async function MusicPage() {
  const releases = await getReleases();
  return (
    <Container>
      <PageHeader title="music" intro="Every release, where to stream it, and our current streaming goals." />
      {releases.length ? (
        <ul className="grid gap-5 md:grid-cols-2">
          {releases.map((r) => (
            <li key={r.id}>
              <Card as="article" className="flex h-full flex-col gap-5 sm:flex-row">
                {r.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.coverUrl} alt={`${r.title} cover`} loading="lazy" className="aspect-square w-full shrink-0 rounded-2xl object-cover sm:w-40" />
                ) : (
                  <Placeholder label={r.title} className="aspect-square w-full shrink-0 rounded-2xl sm:w-40" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>{r.type}</Pill>
                    <time dateTime={r.date} className="text-xs text-muted">
                      {formatDate(r.date)}
                    </time>
                    {r.sample && <SampleBadge />}
                  </div>
                  <h2 className="mt-2 font-display text-2xl">{r.title}</h2>
                  {r.goal && (
                    <div className="mt-4">
                      <GoalMeter {...r.goal} />
                    </div>
                  )}
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {r.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                        >
                          {l.label} <ExternalLink className="size-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No releases yet.</EmptyState>
      )}
    </Container>
  );
}
