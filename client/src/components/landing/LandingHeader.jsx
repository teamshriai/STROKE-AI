import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DISPLAY, BODY, STRONG, LABEL,
  CREAM, PAPER, INK, INK_BODY, INK_SUBTLE, RULE, TINT, HERO_GROUND, HERO_DOT_COLOR, ON_DARK, ON_DARK_BODY,
  FLOW_CORAL, FLOW_AMBER,
  EASE, reducedMotion,
} from './theme.js'
import ArchitectureFlow from './ArchitectureFlow.jsx'
import PartnerMap from './PartnerMap.jsx'
import PatientReportPage from '../../pages/PatientReportPage.jsx'
import { Reveal, SectionHead } from './primitives.jsx'

/* ═══════════════════════════════════════════════════════════════════
   LandingHeader — pinned hero, partner band, and every content section.

   Type contract (see theme.js):
     h1 / h2  → Playfair Display 400
     h3 and below, all body copy → Lato 400 / 700
═══════════════════════════════════════════════════════════════════ */

/* ── "Why It Matters" — two figures and the context behind them ── */
const MATTERS_CARDS = [
  { type: 'stat', tint: TINT.clay, to: 1.9, decimals: 1, suffix: 'M', label: 'Neurons lost, on average, for every minute a stroke goes untreated.' },
  { type: 'stat', tint: TINT.sand, to: 60, decimals: 0, suffix: ' min', label: 'The golden hour clinicians race against, from first symptom to first treatment.' },
  {
    type: 'note',
    tint: TINT.teal,
    text: 'Every layer of delay — recognising symptoms, reaching a hospital, reading a scan — compounds against the clock. Stroke AI is built to collapse that delay into a single, coordinated response.',
    cite: 'Source: Saver, J.L., "Time Is Brain — Quantified," Stroke, 2006.',
  },
]

const TEAM = [
  {
    tint: TINT.clay,
    name: 'SHRI-AI',
    desc: 'Brings the AI and telehealth technology behind "AI for Health, Care for All" — imaging models, real-time coordination software, and the mobile platform patients and bystanders will actually use.',
  },
  {
    tint: TINT.sky,
    name: 'IndoStates Health Hospital',
    desc: 'Brings the clinical and hospital network behind "Prevent, Screen, Treat" — decades of frontline emergency and neurology care, and the ambulance and scan-lab partnerships a stroke response depends on.',
  },
]

/* ── Count-up: figures animate from zero once scrolled into view ── */
function CountUp({ to, decimals = 0, suffix = '' }) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) { setVal(to); return }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      const duration = 1500
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration)
        setVal(to * (1 - Math.pow(1 - t, 3)))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      obs.disconnect()
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>
}

/* ── Bento line chart ── */
function BentoLineChart() {
  const points = [[32, 148], [168, 72], [304, 158], [440, 88], [520, 60]]
  return (
    <svg viewBox="0 0 552 220" preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden="true">
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"
      />
      {points.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6" fill={INK} />
      ))}
    </svg>
  )
}

/* ── Hero dot field — a dense halftone gradient: tiny and near-invisible at
     the vertical middle, fading out both going up toward the top edge and
     going down toward the bottom edge. One continuous easing curve, not a
     hard cutoff. Static SVG, computed once: no rAF, nothing to animate. ── */
const HERO_DOT_W = 1200
const HERO_DOT_H = 640
const HERO_DOT_PITCH = 24
const HERO_DOT_COLS = Math.ceil(HERO_DOT_W / HERO_DOT_PITCH)
const HERO_DOT_ROWS = Math.ceil(HERO_DOT_H / HERO_DOT_PITCH)
const HERO_DOT_MAX_R = 2.75
/* Hard ceiling on any one dot's radius — however big the row trend and the
   per-dot jitter push it, this keeps neighbours from ever touching. */
const HERO_DOT_R_CEIL = HERO_DOT_PITCH / 2 - 1.5
const HERO_DOT_MAX_OPACITY = 0.125
const HERO_DOT_EASE = 1.15 // >1 keeps the peak narrow and the edges quiet

