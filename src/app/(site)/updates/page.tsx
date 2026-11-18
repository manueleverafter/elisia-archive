import type { Metadata } from "next";
import { Pin } from "lucide-react";
import { Card, Container, EmptyState, PageHeader, Pill, SampleBadge, formatDate } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { getPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Fanbase" };

export default async function UpdatesPage() {
  const posts = await getPosts();
  return (
    <Container>
      <PageHeader
        title="bulletin board"
        intro={`Announcements, fan projects and events from the ${siteConfig.fandom.name}.`}
      />
      {posts.length ? (
        <ul className="grid gap-5 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.id} className={p.pinned ? "md:col-span-2" : ""}>
              <Card as="article" className={`h-full ${p.pinned ? "bg-soft" : ""}`}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {p.pinned && (
                    <Pill tone="primary">
                      <Pin className="mr-1 size-3" /> pinned
                    </Pill>
                  )}
                  <Pill>{p.tag}</Pill>
                  {p.sample && <SampleBadge />}
                </div>
                <h2 className="font-display text-2xl">{p.title}</h2>
                <p className="mt-2 text-muted">{p.body}</p>
                <p className="mt-4 text-xs text-muted">
                  {p.author} · <time dateTime={p.date}>{formatDate(p.date)}</time>
                </p>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No posts yet.</EmptyState>
      )}
    </Container>
  );
}
