import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "./ui";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-3">
        <div className="space-y-2 text-sm text-muted">
          <p className="font-hand text-2xl text-text">{siteConfig.name} ♡</p>
          <p>
            Unofficial fan archive. Not affiliated with {siteConfig.idol.name}, her group, or her agency.
          </p>
          <p>
            Videos are embedded from their official sources and every photo stays credited to the fansite
            or photographer who took it.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">Explore</p>
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">Archive</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/credits" className="hover:text-primary">
                Credits & takedown
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-primary">
                Privacy
              </Link>
            </li>
            <li className="text-muted">
              made with ♡ by the {siteConfig.fandom.name}
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-border">
        <Container className="flex justify-between py-4 text-xs text-muted">
          <span>© 2026 {siteConfig.name}</span>
          <span>unofficial fan archive</span>
        </Container>
      </div>
    </footer>
  );
}
