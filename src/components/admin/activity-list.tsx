import { timeAgo } from "./page-title";

export function ActivityList({ items }: { items: Record<string, unknown>[] }) {
  if (!items.length) return <p className="text-muted">Nothing yet.</p>;
  return (
    <ul className="divide-y divide-border">
      {items.map((a) => (
        <li key={String(a.id)} className="flex flex-wrap items-baseline gap-x-2 py-2.5 text-sm">
          <span className="font-semibold">{String(a.userName)}</span>
          <span className="text-muted">{String(a.action)}</span>
          {a.title ? <span className="font-medium">“{String(a.title)}”</span> : null}
          {a.resource ? <span className="text-muted">in {String(a.resource)}</span> : null}
          <span className="ml-auto text-xs text-muted">{timeAgo(String(a.at))}</span>
        </li>
      ))}
    </ul>
  );
}
