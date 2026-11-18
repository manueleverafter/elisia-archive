import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Container, EmptyState, PageHeader } from "@/components/ui";
import { getSocials } from "@/lib/data";
import type { SocialLink } from "@/lib/types";

export const metadata: Metadata = { title: "Socials" };

const groups: { ids: SocialLink["owner"][]; title: string }[] = [
  { ids: ["official"], title: "Elisia" },
  { ids: ["group"], title: "Group" },
  { ids: ["fanbase", "project", "website"], title: "Elysian Fortress (ELFORT)" },
];

export default async function SocialsPage() {
  const socials = await getSocials();
  return (
    <Container>
      <PageHeader title="socials hub" intro="Official accounts and fanbase channels, all in one place." />
      {socials.length === 0 && <EmptyState>No links yet.</EmptyState>}
      <div className="space-y-10">
        {groups.map((g) => {
          const links = socials.filter((s) => g.ids.includes(s.owner));
          if (!links.length) return null;
          return (
            <section key={g.title}>
              <h2 className="mb-4 font-display text-2xl">{g.title}</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {links.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:border-primary"
                    >
                      <span className="bg-gradient grid size-12 shrink-0 place-items-center rounded-2xl font-bold text-primary-fg uppercase">
                        {s.platform.slice(0, 2)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{s.label}</span>
                        <span className="block truncate text-sm text-muted">{s.handle}</span>
                      </span>
                      <ExternalLink className="size-4 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
