import { Link } from 'react-router-dom';
import CoreGrowthChart from '../components/report/CoreGrowthChart.jsx';
import LesionDonut from '../components/report/LesionDonut.jsx';
import OcclusionProbabilityBars from '../components/report/OcclusionProbabilityBars.jsx';
import {
  CriteriaList,
  DataList,
  FindingsTable,
  LogoLink,
  Panel,
  StatTile,
  StatusPill,
} from '../components/report/ReportPrimitives.jsx';
import { INDOSTATES_URL, SHRI_AI_URL } from '../lib/links.js';

// Static demonstration report. Every value below belongs to the published
// sample case (SA-2026-0871) — this page is a design/product artefact, not a
// live model output. The working model demo lives on the Brain Haemorrhage
// Pathway page.

const HEADLINE_STATS = [
  { label: 'Triage priority', value: 'P1', unit: 'immediate', note: 'Thrombectomy team pre-alerted', tone: 'crimson' },
  { label: 'Onset → report', value: '57', unit: 'min', note: 'Inside both treatment windows', tone: 'verdant' },
  { label: 'Presenting NIHSS', value: '14', note: 'Moderate–severe deficit', tone: 'navy' },
  { label: 'ASPECTS', value: '8', unit: '/ 10', note: 'Above the threshold of 6', tone: 'gold' },
  { label: 'Infarct core', value: '18', unit: 'mL', note: 'Small — favourable', tone: 'crimson' },
  { label: 'Mismatch ratio', value: '4.8', unit: '×', note: 'DEFUSE-3 met (> 1.8)', tone: 'navy' },
];

const PATIENT_ROWS = [
  { label: 'Patient ID', value: 'SA-2026-0871' },
  { label: 'Age / Sex', value: '63 y / Male' },
  { label: 'Alert source', value: 'Stroke-AI mobile app (bystander)' },
  { label: 'Symptom onset', value: '08:50 IST · 25-Aug-2026' },
  { label: 'Presenting NIHSS', value: '14 (moderate–severe)' },
  { label: 'BP / Glucose', value: '168/94 mmHg · 122 mg/dL' },
  { label: 'Anticoagulants', value: 'None reported' },
  { label: 'Scan centre', value: 'IndoStates spoke — Pollachi' },
  { label: 'Receiving hub', value: 'IndoStates Comprehensive Stroke Centre, Coimbatore' },
];

const TIMELINE = [
  { time: '08:50', event: 'Symptom onset (witnessed)', delta: 'T+0', tone: 'crimson' },
  { time: '08:56', event: 'App alert → Command Centre', delta: '+6 min', tone: 'navy' },
  { time: '09:04', event: 'Ambulance dispatched, arrives 09:12', delta: '+14 min', tone: 'navy' },
  { time: '09:26', event: 'NCCT + CTA + CTP acquired (spoke)', delta: '+36 min', tone: 'navy' },
  { time: '09:31', event: 'AI analysis complete → hub notified', delta: '+41 min', tone: 'crimson' },
  { time: '09:39', event: 'Thrombectomy team activated', delta: '+49 min', tone: 'gold' },
  { time: '09:47', event: 'Report finalised, patient en route to hub', delta: '+57 min', tone: 'verdant' },
];

const DOT_TONES = {
  crimson: 'bg-crimson',
  navy: 'bg-navy',
  gold: 'bg-gold',
  verdant: 'bg-verdant',
};

