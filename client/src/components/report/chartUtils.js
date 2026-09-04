// ── Shared chart geometry & the report's colour contract ────────────────────
//
// COLOUR CONTRACT (measured, not eyeballed — see the notes in index.css):
//
//   MARK vs TEXT.  A chart mark only has to clear 3:1 against the paper
//   surface; small text has to clear 4.5:1. `--color-gold` clears the first
//   (4.04:1) but not the second, so marks read from MARK and text reads from
//   TEXT_TONE, which swaps gold for its darker `gold-ink` step. Never colour
//   label text with a MARK value.
//
//   STATUS IS SHAPE + TEXT, NEVER HUE ALONE.  These four are a *status* scale
//   (verdant = good, gold = caution, crimson = critical, navy = informational),
//   and gold↔verdant collapse under protanopia (OKLab ΔE 4.8, well under the
//   ΔE 8 target). Hue therefore cannot carry the distinction on its own: every
//   status mark in this report ships beside a StatusIcon glyph and a word.
//   That pairing is load-bearing accessibility, not decoration — don't strip it.

export const MARK = {
  crimson: 'var(--color-crimson)',
  navy: 'var(--color-navy)',
  gold: 'var(--color-gold)',
  verdant: 'var(--color-verdant)',
  slate: 'var(--color-slate)',
  ink: 'var(--color-ink)',
};

export const TEXT_TONE = {
  crimson: 'text-crimson',
  navy: 'text-navy',
  gold: 'text-gold-ink',
  verdant: 'text-verdant',
  slate: 'text-slate',
  ink: 'text-ink',
};

export const FILL_TONE = {
  crimson: 'fill-crimson',
  navy: 'fill-navy',
  gold: 'fill-gold',
  verdant: 'fill-verdant',
  slate: 'fill-slate',
  ink: 'fill-ink',
};

// The paper surface. Gaps between touching fills and rings around overlapping
// markers are drawn in *this*, never as a stroke around the mark.
export const SURFACE = 'var(--color-paper)';

// ── Gauge / donut polar geometry ───────────────────────────────────────────
// t is a normalised position in [0, 1]. For the semicircular gauge t = 0 sits
// at 9 o'clock and t = 1 at 3 o'clock, sweeping over the top.

export const gaugeAngle = (t) => 180 - t * 180;

export function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
}

/** Stroked arc across a semicircular sweep — the path a value bar rides.
 *
 *  The large-arc flag is always 0. The whole dial is 180deg, so a sweep from t0
 *  to t1 spans (t1 - t0) * 180deg and can never exceed a half turn — setting the
 *  flag from the *fraction* (as though the dial were a full circle) makes SVG
 *  draw the complement instead, which is a stray arc looping the wrong way
 *  round for every value above 50%. */
export function gaugeArcPath(cx, cy, r, t0, t1) {
  const from = polar(cx, cy, r, gaugeAngle(t0));
  const to = polar(cx, cy, r, gaugeAngle(t1));
  return `M${from.x.toFixed(2)},${from.y.toFixed(2)} A${r},${r} 0 0 1 ${to.x.toFixed(2)},${to.y.toFixed(2)}`;
}

/** Arc length in user units, so a dash-based draw-in needs no DOM measurement. */
export const gaugeArcLength = (r, t0, t1) => Math.PI * r * (t1 - t0);

/** Filled annular sector, for a donut slice or a gauge zone band. */
export function annularSector(cx, cy, rOuter, rInner, a0, a1) {
  const o0 = polar(cx, cy, rOuter, a0);
  const o1 = polar(cx, cy, rOuter, a1);
  const i1 = polar(cx, cy, rInner, a1);
  const i0 = polar(cx, cy, rInner, a0);
  // Angles decrease as the sweep advances, so a span over 180° is the large arc.
  const largeArc = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return [
    `M${o0.x.toFixed(2)},${o0.y.toFixed(2)}`,
    `A${rOuter},${rOuter} 0 ${largeArc} 1 ${o1.x.toFixed(2)},${o1.y.toFixed(2)}`,
    `L${i1.x.toFixed(2)},${i1.y.toFixed(2)}`,
    `A${rInner},${rInner} 0 ${largeArc} 0 ${i0.x.toFixed(2)},${i0.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

/** Regular polygon vertices for a radar web, first axis at 12 o'clock. */
export function radarPoints(cx, cy, r, count, offset = 90) {
  return Array.from({ length: count }, (_, i) => polar(cx, cy, r, offset - (360 / count) * i));
}

export const clamp01 = (n) => Math.min(1, Math.max(0, n));

/** Which risk band a 0–100 score lands in. Bounds are inclusive-low. */
export function zoneFor(value, zones) {
  return zones.find((z) => value < z.to) ?? zones[zones.length - 1];
}
