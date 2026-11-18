import type { Metadata } from "next";
import { Card, Container, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <Container>
      <div className="mx-auto max-w-3xl">
      <PageHeader title="privacy" />
      <Card className="space-y-4 leading-relaxed">
        <p>Visitors don&apos;t need an account, and we don&apos;t sell or share any data.</p>
        <p>
          Your theme and light/dark choice are saved only in your own browser (local storage) so the site
          remembers them next time.
        </p>
        <p>
          Embedded videos (YouTube, X, TikTok) only load after you press play. Once loaded, those platforms
          apply their own privacy policies.
        </p>
        <p>Mod accounts are used only to manage the archive&apos;s content.</p>
      </Card>
      </div>
    </Container>
  );
}
