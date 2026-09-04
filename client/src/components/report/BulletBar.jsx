import { MARK, TEXT_TONE, clamp01 } from './chartUtils.js';
import { StatusIcon } from './ReportPrimitives.jsx';

// A measured value against its decision threshold — the form for "delta to
// target". The bar is the value, the ink rule is the threshold, and the verdict
// is spelled out in a glyph and a word, so pass/fail never rests on hue alone.
//
// `tone` is the metric's own hue in the report's colour language (a crimson
// core volume stays crimson wherever it appears). `verdictTone` is the *state*
// of this particular reading, which is often the opposite — a core volume well
// under its limit is good news — so the glyph beside the verdict reads from
// that instead, and defaults to `tone` when the two agree.

export default function BulletBar({
  label,
  display,
  value,
  min = 0,
  max,
  threshold,
  thresholdLabel,
  maxLabel,
  tone = 'navy',
  verdictTone,
  verdict,
  note,
}) {
  const frac = clamp01((value - min) / (max - min));
  const thresholdFrac = threshold == null ? null : clamp01((threshold - min) / (max - min));
  // Keep the threshold caption under its own marker, but clear of the end
  // labels it would otherwise sit on top of.
  const captionPct = thresholdFrac == null ? null : Math.min(0.82, Math.max(0.18, thresholdFrac)) * 100;
  const stateTone = verdictTone ?? tone;

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className={`text-[0.72rem] font-bold uppercase tracking-[0.1em] ${TEXT_TONE[tone]}`}>{label}</p>
        <p className="flex flex-none items-center gap-2">
          <span className={`text-sm font-bold tabular-nums ${TEXT_TONE[tone]}`}>{display}</span>
          {verdict && (
            <span
              className={`inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${TEXT_TONE[stateTone]}`}
            >
              <StatusIcon tone={stateTone} className="h-3 w-3" />
              {verdict}
            </span>
          )}
        </p>
      </div>

      <div className="relative mt-2 h-2.5">
        <span
          className="absolute inset-0 rounded-[4px] opacity-[0.13]"
          style={{ background: MARK[tone] }}
          aria-hidden="true"
        />
        <span
          className="bar-grow absolute inset-y-0 left-0"
          style={{
            width: `${(frac * 100).toFixed(2)}%`,
            background: MARK[tone],
            borderRadius: '0 4px 4px 0',
          }}
          aria-hidden="true"
        />
        {thresholdFrac != null && (
          <span
            className="absolute -top-1 -bottom-1 w-[2px] rounded-full bg-ink ring-1 ring-paper"
            style={{ left: `calc(${(thresholdFrac * 100).toFixed(2)}% - 1px)` }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="relative mt-1.5 h-4 text-[0.65rem] text-slate/70">
        <span className="absolute left-0 tabular-nums">{min}</span>
        {thresholdLabel && captionPct != null && (
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap font-semibold text-slate"
            style={{ left: `${captionPct.toFixed(1)}%` }}
          >
            <span aria-hidden="true">▲ </span>
            {thresholdLabel}
          </span>
        )}
        <span className="absolute right-0 tabular-nums">{maxLabel ?? max}</span>
      </div>

      {note && <p className="mt-1.5 text-xs leading-snug text-slate">{note}</p>}
    </div>
  );
}
