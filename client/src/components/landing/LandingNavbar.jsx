import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import BrandMark from '../common/BrandMark.jsx'
import { BODY, STRONG, INK, INK_BODY, PAPER, RULE, EASE } from './theme.js'

/**
 * LandingNavbar — overlay navigation whose items are separate containers rather
 * than one grouped pill.
 *
 * Two palettes: light-on-photograph while the hero fills the screen, ink-on-cream
 * once it has shrunk away. The switch is driven by a sentinel the hero renders
 * (`[data-nav-sentinel]`) instead of a scroll offset, because the pinned hero
 * makes any fixed pixel threshold meaningless.
 */

const NAV_LINKS = [
  { label: 'Our Command Centre', href: '#services' },
  { label: 'Why It Matters', href: '#how-it-works' },
  { label: 'Our Team', href: '#team' },
  { label: 'Platform', href: '#platform' },
]

/* The single entry point into the product — same destination and label as
   the "Explore Stroke-AI" button on the old landing page. */
const CTA = { label: 'Explore Stroke-AI', to: '/app' }

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    const sentinel = document.querySelector('[data-nav-sentinel]')

    /* No sentinel (hero not mounted yet, or a future page without one) — fall
       back to a plain offset so the bar is never stuck in the wrong palette. */
    if (!sentinel) {
      const onScroll = () => setScrolled(window.scrollY > 16)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: '-88px 0px 0px 0px', threshold: 0 },
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!mobileOpen) return

    const onKeyDown = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    const onClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMobileOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [mobileOpen])

  const ink = scrolled ? INK_BODY : 'rgba(255,255,255,0.88)'
  const inkStrong = scrolled ? INK : '#ffffff'
  const chipBorder = scrolled ? RULE : 'rgba(255,255,255,0.30)'
  const chipBg = scrolled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)'

  /* Each item is its own container: same hairline box, own padding, own hover. */
  const chip = {
    ...BODY,
    fontSize: '12.5px',
    letterSpacing: '0.01em',
    lineHeight: 1,
    color: ink,
    background: chipBg,
    border: `1px solid ${chipBorder}`,
    borderRadius: '8px',
    padding: '9px 14px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    WebkitBackdropFilter: 'blur(10px)',
    backdropFilter: 'blur(10px)',
    transition: `color .25s ${EASE}, background .25s ${EASE}, border-color .25s ${EASE}`,
  }

  const hoverIn = (e) => {
    e.currentTarget.style.color = inkStrong
    e.currentTarget.style.background = scrolled ? '#ffffff' : 'rgba(255,255,255,0.18)'
  }
  const hoverOut = (e) => {
    e.currentTarget.style.color = ink
    e.currentTarget.style.background = chipBg
  }

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50"
      style={{
        fontSynthesis: 'none',
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'rgba(247,245,239,0.88)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? RULE : 'transparent'}`,
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        transition: `padding .35s ${EASE}, background .35s ${EASE}, border-color .35s ${EASE}`,
      }}
    >
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4 xl:gap-6">

          {/* ── Brand + partner marks, one group so they stay together ── */}
          <div className="flex items-center gap-3 xl:gap-4 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
            style={{ textDecoration: 'none' }}
          >
            <BrandMark size={14} rounded="rounded-full" />
            <div
              className="flex flex-col leading-[1.15]"
              style={{
                ...STRONG,
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: inkStrong,
                transition: `color .35s ${EASE}`,
              }}
            >
              <span>Stroke</span>
              <span>AI</span>
            </div>
          </Link>

          {/* ── Partner marks — each on its own chip rather than sharing one.
                Both marks are dark artwork, so they still need a light ground
                of their own to stay legible while the bar sits on the dark
                hero. Hidden below xl, where the nav needs the room more than
                the branding. */}
          <span className="hidden xl:flex items-center shrink-0" style={{ gap: '10px' }}>
            {/* Same pair as on the report, so the branding doesn't change
                identity between the bar and the page. */}
            <span style={{
              display: 'flex', alignItems: 'center',
              background: '#FFFFFF',
              border: `1px solid ${scrolled ? RULE : 'rgba(255,255,255,0.42)'}`,
              borderRadius: '8px',
              padding: '6px 10px',
              transition: `border-color .35s ${EASE}`,
            }}>
              <picture>
                <source srcSet="/landing/shri-ai-logo-trans.webp" type="image/webp" />
                <img
                  src="/landing/shri-ai-logo.png" alt="SHRI-AI"
                  width="640" height="640" decoding="async"
                  style={{ height: '40px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </picture>
            </span>
            <span style={{
              display: 'flex', alignItems: 'center',
              background: '#FFFFFF',
              border: `1px solid ${scrolled ? RULE : 'rgba(255,255,255,0.42)'}`,
              borderRadius: '8px',
              padding: '6px 10px',
              transition: `border-color .35s ${EASE}`,
            }}>
              <picture>
                <source srcSet="/landing/logo-indostates-trans.webp" type="image/webp" />
                <img
                  src="/landing/logo-indostates.png" alt="IndoStates Health Hospital"
                  width="640" height="156" decoding="async"
                  style={{ height: '26px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </picture>
            </span>
          </span>
          </div>

          {/* ── Individual nav containers — desktop ── */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-3 xl:gap-3.5">
            {NAV_LINKS.map(({ label, href, to }) => (
              to ? (
                <Link key={label} to={to} style={chip} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  {label}
                </Link>
              ) : (
                <a key={label} href={href} style={chip} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  {label}
                </a>
              )
            ))}
          </nav>

          {/* ── Explore Stroke-AI — desktop ── */}
          <Link
            to={CTA.to}
            className="hidden lg:block shrink-0"
            style={{
              ...STRONG,
              fontSize: '12.5px',
              letterSpacing: '0.01em',
              lineHeight: 1,
              color: scrolled ? PAPER : INK,
              background: scrolled ? INK : 'rgba(255,255,255,0.92)',
              border: `1px solid ${scrolled ? INK : 'rgba(255,255,255,0.92)'}`,
              borderRadius: '8px',
              padding: '10px 18px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: `color .25s ${EASE}, background .25s ${EASE}, border-color .25s ${EASE}`,
            }}
          >
            {CTA.label}
          </Link>

          {/* ── Hamburger — mobile / tablet ── */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden rounded-lg p-2 transition-colors"
            style={{
              color: inkStrong,
              background: chipBg,
              border: `1px solid ${chipBorder}`,
            }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
          >
            {mobileOpen
              ? <X size={18} strokeWidth={1.4} />
              : <Menu size={18} strokeWidth={1.4} />
            }
          </button>

        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          id="landing-mobile-menu"
          className="lg:hidden absolute top-full inset-x-0 px-5 py-5"
          style={{
            background: 'rgba(247,245,239,0.97)',
            borderBottom: `1px solid ${RULE}`,
            WebkitBackdropFilter: 'blur(18px)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <nav className="flex flex-col gap-2">
            {[...NAV_LINKS, CTA].map(({ label, href, to }) => {
              const item = {
                ...BODY,
                fontSize: '13.5px',
                color: INK_BODY,
                background: '#FFFDF8',
                border: `1px solid ${RULE}`,
                borderRadius: '8px',
                padding: '13px 16px',
                textDecoration: 'none',
                display: 'block',
              }
              return to ? (
                <Link key={label} to={to} onClick={() => setMobileOpen(false)} style={item}>{label}</Link>
              ) : (
                <a key={label} href={href} onClick={() => setMobileOpen(false)} style={item}>{label}</a>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
