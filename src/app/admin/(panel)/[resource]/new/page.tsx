import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminTitle, Panel } from "@/components/admin/page-title";
import { ResourceForm } from "@/components/admin/resource-form";
import { isResourceKey, resources } from "@/lib/resources";
import { requirePageUser } from "@/lib/server/session";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]/new">) {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? `Add ${resources[resource].singular}` : "Not found" };
}

export default async function NewItem({ params }: PageProps<"/admin/[resource]/new">) {
  await requirePageUser();
  const { resource } = await params;
  if (!isResourceKey(resource)) notFound();
  const def = resources[resource];
  return (
    <>
      <Link href={`/admin/${resource}`} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary">
        <ArrowLeft className="size-4" /> {def.label}
      </Link>
      <AdminTitle title={`add ${def.singular}`} />
      <Panel className="max-w-2xl">
        <ResourceForm def={def} id={null} initial={{}} />
      </Panel>
    </>
  );
}
