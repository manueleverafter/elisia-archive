import type { Metadata } from "next";
import { CancelInviteButton, InviteForm, ModRow } from "@/components/admin/mods-ui";
import { AdminTitle, Panel, timeAgo } from "@/components/admin/page-title";
import { db } from "@/lib/server/mongo";
import { requirePageUser } from "@/lib/server/session";
import { pendingInvites, TOKEN_HOURS } from "@/lib/server/tokens";

export const metadata: Metadata = { title: "Mods" };

export default async function ModsPage() {
  const me = await requirePageUser("admin");
  const [users, invites] = await Promise.all([
    db.collection("user").find({}, { projection: { name: 1, email: 1, role: 1 } }).sort({ createdAt: 1 }).toArray(),
    pendingInvites(),
  ]);

  return (
    <>
      <AdminTitle
        title="mods"
        intro="Admins can do everything. Editors can add, edit and delete content, but can't manage mods or delete forever."
      />
      <div className="space-y-6">
        <Panel>
          <h2 className="font-display text-xl">Invite a mod</h2>
          <p className="mb-4 text-sm text-muted">
            Creates a private link (valid {TOKEN_HOURS.invite} hours). Send it to the new mod; they choose their own
            name and password.
          </p>
          <InviteForm />
        </Panel>

        {invites.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-xl">Waiting to join</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
              {invites.map((i) => (
                <li key={String(i._id)} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.email}</p>
                    <p className="text-xs text-muted">
                      {i.role} · invited {timeAgo(i.createdAt.toISOString())}
                    </p>
                  </div>
                  <CancelInviteButton email={i.email} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-2 font-display text-xl">Team ({users.length})</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            {users.map((u) => (
              <ModRow
                key={String(u._id)}
                isSelf={String(u._id) === me.id}
                user={{ id: String(u._id), name: String(u.name), email: String(u.email), role: u.role === "admin" ? "admin" : "editor" }}
              />
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