const NCCT_ROWS = [
  {
    finding: 'Intracranial haemorrhage (ICH)',
    result: 'Negative',
    tone: 'verdant',
    confidence: '0.98',
    radiologist: 'Concordant',
    interpretation: 'No acute blood — thrombolysis not excluded',
  },
  {
    finding: 'IPH / IVH / SDH / EDH / SAH',
    result: 'All negative',
    tone: 'verdant',
    confidence: '0.95–0.99',
    radiologist: 'Concordant',
    interpretation: 'No subtype-specific haemorrhage',
  },
  {
    finding: 'ASPECTS score',
    result: '8 / 10',
    tone: 'gold',
    confidence: '0.89',
    radiologist: 'Concordant',
    interpretation: 'Early ischaemic change: insula, M2',
  },
  {
    finding: 'Midline shift',
    result: '0.0 mm',
    tone: 'verdant',
    confidence: '0.97',
    radiologist: 'Concordant',
    interpretation: 'No mass effect',
  },
  {
    finding: 'Mass effect',
    result: 'Absent',
    tone: 'verdant',
    confidence: '0.96',
    radiologist: 'Concordant',
    interpretation: 'No herniation risk at present',
  },
  {
    finding: 'Hyperdense vessel sign',
    result: 'Present — left MCA',
    tone: 'crimson',
    confidence: '0.91',
    radiologist: 'Concordant',
    interpretation: 'Supports acute thrombus in M1',
  },
];

const CTA_ROWS = [
  {
    finding: 'Large vessel occlusion',
    result: 'Positive',
    tone: 'crimson',
    confidence: '0.94',
    radiologist: 'Concordant',
    interpretation: 'Thrombectomy candidate',
  },
  {
    finding: 'Occlusion site',
    result: 'Left MCA — M1',
    tone: 'crimson',
    confidence: '0.92',
    radiologist: 'Concordant',
    interpretation: 'Proximal, retrievable',
  },
  {
    finding: 'Laterality',
    result: 'Left hemisphere',
    tone: 'navy',
    confidence: '0.99',
    radiologist: 'Concordant',
    interpretation: 'Right-sided deficit expected',
  },
  {
    finding: 'Clot length',
    result: '11 mm',
    tone: 'gold',
    confidence: '0.86',
    radiologist: 'Concordant',
    interpretation: 'Favourable for retrieval',
  },
  {
    finding: 'Collateral score',
    result: '2 / 3 — moderate',
    tone: 'gold',
    confidence: '0.83',
    radiologist: 'Concordant',
    interpretation: 'Supports slower core growth',
  },
  {
    finding: 'Circle of Willis',
    result: 'Complete anterior',
    tone: 'verdant',
    confidence: '0.90',
    radiologist: 'Concordant',
    interpretation: 'Some cross-flow protection',
  },
  {
    finding: 'ICA / carotid stenosis',
    result: 'None significant',
    tone: 'verdant',
    confidence: '0.93',
    radiologist: 'Concordant',
    interpretation: 'Access route clear',
  },
  {
    finding: 'Basilar / vertebral',
    result: 'Patent',
    tone: 'verdant',
    confidence: '0.97',
    radiologist: 'Concordant',
    interpretation: 'No posterior involvement',
  },
];

const CTP_METRICS = [
  { metric: 'Infarct core (rCBF < 30%)', value: '18 mL', interpretation: 'Small core — favourable', tone: 'crimson' },
  { metric: 'Penumbra (Tmax > 6 s)', value: '86 mL', interpretation: 'Large salvageable volume', tone: 'gold' },
  { metric: 'Mismatch volume', value: '68 mL', interpretation: 'Substantial tissue at risk', tone: 'gold' },
  { metric: 'Mismatch ratio', value: '4.8×', interpretation: 'DEFUSE-3 criteria met (> 1.8)', tone: 'verdant' },
  { metric: 'Hypoperfusion index', value: '0.32', interpretation: 'Favourable collateral profile', tone: 'verdant' },
  { metric: 'CBV index', value: '0.84', interpretation: 'Good tissue viability', tone: 'verdant' },
];

const VALUE_TONES = {
  crimson: 'text-crimson',
  gold: 'text-gold',
  verdant: 'text-verdant',
  navy: 'text-navy',
};

const OCCLUSION_PROBABILITIES = [
  { label: 'Left MCA — M1', probability: 0.94 },
  { label: 'Left MCA — M2', probability: 0.31 },
  { label: 'Left ICA terminus', probability: 0.12 },
  { label: 'No LVO', probability: 0.06 },
  { label: 'Basilar artery', probability: 0.03 },
  { label: 'Right MCA — M1', probability: 0.02 },
];

