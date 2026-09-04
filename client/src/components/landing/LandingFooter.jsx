import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import BrandMark from '../common/BrandMark.jsx'
import LaunchAccessForm from './LaunchAccessForm.jsx'
import { DISPLAY, BODY, STRONG, LABEL, CREAM, PAPER, INK, INK_BODY, INK_SUBTLE, RULE, FLOW_AMBER, FLOW_BLUE, EASE } from './theme.js'

/* ═══════════════════════════════════════════════════════════════════
   LandingFooter — closing call to action, then the site rails.

     ┌─────────────────────────────────────────────────────────────┐
     │  Get Stroke AI ready                        [ Get Started ] │
     ├─────────────────────────────────────────────────────────────┤  ← hairline
     │  ✳ Stroke AI          QUICK LINKS          GLOBAL REACH      │
     │  contact details      Our Command Centre…  map + HQ + reach  │
     ├─────────────────────────────────────────────────────────────┤  ← hairline
     │                       A joint initiative … © year Stroke AI │
     └─────────────────────────────────────────────────────────────┘

   The 3-column site rail borrows its layout from SHRI-AI's own site (a
   partner org behind this programme) — same shape of contact/nav/reach
   columns and the same HQ contact details — but stays on Stroke AI's own
   light cream ground rather than SHRI-AI's dark one, matching the rest of
   this page.
═══════════════════════════════════════════════════════════════════ */

