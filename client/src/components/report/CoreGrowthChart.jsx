// Modelled infarct-core growth: the Stroke-AI pathway against a conventional
// referral, with the gap between them shaded as the tissue preserved.
const W = 560;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 34, left: 44 };

export default function CoreGrowthChart({ series, xMax, yMax, xLabel, yLabel }) {
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
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Modelled infarct core growth over time">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} y1={sy(t)} x2={W - PAD.right} y2={sy(t)} stroke="var(--color-ink)" strokeOpacity="0.08" />
            <text x={PAD.left - 8} y={sy(t) + 4} textAnchor="end" className="fill-slate text-[0.6rem] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={sx(t)} y={H - 12} textAnchor="middle" className="fill-slate text-[0.6rem] tabular-nums">
            {t}
          </text>
        ))}

        <path d={gapPath} fill="var(--color-verdant)" fillOpacity="0.1" />

        {series.map((s) => (
          <path
            key={s.label}
            d={toPath(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeDasharray={s.dashed ? '6 5' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {series.map((s) => {
          const last = s.points.at(-1);
          return <circle key={s.label} cx={sx(last.x)} cy={sy(last.y)} r="4" fill={s.color} />;
        })}

        <text x={W / 2} y={H - 1} textAnchor="middle" className="fill-slate/70 text-[0.6rem] uppercase tracking-[0.14em]">
          {xLabel}
        </text>
        <text
          x={-(PAD.top + plotH / 2)}
          y="11"
          transform="rotate(-90)"
          textAnchor="middle"
          className="fill-slate/70 text-[0.6rem] uppercase tracking-[0.14em]"
        >
          {yLabel}
        </text>
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {series.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs text-slate">
            <span className="h-0.5 w-6 flex-none rounded-full" style={{ background: s.color }} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
