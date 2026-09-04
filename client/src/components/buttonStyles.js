// ── One button vocabulary for the two /app pages ───────────────────────────
//
// The previous styles leaned on ink/15–ink/20 borders and 4%-tint fills. Those
// measure 1.37–1.54:1 against the surfaces behind them — far under the 3:1 that
// WCAG 1.4.11 asks of a control's boundary — which is why they read as plain
// text instead of as controls. ink/50 is the first step on that ramp to clear
// it (3.42:1 on white, 3.30:1 on paper, 3.16:1 on the dropzone tint), so every
// outlined control here starts there and never goes fainter.
//
// `cursor-pointer` is deliberate too: Chrome gives <button> `cursor: default`,
// so without it a real button feels inert under the pointer.

const BASE = [
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
  'text-sm font-semibold cursor-pointer',
  'transition-[background-color,border-color,box-shadow,transform] duration-150',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  'active:translate-y-px',
  'disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:shadow-none',
].join(' ');

/** The one action a screen is steering you toward. */
export const buttonPrimary = `${BASE} border border-navy bg-navy px-5 py-2.5 text-white shadow-sm hover:bg-navy/90 hover:shadow-md focus-visible:outline-navy disabled:border-ink/20 disabled:bg-ink/15 disabled:text-ink/45`;

/** A filled but secondary action. */
export const buttonSolid = `${BASE} border border-ink bg-ink px-4 py-2 text-white shadow-sm hover:bg-ink/85 hover:shadow-md focus-visible:outline-navy`;

/** Outlined — still unmistakably a button, thanks to the border and shadow. */
export const buttonOutline = `${BASE} border border-ink/50 bg-white px-4 py-2 text-ink shadow-sm hover:border-ink/70 hover:bg-ink/[0.04] hover:shadow-md focus-visible:outline-navy`;

/** Segmented control: a tray with two pressable segments in it. */
export const tabGroup = 'inline-flex flex-wrap gap-1.5 rounded-lg border border-ink/15 bg-ink/[0.035] p-1.5';

export function tabItem(active) {
  return `${BASE} px-4 py-2 ${
    active
      ? 'border border-ink bg-ink text-white shadow-sm'
      : 'border border-ink/50 bg-white text-slate shadow-sm hover:border-ink/70 hover:bg-ink/[0.04] hover:text-ink'
  }`;
}

/** Sidebar destinations, which were previously bare text. */
export function navItem(active) {
  return `block cursor-pointer rounded-md border px-3 py-2.5 shadow-sm transition-[background-color,border-color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
    active
      ? 'border-crimson/45 bg-crimson/[0.06]'
      : 'border-ink/50 bg-white hover:border-ink/70 hover:bg-ink/[0.04]'
  }`;
}

/** A <select> that looks like something you can open. */
export const selectControl =
  'w-full max-w-md cursor-pointer appearance-none rounded-md border border-ink/50 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-ink shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-ink/70 hover:shadow-md focus:border-navy focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-navy';

// appearance-none strips the native arrow, so the affordance is drawn back on.
export const SELECT_CHEVRON = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2312161c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 8l5 5 5-5'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.7rem center',
  backgroundSize: '1.05rem',
};