/* ── Reusable nav link ─────────────────────────────────────────── */
function FooterLink({ href, to, children }) {
  const base = {
    ...BODY,
    fontSize: '13.5px',
    color: INK_BODY,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: `color 0.18s ${EASE}`,
  }
  const hoverIn = e => { e.currentTarget.style.color = INK }
  const hoverOut = e => { e.currentTarget.style.color = INK_BODY }

  if (to) {
    return (
      <Link to={to} style={base} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} style={base} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {children}
    </a>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <>
      <style>{`
        .nf-hero-wrap {
          max-width: 1320px;
          margin: 0 auto;
          padding: clamp(3rem, 6vw, 5rem) clamp(1.25rem, 3vw, 2.5rem) clamp(2.5rem, 5vw, 3.5rem);
        }
        .nf-hero-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: clamp(1.5rem, 4vw, 3rem);
        }
        .nf-top-row {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 3vw, 2.5rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          min-height: 76px;
        }
        .nf-site-nav {
          display: flex;
          align-items: center;
          gap: clamp(1rem, 2.2vw, 2rem);
          flex-wrap: wrap;
        }
        .nf-bottom-wrap {
          max-width: 1320px;
          margin: 0 auto;
          padding: clamp(1.5rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2.5rem);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }
        .nf-cta-btn:focus-visible {
          outline: 2px solid #5aa9e6;
          outline-offset: 3px;
        }

        .nf-rail-wrap {
          max-width: 1320px;
          margin: 0 auto;
          padding: clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 3vw, 2.5rem);
        }
        .nf-rail-grid {
          display: grid;
          gap: clamp(2rem, 4vw, 3rem);
          grid-template-columns: 1.15fr 0.85fr 1.1fr;
        }
        .nf-contact-row, .nf-reach-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: ${PAPER};
          border: 1px solid ${RULE};
          border-radius: 10px;
          padding: 12px 14px;
        }
        .nf-rail-nav {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(10px, 1.6vw, 14px);
        }
        .nf-map-frame {
          display: block;
          width: 100%;
          height: 150px;
          border: 1px solid ${RULE};
          border-radius: 10px;
        }

        @media (max-width: 900px) {
          .nf-rail-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .nf-hero-row { flex-direction: column; align-items: flex-start; }
          .nf-rail-grid { grid-template-columns: 1fr; }
          .nf-bottom-wrap { align-items: flex-start; }
        }
      `}</style>

      <div style={{ width: '100%', background: CREAM, borderTop: `1px solid ${RULE}` }}>

        {/* ════ Closing call to action ═══════════════════════════════ */}
        <section id="signup" aria-labelledby="nf-signup-heading">
          <div className="nf-hero-wrap">
            <div className="nf-hero-row">
              <div>
                <h2
                  id="nf-signup-heading"
                  style={{
                    ...DISPLAY,
                    fontSize: 'clamp(2rem, 4.6vw, 3.4rem)',
                    letterSpacing: '-0.012em',
                    lineHeight: 1.06,
                    color: INK,
                    margin: '0 0 14px',
                    maxWidth: '16ch',
                  }}
                >
                  Together, We Can Make a Difference.
                </h2>
                <p style={{ ...BODY, fontSize: 'clamp(13.5px, 1.15vw, 15.5px)', lineHeight: 1.7, color: INK_BODY, margin: 0, maxWidth: '48ch' }}>
                  Bringing AI-powered stroke detection and faster clinical action to every hospital.
                </p>
                <p style={{ ...BODY, fontSize: '13px', lineHeight: 1.7, color: INK_BODY, margin: '16px 0 0', maxWidth: '48ch' }}>
                  Building this with us? Hospitals, ambulance networks, and health-tech partners are
                  welcome to reach our team directly —{' '}
                  <a
                    href="mailto:partner@stroke-ai.org"
                    style={{ ...STRONG, color: INK, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    partner with us →
                  </a>
                </p>
              </div>

              <Link
                to="/app"
                className="nf-cta-btn"
                style={{
                  ...STRONG,
                  fontSize: '13.5px',
                  color: PAPER,
                  background: INK,
                  border: `1px solid ${INK}`,
                  borderRadius: '8px',
                  padding: '14px 30px',
                  width: 'fit-content',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: `background 0.2s ${EASE}, color 0.2s ${EASE}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = INK }}
                onMouseLeave={e => { e.currentTarget.style.background = INK; e.currentTarget.style.color = PAPER }}
              >
                Get Connected
              </Link>
            </div>

            {/* Launch-access capture — moved here from the hero, so the page
                opens with the promise and closes with the ask. */}
            <div style={{ marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
              <LaunchAccessForm />
            </div>
          </div>
        </section>

        <footer role="contentinfo" aria-label="Stroke AI site footer" style={{ width: '100%' }}>

          {/* ════ Site rail ══════════════════════════════════════════
              Layout modelled on SHRI-AI's own site footer: brand + contact,
              quick links, global reach — see the file header comment. */}
          <div style={{ borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
            <div className="nf-rail-wrap">
              <div className="nf-rail-grid">

                {/* ── Brand & contact ── */}
                <div>
                  <Link
                    to="/"
                    aria-label="Stroke AI — return to homepage"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      textDecoration: 'none', userSelect: 'none', marginBottom: '14px',
                    }}
                  >
                    <BrandMark size={16} />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                      <span style={{ ...STRONG, fontSize: '13px', color: INK }}>Stroke AI</span>
                      <span style={{ ...BODY, fontSize: '11.5px', letterSpacing: '0.04em', color: INK_BODY }}>
                        Emergency Response
                      </span>
                    </div>
                  </Link>

                  <p style={{ ...BODY, fontSize: '13px', lineHeight: 1.7, color: INK_BODY, margin: '0 0 16px', maxWidth: '40ch' }}>
                    The intelligent command centre for stroke care — connecting patients,
                    ambulances, labs, and hospitals in real time.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <a href="mailto:info@shri-ai.org" className="nf-contact-row" style={{ textDecoration: 'none' }}>
                      <Mail size={16} color={INK_BODY} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ ...BODY, fontSize: '13px', color: INK }}>info@shri-ai.org</span>
                    </a>
                    <a href="tel:+14086664320" className="nf-contact-row" style={{ textDecoration: 'none' }}>
                      <Phone size={16} color={INK_BODY} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ ...BODY, fontSize: '13px', color: INK }}>+1 408 666 4320</span>
                    </a>
                  </div>
                </div>

                {/* ── Quick links ── */}
                <div>
                  <span style={{ ...LABEL, color: INK_SUBTLE, display: 'block', marginBottom: '16px' }}>
                    Quick Links
                  </span>
                  <nav aria-label="Footer site navigation" className="nf-rail-nav">
                    <FooterLink href="#services">Our Command Centre</FooterLink>
                    <FooterLink href="#how-it-works">Why It Matters</FooterLink>
                    <FooterLink href="#team">Our Team</FooterLink>
                    <FooterLink to="/app">Sign in</FooterLink>
                  </nav>
                </div>

                {/* ── Global reach ── */}
                <div>
                  <span style={{ ...LABEL, color: INK_SUBTLE, display: 'block', marginBottom: '16px' }}>
                    Global Reach
                  </span>
                  <iframe
                    className="nf-map-frame"
                    title="Map of Stroke AI's USA headquarters"
                    src="https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s6559+Springpath+Lane,+San+Jose,+CA+95120"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="nf-reach-card">
                      <MapPin size={16} color={FLOW_AMBER} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <div style={{ ...STRONG, fontSize: '12.5px', color: INK, marginBottom: '2px' }}>USA Headquarters</div>
                        <div style={{ ...BODY, fontSize: '12.5px', lineHeight: 1.55, color: INK_BODY }}>
                          6559 Springpath Lane, San Jose, CA 95120, USA
                        </div>
                      </div>
                    </div>
                    <div className="nf-reach-card">
                      <Globe size={16} color={FLOW_BLUE} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <div style={{ ...STRONG, fontSize: '12.5px', color: INK, marginBottom: '2px' }}>Globally Available</div>
                        <div style={{ ...BODY, fontSize: '12.5px', lineHeight: 1.55, color: INK_BODY }}>
                          Advancing real-time stroke response through worldwide hospital and ambulance partnerships.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ════ Fine print ═══════════════════════════════════════════ */}
          <div className="nf-bottom-wrap">
            <p style={{ ...BODY, fontSize: '11.5px', color: INK_BODY, margin: 0, lineHeight: 1.6 }}>
              A joint initiative of SHRI-AI and IndoStates Health Hospital
            </p>
            <p style={{ ...BODY, fontSize: '11.5px', color: INK_SUBTLE, margin: 0, lineHeight: 1.6 }}>
              © {year} Stroke AI. All rights reserved.
            </p>
          </div>

        </footer>
      </div>
    </>
  )
}
