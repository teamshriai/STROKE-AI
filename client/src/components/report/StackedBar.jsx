import { MARK, TEXT_TONE } from './chartUtils.js';
import { StatusIcon } from './ReportPrimitives.jsx';

// Part-to-whole for a small number of parts. A pie of two slices is a stat tile
// wearing a costume, so composition rides a single bar instead: the segments are
// held apart by a 2px gap in the surface colour (never a stroke), and an inline
// share label is rendered only where the segment is wide enough to hold it —
// under that, the legend and the value column carry it.

// Shares ride *above* the bar rather than inside the fill. Inside, the label
// would have to be white or ink over the segment's own hue, and gold clears
// neither (4.18:1 against white, 4.34:1 against ink — both under the 4.5:1
// small-text floor), so a gold segment would have to go unlabelled while its
// neighbours were labelled. Above the bar every share wears its own text token
// on paper and the row reads consistently.
const SHARE_LABEL_MIN = 0.12;

export default function StackedBar({
  segments,
  height = 'h-7',
  unit,
  legend = true,
  showShares = false,
  ariaLabel,
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <figure className="m-0">
      {showShares && (
        <div className="mb-1.5 flex w-full gap-[2px]">
          {segments.map((seg) => {
            const share = seg.value / total;
            return (
              <span key={seg.label} className="min-w-0" style={{ width: `${(share * 100).toFixed(2)}%` }}>
                {share >= SHARE_LABEL_MIN && (
                  <span
                    className={`block whitespace-nowrap text-[0.7rem] font-bold tabular-nums ${TEXT_TONE[seg.tone]}`}
                  >
                    {(share * 100).toFixed(1)}%
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}

      <div
        className={`flex w-full ${height} gap-[2px] overflow-hidden rounded-[4px]`}
        role="img"
        aria-label={ariaLabel ?? segments.map((s) => `${s.label} ${s.value}${unit ?? ''}`).join(', ')}
      >
        {segments.map((seg) => {
          const share = seg.value / total;
          return (
            <div
              key={seg.label}
              className="min-w-0 first:rounded-l-[4px] last:rounded-r-[4px]"
              style={{ width: `${(share * 100).toFixed(2)}%`, background: MARK[seg.tone] }}
              title={`${seg.label}: ${seg.value}${unit ?? ''} (${(share * 100).toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {legend && (
        <figcaption>
          <ul className="mt-3 flex flex-col gap-2.5">
            {segments.map((seg) => (
              <li key={seg.label} className="flex items-baseline gap-2.5">
                <StatusIcon tone={seg.tone} className="mt-0.5 h-3.5 w-3.5" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[0.8rem] font-bold ${TEXT_TONE[seg.tone]}`}>{seg.label}</p>
                  {seg.note && <p className="text-xs leading-snug text-slate">{seg.note}</p>}
                </div>
                <p className="flex-none text-right">
                  <span className="text-sm font-bold tabular-nums text-ink">
                    {seg.value}
                    {unit && <span className="ml-0.5 text-[0.7rem] font-semibold text-slate">{unit}</span>}
                  </span>
                  <span className="ml-2 text-xs tabular-nums text-slate/70">
                    {((seg.value / total) * 100).toFixed(1)}%
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </figcaption>
      )}
    </figure>
  );
}
