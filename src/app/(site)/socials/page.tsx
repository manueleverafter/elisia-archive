import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { platformInfo } from "@/components/media-shared";
import { SocialFeed } from "@/components/social-feed";
import { Container, PageHeader } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { getFeed, getSocials } from "@/lib/data";
import type { SocialLink } from "@/lib/types";

export const metadata: Metadata = { title: "Socials" };

const ORDER = ["instagram", "tiktok", "x", "facebook", "youtube", "weverse", "spotify"];

const otherGroups: { ids: SocialLink["owner"][]; title: string }[] = [
  { ids: ["group"], title: "group" },
  { ids: ["fanbase", "project", "website"], title: `${siteConfig.fandom.name} (${siteConfig.fandom.shortName})` },
];

export default async function SocialsPage() {
  const [socials, feed] = await Promise.all([getSocials(), getFeed()]);
  const official = socials.filter((s) => s.owner === "official");
  const byPlatform = ORDER.map((p) => ({ p, links: official.filter((s) => s.platform === p) })).filter((g) => g.links.length);

  return (
    <Container>
      <PageHeader title="socials hub" intro="Follow the official accounts, then scroll for the latest posts in one feed." />

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl">official links</h2>
          <span className="text-sm text-muted">{official.length} destinations</span>
        </div>
        {byPlatform.length === 0 ? (
          <p className="text-muted">Coming soon.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {byPlatform.map(({ p, links }) => (
              <li
                key={p}
                className="rounded-3xl border-2 border-border p-5 shadow-card"
                style={{
                  background: `color-mix(in oklch, var(--surface) 82%, oklch(0.6 0.12 ${platformInfo[p]?.hue ?? 300}))`,
                }}
              >
                <h3 className="mb-3 font-display text-xl">{p === "x" ? "X (Twitter)" : (platformInfo[p]?.name ?? p)}</h3>
                <ul className="space-y-2">
                  {links.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full border-2 border-border bg-surface/70 px-4 py-2 text-sm font-semibold transition hover:border-primary"
                      >
                        <span className="min-w-0 flex-1 truncate">{s.handle}</span>
                        <ArrowUpRight className="size-4 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {otherGroups.map((g) => {
          const links = socials.filter((s) => g.ids.includes(s.owner));
          if (!links.length) return null;
          return (
            <section key={g.title} className="rounded-3xl border border-border bg-surface p-5 shadow-card">
              <h2 className="mb-3 font-hand text-xl">{g.title}</h2>
              <ul className="flex flex-wrap gap-2">
                {links.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary"
                    >
                      <span className="font-semibold">{platformInfo[s.platform]?.name ?? s.label}</span>
                      <span className="text-muted">{s.handle}</span>
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <SocialFeed posts={feed} />
    </Container>
  );
}
