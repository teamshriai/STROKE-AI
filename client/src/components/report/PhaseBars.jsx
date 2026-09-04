import { MARK } from './chartUtils.js';

// The golden hour as durations rather than a list of timestamps. Magnitude on a
// nominal set, so one hue for every bar — the length is what carries the value,
// and colouring by it would spend the identity channel on nothing. The clock
// times and event text stay in the row, so the chart is its own table view.

export default function PhaseBars({ phases, totalLabel, totalValue }) {
  const max = Math.max(...phases.map((p) => p.minutes));

  return (
    <figure className="m-0">
      <ol className="flex flex-col gap-3.5">
        {phases.map((phase) => (
          <li key={phase.from}>
            <div className="flex items-baseline gap-3">
              <time className="w-11 flex-none text-[0.78rem] font-bold tabular-nums text-navy">{phase.from}</time>
              <p className="min-w-0 flex-1 text-[0.82rem] text-ink">{phase.event}</p>
              <p className="flex-none text-[0.78rem] font-bold tabular-nums text-navy">{phase.minutes} min</p>
              <p className="w-11 flex-none text-right text-[0.7rem] tabular-nums text-slate/70">{phase.delta}</p>
            </div>
            <div className="mt-1.5 ml-14 h-2.5">
              <span className="relative block h-full w-full">
                <span
                  className="absolute inset-0 rounded-[4px] opacity-[0.08]"
                  style={{ background: MARK.navy }}
                  aria-hidden="true"
                />
                <span
                  className="bar-grow absolute inset-y-0 left-0"
                  style={{
                    width: `${((phase.minutes / max) * 100).toFixed(2)}%`,
                    background: MARK.navy,
                    borderRadius: '0 4px 4px 0',
                  }}
                  aria-hidden="true"
                />
              </span>
            </div>
          </li>
        ))}
      </ol>

      <figcaption className="mt-4 flex items-baseline justify-between gap-3 border-t border-ink/[0.07] pt-3">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-navy">{totalLabel}</span>
        <span className="text-sm font-bold tabular-nums text-navy">{totalValue}</span>
      </figcaption>
    </figure>
  );
}
