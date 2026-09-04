import { useEffect, useMemo, useRef, useState } from 'react';
import Eyebrow from '../components/Eyebrow.jsx';
import {
  SELECT_CHEVRON,
  buttonOutline,
  buttonPrimary,
  buttonSolid,
  selectControl,
  tabGroup,
  tabItem,
} from '../components/buttonStyles.js';
import { StatusPill } from '../components/report/ReportPrimitives.jsx';
import { fetchSamples, predictSample, predictUpload } from '../lib/api.js';
import { filesFromDropEvent, isDicomLike, totalMegabytes } from '../lib/dicomFiles.js';

const LABEL_DESCRIPTIONS = {
  ICH: 'Any intracranial haemorrhage',
  IPH: 'Intraparenchymal haemorrhage',
  IVH: 'Intraventricular haemorrhage',
  SDH: 'Subdural haemorrhage',
  EDH: 'Extradural / epidural haemorrhage',
  SAH: 'Subarachnoid haemorrhage',
  MassEffect: 'Mass effect',
  MidlineShift: 'Midline shift',
};
const LABEL_ORDER = Object.keys(LABEL_DESCRIPTIONS);
const THRESHOLD = 0.5;

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function prettySampleName(id) {
  const match = id.match(/^patient_(\d+)_/);
  return match ? `Patient ${Number(match[1])}` : id;
}