const GROWTH_SERIES = [
  {
    label: 'Stroke-AI pathway (this patient)',
    color: 'var(--color-crimson)',
    points: [
      { x: 0, y: 0 },
      { x: 57, y: 18 },
      { x: 110, y: 27 },
      { x: 160, y: 32 },
      { x: 240, y: 34 },
    ],
  },
  {
    label: 'Conventional referral (modelled)',
    color: 'var(--color-navy)',
    dashed: true,
    points: [
      { x: 0, y: 0 },
      { x: 57, y: 18 },
      { x: 110, y: 42 },
      { x: 160, y: 63 },
      { x: 240, y: 96 },
    ],
  },
];

const GROWTH_STATS = [
  { label: 'Tissue preserved', value: '62 mL', tone: 'text-verdant' },
  { label: 'Final core — Stroke-AI', value: '34 mL', tone: 'text-crimson' },
  { label: 'Final core — conventional', value: '96 mL', tone: 'text-navy' },
  { label: 'Time saved', value: '74 min', tone: 'text-verdant' },
  { label: 'Collateral grade', value: 'Moderate (2/3)', tone: 'text-gold' },
];

const THROMBOLYSIS_CRITERIA = [
  'Onset 57 min — within the 4.5 h window',
  'No haemorrhage on NCCT (AI 0.98, radiologist-confirmed)',
  'NIHSS 14 — deficit not minor',
  'BP 168/94 — below the 185/110 threshold',
  'No anticoagulant use reported',
  'Glucose 122 mg/dL — within range',
];

const THROMBECTOMY_CRITERIA = [
  'LVO confirmed — left M1 (AI 0.94)',
  'ASPECTS 8 — above the threshold of 6',
  'Mismatch ratio 4.8× — DEFUSE-3 met',
  'Core 18 mL — under the 70 mL limit',
  'Onset-to-groin projected under 6 h',
  'Pre-stroke mRS 0 — functionally independent',
];

const HANDOVER = [
  { time: '09:12', intervention: 'IV access, bloods drawn, cardiac monitor', by: 'Paramedic' },
  { time: '09:18', intervention: 'BP 168/94 — no acute lowering required', by: 'Paramedic' },
  { time: '09:26', intervention: 'Imaging acquired at spoke, auto-uploaded', by: 'Radiographer' },
  { time: '09:31', intervention: 'AI analysis complete — hub neurologist notified', by: 'Stroke-AI' },
  { time: '09:35', intervention: 'Teleconsult: thrombolysis consent obtained', by: 'Hub neurologist' },
  { time: '09:39', intervention: 'Thrombectomy suite + team activated', by: 'Hub coordinator' },
  { time: '09:47', intervention: 'Handover pack transmitted to receiving hub', by: 'Stroke-AI' },
];

const SIGNATURES = [
  { role: 'Reporting radiologist', org: 'IndoStates Radiology', tone: 'border-navy/25' },
  { role: 'Mobile AI doctor', org: 'Stroke-AI Command Centre', tone: 'border-crimson/25' },
  { role: 'Receiving team', org: 'Comprehensive Stroke Centre', tone: 'border-gold/25' },
];

const HEADER_GRADIENT = {
  background:
    'linear-gradient(115deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-navy) 45%, var(--color-ink)) 45%, color-mix(in srgb, var(--color-navy) 82%, var(--color-ink)) 78%, color-mix(in srgb, var(--color-crimson) 55%, var(--color-navy)) 100%)',
};

