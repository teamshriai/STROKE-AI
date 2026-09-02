// Infarct core vs penumbra as a donut. Core is crimson (irreversible),
// penumbra gold (salvageable) — the same semantics used across the report.
const RADIUS = 68;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function LesionDonut({ segments, totalLabel, totalValue }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // Precompute each arc's dash length and start offset so the render stays a
  // pure map over derived data.
  const arcs = segments.reduce((acc, seg) => {
    const dash = (seg.value / total) * CIRCUMFERENCE;
    const offset = acc.length === 0 ? 0 : acc[acc.length - 1].offset + acc[acc.length - 1].dash;
    return [...acc, { ...seg, dash, offset }];
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <svg viewBox="0 0 180 180" className="h-44 w-44 flex-none -rotate-90" role="img" aria-label={`${totalValue} total lesion volume`}>
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth={STROKE}
            strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
            strokeDashoffset={-arc.offset}
          />
        ))}
        <text
          x="90"
          y="84"
          textAnchor="middle"
          className="rotate-90 fill-ink font-serif text-[1.4rem] font-medium"
          style={{ transformOrigin: '90px 90px' }}
        >
          {totalValue}
        </text>
        <text
          x="90"
          y="102"
          textAnchor="middle"
          className="rotate-90 fill-slate text-[0.55rem] uppercase tracking-[0.16em]"
          style={{ transformOrigin: '90px 90px' }}
        >
          {totalLabel}
        </text>
      </svg>

      <ul className="flex w-full flex-col gap-3">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-baseline gap-3">
            <span className="mt-1 h-2.5 w-2.5 flex-none rounded-sm" style={{ background: seg.color }} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{seg.label}</p>
              <p className="text-xs text-slate/70">{seg.note}</p>
            </div>
            <div className="flex-none text-right">
              <p className="font-serif text-sm tabular-nums text-ink">{seg.value} mL</p>
              <p className="text-xs tabular-nums text-slate/70">{((seg.value / total) * 100).toFixed(1)}%</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
