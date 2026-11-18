import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Search } from "lucide-react";
import { Notice } from "@/components/admin/auth-card";
import { TrashButton } from "@/components/admin/item-actions";
import { AdminTitle } from "@/components/admin/page-title";
import { isResourceKey, resources } from "@/lib/resources";
import { listItems, type ImageValue } from "@/lib/server/content";
import { requirePageUser } from "@/lib/server/session";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">) {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? resources[resource].label : "Not found" };
}

export default async function ResourceList({ params, searchParams }: PageProps<"/admin/[resource]">) {
  await requirePageUser();
  const { resource } = await params;
  if (!isResourceKey(resource)) notFound();
  const def = resources[resource];
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const items = await listItems(resource, { q });

  return (
    <>
      <AdminTitle
        title={def.label.toLowerCase()}
        intro={`${items.length} ${items.length === 1 ? def.singular : def.singular + "s"}${q ? ` matching “${q}”` : ""}`}
        actions={
          <Link
            href={`/admin/${resource}/new`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 font-semibold text-primary-fg"
          >
            <Plus className="size-4" /> Add {def.singular}
          </Link>
        }
      />
      {sp.saved && <Notice tone="ok">Saved! It&apos;s live on the site now.</Notice>}

      <form className="mb-4" role="search">
        <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 focus-within:border-primary">
          <Search className="size-4 text-muted" />
          <span className="sr-only">Search {def.label}</span>
          <input name="q" type="search" defaultValue={q} placeholder={`Search ${def.label.toLowerCase()}…`} className="w-full bg-transparent outline-none" />
        </label>
      </form>

      {items.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">
          {q ? "No matches." : `No ${def.singular}s yet. Add the first one!`}
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
          {items.map((it) => {
            const img = (it.image ?? it.cover) as ImageValue | undefined;
            return (
              <li key={it.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                {img?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/${resource}/${it.id}`} className="block truncate font-semibold hover:text-primary">
                    {String(it[def.titleField] ?? "(untitled)")}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
                    {def.dateField && it[def.dateField] ? <span>{String(it[def.dateField])}</span> : null}
                    {it.platform ? <span className="uppercase">{String(it.platform)}</span> : null}
                    {it.featured ? <span className="font-semibold text-primary">★ featured</span> : null}
                    {it.pinned ? <span className="font-semibold text-primary">📌 pinned</span> : null}
                    {it.handle ? <span>{String(it.handle)}</span> : null}
                    {it.outlet ? <span>{String(it.outlet)}</span> : null}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/${resource}/${it.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:bg-surface-2"
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Link>
                  <TrashButton resource={resource} id={it.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
