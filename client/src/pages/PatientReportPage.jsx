import { Link } from 'react-router-dom';
import ArcMeter from '../components/report/ArcMeter.jsx';
import ClinicalRadar from '../components/report/ClinicalRadar.jsx';
import CoreGrowthChart from '../components/report/CoreGrowthChart.jsx';
import DonutChart from '../components/report/DonutChart.jsx';
import BulletBar from '../components/report/BulletBar.jsx';
import FactorBars from '../components/report/FactorBars.jsx';
import OcclusionProbabilityBars from '../components/report/OcclusionProbabilityBars.jsx';
import PhaseBars from '../components/report/PhaseBars.jsx';
import RiskGauge from '../components/report/RiskGauge.jsx';
import StackedBar from '../components/report/StackedBar.jsx';
import { MARK, TEXT_TONE } from '../components/report/chartUtils.js';
import {
  CriteriaList,
  DataList,
  FieldLabel,
  FindingsTable,
  LogoLink,
  Panel,
  StatTile,
  StatusIcon,
  StatusPill,
} from '../components/report/ReportPrimitives.jsx';
import { INDOSTATES_URL, SHRI_AI_URL } from '../lib/links.js';

// Static demonstration report. Every value below belongs to the published
// sample case (SA-2026-0871) — this page is a design/product artefact, not a
// live model output. The working model demo lives on the Brain Haemorrhage
// Pathway page.
//
// Where the page shows a derived figure — the urgency score, the finding
// counts, the mean confidences, the lesion shares — it is computed from the
// arrays here rather than typed in, so a data edit can never leave a stale
// number rendered next to a chart.

// ── Triage urgency score ───────────────────────────────────────────────────
// A weighted composite of six inputs from this case. Note this scores
// *urgency*, not prognosis: they pull in opposite directions here, because a
// large salvageable penumbra is exactly what makes the clock expensive. That is
// why a case with favourable imaging still lands in the High band.

const URGENCY_FACTORS = [
  {
    label: 'Proximal LVO confirmed — left M1',
    weight: 0.3,
    level: 1.0,
    basis: 'CTA model 0.94, radiologist-concordant',
  },
  {
    label: 'Salvageable penumbra — mismatch 4.8×',
    weight: 0.22,
    level: 0.96,
    basis: '68 mL still viable; every minute costs tissue',
  },
  { label: 'Deficit severity — NIHSS 14', weight: 0.18, level: 0.56, basis: 'Scaled against NIHSS 25' },
  { label: 'Core still small — 18 of 70 mL', weight: 0.12, level: 0.74, basis: 'Headroom before the volume limit' },
  { label: 'Treatment window still open', weight: 0.1, level: 0.84, basis: '303 of 360 min remaining' },
  { label: 'Collateral grade moderate — 2/3', weight: 0.08, level: 0.6, basis: 'Core growth only partly buffered' },
];

const URGENCY_BARS = URGENCY_FACTORS.map((f) => ({ ...f, points: f.weight * f.level * 100 })).sort(
  (a, b) => b.points - a.points,
);

const URGENCY_SCORE = Math.round(URGENCY_BARS.reduce((sum, f) => sum + f.points, 0));

const RISK_ZONES = [
  { name: 'Low', from: 0, to: 34, tone: 'verdant' },
  { name: 'Average', from: 34, to: 67, tone: 'gold' },
  { name: 'High', from: 67, to: 100, tone: 'crimson' },
];

// ── Headline figures ───────────────────────────────────────────────────────

