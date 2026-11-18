import type { Metadata } from "next";
import { PolaroidCard } from "@/components/polaroid";
import { Container, EmptyState, PageHeader } from "@/components/ui";
import { getPolaroids } from "@/lib/data";

export const metadata: Metadata = { title: "Polaroids" };

const tilts = [-2, 1.5, -1, 2, -1.5, 1];

export default async function PhotosPage() {
  const photos = await getPolaroids();
  return (
    <Container>
      <PageHeader
        title="polaroids"
        intro="Photos from official accounts and fansites. Every photo stays credited to whoever took it."
        aside={<span className="text-sm text-muted">{photos.length} polaroids</span>}
      />
      {photos.length ? (
        <ul className="grid grid-cols-2 gap-5 sm:gap-7 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p.id}>
              <PolaroidCard photo={p} tilt={tilts[i % tilts.length]} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No polaroids yet.</EmptyState>
      )}
    </Container>
  );
}
