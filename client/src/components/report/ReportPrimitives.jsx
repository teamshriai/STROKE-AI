// Shared presentational pieces for the Acute Stroke Imaging & Triage Report.
// Status colour semantics used throughout: verdant = negative/normal/eligible,
// crimson = positive/critical finding, gold = caution/partial, navy = informational.

const TONE_CLASSES = {
  verdant: 'bg-verdant/10 text-verdant ring-verdant/25',
  crimson: 'bg-crimson/10 text-crimson ring-crimson/25',
  gold: 'bg-gold/10 text-gold ring-gold/25',
  navy: 'bg-navy/10 text-navy ring-navy/25',
  slate: 'bg-ink/5 text-slate ring-ink/10',
};

export function StatusPill({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.12em] ring-1 ring-inset ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const ACCENT_CLASSES = {
  crimson: { bar: 'bg-crimson', title: 'text-crimson', header: 'bg-crimson/[0.05]' },
  navy: { bar: 'bg-navy', title: 'text-navy', header: 'bg-navy/[0.05]' },
  gold: { bar: 'bg-gold', title: 'text-gold', header: 'bg-gold/[0.05]' },
  verdant: { bar: 'bg-verdant', title: 'text-verdant', header: 'bg-verdant/[0.05]' },
};

export function Panel({ title, subtitle, children, accent, className = '' }) {
  const tone = ACCENT_CLASSES[accent];
  return (
    <section className={`overflow-hidden rounded-xl border border-ink/10 bg-white/60 ${className}`}>
      {title && (
        <header className={`flex items-stretch border-b border-ink/10 ${tone ? tone.header : ''}`}>
          {tone && <span className={`w-1 flex-none ${tone.bar}`} aria-hidden="true" />}
          <div className="px-5 py-3.5">
            <h2
              className={`font-serif text-[0.82rem] font-medium uppercase tracking-[0.16em] ${
                tone ? tone.title : 'text-ink'
              }`}
            >
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-xs text-slate/70">{subtitle}</p>}
          </div>
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function StatTile({ label, value, unit, note, tone = 'navy' }) {
  const colours = {
    crimson: 'border-crimson/25 bg-crimson/[0.06] text-crimson',
    navy: 'border-navy/25 bg-navy/[0.06] text-navy',
    gold: 'border-gold/25 bg-gold/[0.07] text-gold',
    verdant: 'border-verdant/25 bg-verdant/[0.06] text-verdant',
  }[tone];

  return (
    <div className={`rounded-xl border px-4 py-3.5 ${colours}`}>
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1.5 font-serif text-[1.5rem] font-medium leading-none tabular-nums">
        {value}
        {unit && <span className="ml-1 text-[0.8rem] font-normal opacity-70">{unit}</span>}
      </p>
      {note && <p className="mt-1.5 text-[0.7rem] leading-snug text-slate/80">{note}</p>}
    </div>
  );
}

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

export function DataList({ rows }) {
  return (
    <dl className="divide-y divide-ink/[0.07]">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0">
          <dt className="flex-none text-xs uppercase tracking-[0.1em] text-slate/70">{label}</dt>
          <dd className="text-right text-sm text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FindingsTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink/10">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-slate/70 first:pl-0 last:pr-0"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.07]">
          {rows.map((row) => (
            <tr key={row.finding}>
              <td className="px-3 py-2.5 pl-0 text-sm text-ink">{row.finding}</td>
              <td className="px-3 py-2.5">
                <StatusPill tone={row.tone}>{row.result}</StatusPill>
              </td>
              <td className="px-3 py-2.5 font-serif text-sm tabular-nums text-ink">{row.confidence}</td>
              <td className="px-3 py-2.5 text-sm text-verdant">{row.radiologist}</td>
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
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="var(--color-verdant)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-4 w-4 flex-none"
            aria-hidden="true"
          >
            <path d="M4 10.5l4 4 8-9" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