const HEADLINE_STATS = [
  {
    label: 'Triage priority',
    value: 'P1',
    unit: 'immediate',
    note: 'Thrombectomy team pre-alerted',
    tone: 'crimson',
  },
  {
    label: 'Onset → report',
    value: '57',
    unit: 'min',
    note: 'Inside both treatment windows',
    tone: 'verdant',
    meter: { value: 57, max: 270, scaleNote: 'of the 270 min · 4.5 h window' },
  },
  {
    label: 'Presenting NIHSS',
    value: '14',
    note: 'Moderate–severe deficit',
    tone: 'navy',
    meter: { value: 14, max: 42, threshold: 6, scaleNote: '0–42 scale · LVO floor 6' },
  },
  {
    label: 'ASPECTS',
    value: '8',
    unit: '/ 10',
    note: 'Above the threshold of 6',
    tone: 'gold',
    meter: { value: 8, max: 10, threshold: 6, scaleNote: '0–10 scale · floor 6' },
  },
  {
    label: 'Infarct core',
    value: '18',
    unit: 'mL',
    note: 'Small — favourable',
    tone: 'crimson',
    meter: { value: 18, max: 70, scaleNote: 'of the 70 mL volume limit' },
  },
  {
    label: 'Mismatch ratio',
    value: '4.8',
    unit: '×',
    note: 'DEFUSE-3 met (> 1.8)',
    tone: 'navy',
    meter: { value: 4.8, max: 6, threshold: 1.8, scaleNote: '0–6 scale · floor 1.8×' },
  },
];

const PATIENT_ROWS = [
  { label: 'Patient ID', value: 'SA-2026-0871' },
  { label: 'Age / Sex', value: '63 y / Male' },
  { label: 'Alert source', value: 'Stroke-AI mobile app (bystander)' },
  { label: 'Symptom onset', value: '08:50 IST · 25-Aug-2026' },
  { label: 'Anticoagulants', value: 'None reported' },
  { label: 'Pre-stroke mRS', value: '0 — functionally independent' },
  { label: 'Scan centre', value: 'IndoStates spoke — Pollachi' },
  { label: 'Receiving hub', value: 'IndoStates CSC, Coimbatore' },
];

// Presenting measurements, each against the threshold that actually gates a
// treatment decision — the reason these are bars and not a column of numbers.
const PRESENTING_MEASUREMENTS = [
  {
    label: 'Systolic BP',
    display: '168 mmHg',
    value: 168,
    min: 80,
    max: 220,
    threshold: 185,
    thresholdLabel: 'thrombolysis ceiling 185',
    tone: 'gold',
    verdictTone: 'verdant',
    verdict: 'Below limit',
  },
  {
    label: 'Diastolic BP',
    display: '94 mmHg',
    value: 94,
    min: 40,
    max: 140,
    threshold: 110,
    thresholdLabel: 'thrombolysis ceiling 110',
    tone: 'gold',
    verdictTone: 'verdant',
    verdict: 'Below limit',
  },
  {
    label: 'Blood glucose',
    display: '122 mg/dL',
    value: 122,
    min: 50,
    max: 400,
    tone: 'verdant',
    verdict: 'In range',
    note: 'Thrombolysis requires 50–400 mg/dL.',
  },
  {
    label: 'Presenting NIHSS',
    display: '14 / 42',
    value: 14,
    min: 0,
    max: 42,
    threshold: 6,
    thresholdLabel: 'LVO suspicion 6',
    tone: 'navy',
    verdict: 'Moderate–severe',
  },
  {
    label: 'ASPECTS',
    display: '8 / 10',
    value: 8,
    min: 0,
    max: 10,
    threshold: 6,
    thresholdLabel: 'thrombectomy floor 6',
    tone: 'gold',
    verdictTone: 'verdant',
    verdict: 'Above floor',
  },
];

// ── Golden hour, as durations ──────────────────────────────────────────────

const PHASES = [
  { from: '08:50', event: 'Onset → bystander raises app alert', minutes: 6, delta: 'T+6' },
  { from: '08:56', event: 'Command Centre triage → ambulance dispatched', minutes: 8, delta: 'T+14' },
  { from: '09:04', event: 'Ambulance en route, on scene 09:12', minutes: 8, delta: 'T+22' },
  { from: '09:12', event: 'Transfer to spoke, NCCT + CTA + CTP acquired', minutes: 14, delta: 'T+36' },
  { from: '09:26', event: 'AI analysis across all three studies', minutes: 5, delta: 'T+41' },
  { from: '09:31', event: 'Hub teleconsult → thrombectomy team activated', minutes: 8, delta: 'T+49' },
  { from: '09:39', event: 'Report finalised, patient en route to hub', minutes: 8, delta: 'T+57' },
];

const ELAPSED_MIN = PHASES.reduce((sum, p) => sum + p.minutes, 0);

