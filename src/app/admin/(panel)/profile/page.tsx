import type { Metadata } from "next";
import { AdminTitle, Panel } from "@/components/admin/page-title";
import { ProfileForm, ThemeForm } from "@/components/admin/settings-forms";
import { readSettings } from "@/lib/server/content";
import { requirePageUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Profile & theme" };

export default async function ProfilePage() {
  const user = await requirePageUser();
  const settings = await readSettings();
  return (
    <>
      <AdminTitle title="profile & theme" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <h2 className="font-display text-xl">Profile facts</h2>
          <p className="mb-4 text-sm text-muted">Shown in the “bunny facts” card on the home page, in this order.</p>
          <ProfileForm initial={settings.profile} />
        </Panel>
        {user.role === "admin" && (
          <Panel>
            <h2 className="font-display text-xl">Site theme</h2>
            <p className="mb-4 text-sm text-muted">Visitors can still pick their own theme. This sets what they see first.</p>
            <ThemeForm current={settings.defaultTheme} />
          </Panel>
        )}
      </div>
    </>
  );
}
