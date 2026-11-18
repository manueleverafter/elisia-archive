import type { Metadata } from "next";
import { Card, Container, PageHeader } from "@/components/ui";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Credits & takedown" };

export default function CreditsPage() {
  return (
    <Container>
      <div className="mx-auto max-w-3xl">
      <PageHeader title="credits & takedown" />
      <Card className="space-y-4 leading-relaxed">
        <p>
          {siteConfig.name} is an unofficial, non-commercial fan archive made by the {siteConfig.fandom.name}.
          We are not affiliated with {siteConfig.idol.name}, her group, or her agency.
        </p>
        <p>
          Videos are embedded from their original platforms. Photos are credited to the official account,
          fansite or photographer who took them, and link back to the source whenever possible.
        </p>
        <h2 className="pt-2 font-display text-2xl">Takedown requests</h2>
        <p>
          If you own something posted here and want it credited differently or removed, contact the
          fanbase admins through our socials and we will act on it quickly.
        </p>
      </Card>
      </div>
    </Container>
  );
}