const TREATMENT_WINDOWS = [
  { label: 'IV thrombolysis', limit: 270, tone: 'verdant', note: '4.5 h window · 213 min left' },
  { label: 'Thrombectomy', limit: 360, tone: 'navy', note: '6 h window · 303 min left' },
];

// ── Imaging findings ───────────────────────────────────────────────────────
// `confidence` is the number the bar is drawn from; `confidenceLabel` is only
// present where the model reports a range rather than a point estimate.

const NCCT_ROWS = [
  {
    finding: 'Intracranial haemorrhage (ICH)',
    result: 'Negative',
    tone: 'verdant',
    confidence: 0.98,
    radiologist: 'Concordant',
    interpretation: 'No acute blood — thrombolysis not excluded',
  },
  {
    finding: 'IPH / IVH / SDH / EDH / SAH',
    result: 'All negative',
    tone: 'verdant',
    confidence: 0.97,
    confidenceLabel: '0.95–0.99',
    radiologist: 'Concordant',
    interpretation: 'No subtype-specific haemorrhage',
  },
  {
    finding: 'ASPECTS score',
    result: '8 / 10',
    tone: 'gold',
    confidence: 0.89,
    radiologist: 'Concordant',
    interpretation: 'Early ischaemic change: insula, M2',
  },
  {
    finding: 'Midline shift',
    result: '0.0 mm',
    tone: 'verdant',
    confidence: 0.97,
    radiologist: 'Concordant',
    interpretation: 'No mass effect',
  },
  {
    finding: 'Mass effect',
    result: 'Absent',
    tone: 'verdant',
    confidence: 0.96,
    radiologist: 'Concordant',
    interpretation: 'No herniation risk at present',
  },
  {
    finding: 'Hyperdense vessel sign',
    result: 'Present — left MCA',
    tone: 'crimson',
    confidence: 0.91,
    radiologist: 'Concordant',
    interpretation: 'Supports acute thrombus in M1',
  },
];

const CTA_ROWS = [
  {
    finding: 'Large vessel occlusion',
    result: 'Positive',
    tone: 'crimson',
    confidence: 0.94,
    radiologist: 'Concordant',
    interpretation: 'Thrombectomy candidate',
  },
  {
    finding: 'Occlusion site',
    result: 'Left MCA — M1',
    tone: 'crimson',
    confidence: 0.92,
    radiologist: 'Concordant',
    interpretation: 'Proximal, retrievable',
  },
  {
    finding: 'Laterality',
    result: 'Left hemisphere',
    tone: 'navy',
    confidence: 0.99,
    radiologist: 'Concordant',
    interpretation: 'Right-sided deficit expected',
  },
  {
    finding: 'Clot length',
    result: '11 mm',
    tone: 'gold',
    confidence: 0.86,
    radiologist: 'Concordant',
    interpretation: 'Favourable for retrieval',
  },
  {
    finding: 'Collateral score',
    result: '2 / 3 — moderate',
    tone: 'gold',
    confidence: 0.83,
    radiologist: 'Concordant',
    interpretation: 'Supports slower core growth',
  },
  {
    finding: 'Circle of Willis',
    result: 'Complete anterior',
    tone: 'verdant',
    confidence: 0.9,
    radiologist: 'Concordant',
    interpretation: 'Some cross-flow protection',
  },
  {
    finding: 'ICA / carotid stenosis',
    result: 'None significant',
    tone: 'verdant',
    confidence: 0.93,
    radiologist: 'Concordant',
    interpretation: 'Access route clear',
  },
  {
    finding: 'Basilar / vertebral',
    result: 'Patent',
    tone: 'verdant',
    confidence: 0.97,
    radiologist: 'Concordant',
    interpretation: 'No posterior involvement',
  },
];

const ALL_FINDINGS = [...NCCT_ROWS, ...CTA_ROWS];

const STATUS_META = {
  verdant: { label: 'Normal / negative', note: 'Nothing that blocks treatment' },
  gold: { label: 'Caution — partial', note: 'Favourable but not clean' },
  crimson: { label: 'Critical — positive', note: 'Drives the intervention' },
  navy: { label: 'Informational', note: 'Localises the deficit' },
};

const TONE_ORDER = ['verdant', 'gold', 'crimson', 'navy'];

