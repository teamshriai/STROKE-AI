import { useEffect, useRef, useState } from 'react'
import { BODY, STRONG, LABEL, INK, INK_BODY, INK_SUBTLE, RULE, FLOW_AMBER, FLOW_CORAL, EASE } from './theme.js'

/* ═══════════════════════════════════════════════════════════════════
   LaunchAccessForm — the work-email capture that closes the landing
   page, sitting in the footer's signup band. Front-end only: there is no
   lead-capture backend yet, so this validates and confirms locally
   rather than pretending to call an endpoint that doesn't exist.

   Self-contained: it carries its own focus-ring rule so it doesn't
   depend on a class declared by whichever section renders it.
═══════════════════════════════════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LaunchAccessForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | error | success
  const [errorMsg, setErrorMsg] = useState('')
  const timerRef = useRef(null)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function handleSubmit(e) {
    e.preventDefault()
    if (status === 'submitting') return

    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error')
      setErrorMsg('Enter a valid work email address.')
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
        <p role="status" style={{ ...STRONG, color: INK, fontSize: 'clamp(14px, 1.1vw, 16px)', lineHeight: 1.6, margin: 0 }}>
          Thanks — we'll be in touch when Stroke AI is ready for your hospital.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'clamp(10px, 1.6vw, 16px)' }}>
          <label style={{ flex: '1 1 200px', minWidth: 0 }}>
            <span style={{ ...LABEL, color: INK_SUBTLE, display: 'block', marginBottom: '6px' }}>
              Work email
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
              placeholder="you@hospital.org"
              className="sa-launch-field"
              style={{
                ...BODY,
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${status === 'error' ? FLOW_CORAL : RULE}`,
                borderRadius: 0,
                padding: '8px 2px',
                fontSize: 'clamp(14px, 1.1vw, 16px)',
                color: INK,
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
            {status === 'submitting' ? 'Sending…' : 'Request Launch Access'}
          </button>
        </div>
      )}

      {status === 'error' && (
        <p role="alert" style={{ ...BODY, color: FLOW_CORAL, fontSize: '12.5px', margin: '8px 0 0' }}>
          {errorMsg}
        </p>
      )}

      {status !== 'success' && (
        <p style={{ ...BODY, color: INK_BODY, fontSize: '12px', lineHeight: 1.6, margin: '12px 0 0' }}>
          No spam. We'll only reach out when Stroke AI is ready for your hospital.
        </p>
      )}
    </form>
  )
}
