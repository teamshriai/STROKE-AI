import { MARK } from './chartUtils.js';

// Per-site occlusion probabilities from the CTA model. One series is the point
// and the rest are context, so this is the *emphasis* form: the dominant call
// takes the accent hue and full weight, everything else recedes to a neutral.
// Every bar is direct-labelled, which is why there are no gridlines to read.

export default function OcclusionProbabilityBars({ items }) {
  const top = Math.max(...items.map((i) => i.probability));

  return (
    <figure className="m-0">
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const isTop = item.probability === top;
          return (
            <li key={item.label} className="flex items-center gap-3 sm:gap-4">
              <span
                className={`w-32 flex-none text-[0.8rem] sm:w-40 ${
                  isTop ? 'font-bold text-crimson' : 'font-medium text-slate'
                }`}
              >
                {item.label}
              </span>
              <span className="relative h-2.5 min-w-0 flex-1" title={`${item.label}: ${item.probability.toFixed(2)}`}>
                <span
                  className="absolute inset-0 rounded-[4px] opacity-[0.08]"
                  style={{ background: MARK.ink }}
                  aria-hidden="true"
                />
                <span
                  className="bar-grow absolute inset-y-0 left-0"
                  style={{
                    width: `${(item.probability * 100).toFixed(1)}%`,
                    background: isTop ? MARK.crimson : MARK.slate,
                    opacity: isTop ? 1 : 0.4,
                    borderRadius: '0 4px 4px 0',
                  }}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`w-9 flex-none text-right text-[0.8rem] tabular-nums ${
                  isTop ? 'font-bold text-crimson' : 'font-semibold text-slate'
                }`}
              >
                {item.probability.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
