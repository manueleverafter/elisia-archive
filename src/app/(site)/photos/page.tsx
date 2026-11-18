import type { Metadata } from "next";
import { PolaroidGallery } from "@/components/polaroid-gallery";
import { Container, EmptyState, PageHeader } from "@/components/ui";
import { getPolaroids } from "@/lib/data";

export const metadata: Metadata = { title: "Polaroids" };

export default async function PhotosPage() {
  const photos = await getPolaroids();
  return (
    <Container>
      <PageHeader
        title="polaroids"
        intro="Photos from official accounts and fansites, credited to whoever took them. Tap a print to open it."
        aside={<span className="text-sm text-muted">{photos.length} polaroids</span>}
      />
      {photos.length ? (
        <PolaroidGallery photos={photos} className="grid grid-cols-2 gap-5 sm:gap-7 md:grid-cols-3 lg:grid-cols-4" />
      ) : (
        <EmptyState>No polaroids yet.</EmptyState>
      )}
    </Container>
  );
}
