// Per-site occlusion probabilities from the CTA model. The dominant call is
// emphasised in crimson; the rest stay muted so the ranking reads at a glance.
export default function OcclusionProbabilityBars({ items }) {
  const top = Math.max(...items.map((i) => i.probability));

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const isTop = item.probability === top;
        return (
          <li key={item.label} className="flex items-center gap-4">
            <span className={`w-40 flex-none text-sm ${isTop ? 'font-medium text-ink' : 'text-slate'}`}>
              {item.label}
            </span>
            <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
              <span
                className={`absolute inset-y-0 left-0 rounded-full ${isTop ? 'bg-crimson' : 'bg-slate/35'}`}
                style={{ width: `${item.probability * 100}%` }}
              />
            </span>
            <span
              className={`w-10 flex-none text-right font-serif text-sm tabular-nums ${
                isTop ? 'text-crimson' : 'text-slate'
              }`}
            >
              {item.probability.toFixed(2)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