export default function BrainHaemorrhagePathwayPage() {
  const [samples, setSamples] = useState([]);
  const [samplesError, setSamplesError] = useState(null);
  const [selectedSample, setSelectedSample] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [mode, setMode] = useState('sample');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  useEffect(() => {
    fetchSamples()
      .then((list) => {
        setSamples(list);
        if (list.length > 0) setSelectedSample(list[0].id);
      })
      .catch((err) => setSamplesError(err.message));
  }, []);

  const activeSample = useMemo(
    () => samples.find((s) => s.id === selectedSample) ?? null,
    [samples, selectedSample]
  );

  const canRun = mode === 'sample' ? Boolean(selectedSample) : uploadFiles.length > 0;

  async function handleRun() {
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const payload = mode === 'sample' ? await predictSample(selectedSample) : await predictUpload(uploadFiles);
      setResult(payload);
    } catch (err) {
      setError(err.message || 'Inference failed.');
    } finally {
      setIsRunning(false);
    }
  }

  function acceptFiles(candidates) {
    const all = Array.from(candidates);
    const dicoms = all.filter(isDicomLike);
    setUploadFiles(dicoms);
    setMode('upload');
    setUploadNotice(
      dicoms.length === 0
        ? all.length === 0
          ? 'Nothing was read from that drop — try the Browse folder button instead.'
          : `Found ${all.length} file(s) but none look like DICOM slices.`
        : null
    );
  }

  async function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    // Reads dropped folders recursively; plain multi-file drops still work.
    acceptFiles(await filesFromDropEvent(event));
  }

  const ichProbability = result?.probabilities?.ICH ?? 0;
  const isPositive = ichProbability >= THRESHOLD;
  const maxAttention = result ? Math.max(...result.attention) : 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <header>
        <Eyebrow>Brain Haemorrhage Pathway</Eyebrow>
        <h1 className="mt-4 font-serif text-[clamp(1.5rem,3.4vw,2.15rem)] font-medium leading-tight tracking-tight text-ink">
          NCCT haemorrhage detection — live model
        </h1>
        <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-slate">
          Runs a trained multiple-instance-learning model over a full non-contrast CT head study and returns
          study-level probabilities for haemorrhage, its five subtypes, mass effect and midline shift.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3">
        <p className="rounded-lg border border-crimson/25 bg-crimson/[0.04] px-4 py-3 text-sm leading-relaxed text-slate">
          <strong className="font-medium text-crimson">Research prototype — not for clinical use.</strong> Trained on
          ~320 CQ500 studies as a proof of concept (held-out test AUROC 0.878 for haemorrhage). It demonstrates the
          pathway end to end; it does not diagnose anyone.
        </p>
        <p className="rounded-lg border border-navy/20 bg-navy/[0.04] px-4 py-3 text-sm leading-relaxed text-slate">
          <strong className="font-medium text-navy">Non-contrast CT (NCCT) head, axial only.</strong> The model was
          trained exclusively on plain pre-contrast brain CT — bone-kernel, contrast-enhanced or non-head series
          (neck, orbit, sinus) will produce meaningless output.
        </p>
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      <section className="mt-8 rounded-xl border border-ink/10 bg-white/60 p-5 sm:p-6">
        <div className={tabGroup} role="tablist" aria-label="Input source">
          {[
            { key: 'sample', label: 'Bundled sample study' },
            { key: 'upload', label: 'Upload DICOM slices' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={mode === tab.key}
              aria-controls="input-panel"
              onClick={() => setMode(tab.key)}
              className={tabItem(mode === tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5" id="input-panel" role="tabpanel">
          {mode === 'sample' ? (
            <div>
              <label htmlFor="sample-select" className="block text-xs uppercase tracking-[0.14em] text-slate/70">
                Held-out CQ500 study (never seen during training)
              </label>
              {samplesError ? (
                <p className="mt-3 text-sm text-crimson">
                  Could not reach the backend ({samplesError}). Start it with{' '}
                  <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">uvicorn main:app --port 8000</code> in{' '}
                  <code className="rounded bg-ink/5 px-1.5 py-0.5 text-xs">server/</code>.
                </p>
              ) : (
                <>
                  <select
                    id="sample-select"
                    value={selectedSample}
                    onChange={(e) => setSelectedSample(e.target.value)}
                    className={`mt-2 ${selectControl}`}
                    style={SELECT_CHEVRON}
                  >
                    {samples.map((sample) => (
                      <option key={sample.id} value={sample.id}>
                        {prettySampleName(sample.id)} — {sample.n_slices} slices
                      </option>
                    ))}
                  </select>
                  {activeSample?.ground_truth && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.12em] text-slate/70">Radiologist ground truth:</span>
                      {LABEL_ORDER.filter((l) => activeSample.ground_truth[l] === 1).length === 0 ? (
                        <StatusPill tone="verdant">No findings</StatusPill>
                      ) : (
                        LABEL_ORDER.filter((l) => activeSample.ground_truth[l] === 1).map((label) => (
                          <StatusPill key={label} tone="crimson">
                            {label}
                          </StatusPill>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
                  isDragging ? 'border-navy bg-navy/[0.04]' : 'border-ink/20 bg-ink/[0.02]'
                }`}
              >
                <p className="text-sm text-ink">
                  Drag and drop the patient&rsquo;s <strong className="font-medium">NCCT test data</strong> here
                </p>
                <p className="mt-1 text-xs text-slate/70">
                  Whole folders are read automatically, including nested subfolders — or drop the individual .dcm
                  slices
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className={buttonSolid}
                  >
                    Browse folder
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={buttonOutline}
                  >
                    Browse files
                  </button>
                </div>
                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  webkitdirectory=""
                  directory=""
                  className="hidden"
                  onChange={(e) => acceptFiles(e.target.files)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".dcm,.dicom"
                  multiple
                  className="hidden"
                  onChange={(e) => acceptFiles(e.target.files)}
                />
              </div>
              {uploadFiles.length > 0 && (
                <p className="mt-3 text-sm text-slate">
                  <strong className="font-medium text-ink">{uploadFiles.length} slices</strong> ready ·{' '}
                  {totalMegabytes(uploadFiles).toFixed(1)} MB
                  {uploadFiles.length > 150 && (
                    <span className="text-slate/70"> — a large series can take a minute to upload</span>
                  )}
                </p>
              )}
              {uploadNotice && <p className="mt-3 text-sm text-crimson">{uploadNotice}</p>}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={!canRun || isRunning}
          className={`mt-6 ${buttonPrimary}`}
        >
          {isRunning ? 'Running inference…' : 'Run inference'}
        </button>

        {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
      </section>

      {/* ── Result ────────────────────────────────────────────────── */}
      {result && (
        <section className="mt-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
            <div
              className={`rounded-xl border px-6 py-6 text-center ${
                isPositive ? 'border-crimson/25 bg-crimson/[0.06]' : 'border-verdant/25 bg-verdant/[0.06]'
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate/70">Model verdict</p>
              <p
                className={`mt-3 font-serif text-[1.35rem] font-medium leading-tight ${
                  isPositive ? 'text-crimson' : 'text-verdant'
                }`}
              >
                {isPositive ? 'Haemorrhage detected' : 'No haemorrhage detected'}
              </p>
              <p className={`mt-3 font-serif text-[2.4rem] font-medium leading-none tabular-nums ${isPositive ? 'text-crimson' : 'text-verdant'}`}>
                {formatPercent(isPositive ? ichProbability : 1 - ichProbability)}
              </p>
              <p className="mt-2 text-xs text-slate/70">confidence</p>
              <p className="mt-4 border-t border-ink/[0.07] pt-3 text-xs text-slate/70">
                {result.n_slices_used} of {result.n_slices_available} slices sampled
              </p>
            </div>

            <div className="rounded-xl border border-ink/10 bg-white/60 px-5 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate/70">Per-finding probability</p>
              <ul className="mt-4 flex flex-col gap-3">
                {LABEL_ORDER.map((label) => {
                  const value = result.probabilities[label] ?? 0;
                  const flagged = value >= THRESHOLD;
                  return (
                    <li key={label} className="flex items-center gap-4">
                      <span className="w-44 flex-none">
                        <span className={`block text-sm ${flagged ? 'font-medium text-ink' : 'text-slate'}`}>{label}</span>
                        <span className="block text-xs text-slate/60">{LABEL_DESCRIPTIONS[label]}</span>
                      </span>
                      <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                        <span
                          className={`absolute inset-y-0 left-0 rounded-full ${flagged ? 'bg-crimson' : 'bg-slate/35'}`}
                          style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%` }}
                        />
                      </span>
                      <span
                        className={`w-14 flex-none text-right font-serif text-sm tabular-nums ${
                          flagged ? 'text-crimson' : 'text-slate'
                        }`}
                      >
                        {formatPercent(value)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/60 px-5 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate/70">Slice attention</p>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Attention weight per sampled slice — higher means that slice contributed more to the study-level
              prediction.
            </p>
            <div className="mt-4 flex h-24 items-end gap-1" role="img" aria-label="Attention weight per sampled slice">
              {result.attention.map((weight, i) => (
                <span
                  key={i}
                  title={`slice ${i}: ${weight.toFixed(3)}`}
                  className={`min-w-0 flex-1 rounded-t-sm ${
                    i === result.top_attention_index ? 'bg-crimson' : 'bg-slate/30'
                  }`}
                  style={{ height: `${Math.max((weight / maxAttention) * 100, 2)}%` }}
                />
              ))}
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-slate/70">
              Slice previews — triple window (brain / subdural / soft tissue)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {result.previews.map((preview) => (
                <figure key={preview.index} className="m-0">
                  <img
                    src={preview.image}
                    alt={`NCCT slice ${preview.index}`}
                    className="w-full rounded-md border border-ink/10 bg-ink"
                  />
                  <figcaption className="mt-1.5 text-[0.7rem] text-slate/70">
                    slice #{preview.index}
                    {preview.index === result.top_attention_index && (
                      <span className="text-crimson"> · peak attention</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