const toneCounts = (rows) =>
  rows.reduce((acc, row) => ({ ...acc, [row.tone]: (acc[row.tone] ?? 0) + 1 }), {});

const toneSegments = (rows) => {
  const counts = toneCounts(rows);
  return TONE_ORDER.filter((tone) => counts[tone]).map((tone) => ({
    tone,
    value: counts[tone],
    label: STATUS_META[tone].label,
    note: STATUS_META[tone].note,
  }));
};

const meanConfidence = (rows) => rows.reduce((sum, row) => sum + row.confidence, 0) / rows.length;

const MODALITIES = [
  { key: 'NCCT', rows: NCCT_ROWS, tone: 'navy' },
  { key: 'CTA', rows: CTA_ROWS, tone: 'crimson' },
];

// ── CT perfusion ───────────────────────────────────────────────────────────
// Tmax > 6 s (86 mL) is the TOTAL hypoperfused territory: it already contains
// the 18 mL rCBF < 30% core, and the salvageable mismatch is the 68 mL
// difference. That is what makes the mismatch ratio 86 / 18 = 4.8×. Treating
// 86 mL as a separate penumbra and adding it to the core would double-count the
// core and misstate every share on the chart.

const LESION_SEGMENTS = [
  { label: 'Infarct core', note: 'rCBF < 30% — irreversible', value: 18, tone: 'crimson' },
  { label: 'Salvageable mismatch', note: 'Recoverable with prompt reperfusion', value: 68, tone: 'gold' },
];

const HYPOPERFUSED_TOTAL = LESION_SEGMENTS.reduce((sum, s) => sum + s.value, 0);

const CTP_THRESHOLDS = [
  {
    label: 'Infarct core (rCBF < 30%)',
    display: '18 mL',
    value: 18,
    max: 70,
    maxLabel: '70 limit',
    tone: 'crimson',
    verdictTone: 'verdant',
    verdict: 'Under limit',
    note: 'Small core — the strongest single predictor of a good outcome after reperfusion.',
  },
  {
    label: 'Mismatch volume',
    display: '68 mL',
    value: 68,
    max: 120,
    threshold: 15,
    thresholdLabel: 'DEFUSE-3 floor 15 mL',
    tone: 'gold',
    verdictTone: 'verdant',
    verdict: 'Met',
    note: 'Substantial tissue at risk and still recoverable.',
  },
  {
    label: 'Mismatch ratio',
    display: '4.8×',
    value: 4.8,
    max: 6,
    threshold: 1.8,
    thresholdLabel: 'DEFUSE-3 floor 1.8×',
    tone: 'verdant',
    verdict: 'Met',
    note: 'Tmax > 6 s volume divided by core volume — 86 / 18.',
  },
  {
    label: 'Hypoperfusion index',
    display: '0.32',
    value: 0.32,
    max: 1,
    threshold: 0.4,
    thresholdLabel: 'favourable below 0.40',
    tone: 'verdant',
    verdict: 'Favourable',
    note: 'Low index implies good collateral support and slower core growth.',
  },
  {
    label: 'CBV index',
    display: '0.84',
    value: 0.84,
    max: 1,
    threshold: 0.7,
    thresholdLabel: 'viable above 0.70',
    tone: 'verdant',
    verdict: 'Good',
    note: 'Tissue viability within the hypoperfused territory.',
  },
];

// ── Decision profile ───────────────────────────────────────────────────────
// Each axis is normalised on its own real scale, with the reference envelope
// set at the value the guidelines actually ask for.

const RADAR_AXES = [
  { label: 'ASPECTS', display: '8 / 10', value: 8 / 10, threshold: 6 / 10, tone: 'gold' },
  { label: 'Mismatch', display: '4.8×', value: 4.8 / 6, threshold: 1.8 / 6, tone: 'verdant' },
  { label: 'Core margin', display: '52 mL', value: 52 / 70, threshold: 20 / 70, tone: 'crimson' },
  { label: 'Collateral', display: '2 / 3', value: 2 / 3, threshold: 1 / 3, tone: 'gold' },
  { label: 'CBV index', display: '0.84', value: 0.84, threshold: 0.7, tone: 'verdant' },
  { label: 'Window left', display: '303 min', value: 303 / 360, threshold: 60 / 360, tone: 'navy' },
];

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
    color: MARK.crimson,
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
    color: MARK.navy,
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
  { label: 'Tissue preserved', value: '62 mL', tone: 'verdant' },
  { label: 'Final core — Stroke-AI', value: '34 mL', tone: 'crimson' },
  { label: 'Final core — conventional', value: '96 mL', tone: 'navy' },
  { label: 'Time saved', value: '74 min', tone: 'verdant' },
  { label: 'Collateral grade', value: '2 / 3', tone: 'gold' },
];

