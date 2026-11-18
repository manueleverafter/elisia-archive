import Link from "next/link";
import { Search } from "lucide-react";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { DesktopNav, MobileNav } from "./nav-links";
import { ThemePicker } from "./theme-picker";
import { Container } from "./ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container wide className="flex h-16 items-center gap-3">
        <Link href="/" className="mr-auto leading-tight">
          <span className="block font-hand text-2xl">{siteConfig.name} ♡</span>
          <span className="hidden text-xs text-muted sm:block">{siteConfig.tagline}</span>
        </Link>

        <form action="/search" role="search" className="hidden md:block">
          <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 focus-within:border-primary">
            <Search className="size-4 text-muted" />
            <span className="sr-only">Search the archive</span>
            <input
              name="q"
              type="search"
              placeholder="find a clip, date, or photo…"
              className="w-40 bg-transparent text-sm outline-none placeholder:text-muted lg:w-48"
            />
          </label>
        </form>

        <ThemePicker />

        <Suspense fallback={<div className="size-10 xl:hidden" />}>
          <DesktopNav />
          <MobileNav />
        </Suspense>
      </Container>
    </header>
  );
}
