"""Stroke-AI demo backend.

Serves the brain-haemorrhage model behind the Brain Haemorrhage Pathway page:
a multiple-instance-learning model over non-contrast CT (NCCT) slices that
returns study-level probabilities for haemorrhage and its subtypes.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

import csv
import os
import shutil
import tempfile
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from ml.inference import LABEL_DESCRIPTIONS, LABELS, run_inference

BASE_DIR = Path(__file__).resolve().parent
TEST_DATA_DIR = BASE_DIR / "test_data"
GROUND_TRUTH_CSV = TEST_DATA_DIR / "ground_truth_labels.csv"

# Vite's dev server by default; override in deployment with a comma-separated list.
ALLOWED_ORIGINS = os.environ.get(
    "STROKE_AI_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app = FastAPI(title="Stroke-AI Demo API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _load_ground_truth() -> dict:
    if not GROUND_TRUTH_CSV.exists():
        return {}
    with GROUND_TRUTH_CSV.open() as f:
        return {
            row["folder"]: {label: int(row[label]) for label in LABELS if label in row}
            for row in csv.DictReader(f)
        }


@app.get("/api/health")
def health():
    return {"status": "ok", "labels": LABELS, "label_descriptions": LABEL_DESCRIPTIONS}


@app.get("/api/samples")
def list_samples():
    """Bundled demo studies — real held-out CQ500 patients the model never trained on."""
    if not TEST_DATA_DIR.exists():
        return {"samples": []}

    ground_truth = _load_ground_truth()
    samples = []
    for folder in sorted(p for p in TEST_DATA_DIR.iterdir() if p.is_dir()):
        samples.append(
            {
                "id": folder.name,
                "n_slices": len(list(folder.glob("*.dcm"))),
                "ground_truth": ground_truth.get(folder.name),
            }
        )
    return {"samples": samples}


@app.post("/api/predict")
async def predict(sample_id: Optional[str] = Form(None), files: List[UploadFile] = File(default=[])):
    """Run the model on either a bundled sample study or uploaded NCCT slices."""
    if sample_id:
        series_dir = (TEST_DATA_DIR / sample_id).resolve()
        # Keep a crafted sample_id from escaping the demo data directory.
        if TEST_DATA_DIR.resolve() not in series_dir.parents or not series_dir.is_dir():
            raise HTTPException(status_code=404, detail=f"Unknown sample: {sample_id}")
        result = run_inference(series_dir)
        if result is None:
            raise HTTPException(status_code=422, detail="No readable DICOM slices in that sample.")
        return {"source": {"type": "sample", "id": sample_id}, **result}

    if not files:
        raise HTTPException(status_code=400, detail="Provide either a sample_id or one or more DICOM files.")

    tmp_dir = Path(tempfile.mkdtemp(prefix="strokeai_upload_"))
    try:
        for i, upload in enumerate(files):
            # A folder upload sends relative paths ("series/CT000000.dcm"), so keep
            # only the basename — that also stops an uploaded path from escaping
            # tmp_dir. The index prefix keeps same-named slices from different
            # subfolders from overwriting each other; slice order comes from the
            # DICOM headers, not the filename.
            name = Path(upload.filename or "slice.dcm").name
            # PACS exports often have no extension, and the series reader only
            # picks up .dcm/.dicom, so normalise it here.
            if not name.lower().endswith((".dcm", ".dicom")):
                name = f"{name}.dcm"
            target = tmp_dir / f"{i:05d}_{name}"
            with target.open("wb") as out:
                shutil.copyfileobj(upload.file, out)

        result = run_inference(tmp_dir)
        if result is None:
            raise HTTPException(status_code=422, detail="Could not read any DICOM slices from the upload.")
        return {"source": {"type": "upload", "n_files": len(files)}, **result}
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