export default function PatientReportPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <article className="overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_10px_40px_rgba(18,22,28,0.06)]">
        {/* ── Report header ─────────────────────────────────────────── */}
        <header className="px-6 py-7 text-white sm:px-9 sm:py-8" style={HEADER_GRADIENT}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              >
                <img src="/assets/ribbon-mark.png" alt="Stroke-AI" className="h-7 w-7 flex-none object-contain" />
                <span className="text-xs font-medium uppercase tracking-[0.28em] text-white/80">Stroke-AI</span>
              </Link>
              <h1 className="mt-4 font-serif text-[clamp(1.35rem,3vw,1.95rem)] font-medium leading-tight tracking-tight">
                Acute Stroke Imaging &amp; Triage Report
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                AI-assisted NCCT · CTA · CT Perfusion · MRA — hub-and-spoke emergency pathway
              </p>
            </div>

            <div className="flex flex-none flex-col gap-3 sm:items-end">
              <div className="text-left sm:text-right">
                <p className="font-serif text-base font-medium tracking-wide">Stroke-AI</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-white/60">Anywhere · Anytime</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/95 px-3 py-2">
                <LogoLink
                  href={INDOSTATES_URL}
                  src="/assets/logo-indostates.png"
                  alt="IndoStates Health Hospital"
                  className="w-28 object-contain"
                />
                <span className="h-7 w-px bg-ink/15" aria-hidden="true" />
                <LogoLink
                  href={SHRI_AI_URL}
                  src="/assets/shri-ai-logo-trans.webp"
                  alt="SHRI-AI"
                  className="w-9 object-contain"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-5 px-4 py-6 sm:px-7 sm:py-8">
          {/* ── Headline numbers ────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {HEADLINE_STATS.map((stat) => (
              <StatTile key={stat.label} {...stat} />
            ))}
          </div>

          {/* ── Triage verdict ──────────────────────────────────────── */}
          <section className="rounded-xl border border-crimson/30 bg-gradient-to-br from-crimson/[0.09] via-crimson/[0.04] to-navy/[0.05] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-crimson">
                  AI triage verdict — decision support
                </p>
                <h2 className="mt-3 font-serif text-[clamp(1.2rem,2.6vw,1.75rem)] font-medium leading-tight text-ink">
                  Ischemic stroke ·{' '}
                  <span className="text-crimson">large vessel occlusion</span>
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">
                  Left MCA (M1) occlusion with salvageable penumbra. No haemorrhage on NCCT — thrombolysis not
                  contraindicated by imaging. Patient meets criteria for both IV thrombolysis and mechanical
                  thrombectomy.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill tone="crimson">LVO positive</StatusPill>
                  <StatusPill tone="verdant">ICH negative</StatusPill>
                  <StatusPill tone="gold">ASPECTS 8</StatusPill>
                  <StatusPill tone="navy">Mismatch 4.8×</StatusPill>
                  <StatusPill tone="slate">AI conf 0.94</StatusPill>
                </div>
              </div>

              <div className="flex-none rounded-xl bg-crimson px-7 py-5 text-center text-white shadow-[0_8px_24px_rgba(199,53,90,0.25)] lg:w-64">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/75">Triage priority</p>
                <p className="mt-2 font-serif text-[1.8rem] font-medium leading-none">P1 Immediate</p>
                <p className="mt-3 text-xs leading-relaxed text-white/80">Thrombectomy team pre-alerted at 09:39</p>
              </div>
            </div>
          </section>

          {/* ── Visual analysis, front and centre ───────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Ischemic territory composition (CTP)" accent="gold">
              <LesionDonut
                totalValue="104 mL"
                totalLabel="Total lesion"
                segments={[
                  { label: 'Infarct core', note: 'Irreversible', value: 18, color: 'var(--color-crimson)' },
                  {
                    label: 'Penumbra',
                    note: 'Salvageable with reperfusion',
                    value: 86,
                    color: 'var(--color-gold)',
                  },
                ]}
              />
              <p className="mt-5 border-t border-ink/[0.07] pt-4 text-sm leading-relaxed text-slate">
                Mismatch ratio <strong className="font-medium text-verdant">4.8×</strong> — well above the 1.8×
                DEFUSE-3 threshold. <strong className="font-medium text-gold">86 mL</strong> of brain tissue remains
                salvageable if reperfusion is achieved promptly.
              </p>
            </Panel>

            <Panel title="Occlusion site probability (CTA model)" accent="crimson">
              <OcclusionProbabilityBars items={OCCLUSION_PROBABILITIES} />
              <p className="mt-5 border-t border-ink/[0.07] pt-4 text-sm leading-relaxed text-slate">
                <strong className="font-medium text-crimson">M1 occlusion</strong> is the model&rsquo;s dominant call,
                consistent with the hyperdense vessel sign on NCCT and the perfusion deficit territory.
              </p>
            </Panel>
          </div>

          <Panel title="Time-is-brain projection" accent="navy">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px] lg:gap-8">
              <CoreGrowthChart
                series={GROWTH_SERIES}
                xMax={240}
                yMax={100}
                xLabel="Minutes from onset"
                yLabel="Infarct core (mL)"
              />
              <div className="flex flex-col divide-y divide-ink/[0.07] lg:border-l lg:border-ink/[0.07] lg:pl-6">
                {GROWTH_STATS.map((stat) => (
                  <div key={stat.label} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs uppercase tracking-[0.1em] text-slate/70">{stat.label}</p>
                    <p className={`mt-1 font-serif text-lg font-medium tabular-nums ${stat.tone}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 border-t border-ink/[0.07] pt-4 text-sm leading-relaxed text-slate">
              Modelled projection based on collateral grade and observed core growth rate — illustrative, not a
              patient-specific guarantee.
            </p>
          </Panel>

          {/* ── Patient & timeline ──────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Patient &amp; event" accent="navy">
              <DataList rows={PATIENT_ROWS} />
            </Panel>

            <Panel title="Golden-hour timeline" accent="verdant">
              <ol className="divide-y divide-ink/[0.07]">
                {TIMELINE.map((step) => (
                  <li key={step.time} className="flex items-baseline gap-3 py-2 first:pt-0 last:pb-0">
                    <span
                      className={`mt-1.5 h-2 w-2 flex-none rounded-full ${DOT_TONES[step.tone]}`}
                      aria-hidden="true"
                    />
                    <span className="w-12 flex-none font-serif text-sm tabular-nums text-ink">{step.time}</span>
                    <span className="min-w-0 flex-1 text-sm text-slate">{step.event}</span>
                    <span className="flex-none text-xs tabular-nums text-slate/60">{step.delta}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-lg bg-verdant/10 px-4 py-3 text-sm text-verdant ring-1 ring-inset ring-verdant/20">
                <strong className="font-medium">57 min from onset</strong> — within the 4.5 h thrombolysis and 6 h
                thrombectomy windows.
              </p>
            </Panel>
          </div>

          {/* ── Modality tables ─────────────────────────────────────── */}
          <Panel title="Non-contrast CT (NCCT) — AI analysis" accent="navy">
            <FindingsTable
              columns={['Finding', 'AI result', 'Confidence', 'Radiologist', 'Interpretation']}
              rows={NCCT_ROWS}
            />
          </Panel>

          <Panel title="CT angiography (CTA) — AI analysis" accent="crimson">
            <FindingsTable
              columns={['Finding', 'AI result', 'Confidence', 'Radiologist', 'Interpretation']}
              rows={CTA_ROWS}
            />
          </Panel>

          <Panel title="CT perfusion (CTP) — AI analysis" accent="gold">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10">
                    {['Metric', 'Value', 'Interpretation'].map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-slate/70 first:pl-0 last:pr-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/[0.07]">
                  {CTP_METRICS.map((row) => (
                    <tr key={row.metric}>
                      <td className="px-3 py-2.5 pl-0 text-sm text-ink">{row.metric}</td>
                      <td className={`px-3 py-2.5 font-serif text-sm font-medium tabular-nums ${VALUE_TONES[row.tone]}`}>
                        {row.value}
                      </td>
                      <td className="px-3 py-2.5 pr-0 text-sm text-slate">{row.interpretation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* ── MRA not performed ───────────────────────────────────── */}
          <section className="rounded-xl border border-ink/10 bg-ink/[0.02] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate/70">
              MR angiography (MRA) — not performed this episode
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              CTA was diagnostic and immediately available at the spoke centre; MRA was deferred to avoid delaying
              thrombectomy. MRA/DWI may be considered post-intervention for infarct characterisation and aetiology
              work-up.
            </p>
          </section>

          {/* ── Eligibility ─────────────────────────────────────────── */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-verdant">
              Treatment eligibility — rule-based, clinician-confirmed
            </p>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[
                { title: 'IV thrombolysis (rtPA / tenecteplase)', items: THROMBOLYSIS_CRITERIA },
                { title: 'Mechanical thrombectomy', items: THROMBECTOMY_CRITERIA },
              ].map((card) => (
                <section
                  key={card.title}
                  className="rounded-xl border border-verdant/30 bg-gradient-to-br from-verdant/[0.08] to-verdant/[0.02] px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-sm font-medium uppercase tracking-[0.12em] text-ink">
                      {card.title}
                    </h3>
                    <StatusPill tone="verdant">Eligible</StatusPill>
                  </div>
                  <div className="mt-4">
                    <CriteriaList items={card.items} />
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* ── Handover ────────────────────────────────────────────── */}
          <Panel title="En-route care &amp; clinical handover" accent="navy">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10">
                    {['Time', 'Intervention', 'By'].map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-slate/70 first:pl-0 last:pr-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/[0.07]">
                  {HANDOVER.map((row) => (
                    <tr key={row.time}>
                      <td className="px-3 py-2.5 pl-0 font-serif text-sm tabular-nums text-navy">{row.time}</td>
                      <td className="px-3 py-2.5 text-sm text-slate">{row.intervention}</td>
                      <td className="px-3 py-2.5 pr-0 text-sm text-slate/80">{row.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* ── Signatures ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {SIGNATURES.map((sig) => (
              <div key={sig.role} className={`rounded-xl border bg-white/50 px-5 py-4 ${sig.tone}`}>
                <p className="text-xs uppercase tracking-[0.14em] text-slate/70">{sig.role}</p>
                <p className="mt-6 border-b border-dashed border-ink/25 pb-1 text-sm text-ink">Dr.</p>
                <p className="mt-2 text-xs text-slate/70">{sig.org}</p>
              </div>
            ))}
          </div>

          {/* ── Disclaimer ──────────────────────────────────────────── */}
          <section className="rounded-xl border border-crimson/30 bg-crimson/[0.05] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-crimson">
              Clinical decision support — not an autonomous diagnosis
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              All AI outputs require verification by a qualified radiologist or stroke physician before any treatment
              decision. Thrombolysis and thrombectomy eligibility shown here is rule-based and must be confirmed
              against full clinical context, contraindications and local protocol. Time-is-brain projections are
              modelled estimates, not guarantees. This is a sample report generated for demonstration purposes.
            </p>
          </section>
        </div>

        {/* ── Report footer ─────────────────────────────────────────── */}
        <footer className="border-t border-ink/10 bg-gradient-to-r from-navy/[0.05] via-ink/[0.02] to-crimson/[0.05] px-6 py-6 sm:px-9">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-7">
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
            <div className="text-center sm:text-right">
              <p className="text-sm text-slate">
                Stroke-AI Platform ·{' '}
                <a
                  href={INDOSTATES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline decoration-ink/25 underline-offset-2 transition-colors hover:text-navy hover:decoration-navy"
                >
                  IndoStates Health Hospital
                </a>{' '}
                ×{' '}
                <a
                  href={SHRI_AI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline decoration-ink/25 underline-offset-2 transition-colors hover:text-crimson hover:decoration-crimson"
                >
                  Shri-AI
                </a>{' '}
                · Coimbatore
              </p>
              <p className="mt-1 text-xs text-slate/60">
                Report generated 25-Aug-2026 09:47 IST · Sample report for demonstration
              </p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