function buildHeroDots() {
  const dots = []
  for (let r = 0; r < HERO_DOT_ROWS; r++) {
    const v = r / (HERO_DOT_ROWS - 1) // 0 at top, 1 at bottom
    const distFromMid = Math.abs(v - 0.5) * 2 // 0 at the vertical middle, 1 at either edge
    const eased = Math.pow(Math.max(0, 1 - distFromMid), HERO_DOT_EASE)
    if (HERO_DOT_MAX_OPACITY * eased < 0.006) continue // whole row not worth painting
    const y = (r + 0.5) * HERO_DOT_PITCH
    for (let c = 0; c < HERO_DOT_COLS; c++) {
      const x = (c + 0.5) * HERO_DOT_PITCH
      /* Per-dot jitter — irregular sizes like a real halftone, never a
         clean smooth ramp — but always clamped below HERO_DOT_R_CEIL so
         dots vary without ever colliding. */
      const jitter = 0.55 + Math.random() * 0.85
      const radius = Math.min(HERO_DOT_MAX_R * eased * jitter, HERO_DOT_R_CEIL)
      const opacity = Math.min(0.85, HERO_DOT_MAX_OPACITY * eased * (0.75 + jitter * 0.25))
      dots.push({ x, y, radius, opacity })
    }
  }
  return dots
}

const HERO_DOTS = buildHeroDots()

