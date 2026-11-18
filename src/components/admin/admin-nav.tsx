"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Camera,
  ExternalLink,
  Film,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Music2,
  Newspaper,
  Share2,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { signOutAction } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/media", label: "Media", Icon: Film },
  { href: "/admin/polaroids", label: "Polaroids", Icon: Camera },
  { href: "/admin/releases", label: "Music", Icon: Music2 },
  { href: "/admin/posts", label: "Fanbase", Icon: Megaphone },
  { href: "/admin/press", label: "Press", Icon: Newspaper },
  { href: "/admin/socials", label: "Socials", Icon: Share2 },
  { href: "/admin/profile", label: "Profile & theme", Icon: UserRound },
  { href: "/admin/trash", label: "Trash", Icon: Trash2 },
  { href: "/admin/activity", label: "Activity", Icon: Activity },
  { href: "/admin/mods", label: "Mods", Icon: Users, adminOnly: true },
];

export function AdminNav({ isAdmin, name }: { isAdmin: boolean; name: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const visible = items.filter((i) => !i.adminOnly || isAdmin);

  return (
    <>
      {/* Phone / tablet: scrollable chip row */}
      <nav aria-label="Admin" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:hidden">
        {visible.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium ${
              active(href) ? "border-transparent bg-primary text-primary-fg" : "border-border bg-surface"
            }`}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-60 shrink-0 flex-col rounded-3xl border border-border bg-surface p-4 shadow-card lg:flex">
        <Link href="/admin" className="px-2 font-hand text-2xl">
          archive admin ♡
        </Link>
        <nav aria-label="Admin" className="mt-4 flex-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {visible.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active(href) ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active(href) ? "bg-primary text-primary-fg" : "hover:bg-surface-2"
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-border pt-3 text-sm">
          <p className="px-3 text-muted">
            Signed in as <span className="font-semibold text-text">{name}</span>
          </p>
          <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-surface-2">
            <ExternalLink className="size-4" /> View site
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-surface-2">
              <LogOut className="size-4" /> Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
