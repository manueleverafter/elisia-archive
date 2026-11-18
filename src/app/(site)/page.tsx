import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, Camera, Crown, ExternalLink, Music2, Pin, Play } from "lucide-react";
import { GoalMeter } from "@/components/goal-meter";
import { HeroVideo } from "@/components/hero-video";
import { platformLabel } from "@/components/media-shared";
import { PolaroidGallery } from "@/components/polaroid-gallery";
import { Card, CardTitle, Container, Pill, formatDate } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { getFeaturedMedia, getPolaroids, getPosts, getProfile, getReleases, getSocials } from "@/lib/data";

export default async function HomePage() {
  const [featured, polaroids, releases, posts, profile, socials] = await Promise.all([
    getFeaturedMedia(),
    getPolaroids(),
    getReleases(),
    getPosts(),
    getProfile(),
    getSocials(),
  ]);
  const release = releases[0];
  const pinned = posts.filter((p) => p.pinned);

  const heroContent = (
        <Container className="pb-12 sm:pb-16">
          {featured ? (
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Pill tone="primary">today&apos;s featured clip</Pill>
              </div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                {featured.category} · {formatDate(featured.date)}
              </p>
              <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">{featured.title}</h1>
              {featured.description && <p className="mt-3 text-muted sm:text-lg">{featured.description}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {featured.tags.map((t) => (
                  <Pill key={t}>#{t}</Pill>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={featured.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-fg shadow-card transition hover:brightness-110"
                >
                  <Play className="size-4 fill-current" /> Watch on {platformLabel[featured.platform]}
                </a>
                <BrowseButton />
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">
              <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">{siteConfig.name}</h1>
              <p className="mt-3 text-lg text-muted">{siteConfig.tagline}</p>
              <div className="mt-6">
                <BrowseButton />
              </div>
            </div>
          )}
        </Container>
  );

  return (
    <>
      {/* HERO */}
      {featured?.youtubeId ? (
        <HeroVideo
          youtubeId={featured.youtubeId}
          title={featured.title}
          poster={
            <Image
              src={`https://i.ytimg.com/vi/${featured.youtubeId}/maxresdefault.jpg`}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          }
        >
          {heroContent}
        </HeroVideo>
      ) : (
        <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="bg-gradient kenburns absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
          </div>
          {heroContent}
        </section>
      )}

      {/* ARCHIVE GRID */}
      <Container>
        <div id="archive" className="scroll-mt-20 flex flex-wrap items-end justify-between gap-3 pt-12 pb-6">
          <h2 className="font-display text-3xl sm:text-4xl">
            {siteConfig.fandom.greeting} <span className="text-gradient">welcome to the burrow</span> ♡
          </h2>
          <div className="flex gap-2">
            <Pill>archive status: open</Pill>
            <Pill>♡ for our bunny</Pill>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardTitle icon={<Crown className="size-5" />}>bunny facts</CardTitle>
            {profile.length === 0 && <p className="text-muted">Facts coming soon.</p>}
            <dl className="grid gap-4 sm:grid-cols-2">
              {profile.map((f, i) => (
                <div key={i}>
                  <dt className="text-xs font-semibold tracking-wider text-muted uppercase">{f.label}</dt>
                  <dd className="mt-0.5 font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                {socials.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-sm hover:text-primary"
                    >
                      {s.handle} <ExternalLink className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle icon={<Camera className="size-5" />} aside={<Pill>HD downloadable</Pill>}>
              polaroid snaps
            </CardTitle>
            {polaroids.length === 0 && <p className="text-muted">The first polaroids are on their way.</p>}
            <PolaroidGallery photos={polaroids.slice(0, 2)} tilts={[-2, 2]} className="grid grid-cols-2 gap-4 px-1" />
            <SeeAll href="/photos">see all polaroids</SeeAll>
          </Card>

          <Card>
            <CardTitle
              icon={<Music2 className="size-5" />}
              aside={release?.goal && <Pill>goal: {release.goal.target.toLocaleString("en-US")}</Pill>}
            >
              music station
            </CardTitle>
            {release ? (
              <>
                <div className="rounded-2xl border border-border bg-surface-2 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="font-semibold">{release.title}</p>
                    <Pill tone="primary">now tracking</Pill>
                  </div>
                  {release.goal && <GoalMeter {...release.goal} />}
                </div>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {release.links.map((l) => (
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
              </>
            ) : (
              <p className="text-muted">No releases yet.</p>
            )}
            <SeeAll href="/music">streaming links</SeeAll>
          </Card>

          <Card>
            <CardTitle icon={<Pin className="size-5" />} aside={<Pill>{pinned.length} pinned</Pill>}>
              fan notes
            </CardTitle>
            {pinned.length ? (
              <ul className="space-y-3">
                {pinned.map((p) => (
                  <li key={p.id}>
                    {(() => {
                      const inner = (
                        <>
                          <p className="font-semibold">
                            {p.title} {p.link && <ExternalLink className="inline size-3.5" />}
                          </p>
                          <p className="mt-1 line-clamp-3 text-sm text-muted">{p.body}</p>
                          <p className="mt-2 text-xs text-muted">
                            {p.author} · {formatDate(p.date)}
                          </p>
                        </>
                      );
                      return p.link ? (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-soft p-4 transition hover:ring-2 hover:ring-primary">
                          {inner}
                        </a>
                      ) : (
                        <div className="rounded-2xl bg-soft p-4">{inner}</div>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No pinned notes yet. Check the bulletin board for the latest.</p>
            )}
            <SeeAll href="/updates">view full bulletin board</SeeAll>
          </Card>
        </div>
      </Container>
    </>
  );
}

function BrowseButton() {
  return (
    <a
      href="#archive"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-5 py-3 font-semibold backdrop-blur transition hover:bg-surface"
    >
      Browse the archive <ArrowDown className="size-4" />
    </a>
  );
}

function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
    >
      {children} <ArrowRight className="size-4" />
    </Link>
  );
}
