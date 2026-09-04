import { MARK, SURFACE, TEXT_TONE, clamp01, gaugeAngle, gaugeArcLength, gaugeArcPath, polar, zoneFor } from './chartUtils.js';

// ── Triage urgency meter ────────────────────────────────────────────────────
// A single ratio against a scale, so the form is a meter, not a chart. The
// needle is the value mark; the three coloured bands behind it are the scale.
//
// Hue cannot carry the Low/Average/High distinction on its own here (gold and
// verdant collapse under protanopia — see chartUtils.js), so each band is also
// *named* on the dial, the active band is named again in the readout beneath
// it, and the legend repeats the numeric range. Colour is the last channel in
// that stack, never the only one.

const VB = { w: 344, h: 200 };
const CX = 172;
const CY = 172;
const R_INNER = 96;
const R_OUTER = 118; // 22px band — inside the mark-thickness cap
const R_TRACK = 131; // the value bar rides just outside the bands
const R_TICK = 138;
// Band names sit OUTSIDE the dial. Inside the ring they share the bowl with the
// needle, which sweeps to a band's own mid-angle at exactly the value that band
// covers — at 83% the needle ran straight through the word "HIGH". Out here
// nothing can reach them: the needle stops at R_NEEDLE.
const R_WORD = 150;
const R_NEEDLE = 112;
const GAP_DEG = 1.4; // ≈2px of surface between touching bands at this radius

export default function RiskGauge({ value, zones, label, caption, scaleTicks = [] }) {
  const t = clamp01(value / 100);
  const zone = zoneFor(value, zones);
  const trackLength = gaugeArcLength(R_TRACK, 0, t);

  return (
    <figure className="m-0 w-full">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full"
        role="img"
        aria-label={`${label}: ${value} out of 100, in the ${zone.name} band`}
      >
        {/* The scale — three named bands, held apart by surface-coloured gaps */}
        {zones.map((z) => {
          const t0 = z.from / 100;
          const t1 = z.to / 100;
          const a0 = gaugeAngle(t0) - (z.from === 0 ? 0 : GAP_DEG);
          const a1 = gaugeAngle(t1) + (z.to === 100 ? 0 : GAP_DEG);
          const word = polar(CX, CY, R_WORD, gaugeAngle((t0 + t1) / 2));
          const isActive = z.name === zone.name;
          return (
            <g key={z.name}>
              <path d={band(a0, a1)} fill={MARK[z.tone]} fillOpacity={isActive ? 1 : 0.26}>
                <title>{`${z.name}: ${z.from}–${z.to === 100 ? 100 : z.to - 1}`}</title>
              </path>
              {/* Anchored outward, not centred: a centred word puts half its
                  width back toward the dial and grazes the track. */}
              <text
                x={word.x}
                y={word.y + 4}
                textAnchor={word.x > CX + 8 ? 'start' : word.x < CX - 8 ? 'end' : 'middle'}
                fill="currentColor"
                className={`${TEXT_TONE[z.tone]} text-[11px] uppercase tracking-[0.14em] ${
                  isActive ? 'font-bold' : 'font-semibold'
                }`}
              >
                {z.name}
              </text>
            </g>
          );
        })}

        {/* Marks at the band thresholds. They carry no numbers: the legend
            below states every band's range exactly, and a figure out here would
            be one more thing the needle could cross. */}
        {scaleTicks.map((tick) => {
          const a = gaugeAngle(tick / 100);
          const from = polar(CX, CY, R_TICK, a);
          const to = polar(CX, CY, R_TICK + 8, a);
          return (
            <line
              key={tick}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--color-ink)"
              strokeOpacity="0.22"
            />
          );
        })}

{/* The value bar. The unfilled track stays neutral: painting the whole
            sweep in the active band's hue would wash the Low and Average
            thirds in crimson and misstate the scale. */}
        <path
          d={gaugeArcPath(CX, CY, R_TRACK, 0, 1)}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity="0.08"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Neutral ink, not the active band's hue: a crimson arc sweeping 83%
            of the dial would paint over the Low and Average thirds and read as
            though crimson covered the whole scale. The bands own the colour;
            this arc only says how far along the needle has travelled. */}
        <path
          className="arc-draw"
          style={{ '--arc-length': `${trackLength}` }}
          d={gaugeArcPath(CX, CY, R_TRACK, 0, t)}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity="0.7"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${trackLength} ${trackLength}`}
        />

        {/* The needle — drawn at 12 o'clock, rotated onto the value, so the CSS
            sweep can start from a plain rotate(-90deg) = zero. */}
        <g
          className="needle-sweep"
          style={{
            '--pivot-x': `${CX}px`,
            '--pivot-y': `${CY}px`,
            transform: `rotate(${((t - 0.5) * 180).toFixed(2)}deg)`,
          }}
        >
          <path
            d={`M${CX},${CY - R_NEEDLE} L${CX + 5.5},${CY - 6} L${CX},${CY + 19} L${CX - 5.5},${CY - 6} Z`}
            fill="var(--color-ink)"
          />
          <circle cx={CX} cy={CY} r="10" fill="var(--color-ink)" stroke={SURFACE} strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r="3.5" fill={SURFACE} />
        </g>

        {/* Hero figure, in the ground the semicircle leaves open */}
        <text
          x={CX}
          y={CY - 18}
          textAnchor="middle"
          fill="currentColor"
          className={`${TEXT_TONE[zone.tone]} text-[40px] font-bold`}
        >
          {value}
          <tspan dy="-3" className="text-[20px] font-semibold">
            %
          </tspan>
        </text>
      </svg>

      <figcaption>
        <p className="text-center text-sm font-bold uppercase tracking-[0.16em] text-ink">
          <span className={TEXT_TONE[zone.tone]}>{zone.name} urgency</span> · {label}
        </p>
        {caption && <p className="mx-auto mt-2 max-w-sm text-center text-xs leading-relaxed text-slate">{caption}</p>}

        {/* The band ranges in words and numbers — so the dial never rests on a
            reader telling gold from green. */}
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {zones.map((z) => {
            const isActive = z.name === zone.name;
            return (
              <li
                key={z.name}
                className={`flex items-center gap-1.5 text-[0.7rem] ${
                  isActive ? `font-bold ${TEXT_TONE[z.tone]}` : 'font-medium text-slate/70'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 flex-none rounded-sm"
                  style={{ background: MARK[z.tone], opacity: isActive ? 1 : 0.32 }}
                  aria-hidden="true"
                />
                <span className="uppercase tracking-[0.1em]">{z.name}</span>
                <span className="tabular-nums opacity-70">
                  {z.from}–{z.to === 100 ? 100 : z.to - 1}
                </span>
                {isActive && <span className="not-sr-only" aria-hidden="true">◀</span>}
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}

function band(a0, a1) {
  const o0 = polar(CX, CY, R_OUTER, a0);
  const o1 = polar(CX, CY, R_OUTER, a1);
  const i1 = polar(CX, CY, R_INNER, a1);
  const i0 = polar(CX, CY, R_INNER, a0);
  return [
    `M${o0.x.toFixed(2)},${o0.y.toFixed(2)}`,
    `A${R_OUTER},${R_OUTER} 0 0 1 ${o1.x.toFixed(2)},${o1.y.toFixed(2)}`,
    `L${i1.x.toFixed(2)},${i1.y.toFixed(2)}`,
    `A${R_INNER},${R_INNER} 0 0 0 ${i0.x.toFixed(2)},${i0.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}
