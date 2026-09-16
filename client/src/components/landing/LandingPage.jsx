import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import LandingNavbar from './LandingNavbar.jsx'
import LandingHeader from './LandingHeader.jsx'
import LandingFooter from './LandingFooter.jsx'

export default function LandingPage() {
  const { hash } = useLocation()
  const deepLinkHandled = useRef(false)

  // The browser tries to scroll to the URL fragment before this route's lazy
  // chunk has rendered the target section, so a direct/refreshed load of
  // e.g. /#services silently lands at the top instead. Retry once mounted.
  useEffect(() => {
    // Only the FIRST hash of the session is a deep link needing that rescue.
    // Every later hash change is the user clicking a nav anchor, which the
    // browser is already animating via the root's `scroll-behavior: smooth`
    // (index.css) — the instant scrollIntoView below used to fire on those
    // too and snap the page, which is what made in-page navigation jump
    // rather than glide.
    if (deepLinkHandled.current) return
    deepLinkHandled.current = true

    if (!hash) return
    const id = hash.slice(1)

    const scrollToTarget = () => {
      const el = document.getElementById(id)
      if (!el) return
      // scrollIntoView (rather than a measured window.scrollTo) so each section's
      // own `scroll-margin-top` is honoured and the heading clears the fixed nav.
      // Explicit 'instant' bypasses the root's `scroll-behavior: smooth`
      // (index.css), which would otherwise animate and may not finish
      // before the browser considers the page "loaded".
      el.scrollIntoView({ behavior: 'instant', block: 'start' })
    }

    // Images below the fold (feature/benefit photos) can still be decoding
    // when this effect first runs, which shifts section offsets below and
    // makes an early measurement land short. Re-measure a few times as
    // layout settles rather than guessing a single "safe" delay.
    scrollToTarget()
    const timeouts = [100, 400, 1200].map((ms) => window.setTimeout(scrollToTarget, ms))

    return () => timeouts.forEach(window.clearTimeout)
  }, [hash])

  return (
    <div
      className="sa-landing min-h-screen selection:bg-[#e6e2d3] selection:text-[#16160F]"
      style={{ background: '#F7F5EF', color: '#16160F' }}
    >
      {/* Fixed navigation bar */}
      <LandingNavbar />

      {/* Hero + scroll-reveal content sections (all in one component) */}
      <LandingHeader />

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
