import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemePicker } from "@/components/theme-picker";
import { requirePageUser } from "@/lib/server/session";
import { signOutAction } from "../actions";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">Loading admin…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6 lg:flex-row lg:gap-6 lg:py-6">
      <div className="lg:contents">
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <Link href="/admin" className="font-hand text-2xl">
            archive admin ♡
          </Link>
          <div className="flex items-center gap-2">
            <ThemePicker />
            <Link href="/" target="_blank" aria-label="View site" className="grid size-10 place-items-center rounded-full border border-border bg-surface">
              <ExternalLink className="size-4" />
            </Link>
            <form action={signOutAction}>
              <button type="submit" aria-label="Log out" className="grid size-10 place-items-center rounded-full border border-border bg-surface">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
        <AdminNav isAdmin={user.role === "admin"} name={user.name} />
      </div>
      <main id="main" className="min-w-0 flex-1">
        <div className="mb-2 hidden justify-end lg:flex">
          <ThemePicker />
        </div>
        {children}
      </main>
    </div>
  );
}
