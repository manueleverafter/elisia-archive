import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Notice } from "@/components/admin/auth-card";
import { RestoreButton } from "@/components/admin/item-actions";
import { AdminTitle, Panel } from "@/components/admin/page-title";
import { ResourceForm } from "@/components/admin/resource-form";
import { isResourceKey, resources } from "@/lib/resources";
import { getItem } from "@/lib/server/content";
import { requirePageUser } from "@/lib/server/session";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? `Edit ${resources[resource].singular}` : "Not found" };
}

export default async function EditItem({ params }: PageProps<"/admin/[resource]/[id]">) {
  await requirePageUser();
  const { resource, id } = await params;
  if (!isResourceKey(resource)) notFound();
  const def = resources[resource];
  const item = await getItem(resource, id).catch(() => null);
  if (!item) notFound();

  return (
    <>
      <Link href={`/admin/${resource}`} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary">
        <ArrowLeft className="size-4" /> {def.label}
      </Link>
      <AdminTitle title={`edit ${def.singular}`} />
      {item.deletedAt ? (
        <Notice>
          This {def.singular} is in the trash. <RestoreButton resource={resource} id={id} />
        </Notice>
      ) : null}
      <Panel className="max-w-2xl">
        <ResourceForm def={def} id={id} initial={item} />
      </Panel>
    </>
  );
}
