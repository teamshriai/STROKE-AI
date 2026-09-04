// Shared presentational pieces for the Acute Stroke Imaging & Triage Report.
//
// Status colour semantics used throughout: verdant = negative/normal/eligible,
// crimson = positive/critical finding, gold = caution/partial, navy =
// informational.
//
// Two rules hold this file together:
//
//   1. FIELD TITLES ARE BOLD AND COLOURED. Every label that names a field wears
//      FieldLabel (or the same recipe): real 700 weight, its own accent hue,
//      uppercase with open tracking. Body values stay in ink and slate so the
//      titles are the thing that pops.
//   2. A STATUS HUE NEVER TRAVELS ALONE. gold and verdant measure OKLab ΔE 4.8
//      apart under protanopia — indistinguishable — so every status mark ships
//      with a StatusIcon, whose *silhouette* (circle / diamond / triangle /
//      square) is what actually carries the state. Removing the glyphs would
//      leave a colour-only encoding.

import { TEXT_TONE } from './chartUtils.js';

// ── Status glyphs — the shape channel ──────────────────────────────────────

const GLYPHS = {
  verdant: (
    <>
      <circle cx="8" cy="8" r="7" />
      <path d="M4.9 8.3l2.1 2.1 4.2-4.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  gold: (
    <>
      <path d="M8 0.9l7.1 7.1L8 15.1 0.9 8z" />
      <path d="M8 4.3v5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="1" fill="#fff" />
    </>
  ),
  crimson: (
    <>
      <path d="M8 1.1l6.9 12.5H1.1z" />
      <path d="M8 5.7v4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="11.9" r="1" fill="#fff" />
    </>
  ),
  navy: (
    <>
      <rect x="1" y="1" width="14" height="14" rx="3.6" />
      <circle cx="8" cy="4.8" r="1.05" fill="#fff" />
      <path d="M8 7.3v4.2" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  slate: (
    <>
      <rect x="1.9" y="1.9" width="12.2" height="12.2" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.3 8h5.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  ink: (
    <>
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8" cy="8" r="2.6" />
    </>
  ),
};

export function StatusIcon({ tone = 'slate', className = 'h-3.5 w-3.5', title }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`${TEXT_TONE[tone]} flex-none ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      {title && <title>{title}</title>}
      {GLYPHS[tone] ?? GLYPHS.slate}
    </svg>
  );
}

// ── Field titles ───────────────────────────────────────────────────────────

const LABEL_SIZES = {
  xs: 'text-[0.63rem] tracking-[0.16em]',
  sm: 'text-[0.7rem] tracking-[0.13em]',
  md: 'text-[0.8rem] tracking-[0.13em]',
  lg: 'text-[0.9rem] tracking-[0.1em]',
};

export function FieldLabel({ children, tone = 'navy', size = 'sm', as: Tag = 'p', className = '' }) {
  return (
    <Tag className={`font-bold uppercase ${LABEL_SIZES[size]} ${TEXT_TONE[tone]} ${className}`}>{children}</Tag>
  );
}

// ── Pills ──────────────────────────────────────────────────────────────────

const PILL_TONES = {
  verdant: 'bg-verdant/[0.09] text-verdant ring-verdant/25',
  crimson: 'bg-crimson/[0.06] text-crimson ring-crimson/25',
  gold: 'bg-gold/[0.07] text-gold-ink ring-gold/30',
  navy: 'bg-navy/[0.06] text-navy ring-navy/25',
  slate: 'bg-ink/[0.04] text-slate ring-ink/10',
};

export function StatusPill({ children, tone = 'slate', icon = true, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] ring-1 ring-inset ${PILL_TONES[tone]} ${className}`}
    >
      {icon && <StatusIcon tone={tone} className="h-3 w-3" />}
      {children}
    </span>
  );
}

// ── Panels ─────────────────────────────────────────────────────────────────

const ACCENT_CLASSES = {
  crimson: { bar: 'bg-crimson', title: 'text-crimson', header: 'bg-crimson/[0.05]' },
  navy: { bar: 'bg-navy', title: 'text-navy', header: 'bg-navy/[0.05]' },
  gold: { bar: 'bg-gold', title: 'text-gold-ink', header: 'bg-gold/[0.06]' },
  verdant: { bar: 'bg-verdant', title: 'text-verdant', header: 'bg-verdant/[0.05]' },
};

