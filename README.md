# Stroke-AI

The intelligent command centre for stroke care — a joint initiative of
[SHRI-AI](https://shri-ai.org) and [IndoStates Health Hospital](https://indostates.com/).

```
client/    Vite + React SPA — landing page and the in-app demo pages
server/    FastAPI backend — serves the NCCT haemorrhage model
deploy/    nginx site config and systemd unit for the EC2 deployment
assets/    images for the root-level static landing page
```

**Deploying to a server? See [DEPLOYMENT.md](DEPLOYMENT.md)** — a step-by-step
AWS EC2 runbook.

## Pages

| Route | What it is |
|---|---|
| `/` | Public landing page. The top-right **Explore Stroke-AI** button leads into the demo. |
| `/app` | **Patient Report** — a sample Acute Stroke Imaging & Triage Report (static demonstration case). |
| `/app/brain-haemorrhage-pathway` | **Brain Haemorrhage Pathway** — runs the trained model live on a real NCCT study. |

## Running locally

Requires **Node 20+** (Vite 8 will not build on Node 18) and **Python 3.10+**.

### Backend

Install the **CPU** build of PyTorch first — a plain `pip install torch` pulls
the CUDA build and ~2-3 GB of NVIDIA packages you don't need:

```bash
cd server
python3 -m venv .venv && source .venv/bin/activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The model checkpoint (`server/checkpoints/best_model.pt`) and six demo studies
(`server/test_data/`) are committed, so nothing else needs downloading. Check
it's up with `curl localhost:8000/api/health`.

### Frontend

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

`npm run dev` talks to `http://localhost:8000` by default; a production build
defaults to same-origin `/api` paths. Set `VITE_API_BASE_URL` (see
`client/.env.example`) only when the API lives on a different host.

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Liveness check plus the label list. |
| `GET /api/samples` | The bundled demo studies and their radiologist ground-truth labels. |
| `POST /api/predict` | Runs the model. Send either `sample_id` (a bundled study) or `files` (uploaded DICOM slices). |

Returns study-level probabilities for haemorrhage (ICH), its five subtypes (IPH,
IVH, SDH, EDH, SAH), mass effect and midline shift, plus per-slice attention
weights and triple-windowed slice previews.

Uploads accept a whole series folder (nested subfolders are walked) and
extensionless PACS-style exports, not just individually selected `.dcm` files.

## About the model

A multiple-instance-learning model (EfficientNet-B0 encoder + gated attention
pooling over a study's slices) trained on ~320
[CQ500](http://headctstudy.qure.ai/dataset) studies. Held-out test performance:
**AUROC 0.878** for any haemorrhage. Inference samples 24 evenly spaced slices
per study and runs on CPU in about a second.

Inputs must be **non-contrast CT (NCCT) head, axial** — the modality it was
trained on. Bone-kernel, contrast-enhanced and non-head series will produce
meaningless output.

The six bundled demo studies are real held-out CQ500 patients the model never
saw during training; their ground-truth labels are the majority vote of three
radiologists.

## Notes for contributors

- Tailwind v4 is configured **CSS-first** — theme tokens live in the `@theme`
  block of `client/src/index.css`, and there is deliberately no
  `tailwind.config.js`.
- Report charts are hand-rolled inline SVG (`client/src/components/report/`), so
  there is no charting dependency.
- Lint with `npm run lint` (oxlint). One pre-existing warning in
  `FadeSection.jsx` is inherited from the original landing-page code.
- `server/ml/` mirrors the training-time preprocessing exactly (HU conversion,
  triple-window rendering, slice ordering by `ImagePositionPatient`). Changing
  it changes what the model sees, so keep it in step with training.

> **Research prototype — not for clinical use.** All outputs require
> verification by a qualified radiologist or stroke physician. The Patient
> Report page is a design demonstration populated with a sample case, not a real
> patient or live model output.
