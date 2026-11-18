import type { Metadata } from "next";
import { PurgeButton, RestoreButton } from "@/components/admin/item-actions";
import { AdminTitle, timeAgo } from "@/components/admin/page-title";
import { resourceList } from "@/lib/resources";
import { listItems, purgeExpiredTrash, TRASH_DAYS } from "@/lib/server/content";
import { requirePageUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Trash" };

export default async function TrashPage() {
  const user = await requirePageUser();
  await purgeExpiredTrash();
  const groups = await Promise.all(resourceList.map(async (r) => ({ def: r, items: await listItems(r.key, { trashed: true }) })));
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <AdminTitle
        title="trash"
        intro={`Deleted items stay here for ${TRASH_DAYS} days, then disappear for good.${user.role === "admin" ? "" : " Only admins can delete forever."}`}
      />
      {total === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">Trash is empty.</p>
      ) : (
        <div className="space-y-6">
          {groups
            .filter((g) => g.items.length)
            .map(({ def, items }) => (
              <section key={def.key}>
                <h2 className="mb-2 font-display text-xl">{def.label}</h2>
                <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
                  {items.map((it) => (
                    <li key={it.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{String(it[def.titleField] ?? "(untitled)")}</p>
                        <p className="text-xs text-muted">deleted {timeAgo(String(it.deletedAt))}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <RestoreButton resource={def.key} id={it.id} />
                        {user.role === "admin" && <PurgeButton resource={def.key} id={it.id} />}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
