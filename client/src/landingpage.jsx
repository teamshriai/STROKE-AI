import { useEffect, useRef, useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHRI_AI_URL = 'https://shri-ai.org';
const INDOSTATES_URL = 'https://indostates.com/';

function FadeSection({ children, className = '', ...props }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`fade-section${isVisible ? ' is-visible' : ''} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

function Eyebrow({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px w-8 bg-crimson/40" aria-hidden="true"></span>
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-crimson">{children}</span>
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', state: '' });

  function handleSubmit(e) {
    e.preventDefault();
    const value = email.trim();

    if (!value) {
      setMessage({ text: 'Please enter your email address.', state: 'error' });
      return;
    }

    if (!EMAIL_RE.test(value)) {
      setMessage({ text: "That doesn't look like a valid email address.", state: 'error' });
      return;
    }

    const subject = encodeURIComponent('Notify me at StrokeAI launch');
    const body = encodeURIComponent(`Please notify me when StrokeAI launches.\n\nMy email: ${value}`);
    window.location.href = `mailto:Sena@shri-ai.org?subject=${subject}&body=${body}`;

    setMessage({ text: 'Opening your email app — hit send to join the list.', state: 'success' });
  }

  return (
    <>
      <div className="texture" aria-hidden="true"></div>

      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-6 py-4 sm:px-10 lg:px-12">
          <a
            href={SHRI_AI_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit SHRI-AI"
            className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
          >
            <img src="/assets/logo-shriai.png" alt="SHRI-AI" className="h-9 w-9 rounded-lg object-contain" />
          </a>
          <span className="font-serif text-base font-medium tracking-wide text-ink">Stroke-AI.org</span>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section
          className="relative mx-auto flex max-w-6xl flex-col items-center overflow-hidden px-6 py-24 text-center sm:px-10 lg:px-12"
          style={{ minHeight: '92svh', justifyContent: 'center' }}
        >
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
            style={{ background: 'radial-gradient(560px circle at 50% 28%, var(--color-crimson), transparent 72%)' }}
            aria-hidden="true"
          ></div>

          <div className="mb-14 flex flex-col items-center gap-4 sm:mb-16">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10">
              <a
                href={SHRI_AI_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit SHRI-AI"
                className="flex-none rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
              >
                <img
                  src="/assets/logo-shriai.png"
                  alt="SHRI-AI — AI for Health, Care for All"
                  className="h-24 w-24 flex-none rounded-2xl object-contain sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36"
                />
              </a>
              <span
                className="hidden w-px flex-none bg-ink/15 sm:block sm:h-20 md:h-24 lg:h-28"
                aria-hidden="true"
              ></span>
              <a
                href={INDOSTATES_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit IndoStates Health Hospital"
                className="h-[clamp(56px,20vw,72px)] flex-none overflow-hidden border border-ink/10 shadow-[0_10px_30px_rgba(18,22,28,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson sm:h-20 md:h-24 lg:h-28"
                style={{ aspectRatio: '1024 / 548' }}
              >
                <img
                  src="/assets/indostates1.webp"
                  alt="IndoStates Health Hospital"
                  className="h-full w-full scale-110 object-cover"
                />
              </a>
            </div>
            <p className="text-center text-xs font-light tracking-[0.02em] text-slate/70 sm:text-sm">
              Working together to detect stroke earlier and act faster
            </p>
          </div>

          <h1 className="mx-auto max-w-3xl text-balance font-sans text-[clamp(2.2rem,5.2vw,4rem)] font-light leading-[1.05] tracking-[-0.03em] text-ink">
            AI for Stroke.
            <br />
            Helping <span className="hero-em text-shimmer">Every Second</span> Count.
          </h1>
          <p className="mx-auto mt-7 max-w-[50ch] text-[clamp(1.02rem,1.6vw,1.2rem)] leading-relaxed text-slate">
            A mobile alert triggers <strong className="font-medium text-ink">AI-guided diagnosis in transit</strong>{' '}
            and a <strong className="font-medium text-ink">coordinated ambulance response</strong> &mdash; racing
            every second of the stroke golden hour.
          </p>

          <div className="mt-12 inline-flex items-center gap-3 rounded-full border border-crimson/25 bg-crimson/[0.06] px-5 py-2.5 shadow-[0_1px_3px_rgba(199,53,90,0.08)]">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-60"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-crimson"></span>
            </span>
            <span className="text-[0.8rem] font-medium uppercase tracking-[0.22em] text-crimson">Launching Soon</span>
          </div>

          <form className="mx-auto mt-6 w-full max-w-md" onSubmit={handleSubmit} noValidate>
            <div className="flex items-stretch overflow-hidden rounded-sm border border-ink/15 bg-white/80 transition-colors focus-within:border-ink/40">
              <label htmlFor="notify-email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="notify-email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[0.95rem] text-ink placeholder:text-slate/50 focus:outline-none sm:px-5"
              />
              <button
                type="submit"
                className="flex-none whitespace-nowrap border-l border-ink/15 bg-ink px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-crimson focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson sm:px-7"
              >
                Notify Me at Launch
              </button>
            </div>
            <p
              className={`mt-3 min-h-[1.4em] text-left text-sm ${
                message.state === 'error' ? 'text-crimson' : message.state === 'success' ? 'text-gold' : 'text-transparent'
              }`}
              role="status"
              aria-live="polite"
            >
              {message.text || ' '}
            </p>
          </form>
        </section>

        {/* WHY IT MATTERS */}
        <FadeSection className="mx-auto max-w-6xl border-t border-ink/10 px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
            <div>
              <Eyebrow>Why It Matters</Eyebrow>
              <h2 className="mt-4 font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
                Time is brain.
              </h2>
            </div>
            <div>
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                <div>
                  <p className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] font-medium leading-none text-ink">1.9M</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-slate">
                    Neurons lost, on average, for every minute a stroke goes untreated.
                  </p>
                </div>
                <div>
                  <p className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] font-medium leading-none text-ink">60 min</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-slate">
                    The golden hour clinicians race against, from first symptom to first treatment.
                  </p>
                </div>
              </div>
              <p className="mt-10 max-w-[62ch] text-[0.95rem] leading-relaxed text-slate">
                Every layer of delay &mdash; recognizing symptoms, reaching a hospital, reading a scan &mdash;
                compounds against the clock. StrokeAI is built to collapse that delay into a single, coordinated
                response.
              </p>
              <p className="mt-6 text-xs tracking-[0.04em] text-slate/50">
                Source: Saver, J.L., &ldquo;Time Is Brain &mdash; Quantified,&rdquo; <em>Stroke</em>, 2006.
              </p>
            </div>
          </div>
        </FadeSection>

        {/* VISION */}
        <FadeSection className="mx-auto max-w-6xl border-t border-ink/10 px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
          <div className="mb-14">
            <Eyebrow>What We&rsquo;re Building</Eyebrow>
            <h2 className="mt-4 max-w-xl font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
              Every second is designed for.
            </h2>
          </div>

          <div className="grid grid-cols-1 divide-y divide-ink/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="flex flex-col gap-4 py-8 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
              <span className="font-serif text-sm italic text-ink/30">01</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-crimson)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
                <path d="M12 18h.01" />
                <path d="M6 9h3l2-3 2 6 2-3h3" />
              </svg>
              <h3 className="font-serif text-lg font-medium text-ink">Alert reaches help in seconds</h3>
              <p className="text-[0.95rem] leading-relaxed text-slate">
                A single tap from the mobile app instantly notifies the Command Center, nearest ambulance, and scan lab at once.
              </p>
            </div>
            <div className="flex flex-col gap-4 py-8 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
              <span className="font-serif text-sm italic text-ink/30">02</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              <h3 className="font-serif text-lg font-medium text-ink">AI reads the scan in transit</h3>
              <p className="text-[0.95rem] leading-relaxed text-slate">
                CT/MRI imaging is analyzed by AI alongside a radiologist while the patient is still on the way to the lab.
              </p>
            </div>
            <div className="flex flex-col gap-4 py-8 first:pt-0 md:px-8 md:py-0 md:first:pl-0 md:last:pr-0">
              <span className="font-serif text-sm italic text-ink/30">03</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M3 17h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H3v10Z" />
                <path d="M7 17h9V6H7" />
                <path d="M16 10h3l2 3v4h-2" />
                <circle cx="8.5" cy="18.5" r="1.5" />
                <circle cx="17.5" cy="18.5" r="1.5" />
              </svg>
              <h3 className="font-serif text-lg font-medium text-ink">Treatment begins before arrival</h3>
              <p className="text-[0.95rem] leading-relaxed text-slate">
                A therapy decision is finalized en-route, so medication starts inside the Stroke AI Ambulance &mdash; not after admission.
              </p>
            </div>
          </div>
        </FadeSection>

        {/* ABOUT */}
        <FadeSection className="mx-auto max-w-6xl border-t border-ink/10 px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
            <div>
              <Eyebrow>Our Team</Eyebrow>
              <h2 className="mt-4 font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
                One mission, two teams.
              </h2>
            </div>
            <div className="flex flex-col gap-6 text-base leading-relaxed text-slate lg:text-[1.05rem]">
              <p>
                <strong className="font-medium text-ink">SHRI-AI</strong> brings the AI and telehealth technology
                behind &ldquo;AI for Health, Care for All&rdquo; &mdash; imaging models, real-time coordination
                software, and the mobile platform patients and bystanders will actually use.
              </p>
              <p>
                <strong className="font-medium text-ink">IndoStates Health Hospital</strong> brings the clinical
                and hospital network behind &ldquo;Prevent, Screen, Treat&rdquo; &mdash; decades of frontline
                emergency and neurology care, and the ambulance and scan-lab partnerships a stroke response depends
                on.
              </p>
              <p>
                Together, we&rsquo;re building India&rsquo;s first mobile stroke-response network &mdash; combining
                telehealth, AI-assisted imaging, and a coordinated ambulance network into a single race against the
                clock.
              </p>
            </div>
          </div>
        </FadeSection>

        {/* GET INVOLVED */}
        <FadeSection className="mx-auto max-w-6xl border-t border-ink/10 px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
            <div>
              <Eyebrow>Get Involved</Eyebrow>
              <h2 className="mt-4 font-serif text-[clamp(1.6rem,3vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
                Building this with us?
              </h2>
            </div>
            <div className="flex flex-col items-start gap-6">
              <p className="max-w-[62ch] text-base leading-relaxed text-slate lg:text-[1.05rem]">
                Hospitals, ambulance networks, and health-tech partners interested in the pilot are welcome to reach
                our team directly &mdash; we&rsquo;re assembling the launch network now.
              </p>
              <a
                href="mailto:Sena@shri-ai.org?subject=Partnership%20inquiry%20%E2%80%94%20StrokeAI"
                className="inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-medium text-ink transition-colors hover:border-crimson hover:text-crimson"
              >
                Partner with us
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </FadeSection>
      </main>

      <footer className="relative z-10 border-t border-ink/10 px-6 py-14 text-center sm:px-10 lg:px-12">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-9">
          <a
            href={SHRI_AI_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit SHRI-AI"
            className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
          >
            <img
              src="/assets/logo-shriai.png"
              alt="SHRI-AI"
              className="w-16 rounded-xl object-contain transition-transform duration-300 hover:scale-105"
            />
          </a>
          <a
            href={INDOSTATES_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit IndoStates Health Hospital"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
          >
            <img
              src="/assets/logo-indostates.png"
              alt="IndoStates Health Hospital"
              className="w-[160px] transition-transform duration-300 hover:scale-105"
            />
          </a>
        </div>
        <p className="my-1.5 text-sm text-slate/80">
          A joint initiative of{' '}
          <a
            href={SHRI_AI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink underline decoration-ink/25 underline-offset-2 transition-colors hover:text-crimson hover:decoration-crimson"
          >
            SHRI-AI
          </a>{' '}
          and{' '}
          <a
            href={INDOSTATES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink underline decoration-ink/25 underline-offset-2 transition-colors hover:text-crimson hover:decoration-crimson"
          >
            IndoStates Health Hospital
          </a>
        </p>
        <p className="my-1.5 text-sm text-slate/80">&copy; 2026 StrokeAI. All rights reserved.</p>
      </footer>
    </>
  );
}
