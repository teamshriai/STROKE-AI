import { Link, NavLink } from 'react-router-dom';
import { navItem } from './buttonStyles.js';
import { LogoLink } from './report/ReportPrimitives.jsx';
import { INDOSTATES_URL, SHRI_AI_URL } from '../lib/links.js';

const NAV_ITEMS = [
  { to: '/app', end: true, label: 'Patient Report', hint: 'Acute stroke imaging & triage' },
  {
    to: '/app/brain-haemorrhage-pathway',
    end: false,
    label: 'Brain Haemorrhage Pathway',
    hint: 'Live NCCT model inference',
  },
];

export default function Sidebar() {
  return (
    <aside className="flex w-full flex-none flex-col border-b border-ink/10 bg-paper lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-ink/10 px-5 py-5">
        <Link
          to="/"
          className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
        >
          <img src="/assets/ribbon-mark.png" alt="Stroke-AI" className="h-8 w-8 object-contain" />
          <span className="font-serif text-base font-medium tracking-wide text-ink">Stroke-AI</span>
        </Link>
        <p className="mt-2 text-xs tracking-[0.02em] text-slate/70">Demo console</p>
      </div>

      <nav className="flex flex-col gap-2 px-3 py-4" aria-label="Demo pages">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => navItem(isActive)}
          >
            {({ isActive }) => (
              <>
                <span className={`block text-sm font-semibold ${isActive ? 'text-crimson' : 'text-ink'}`}>
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate">{item.hint}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto hidden border-t border-ink/10 px-5 py-5 lg:block">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate/50">A joint initiative</p>
        <div className="mt-3 flex flex-col items-start gap-4">
          <LogoLink
            href={INDOSTATES_URL}
            src="/assets/logo-indostates.png"
            alt="IndoStates Health Hospital"
            className="w-40 object-contain"
          />
          <LogoLink
            href={SHRI_AI_URL}
            src="/assets/shri-ai-logo-trans.webp"
            alt="SHRI-AI"
            className="w-16 object-contain"
          />
        </div>
      </div>
    </aside>
  );
}
