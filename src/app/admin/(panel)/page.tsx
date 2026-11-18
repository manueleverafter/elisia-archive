import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ActivityList } from "@/components/admin/activity-list";
import { AdminTitle, Panel } from "@/components/admin/page-title";
import { resourceList } from "@/lib/resources";
import { col, recentActivity } from "@/lib/server/content";
import { requirePageUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requirePageUser();
  const [counts, activity] = await Promise.all([
    Promise.all(resourceList.map((r) => col(r.key).countDocuments({ deletedAt: null }))),
    recentActivity(10),
  ]);

  return (
    <>
      <AdminTitle title={`hi, ${user.name}!`} intro="What are we adding to the archive today?" />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {resourceList.map((r, i) => (
          <li key={r.key}>
            <div className="flex h-full flex-col rounded-3xl border border-border bg-surface p-4 shadow-card">
              <Link href={`/admin/${r.key}`} className="flex-1 hover:text-primary">
                <span className="block text-3xl font-semibold">{counts[i]}</span>
                <span className="text-sm text-muted">{r.label}</span>
              </Link>
              <Link
                href={`/admin/${r.key}/new`}
                className="mt-3 inline-flex items-center gap-1 self-start rounded-full bg-soft px-3 py-1.5 text-sm font-semibold"
              >
                <Plus className="size-4" /> Add {r.singular}
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <Panel className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl">Recent activity</h2>
          <Link href="/admin/activity" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <ActivityList items={activity} />
      </Panel>
    </>
  );
}