const ELIGIBILITY = [
  {
    title: 'IV thrombolysis (rtPA / tenecteplase)',
    items: [
      'Onset 57 min — within the 4.5 h window',
      'No haemorrhage on NCCT (AI 0.98, radiologist-confirmed)',
      'NIHSS 14 — deficit not minor',
      'BP 168/94 — below the 185/110 threshold',
      'No anticoagulant use reported',
      'Glucose 122 mg/dL — within range',
    ],
  },
  {
    title: 'Mechanical thrombectomy',
    items: [
      'LVO confirmed — left M1 (AI 0.94)',
      'ASPECTS 8 — above the threshold of 6',
      'Mismatch ratio 4.8× — DEFUSE-3 met',
      'Core 18 mL — under the 70 mL limit',
      'Onset-to-groin projected under 6 h',
      'Pre-stroke mRS 0 — functionally independent',
    ],
  },
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
  { role: 'Reporting radiologist', org: 'IndoStates Radiology', tone: 'navy', border: 'border-navy/25' },
  { role: 'Mobile AI doctor', org: 'Stroke-AI Command Centre', tone: 'crimson', border: 'border-crimson/25' },
  { role: 'Receiving team', org: 'Comprehensive Stroke Centre', tone: 'gold', border: 'border-gold/30' },
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
                className="inline-flex items-center gap-2.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 transition-colors hover:border-white/55 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
              >
                <img src="/assets/ribbon-mark.png" alt="Stroke-AI" className="h-7 w-7 flex-none object-contain" />
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-white/85">Stroke-AI</span>
              </Link>
              <h1 className="mt-4 text-[clamp(1.35rem,3vw,1.95rem)] font-semibold leading-tight tracking-tight">
                Acute Stroke Imaging &amp; Triage Report
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                AI-assisted NCCT · CTA · CT Perfusion · MRA — hub-and-spoke emergency pathway
              </p>
            </div>

            <div className="flex flex-none flex-col gap-3 sm:items-end">
              <div className="text-left sm:text-right">
                <p className="text-base font-semibold tracking-wide">Stroke-AI</p>
                <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/65">
                  Anywhere · Anytime
                </p>
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
          {/* ── Triage verdict, led by the urgency meter ─────────────── */}
          <section className="rounded-xl border border-crimson/30 bg-crimson/[0.045] px-5 py-6 sm:px-6">
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-9">
              <div className="mx-auto w-full max-w-sm lg:mx-0">
                <FieldLabel tone="crimson" size="xs" className="text-center">
                  Triage urgency index
                </FieldLabel>
                <div className="mt-3">
                  <RiskGauge
                    value={URGENCY_SCORE}
                    zones={RISK_ZONES}
                    scaleTicks={[0, 34, 67, 100]}
                    label="P1 immediate"
                    caption="Weighted composite of the six imaging and clinical inputs below. Demonstration model — it grades how fast this patient must move, not how well they will do."
                  />
                </div>
              </div>

              <div className="min-w-0">
                <FieldLabel tone="crimson" size="xs">
                  AI triage verdict — decision support
                </FieldLabel>
                <h2 className="mt-3 text-[clamp(1.2rem,2.6vw,1.7rem)] font-semibold leading-tight text-ink">
                  Ischemic stroke · <span className="text-crimson">large vessel occlusion</span>
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

                <div className="mt-6 rounded-xl border border-ink/10 bg-white/70 px-4 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <FieldLabel tone="navy" size="sm">
                      What is driving the score
                    </FieldLabel>
                    <p className="text-[0.7rem] font-semibold tabular-nums text-slate">
                      contribution points of {URGENCY_SCORE}
                    </p>
                  </div>
                  <div className="mt-3.5">
                    <FactorBars
                      factors={URGENCY_BARS}
                      unitLabel="Each input is scored 0–1 against its own clinical scale, then weighted. The confirmed proximal occlusion alone accounts for 30 of the 83 points."
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Headline numbers ────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {HEADLINE_STATS.map((stat) => (
              <StatTile key={stat.label} {...stat} />
            ))}
          </div>

          {/* ── Golden hour & treatment windows ─────────────────────── */}
          <Panel
            title="Golden hour — where the 57 minutes went"
            accent="verdant"
            subtitle="Each bar is one phase's duration; the clock time and event stay on the row."
          >
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_minmax(0,12rem)] lg:gap-8">
              <PhaseBars phases={PHASES} totalLabel="Onset → report finalised" totalValue={`${ELAPSED_MIN} min`} />

              <div className="flex flex-col gap-6 lg:border-l lg:border-ink/[0.07] lg:pl-7">
                <FieldLabel tone="verdant" size="xs">
                  Window consumed
                </FieldLabel>
                {TREATMENT_WINDOWS.map((win) => (
                  <ArcMeter
                    key={win.label}
                    value={ELAPSED_MIN}
                    limit={win.limit}
                    unit="min"
                    tone={win.tone}
                    label={win.label}
                    note={win.note}
                  />
                ))}
              </div>
            </div>
            <p className="mt-5 flex items-start gap-2 rounded-lg bg-verdant/[0.09] px-4 py-3 text-sm text-verdant ring-1 ring-inset ring-verdant/20">
              <StatusIcon tone="verdant" className="mt-0.5 h-4 w-4" />
              <span>
                <strong className="font-bold">{ELAPSED_MIN} min from onset</strong> — inside both the 4.5 h
                thrombolysis and 6 h thrombectomy windows, with 213 and 303 minutes still on the clock.
              </span>
            </p>
          </Panel>

          {/* ── Perfusion & occlusion ───────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Ischaemic territory composition (CTP)"
              accent="gold"
              meta={<StatusPill tone="gold">{HYPOPERFUSED_TOTAL} mL hypoperfused</StatusPill>}
            >
              <StackedBar
                segments={LESION_SEGMENTS}
                unit=" mL"
                showShares
                ariaLabel={`Of ${HYPOPERFUSED_TOTAL} mL hypoperfused tissue, 18 mL is infarct core and 68 mL salvageable mismatch`}
              />
              <p className="mt-5 border-t border-ink/[0.07] pt-4 text-sm leading-relaxed text-slate">
                Tmax &gt; 6 s marks <strong className="font-bold text-ink">{HYPOPERFUSED_TOTAL} mL</strong> of
                hypoperfused tissue in total. Only{' '}
                <strong className="font-bold text-crimson">18 mL</strong> of it is irreversibly infarcted, leaving{' '}
                <strong className="font-bold text-gold-ink">68 mL</strong> salvageable — a mismatch ratio of{' '}
                <strong className="font-bold text-verdant">4.8×</strong>, well above the 1.8× DEFUSE-3 threshold.
              </p>
            </Panel>

            <Panel
              title="Occlusion site probability (CTA model)"
              accent="crimson"
              meta={<StatusPill tone="crimson">M1 · 0.94</StatusPill>}
            >
              <OcclusionProbabilityBars items={OCCLUSION_PROBABILITIES} />
              <p className="mt-5 border-t border-ink/[0.07] pt-4 text-sm leading-relaxed text-slate">
                <strong className="font-bold text-crimson">M1 occlusion</strong> is the model&rsquo;s dominant call,
                consistent with the hyperdense vessel sign on NCCT and the perfusion deficit territory. Sites are
                scored independently, so the probabilities are not a part-to-whole.
              </p>
            </Panel>
          </div>

          {/* ── Time-is-brain ───────────────────────────────────────── */}
          <Panel title="Time-is-brain projection" accent="navy">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,12rem)] lg:gap-8">
              <CoreGrowthChart
                series={GROWTH_SERIES}
                xMax={240}
                yMax={100}
                xLabel="Minutes from onset"
                yLabel="Infarct core (mL)"
                gapNote="62 mL preserved"
              />
              <div className="flex flex-col divide-y divide-ink/[0.07] lg:border-l lg:border-ink/[0.07] lg:pl-7">
                {GROWTH_STATS.map((stat) => (
                  <div key={stat.label} className="py-3 first:pt-0 last:pb-0">
                    <FieldLabel tone={stat.tone} size="xs">
                      {stat.label}
                    </FieldLabel>
                    <p className={`mt-1 text-lg font-bold tabular-nums ${TEXT_TONE[stat.tone]}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 border-t border-ink/[0.07] pt-4 text-sm leading-relaxed text-slate">
              Modelled projection based on collateral grade and observed core growth rate — illustrative, not a
              patient-specific guarantee.
            </p>
          </Panel>

          {/* ── Decision profile & perfusion thresholds ─────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel
              title="Clinical decision profile"
              accent="crimson"
              subtitle="Six gating inputs, each on its own scale, against the guideline envelope."
            >
              <ClinicalRadar
                axes={RADAR_AXES}
                seriesLabel="This patient"
                thresholdLabel="Guideline threshold"
              />
              <p className="mt-3 border-t border-ink/[0.07] pt-4 text-sm leading-relaxed text-slate">
                The case sits outside the reference envelope on all six axes — the shape is why both treatment
                pathways come back eligible rather than borderline.
              </p>
            </Panel>

            <Panel title="Perfusion thresholds (CTP)" accent="gold">
              <div className="divide-y divide-ink/[0.07]">
                {CTP_THRESHOLDS.map((row) => (
                  <BulletBar key={row.label} {...row} />
                ))}
              </div>
            </Panel>
          </div>

          {/* ── Patient & measurements ──────────────────────────────── */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <Panel title="Patient &amp; event" accent="navy">
              <DataList rows={PATIENT_ROWS} />
            </Panel>

            <Panel
              title="Presenting measurements"
              accent="verdant"
              subtitle="Each reading against the threshold that gates a treatment decision."
            >
              <div className="divide-y divide-ink/[0.07]">
                {PRESENTING_MEASUREMENTS.map((row) => (
                  <BulletBar key={row.label} {...row} />
                ))}
              </div>
            </Panel>
          </div>

          {/* ── Findings overview ───────────────────────────────────── */}
          <Panel
            title="AI findings at a glance"
            accent="navy"
            subtitle={`${ALL_FINDINGS.length} findings across NCCT and CTA, every one radiologist-concordant.`}
          >
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_minmax(0,13rem)] lg:gap-8">
              <DonutChart
                segments={toneSegments(ALL_FINDINGS)}
                centreValue={ALL_FINDINGS.length}
                centreLabel="Findings"
                ariaLabel={`Breakdown of ${ALL_FINDINGS.length} AI findings by status`}
              />

              <div className="flex flex-col gap-5 lg:border-l lg:border-ink/[0.07] lg:pl-7">
                <FieldLabel tone="navy" size="xs">
                  Mean AI confidence
                </FieldLabel>
                {MODALITIES.map((modality) => (
                  <ArcMeter
                    key={modality.key}
                    value={meanConfidence(modality.rows)}
                    limit={1}
                    tone={modality.tone}
                    label={`${modality.key} · ${modality.rows.length} findings`}
                    note={`Mean ${meanConfidence(modality.rows).toFixed(2)} across the panel`}
                  />
                ))}
              </div>
            </div>
          </Panel>

          {/* ── Modality tables ─────────────────────────────────────── */}
          {MODALITIES.map((modality) => (
            <Panel
              key={modality.key}
              title={
                modality.key === 'NCCT'
                  ? 'Non-contrast CT (NCCT) — AI analysis'
                  : 'CT angiography (CTA) — AI analysis'
              }
              accent={modality.tone}
              meta={
                <StatusPill tone={modality.tone}>
                  Mean conf {meanConfidence(modality.rows).toFixed(2)}
                </StatusPill>
              }
            >
              <div className="mb-5">
                <StackedBar segments={toneSegments(modality.rows)} height="h-4" legend={false} />
                <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5">
                  {toneSegments(modality.rows).map((seg) => (
                    <li key={seg.tone} className="flex items-center gap-1.5">
                      <StatusIcon tone={seg.tone} className="h-3 w-3" />
                      <span className={`text-[0.68rem] font-bold uppercase tracking-[0.1em] ${TEXT_TONE[seg.tone]}`}>
                        {seg.value} {seg.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <FindingsTable
                columns={['Finding', 'AI result', 'Confidence', 'Radiologist', 'Interpretation']}
                rows={modality.rows}
                accent={modality.tone}
              />
            </Panel>
          ))}

          {/* ── MRA not performed ───────────────────────────────────── */}
          <section className="rounded-xl border border-ink/10 bg-ink/[0.02] px-5 py-4">
            <FieldLabel tone="slate" size="sm">
              MR angiography (MRA) — not performed this episode
            </FieldLabel>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              CTA was diagnostic and immediately available at the spoke centre; MRA was deferred to avoid delaying
              thrombectomy. MRA/DWI may be considered post-intervention for infarct characterisation and aetiology
              work-up.
            </p>
          </section>

          {/* ── Eligibility ─────────────────────────────────────────── */}
          <div>
            <FieldLabel tone="verdant" size="sm" className="mb-3">
              Treatment eligibility — rule-based, clinician-confirmed
            </FieldLabel>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {ELIGIBILITY.map((card) => (
                <section
                  key={card.title}
                  className="rounded-xl border border-verdant/30 bg-verdant/[0.05] px-5 py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[0.84rem] font-bold uppercase tracking-[0.12em] text-verdant">
                      {card.title}
                    </h3>
                    <StatusPill tone="verdant">Eligible</StatusPill>
                  </div>
                  <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex-none sm:w-32">
                      <ArcMeter
                        value={card.items.length}
                        limit={card.items.length}
                        tone="verdant"
                        percentLabel={false}
                        label="Criteria met"
                        note={`${card.items.length} of ${card.items.length}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CriteriaList items={card.items} />
                    </div>
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
                        className="px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-navy first:pl-0 last:pr-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/[0.07]">
                  {HANDOVER.map((row) => (
                    <tr key={row.time}>
                      <th scope="row" className="px-3 py-2.5 pl-0 text-left text-sm font-bold tabular-nums text-navy">
                        {row.time}
                      </th>
                      <td className="px-3 py-2.5 text-sm text-slate">{row.intervention}</td>
                      <td className="px-3 py-2.5 pr-0 text-sm font-medium text-slate/80">{row.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* ── Signatures ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {SIGNATURES.map((sig) => (
              <div key={sig.role} className={`rounded-xl border bg-white/50 px-5 py-4 ${sig.border}`}>
                <FieldLabel tone={sig.tone} size="xs">
                  {sig.role}
                </FieldLabel>
                <p className="mt-6 border-b border-dashed border-ink/25 pb-1 text-sm text-ink">Dr.</p>
                <p className="mt-2 text-xs font-medium text-slate/80">{sig.org}</p>
              </div>
            ))}
          </div>

          {/* ── Disclaimer ──────────────────────────────────────────── */}
          <section className="rounded-xl border border-crimson/30 bg-crimson/[0.045] px-5 py-4">
            <FieldLabel tone="crimson" size="sm">
              Clinical decision support — not an autonomous diagnosis
            </FieldLabel>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              All AI outputs require verification by a qualified radiologist or stroke physician before any treatment
              decision. Thrombolysis and thrombectomy eligibility shown here is rule-based and must be confirmed
              against full clinical context, contraindications and local protocol. The triage urgency index and the
              time-is-brain projection are modelled estimates, not guarantees. This is a sample report generated for
              demonstration purposes.
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
                  className="font-semibold text-ink underline decoration-ink/25 underline-offset-2 transition-colors hover:text-navy hover:decoration-navy"
                >
                  IndoStates Health Hospital
                </a>{' '}
                ×{' '}
                <a
                  href={SHRI_AI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink underline decoration-ink/25 underline-offset-2 transition-colors hover:text-crimson hover:decoration-crimson"
                >
                  Shri-AI
                </a>{' '}
                · Coimbatore
              </p>
              <p className="mt-1 text-xs text-slate/70">
                Report generated 25-Aug-2026 09:47 IST · Sample report for demonstration
              </p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
