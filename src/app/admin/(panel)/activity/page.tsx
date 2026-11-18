import type { Metadata } from "next";
import { AdminTitle, Panel } from "@/components/admin/page-title";
import { recentActivity } from "@/lib/server/content";
import { requirePageUser } from "@/lib/server/session";
import { ActivityList } from "@/components/admin/activity-list";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  await requirePageUser();
  const items = await recentActivity(200);
  return (
    <>
      <AdminTitle title="activity" intro="Who changed what, newest first." />
      <Panel>
        <ActivityList items={items} />
      </Panel>
    </>
  );
}
