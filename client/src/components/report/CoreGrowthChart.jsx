import { MARK, SURFACE } from './chartUtils.js';

// Modelled infarct-core growth: the Stroke-AI pathway against a conventional
// referral, with the gap between them shaded as the tissue preserved. Two
// series, so the legend is always present; the line ends are direct-labelled
// and the grid stays a recessive solid hairline behind them.

const W = 600;
const H = 268;
const PAD = { top: 18, right: 62, bottom: 38, left: 46 };

export default function CoreGrowthChart({ series, xMax, yMax, xLabel, yLabel, gapNote }) {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const sx = (x) => PAD.left + (x / xMax) * plotW;
  const sy = (y) => PAD.top + plotH - (y / yMax) * plotH;

  const toPath = (points) => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x)},${sy(p.y)}`).join(' ');

  const [fast, slow] = series;
  const gapPath = `${toPath(slow.points)} L${sx(fast.points.at(-1).x)},${sy(fast.points.at(-1).y)} ${fast.points
    .slice()
    .reverse()
    .map((p) => `L${sx(p.x)},${sy(p.y)}`)
    .join(' ')} Z`;

  const yTicks = [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax];
  const xTicks = [0, xMax / 4, xMax / 2, (xMax * 3) / 4, xMax];

  return (
    <figure className="m-0 w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Modelled infarct core growth over time">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} y1={sy(t)} x2={W - PAD.right} y2={sy(t)} stroke="var(--color-ink)" strokeOpacity="0.08" />
            <text x={PAD.left - 8} y={sy(t) + 4} textAnchor="end" className="fill-slate text-[0.62rem] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={sx(t)} y={H - 16} textAnchor="middle" className="fill-slate text-[0.62rem] tabular-nums">
            {t}
          </text>
        ))}

        {/* The tissue the fast pathway keeps — a wash, never a saturated block */}
        <path d={gapPath} fill={MARK.verdant} fillOpacity="0.1" />
        {gapNote && (
          <text
            x={sx(xMax * 0.62)}
            y={sy(yMax * 0.46)}
            textAnchor="middle"
            className="fill-verdant text-[0.72rem] font-bold"
          >
            {gapNote}
          </text>
        )}

        {series.map((s) => (
          <path
            key={s.label}
            d={toPath(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeDasharray={s.dashed ? '6 5' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* End markers carry a surface ring so they stay legible where they
            cross the shading, and the endpoint value is labelled directly. */}
        {series.map((s) => {
          const last = s.points.at(-1);
          return (
            <g key={s.label}>
              <circle cx={sx(last.x)} cy={sy(last.y)} r="4.5" fill={s.color} stroke={SURFACE} strokeWidth="2">
                <title>{`${s.label}: ${last.y} mL at ${last.x} min`}</title>
              </circle>
              <text x={sx(last.x) + 11} y={sy(last.y) + 4} className="fill-ink text-[0.72rem] font-bold tabular-nums">
                {last.y} mL
              </text>
            </g>
          );
        })}

        <text
          x={PAD.left + plotW / 2}
          y={H - 2}
          textAnchor="middle"
          className="fill-slate text-[0.6rem] font-bold uppercase tracking-[0.14em]"
        >
          {xLabel}
        </text>
        <text
          x={-(PAD.top + plotH / 2)}
          y="12"
          transform="rotate(-90)"
          textAnchor="middle"
          className="fill-slate text-[0.6rem] font-bold uppercase tracking-[0.14em]"
        >
          {yLabel}
        </text>
      </svg>

      <figcaption>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {series.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-xs font-semibold text-slate">
              <svg viewBox="0 0 24 8" className="h-2 w-6 flex-none" aria-hidden="true">
                <line
                  x1="1"
                  y1="4"
                  x2="23"
                  y2="4"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                />
              </svg>
              {s.label}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
