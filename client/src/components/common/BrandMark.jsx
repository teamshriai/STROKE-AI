import { Brain } from 'lucide-react'

/* Stroke AI brand mark — a light-weight brain glyph, white on a black disc.
   Single source of truth so the logo isn't hand-drawn separately in every
   header (sidebar, landing nav/footer, auth screens).

   The glyph comes from lucide-react (already a dependency) rather than a
   hand-rolled path: it stays evenly weighted at any size, which a hand-tuned
   brain outline does not. */
export default function BrandMark({ size = 18, rounded = 'rounded-full' }) {
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center ${rounded}`}
      style={{
        width: size + 14,
        height: size + 14,
        background: '#0F0F0F',
      }}
    >
      <Brain
        size={size}
        color="#FFFFFF"
        strokeWidth={1.6}
        absoluteStrokeWidth
        aria-hidden="true"
      />
    </div>
  )
}