export function Panel({ title, subtitle, children, accent, meta, className = '' }) {
  const tone = ACCENT_CLASSES[accent];
  return (
    <section className={`overflow-hidden rounded-xl border border-ink/10 bg-white/60 ${className}`}>
      {title && (
        <header className={`flex items-stretch border-b border-ink/10 ${tone ? tone.header : ''}`}>
          {tone && <span className={`w-1 flex-none ${tone.bar}`} aria-hidden="true" />}
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5">
            <div className="min-w-0">
              <h2
                className={`text-[0.84rem] font-bold uppercase tracking-[0.14em] ${tone ? tone.title : 'text-ink'}`}
              >
                {title}
              </h2>
              {subtitle && <p className="mt-1 text-xs text-slate">{subtitle}</p>}
            </div>
            {meta && <div className="flex flex-none flex-wrap items-center gap-2">{meta}</div>}
          </div>
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

// ── Stat tiles ─────────────────────────────────────────────────────────────

const TILE_TONES = {
  crimson: 'border-crimson/25 bg-crimson/[0.06]',
  navy: 'border-navy/25 bg-navy/[0.06]',
  gold: 'border-gold/30 bg-gold/[0.07]',
  verdant: 'border-verdant/25 bg-verdant/[0.06]',
};

const TILE_BAR = {
  crimson: 'bg-crimson',
  navy: 'bg-navy',
  gold: 'bg-gold',
  verdant: 'bg-verdant',
};

export function StatTile({ label, value, unit, note, tone = 'navy', meter }) {
  return (
    <div className={`flex flex-col rounded-xl border px-4 py-3.5 ${TILE_TONES[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <FieldLabel tone={tone} size="xs" className="min-w-0">
          {label}
        </FieldLabel>
        <StatusIcon tone={tone} className="mt-px h-3 w-3" />
      </div>

      {/* Hero-adjacent figures take proportional digits; tabular-nums is for
          columns that have to line up, not for a lone display number. */}
      <p className={`mt-1.5 text-[1.55rem] font-bold leading-none ${TEXT_TONE[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-[0.78rem] font-semibold opacity-75">{unit}</span>}
      </p>

      {meter && (
        <span className="relative mt-2.5 block h-1.5" aria-hidden="true">
          <span className={`absolute inset-0 rounded-[3px] opacity-[0.16] ${TILE_BAR[tone]}`} />
          <span
            className={`bar-grow absolute inset-y-0 left-0 ${TILE_BAR[tone]}`}
            style={{
              width: `${Math.min(100, (meter.value / meter.max) * 100).toFixed(1)}%`,
              borderRadius: '0 3px 3px 0',
            }}
          />
          {meter.threshold != null && (
            <span
              className="absolute -top-0.5 -bottom-0.5 w-[2px] rounded-full bg-ink ring-1 ring-paper"
              style={{ left: `calc(${((meter.threshold / meter.max) * 100).toFixed(1)}% - 1px)` }}
            />
          )}
        </span>
      )}

      {note && <p className="mt-1.5 text-[0.7rem] font-medium leading-snug text-slate">{note}</p>}
      {meter?.scaleNote && <p className="mt-0.5 text-[0.63rem] tabular-nums text-slate/70">{meter.scaleNote}</p>}
    </div>
  );
}

// ── Links ──────────────────────────────────────────────────────────────────

export function LogoLink({ href, src, alt, className }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={alt}
      className="inline-flex rounded-lg transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
    >
      <img src={src} alt={alt} className={className} />
    </a>
  );
}

// ── Lists & tables ─────────────────────────────────────────────────────────

export function DataList({ rows, tone = 'navy' }) {
  return (
    <dl className="divide-y divide-ink/[0.07]">
      {rows.map(({ label, value, tone: rowTone }) => (
        <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className={`flex-none text-[0.68rem] font-bold uppercase tracking-[0.12em] ${TEXT_TONE[rowTone ?? tone]}`}>
            {label}
          </dt>
          <dd className="text-right text-sm font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Model confidence as a length, not a bare decimal. One hue — the bar's length
 *  is the value, so colouring it by that value would encode nothing new. */
export function ConfidenceMeter({ value, display }) {
  return (
    <span className="flex items-center gap-2">
      <span className="relative block h-2 w-14 flex-none" aria-hidden="true">
        <span className="absolute inset-0 rounded-[3px] bg-navy/[0.13]" />
        <span
          className="bar-grow absolute inset-y-0 left-0 bg-navy"
          style={{ width: `${(value * 100).toFixed(1)}%`, borderRadius: '0 3px 3px 0' }}
        />
      </span>
      <span className="whitespace-nowrap text-[0.78rem] font-bold tabular-nums text-ink">
        {display ?? value.toFixed(2)}
      </span>
    </span>
  );
}

export function FindingsTable({ columns, rows, accent = 'navy' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink/10">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className={`px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.14em] first:pl-0 last:pr-0 ${TEXT_TONE[accent]}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.07]">
          {rows.map((row) => (
            <tr key={row.finding} className="transition-colors hover:bg-ink/[0.015]">
              <th scope="row" className="px-3 py-2.5 pl-0 text-left text-sm font-semibold text-ink">
                {row.finding}
              </th>
              <td className="px-3 py-2.5">
                <StatusPill tone={row.tone}>{row.result}</StatusPill>
              </td>
              <td className="px-3 py-2.5">
                <ConfidenceMeter value={row.confidence} display={row.confidenceLabel} />
              </td>
              <td className="px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-verdant">
                  <StatusIcon tone="verdant" className="h-3.5 w-3.5" />
                  {row.radiologist}
                </span>
              </td>
              <td className="px-3 py-2.5 pr-0 text-sm text-slate">{row.interpretation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CriteriaList({ items }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-slate">
          <StatusIcon tone="verdant" className="mt-0.5 h-4 w-4" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
