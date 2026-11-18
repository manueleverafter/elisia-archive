const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function GoalMeter({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {compact.format(current)} / {compact.format(target)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={current}
        className="h-3 overflow-hidden rounded-full bg-surface-2"
      >
        <div className="bg-gradient h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {pct.toFixed(1)}% · {compact.format(Math.max(0, target - current))} to go
      </p>
    </div>
  );
}
