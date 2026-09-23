import { useEffect, useRef, useState } from 'react'
import {
  BODY, STRONG, LABEL, INK, INK_BODY, INK_SUBTLE, RULE,
  ON_DARK, ON_DARK_BODY, ON_DARK_RULE,
  FLOW_AMBER, FLOW_CORAL, EASE,
} from './theme.js'

/* ═══════════════════════════════════════════════════════════════════
   LaunchAccessForm — email capture. Front-end only: there is no
   lead-capture backend yet, so this validates and confirms locally
   rather than pretending to call an endpoint that doesn't exist.

   Used twice, on opposite grounds — the hero's dark blue and the
   footer's cream — so the palette comes from `tone` rather than being
   baked in, and the copy comes from props so neither caller has to fork
   the validation logic.

   Self-contained: it carries its own focus-ring rule so it doesn't
   depend on a class declared by whichever section renders it.
═══════════════════════════════════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PALETTE = {
  light: { text: INK, label: INK_SUBTLE, caption: INK_BODY, rule: RULE },
  dark: { text: ON_DARK, label: ON_DARK_BODY, caption: ON_DARK_BODY, rule: ON_DARK_RULE },
}

export default function LaunchAccessForm({
  tone = 'light',
  label = 'Work email',
  placeholder = 'you@hospital.org',
  submitLabel = 'Connect Your Hospital',
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | error | success
  const [errorMsg, setErrorMsg] = useState('')
  const timerRef = useRef(null)

  const c = PALETTE[tone] ?? PALETTE.light

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function handleSubmit(e) {
    e.preventDefault()
    if (status === 'submitting') return

    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error')
      setErrorMsg('Enter a valid email address.')
      return
    }

    setStatus('submitting')
    setErrorMsg('')
    timerRef.current = window.setTimeout(() => setStatus('success'), 550)
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: '520px' }}>
      <style>{`
        .sa-launch-field:focus-visible,
        .sa-launch-btn:focus-visible {
          outline: 2px solid #5aa9e6;
          outline-offset: 2px;
        }
        .sa-launch-btn:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      {status === 'success' ? (
        <p role="status" style={{ ...STRONG, color: c.text, fontSize: 'clamp(14px, 1.1vw, 16px)', lineHeight: 1.6, margin: 0 }}>
          Thanks — our clinical team will be in touch about bringing Stroke AI to your hospital.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'clamp(10px, 1.6vw, 16px)' }}>
          <label style={{ flex: '1 1 200px', minWidth: 0 }}>
            <span style={{ ...LABEL, color: c.label, display: 'block', marginBottom: '6px' }}>
              {label}
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              placeholder={placeholder}
              className="sa-launch-field"
              style={{
                ...BODY,
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${status === 'error' ? FLOW_CORAL : c.rule}`,
                borderRadius: 0,
                padding: '8px 2px',
                fontSize: 'clamp(14px, 1.1vw, 16px)',
                color: c.text,
                transition: `border-color 0.25s ${EASE}`,
              }}
            />
          </label>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="sa-launch-btn"
            style={{
              ...STRONG,
              flex: '0 0 auto',
              background: FLOW_AMBER,
              color: INK,
              border: 'none',
              borderRadius: '8px',
              padding: '13px 24px',
              fontSize: 'clamp(12.5px, 1vw, 13.5px)',
              letterSpacing: '0.02em',
              cursor: status === 'submitting' ? 'default' : 'pointer',
              opacity: status === 'submitting' ? 0.75 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {status === 'submitting' ? 'Sending…' : submitLabel}
          </button>
        </div>
      )}

      {status === 'error' && (
        <p role="alert" style={{ ...BODY, color: FLOW_CORAL, fontSize: '12.5px', margin: '8px 0 0' }}>
          {errorMsg}
        </p>
      )}

      {status !== 'success' && (
        <p style={{ ...BODY, color: c.caption, fontSize: '12px', lineHeight: 1.6, margin: '12px 0 0' }}>
          No spam. A direct line to the team building AI stroke triage — from the
          emergency call to the thrombectomy table.
        </p>
      )}
    </form>
  )
}
