import { MARK, TEXT_TONE, annularSector, polar } from './chartUtils.js';
import { StatusIcon } from './ReportPrimitives.jsx';

// Part-to-whole at a glance. Every share is direct-labelled *outside* the ring
// on paper rather than inside the fill: the gold step can't clear the small-text
// contrast floor against either white or ink, and one consistent label position
// beats two. The legend carries the counts, and status slices carry a glyph.

// Leader labels sit 12 units outside the ring and are anchored outward, so
// the box carries a label's width of margin on each side of it.
const VB = { w: 300, h: 216 };
const CX = 136;
const CY = 106;
const R_OUTER = 84;
const R_INNER = 60; // 24px ring
const GAP_DEG = 1.2; // ≈2px of surface at the ring's mid-radius

export default function DonutChart({ segments, centreValue, centreLabel, ariaLabel }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // Cumulative sweep as a fold, so nothing is mutated across a render.
  const slices = segments.reduce((acc, seg) => {
    const from = acc.length === 0 ? 0 : acc[acc.length - 1].to;
    const to = from + seg.value / total;
    return [
      ...acc,
      {
        ...seg,
        to,
        share: seg.value / total,
        a0: 90 - from * 360 - GAP_DEG,
        a1: 90 - to * 360 + GAP_DEG,
        midAngle: 90 - ((from + to) / 2) * 360,
      },
    ];
  }, []);

  return (
    <figure className="m-0 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-2">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full max-w-[19rem] flex-none"
        role="img"
        aria-label={ariaLabel}
      >
        {slices.map((s) => {
          const inner = polar(CX, CY, R_OUTER + 3, s.midAngle);
          const outer = polar(CX, CY, R_OUTER + 12, s.midAngle);
          const anchor = outer.x > CX + 6 ? 'start' : outer.x < CX - 6 ? 'end' : 'middle';
          const dx = anchor === 'start' ? 3 : anchor === 'end' ? -3 : 0;
          return (
            <g key={s.label}>
              <path d={annularSector(CX, CY, R_OUTER, R_INNER, s.a0, s.a1)} fill={MARK[s.tone]}>
                <title>{`${s.label}: ${s.value} (${(s.share * 100).toFixed(1)}%)`}</title>
              </path>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="var(--color-ink)" strokeOpacity="0.25" />
              <text
                x={outer.x + dx}
                y={outer.y + 4}
                textAnchor={anchor}
                fill="currentColor"
                className={`${TEXT_TONE[s.tone]} text-[12px] font-bold tabular-nums`}
              >
                {Math.round(s.share * 100)}%
              </text>
            </g>
          );
        })}

        <text x={CX} y={CY - 2} textAnchor="middle" className="fill-ink text-[24px] font-bold">
          {centreValue}
        </text>
        <text
          x={CX}
          y={CY + 16}
          textAnchor="middle"
          className="fill-slate text-[9px] font-semibold uppercase tracking-[0.14em]"
        >
          {centreLabel}
        </text>
      </svg>

      <figcaption className="w-full min-w-0">
        <ul className="flex w-full flex-col gap-2.5">
          {slices.map((s) => (
            <li key={s.label} className="flex items-baseline gap-2.5">
              <StatusIcon tone={s.tone} className="mt-0.5 h-3.5 w-3.5 flex-none" />
              <div className="min-w-0 flex-1">
                <p className={`text-[0.8rem] font-bold ${TEXT_TONE[s.tone]}`}>{s.label}</p>
                {s.note && <p className="text-xs leading-snug text-slate">{s.note}</p>}
              </div>
              <p className="flex-none text-right text-sm font-bold tabular-nums text-ink">{s.display ?? s.value}</p>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
