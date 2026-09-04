import { MARK } from './chartUtils.js';

// What the urgency score is made of. One series, so one hue and no legend box —
// the panel title names it. The dominant driver takes the full step and the
// rest a lighter one: that is *emphasis*, not a value ramp, and the tip labels
// stand in for an axis the chart doesn't need.

export default function FactorBars({ factors, unitLabel }) {
  const max = Math.max(...factors.map((f) => f.points));

  return (
    <figure className="m-0">
      <ul className="flex flex-col gap-3">
        {factors.map((factor, i) => {
          const isTop = i === 0;
          return (
            <li key={factor.label}>
              <div className="flex items-baseline justify-between gap-3">
                <p className={`min-w-0 text-[0.78rem] ${isTop ? 'font-bold text-ink' : 'font-medium text-slate'}`}>
                  {factor.label}
                  {isTop && (
                    <span className="ml-2 whitespace-nowrap rounded-full bg-navy/10 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-navy">
                      Dominant driver
                    </span>
                  )}
                </p>
                <p className="flex-none text-[0.78rem] font-bold tabular-nums text-navy">
                  +{factor.points.toFixed(1)}
                </p>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="relative h-2.5 min-w-0 flex-1 rounded-[4px]">
                  <span
                    className="absolute inset-0 rounded-[4px] opacity-[0.10]"
                    style={{ background: MARK.navy }}
                    aria-hidden="true"
                  />
                  <span
                    className="bar-grow absolute inset-y-0 left-0"
                    style={{
                      width: `${((factor.points / max) * 100).toFixed(2)}%`,
                      background: MARK.navy,
                      opacity: isTop ? 1 : 0.55,
                      borderRadius: '0 4px 4px 0',
                    }}
                    aria-hidden="true"
                  />
                </span>
                <span className="w-[5.5rem] flex-none text-right text-[0.65rem] tabular-nums text-slate/70">
                  weight {(factor.weight * 100).toFixed(0)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {unitLabel && (
        <figcaption className="mt-3 border-t border-ink/[0.07] pt-3 text-xs leading-relaxed text-slate">
          {unitLabel}
        </figcaption>
      )}
    </figure>
  );
}
