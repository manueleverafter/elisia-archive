export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-2xl bg-surface-2" />
      <div className="h-24 rounded-3xl bg-surface-2" />
      <div className="h-24 rounded-3xl bg-surface-2" />
    </div>
  );
}
