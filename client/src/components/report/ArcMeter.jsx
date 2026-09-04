import { MARK, TEXT_TONE, clamp01, gaugeArcLength, gaugeArcPath } from './chartUtils.js';

// A single ratio against a limit — so a meter, not a chart. The unfilled track
// is the same hue at a low step, which lets the state read across the whole
// arc rather than only where the fill happens to stop.

const VB = { w: 140, h: 86 };
const CX = 70;
const CY = 74;
const R = 54;

export default function ArcMeter({ value, limit, unit, tone = 'navy', label, note, percentLabel = true }) {
  const t = clamp01(value / limit);
  const pct = Math.round(t * 100);
  const length = gaugeArcLength(R, 0, t);

  return (
    <figure className="m-0 flex flex-col items-center">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full max-w-[9rem]"
        role="img"
        aria-label={`${label}: ${value} of ${limit} ${unit ?? ''} (${pct}%)`}
      >
        <path
          d={gaugeArcPath(CX, CY, R, 0, 1)}
          fill="none"
          stroke={MARK[tone]}
          strokeOpacity="0.13"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          className="arc-draw"
          style={{ '--arc-length': `${length}` }}
          d={gaugeArcPath(CX, CY, R, 0, Math.max(t, 0.001))}
          fill="none"
          stroke={MARK[tone]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${length} ${length}`}
        />
        <text
          x={CX}
          y={CY - 8}
          textAnchor="middle"
          fill="currentColor"
          className={`${TEXT_TONE[tone]} text-[24px] font-bold`}
        >
          {percentLabel ? `${pct}%` : value}
        </text>
      </svg>

      <figcaption className="mt-1 text-center">
        <p className={`text-[0.68rem] font-bold uppercase tracking-[0.12em] ${TEXT_TONE[tone]}`}>{label}</p>
        {note && <p className="mt-1 text-[0.7rem] leading-snug text-slate">{note}</p>}
      </figcaption>
    </figure>
  );
}
