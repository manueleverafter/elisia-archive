import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe2, Newspaper, Pin, Users } from "lucide-react";
import { Card, CardTitle, Container, PageHeader, Pill, formatDate } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { getAds, getPosts, getPress, getSocials } from "@/lib/data";
import type { Post, SocialLink } from "@/lib/types";

export const metadata: Metadata = { title: "Fanbase" };

const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

const fanGroups: { id: SocialLink["owner"]; title: string }[] = [
  { id: "fanbase", title: "community accounts" },
  { id: "project", title: "fan projects" },
  { id: "website", title: "website" },
];

const platformName: Record<string, string> = {
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  spotify: "Spotify",
  weverse: "Weverse",
};

export default async function FanbasePage() {
  const [posts, socials, ads, press] = await Promise.all([getPosts(), getSocials(), getAds(), getPress()]);
  const notes = posts.filter((p) => p.pinned);
  const bulletin = posts.filter((p) => !p.pinned);
  const fanLinks = socials.filter((s) => fanGroups.some((g) => g.id === s.owner));
  const adsByYear = Object.entries(
    ads.reduce<Record<string, typeof ads>>((acc, a) => {
      (acc[a.date.slice(0, 4)] ??= []).push(a);
      return acc;
    }, {}),
  ).sort(([a], [b]) => b.localeCompare(a));

  const pill =
    "flex items-center gap-2 rounded-full border-2 border-border bg-surface px-4 py-2.5 text-sm transition hover:border-primary";

  return (
    <Container>
      <PageHeader title="fan notes & bulletin" />
      <div className="space-y-6">
        {/* Pinned fan notes */}
        <Card className="bg-soft">
          {notes.length ? (
            <>
              <CardTitle icon={<Pin className="size-5" />}>fan notes</CardTitle>
              <ul className="grid gap-3 md:grid-cols-2">
                {notes.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="font-hand text-2xl">no notes on the board yet</p>
              <p className="mt-2 text-sm text-muted">
                Pinned reminders from the fanbase will appear here: voting guides, event schedules and support drives.
              </p>
            </div>
          )}
        </Card>

        {/* Official fanbase pages */}
        <Card>
          <CardTitle icon={<Users className="size-5" />}>{siteConfig.fandom.name} official pages</CardTitle>
          <p className="-mt-2 mb-4 text-sm text-muted">
            Community-run pages for voting reminders, schedules, streaming parties and support drives.
          </p>
          {fanLinks.length === 0 && <p className="text-muted">Links coming soon.</p>}
          <div className="space-y-5">
            {fanGroups.map((g) => {
              const links = fanLinks.filter((s) => s.owner === g.id);
              if (!links.length) return null;
              return (
                <section key={g.id}>
                  <h3 className="mb-2 font-hand text-xl">{g.title}</h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {links.map((s) => (
                      <li key={s.id}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className={pill}>
                          <span className="font-semibold">{g.id === "website" ? s.label : platformName[s.platform] ?? s.label}</span>
                          <span className="min-w-0 flex-1 truncate text-muted">{s.handle}</span>
                          <ArrowRight className="size-4 shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-muted">
            Looking for {siteConfig.idol.name}&apos;s own accounts? See the{" "}
            <Link href="/socials" className="font-semibold underline hover:text-primary">
              official links on Socials
            </Link>
            .
          </p>
        </Card>

        {/* Billboard ads */}
        <Card>
          <CardTitle icon={<Globe2 className="size-5" />} aside={<Pill>{ads.length} posts</Pill>}>
            billboard ads around the world
          </CardTitle>
          {ads.length === 0 ? (
            <p className="text-muted">Birthday and support ads will be listed here, with links to their posts.</p>
          ) : (
            <div className="space-y-5">
              {adsByYear.map(([year, list]) => (
                <section key={year}>
                  <h3 className="mb-2 font-hand text-xl">{year}</h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((a) => (
                      <li key={a.id}>
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className={pill} title={a.note}>
                          <span className="min-w-0 flex-1 truncate font-semibold">
                            {month.format(new Date(a.date))} · {a.location}
                          </span>
                          <ArrowRight className="size-4 shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Card>

        {/* Bulletin */}
        {bulletin.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-2xl">bulletin board</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {bulletin.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Press preview */}
        <Card>
          <CardTitle
            icon={<Newspaper className="size-5" />}
            aside={
              <Link href="/press" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:border-primary">
                all {press.length} headlines <ArrowRight className="size-4" />
              </Link>
            }
          >
            {siteConfig.idol.name.toLowerCase()} in the press
          </CardTitle>
          {press.length === 0 ? (
            <p className="text-muted">No articles yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {press.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block py-3">
                    <span className="font-semibold group-hover:text-primary">{p.headline}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {p.outlet} · {formatDate(p.date)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Container>
  );
}

function PostCard({ post: p }: { post: Post }) {
  const body = (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {p.pinned && (
          <Pill tone="primary">
            <Pin className="mr-1 size-3" /> pinned
          </Pill>
        )}
        <Pill>{p.tag}</Pill>
        {p.link && <ArrowUpRight className="ml-auto size-4 text-muted group-hover:text-primary" />}
      </div>
      <h3 className="font-display text-xl group-hover:text-primary">{p.title}</h3>
      <p className="mt-1.5 text-sm whitespace-pre-line text-muted">{p.body}</p>
      <p className="mt-3 text-xs text-muted">
        {p.author} · <time dateTime={p.date}>{formatDate(p.date)}</time>
      </p>
    </>
  );
  const cls = "group block h-full rounded-3xl border border-border bg-surface p-5 shadow-card transition";
  return p.link ? (
    <a href={p.link} target="_blank" rel="noopener noreferrer" className={`${cls} hover:border-primary`}>
      {body}
    </a>
  ) : (
    <article className={cls}>{body}</article>
  );
}