function HeroDotField() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox={`0 0 ${HERO_DOT_W} ${HERO_DOT_H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {HERO_DOTS.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.radius} fill={HERO_DOT_COLOR} opacity={d.opacity} />
      ))}
    </svg>
  )
}

/* ── Alert siren — a small red beacon-light vector with a pulsing ring,
     sitting right next to the "Stroke AI" eyebrow. ── */
function HeroSosBadge() {
  return (
    <span className="sa-hero-sos" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" style={{ flexShrink: 0 }}>
        <circle className="sa-hero-sos-ring" cx="12" cy="13" r="9" fill="none" stroke={FLOW_CORAL} strokeWidth="1.5" />
        <line x1="12" y1="4.5" x2="12" y2="7.5" stroke={FLOW_CORAL} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="6.5" y1="7" x2="8.5" y2="9" stroke={FLOW_CORAL} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="17.5" y1="7" x2="15.5" y2="9" stroke={FLOW_CORAL} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.5 17.5 Q6.5 9.5 12 9.5 Q17.5 9.5 17.5 17.5 Z" fill={FLOW_CORAL} />
        <rect x="8.5" y="17" width="7" height="2.4" rx="1" fill={FLOW_CORAL} />
      </svg>
    </span>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
export default function LandingHeader() {
  /* Hero entrance plays once on mount — it is above the fold, so an
     IntersectionObserver would fire immediately anyway. */
  const [heroIn, setHeroIn] = useState(() => reducedMotion())
  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroIn(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <style>{`
        .sa-focus:focus-visible {
          outline: 2px solid #5aa9e6;
          outline-offset: 2px;
        }

        /* The statement behind the hero plate: one line on desktop, wrapped on
           phones — 27 characters held on one line at 390px would shrink it to
           nothing. */
        .sa-statement { max-width: min(92vw, 16ch); text-wrap: balance; }
        @media (min-width: 1024px) {
          .sa-statement { max-width: none; white-space: nowrap; text-wrap: nowrap; }
        }

        .sa-grid-3 {
          display: grid;
          gap: clamp(14px, 2vw, 24px);
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        }
        .sa-grid-2 {
          display: grid;
          gap: clamp(14px, 2vw, 24px);
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
        }

        /* Benefits bento: stacked on phones, two columns with a full-height
           third panel from 640px up. */
        .sa-bento { display: grid; gap: clamp(8px, 1.2vw, 14px); }
        @media (min-width: 640px) {
          .sa-bento {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
          }
          .sa-bento > :nth-child(3) { grid-column: 2; grid-row: 1 / span 2; }
        }

        /* Hero: single column with the visual reordered above the copy on
           phones (it's aria-hidden, so reordering it costs nothing for
           screen-reader or keyboard-focus order), two columns from 1024px. */
        .sa-hero-grid {
          display: grid;
          gap: clamp(2rem, 5vw, 3.5rem);
          align-items: center;
        }
        .sa-hero-visual-slot {
          order: -1;
          width: min(100%, 420px);
          margin: 0 auto clamp(1.5rem, 4vw, 2.25rem);
        }
        .sa-hero-visual-slot img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        @media (min-width: 768px) {
          .sa-hero-visual-slot { width: min(100%, 480px); }
        }
        @media (min-width: 1024px) {
          .sa-hero-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); }
          .sa-hero-visual-slot { order: 0; width: 100%; margin: 0; }
        }

        .sa-hero-sos {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-left: 10px;
          vertical-align: middle;
        }
        .sa-hero-sos-ring {
          transform-box: fill-box;
          transform-origin: center;
          opacity: 0.8;
        }
        @media (prefers-reduced-motion: no-preference) {
          .sa-hero-sos-ring { animation: sa-sos-pulse 1.8s ease-out infinite; }
        }
        @keyframes sa-sos-pulse {
          0% { transform: scale(0.65); opacity: 0.9; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━
          A normal, static section — no scroll pin. The hero visual is a
          background-removed cutout (see /assets/hero-image-cutout.webp,
          derived from hero-image.webp) that scales by width via CSS, no
          component swapping needed across breakpoints.
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          background: HERO_GROUND,
          overflow: 'hidden',
          paddingTop: 'clamp(6.5rem, 14vh, 9rem)',
          paddingBottom: 'clamp(3rem, 7vh, 5rem)',
        }}
      >
        <HeroDotField />
        <div style={{ position: 'relative', maxWidth: '1320px', margin: '0 auto', padding: '0 clamp(1rem, 3vw, 2.5rem)' }}>
          <div className="sa-hero-grid">
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 'clamp(0.9rem, 2vw, 1.4rem)',
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? 'translateY(0)' : 'translateY(10px)',
                  transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                }}
              >
                <span style={{ ...LABEL, fontSize: '12px', color: ON_DARK_BODY }}>Stroke AI</span>
                <HeroSosBadge />
              </div>

              <div
                aria-hidden="true"
                style={{
                  width: heroIn ? 'clamp(44px, 6vw, 76px)' : '0px',
                  height: '1px',
                  background: ON_DARK,
                  marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
                  transition: `width 0.9s ${EASE} 120ms`,
                }}
              />

              <h1
                style={{
                  ...DISPLAY,
                  /* Tuned to hold "Helping Every Second Count." on one line
                     within the two-column layout's narrower text column —
                     not the old full-bleed hero's width. */
                  fontSize: 'clamp(1.85rem, 2.9vw, 2.5rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.014em',
                  color: ON_DARK,
                  margin: '0 0 clamp(1rem, 2vw, 1.4rem)',
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? 'translateY(0)' : 'translateY(18px)',
                  transition: `opacity 1s ${EASE} 160ms, transform 1s ${EASE} 160ms`,
                }}
              >
                <span style={{ display: 'block' }}>
                  AI powered <span style={{ color: FLOW_AMBER }}>Command center</span> for Stroke.
                </span>
                <span style={{ display: 'block' }}>Helping Every Second Count.</span>
              </h1>

              <p
                style={{
                  ...BODY,
                  fontSize: 'clamp(15px, 1.25vw, 17px)',
                  color: ON_DARK_BODY,
                  lineHeight: 1.7,
                  maxWidth: '52ch',
                  margin: '0 0 clamp(1.75rem, 3.5vw, 2.4rem)',
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? 'translateY(0)' : 'translateY(14px)',
                  transition: `opacity 0.9s ${EASE} 240ms, transform 0.9s ${EASE} 240ms`,
                }}
              >
                The intelligent command centre for stroke care — connecting patients,
                ambulances, labs, hospitals, and AI in real time.
              </p>
            </div>

            <div className="sa-hero-visual-slot" aria-hidden="true">
              <img
                src="/assets/hero-cutout-tight.webp"
                alt=""
                width="1401"
                height="798"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 'clamp(2.25rem, 4.5vw, 3.25rem)',
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? 'translateY(0)' : 'translateY(14px)',
              transition: `opacity 0.9s ${EASE} 320ms, transform 0.9s ${EASE} 320ms`,
            }}
          >
            {/* The launch-access form lives in the footer now; the hero just
                states where the product is. */}
            <span style={{
              ...LABEL,
              fontSize: 'clamp(12px, 1.1vw, 14px)',
              letterSpacing: '0.26em',
              color: FLOW_AMBER,
            }}>
              Launching soon
            </span>
          </div>
        </div>

        {/* Sentinel the navbar watches to know when the dark hero has
            scrolled past and the bar needs to switch to ink on cream.
            `min(80vh, 100%)`: normally the hero's own bottom edge (100%,
            matching where the dark ground actually ends — true on desktop,
            where the hero is shorter than the viewport), but capped at 80%
            of the viewport height for the taller stacked mobile layout,
            where the true bottom edge sits below the initial viewport —
            left uncapped there, the sentinel would already read as
            "scrolled past" at load, and the navbar would flip to its
            light-ground palette immediately while still sitting on the
            dark hero. */}
        <div
          data-nav-sentinel
          aria-hidden="true"
          style={{ position: 'absolute', top: 'min(80vh, 100%)', left: 0, width: '1px', height: '1px' }}
        />
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━ WHAT WE'RE BUILDING ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="services" style={{ background: CREAM, position: 'relative', zIndex: 10, scrollMarginTop: '124px' }}>
        {/* Every section heading shares this measure — see PartnerMap.jsx,
            the reference for the convention. */}
        <div style={{
          maxWidth: '1800px', margin: '0 auto',
          padding: 'clamp(2.25rem, 4vw, 3.5rem) clamp(1.25rem, 3vw, 2.5rem) 0',
        }}>
          <Reveal>
            <SectionHead label="AI-powered Command Centre" title="Anywhere, anytime." />
          </Reveal>
        </div>

        <Reveal
          delay={80}
          style={{
            maxWidth: '1800px',
            margin: '0 auto',
            padding: 'clamp(1.75rem, 3.5vw, 2.75rem) clamp(1rem, 3vw, 2.5rem) clamp(3rem, 6vw, 5rem)',
          }}
        >
          <ArchitectureFlow />
        </Reveal>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━ THE PARTNER NETWORK ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <PartnerMap />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━ WHY IT MATTERS ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        id="how-it-works"
        style={{
          background: PAPER,
          borderTop: `1px solid ${RULE}`,
          position: 'relative', zIndex: 10,
          scrollMarginTop: '124px',
        }}
      >
        <div style={{
          maxWidth: '1800px', margin: '0 auto',
          padding: 'clamp(2.25rem, 4vw, 3.5rem) clamp(1.25rem, 3vw, 2.5rem)',
        }}>
          <Reveal>
            <SectionHead
              label="Why It Matters"
              title="Act in Time, Save the Brain"
              lede="Stroke damage is measured in minutes, not hours. Every delay between the first symptom and the first treatment costs tissue that does not come back."
            />
          </Reveal>

          <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
            <div className="sa-grid-3" style={{ marginTop: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
              {MATTERS_CARDS.map((c, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div style={{
                    background: c.tint.bg,
                    border: `1px solid ${RULE}`,
                    borderRadius: '10px',
                    padding: 'clamp(20px, 2.4vw, 30px)',
                    height: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: c.type === 'stat' ? 'flex-start' : 'center',
                  }}>
                    {c.type === 'stat' ? (
                      <>
                        <div style={{
                          ...DISPLAY, fontSize: 'clamp(2.4rem, 4.4vw, 3.4rem)',
                          lineHeight: 1, letterSpacing: '-0.02em', color: c.tint.ink, marginBottom: '14px',
                        }}>
                          <CountUp to={c.to} decimals={c.decimals} suffix={c.suffix} />
                        </div>
                        <p style={{ ...BODY, fontSize: 'clamp(13px, 1.05vw, 14.5px)', lineHeight: 1.65, color: INK_BODY, margin: 0 }}>
                          {c.label}
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ ...BODY, fontSize: 'clamp(13px, 1.05vw, 14.5px)', lineHeight: 1.7, color: INK_BODY, margin: '0 0 12px' }}>
                          {c.text}
                        </p>
                        <p style={{ ...BODY, fontSize: '11.5px', lineHeight: 1.6, color: INK_BODY, margin: 0 }}>
                          {c.cite}
                        </p>
                      </>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* The real triage report, rendered exactly as it appears on its own
              page (pages/PatientReportPage.jsx) — same component, so its
              palette, contrast and charts stay identical and the report page
              itself is untouched. Only the surrounding alignment is this
              page's. */}
          <div style={{ marginTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
            <Reveal>
              <SectionHead
                label="A Report From The Field"
                title="What the AI hands the stroke team."
                lede="A live example from the demo console — the same triage figures a receiving hub sees within minutes of the scan."
              />
            </Reveal>
            <div style={{ marginTop: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
              <PatientReportPage />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━ THE PLATFORM ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="platform" style={{ background: CREAM, borderTop: `1px solid ${RULE}`, position: 'relative', zIndex: 10, scrollMarginTop: '124px' }}>
        <div style={{
          maxWidth: '1800px', margin: '0 auto',
          padding: 'clamp(2.25rem, 4vw, 3.5rem) clamp(1.25rem, 3vw, 2.5rem)',
        }}>
          <Reveal>
            <SectionHead
              label="The Platform"
              title="One platform. One golden hour."
              lede="From the first alert to treatment, every step is built to run in parallel rather than in sequence."
            />
          </Reveal>

          <Reveal delay={120}>
            <div style={{
              textAlign: 'center',
              maxWidth: '640px',
              margin: 'clamp(2rem, 4.5vw, 3rem) auto 0',
              background: TINT.sky.bg,
              border: `1px solid ${RULE}`,
              borderRadius: '10px',
              padding: 'clamp(26px, 4vw, 44px) clamp(20px, 3vw, 32px)',
            }}>
              <Link
                to="/app"
                className="sa-focus"
                style={{
                  ...STRONG,
                  fontSize: 'clamp(12.5px, 1vw, 13.5px)',
                  color: PAPER, background: INK,
                  border: `1px solid ${INK}`,
                  padding: '13px 28px', borderRadius: '8px',
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                  textDecoration: 'none',
                  transition: 'background .2s ease, color .2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = INK }}
                onMouseLeave={e => { e.currentTarget.style.background = INK; e.currentTarget.style.color = PAPER }}
              >
                Explore the Platform
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━ OUR TEAM ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="team" style={{ background: PAPER, borderTop: `1px solid ${RULE}`, position: 'relative', zIndex: 10, scrollMarginTop: '124px' }}>
        <div style={{
          maxWidth: '1800px', margin: '0 auto',
          padding: 'clamp(2.25rem, 4vw, 3.5rem) clamp(1.25rem, 3vw, 2.5rem)',
        }}>
          <Reveal>
            <SectionHead label="Our Team" title="One mission, strong partnership." />
          </Reveal>

          <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
            <div className="sa-grid-2" style={{ margin: 'clamp(1.75rem, 3.5vw, 2.75rem) 0 clamp(2rem, 4vw, 2.75rem)' }}>
              {TEAM.map((t, i) => (
                <Reveal key={t.name} delay={i * 90}>
                  <div style={{
                    background: t.tint.bg, border: `1px solid ${RULE}`, borderRadius: '10px',
                    padding: 'clamp(20px, 2.4vw, 30px)', height: '100%', boxSizing: 'border-box',
                  }}>
                    <h3 style={{ ...STRONG, fontSize: 'clamp(16px, 1.5vw, 19px)', color: INK, margin: '0 0 10px' }}>
                      {t.name}
                    </h3>
                    <p style={{ ...BODY, fontSize: 'clamp(13px, 1.05vw, 14.5px)', lineHeight: 1.7, color: INK_BODY, margin: 0 }}>
                      {t.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100}>
              <p style={{
                ...BODY, fontSize: 'clamp(13.5px, 1.15vw, 15.5px)', lineHeight: 1.75,
                color: INK_BODY, textAlign: 'center', maxWidth: '620px', margin: '0 auto',
              }}>
                Together, we&rsquo;re building India&rsquo;s first mobile stroke-response network —
                combining telehealth, AI-assisted imaging, and a coordinated ambulance network into a
                single race against the clock.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━ WHY STROKE AI ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        id="benefits"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100svh',
          overflow: 'hidden',
          zIndex: 10,
          scrollMarginTop: '124px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            /* One hand holding, the other operating, screen turned away — the
               patient's way in to a doctor, which is what this section argues.
               CC0 via Openverse (StockSnap ODN23L0AC9), hosted locally. */
            backgroundImage: "url('/landing/benefits-phone.webp')",
            backgroundSize: 'cover',
            /* Focal point sits on the phone (≈45% across), so the tall crop a
               phone viewport takes still frames the hands rather than a shoulder. */
            backgroundPosition: '45% 42%',
            filter: 'brightness(0.46) contrast(1.06)',
          }}
        />
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 72%,rgba(0,0,0,0.45) 100%)',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to top,rgba(0,0,0,0.32) 0%,rgba(0,0,0,0) 55%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          paddingTop: 'clamp(1.6rem, 3.5vh, 2.6rem)',
          display: 'flex', justifyContent: 'center',
        }}>
          <Reveal y={-14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span aria-hidden="true" style={{ width: '22px', height: '1px', background: 'rgba(255,255,255,0.4)' }} />
              <span style={{
                ...STRONG, fontSize: '11px', letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)',
              }}>
                Why Stroke AI
              </span>
            </div>
          </Reveal>
        </div>

        <div style={{
          position: 'relative', zIndex: 2, width: '100%',
          padding: 'clamp(1rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2.5rem) clamp(1.5rem, 3.5vh, 2.8rem)',
          boxSizing: 'border-box',
        }}>
          <div className="sa-bento" style={{ maxWidth: '1320px', margin: '0 auto' }}>
            {/* 01 — light panel */}
            <Reveal delay={0} style={{ display: 'flex' }}>
              <div style={{
                background: 'rgba(245, 250, 255, 0.93)',
                borderRadius: '4px',
                padding: 'clamp(18px, 2vw, 26px)',
                display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between',
                gap: 'clamp(24px, 3vw, 40px)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.7)',
                boxSizing: 'border-box',
              }}>
                <span style={{ ...BODY, fontSize: '11px', letterSpacing: '0.14em', color: INK_SUBTLE }}>01</span>
                <div>
                  <h3 style={{ ...STRONG, fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.25, color: INK, margin: '0 0 6px' }}>
                    Golden hour focus
                  </h3>
                  <p style={{ ...BODY, fontSize: 'clamp(12.5px, 0.95vw, 13.5px)', lineHeight: 1.65, color: INK_BODY, margin: 0 }}>
                    Every step is built around reaching treatment inside the critical first hour.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* 02 — dark glass */}
            <Reveal delay={110} style={{ display: 'flex' }}>
              <div style={{
                background: 'rgba(18, 22, 28, 0.68)',
                borderRadius: '4px',
                padding: 'clamp(18px, 2vw, 26px)',
                display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between',
                gap: 'clamp(24px, 3vw, 40px)',
                backdropFilter: 'blur(22px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(22px) saturate(1.3)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxSizing: 'border-box',
              }}>
                <span style={{ ...BODY, fontSize: '11px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.42)' }}>02</span>
                <div>
                  <h3 style={{ ...STRONG, fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.25, color: '#FFFDF8', margin: '0 0 6px' }}>
                    A verified care network
                  </h3>
                  <p style={{ ...BODY, fontSize: 'clamp(12.5px, 0.95vw, 13.5px)', lineHeight: 1.65, color: 'rgba(255,255,255,0.66)', margin: 0 }}>
                    You are connected only to hospitals and stroke specialists we have vetted.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* 03 — tall panel with the chart */}
            <Reveal delay={55} style={{ display: 'flex' }}>
              <div style={{
                background: '#a8d4f5',
                borderRadius: '4px',
                padding: 'clamp(18px, 2vw, 26px)',
                display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between',
                minHeight: 'clamp(220px, 28vw, 360px)',
                border: '1px solid rgba(255,255,255,0.35)',
                boxSizing: 'border-box',
              }}>
                <span style={{ ...BODY, fontSize: '11px', letterSpacing: '0.14em', color: 'rgba(22,22,15,0.45)' }}>03</span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: 'clamp(12px, 2.5vw, 28px) 0', minHeight: 0 }}>
                  <BentoLineChart />
                </div>
                <div>
                  <h3 style={{ ...STRONG, fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.25, color: INK, margin: '0 0 6px' }}>
                    Cover around the clock
                  </h3>
                  <p style={{ ...BODY, fontSize: 'clamp(12.5px, 0.95vw, 13.5px)', lineHeight: 1.65, color: INK_BODY, margin: 0 }}>
                    The command centre is monitored day and night, so help is always ready.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
