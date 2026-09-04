import { MARK, SURFACE, TEXT_TONE, polar, radarPoints } from './chartUtils.js';

// Six decision inputs on one shape: where the case sits, against the envelope
// the guidelines ask for. Two series, so a legend is always present, and each
// axis is named and carries its own reading — the fill is the summary, not the
// source of the numbers.

// The box is wider than the web needs: the four diagonal axis labels are
// anchored outward from it, and a tighter box clips their outer ends.
const VB = { w: 404, h: 300 };
const CX = 202;
const CY = 152;
const R = 104;
const R_LABEL = 122;
const RINGS = [0.25, 0.5, 0.75, 1];

export default function ClinicalRadar({ axes, seriesLabel, thresholdLabel }) {
  const n = axes.length;
  const web = radarPoints(CX, CY, R, n);

  const ringPath = (scale) =>
    radarPoints(CX, CY, R * scale, n)
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');

  const seriesPath = (key) =>
    axes
      .map((axis, i) => {
        const p = polar(CX, CY, R * axis[key], 90 - (360 / n) * i);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ');

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full" role="img" aria-label={`${seriesLabel} against ${thresholdLabel}`}>
        {/* Web: solid hairlines, one step off the surface */}
        {RINGS.map((scale) => (
          <polygon key={scale} points={ringPath(scale)} fill="none" stroke="var(--color-ink)" strokeOpacity="0.09" />
        ))}
        {web.map((p, i) => (
          <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="var(--color-ink)" strokeOpacity="0.09" />
        ))}

        {/* Reference envelope */}
        <polygon
          points={seriesPath('threshold')}
          fill="none"
          stroke={MARK.navy}
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />

        {/* The case itself */}
        <polygon points={seriesPath('value')} fill={MARK.crimson} fillOpacity="0.1" />
        <polygon
          points={seriesPath('value')}
          fill="none"
          stroke={MARK.crimson}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {axes.map((axis, i) => {
          const angle = 90 - (360 / n) * i;
          const p = polar(CX, CY, R * axis.value, angle);
          const l = polar(CX, CY, R_LABEL, angle);
          const anchor = l.x > CX + 8 ? 'start' : l.x < CX - 8 ? 'end' : 'middle';
          return (
            <g key={axis.label}>
              <circle cx={p.x} cy={p.y} r="4.5" fill={MARK.crimson} stroke={SURFACE} strokeWidth="2">
                <title>{`${axis.label}: ${axis.display}`}</title>
              </circle>
              <text
                x={l.x}
                y={l.y}
                textAnchor={anchor}
                fill="currentColor"
                className={`${TEXT_TONE[axis.tone ?? 'ink']} text-[10px] font-bold uppercase tracking-[0.08em]`}
              >
                {axis.label}
              </text>
              <text x={l.x} y={l.y + 12} textAnchor={anchor} className="fill-slate text-[10px] font-semibold tabular-nums">
                {axis.display}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-slate">
          <svg viewBox="0 0 24 8" className="h-2 w-6 flex-none" aria-hidden="true">
            <line x1="1" y1="4" x2="23" y2="4" stroke={MARK.crimson} strokeWidth="2" strokeLinecap="round" />
          </svg>
          {seriesLabel}
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold text-slate">
          <svg viewBox="0 0 24 8" className="h-2 w-6 flex-none" aria-hidden="true">
            <line x1="1" y1="4" x2="23" y2="4" stroke={MARK.navy} strokeWidth="2" strokeDasharray="5 4" />
          </svg>
          {thresholdLabel}
        </span>
      </figcaption>
    </figure>
  );
}
