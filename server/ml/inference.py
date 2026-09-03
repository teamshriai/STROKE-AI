"""Inference entry point: a folder of NCCT DICOM slices -> study-level results.

Mirrors the preprocessing the model was trained with: sort slices by anatomical
position, sample evenly across the volume, convert to Hounsfield Units, then
render each slice as a triple-window (brain / subdural / soft-tissue) RGB image.
"""
from __future__ import annotations

import base64
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional

import cv2
import numpy as np
import torch

from .dicom_utils import evenly_spaced_indices, list_and_sort_series, preprocess_dicom_path
from .models import CQ500MILModel

LABELS = ["ICH", "IPH", "IVH", "SDH", "EDH", "SAH", "MassEffect", "MidlineShift"]
LABEL_DESCRIPTIONS = {
    "ICH": "Any intracranial haemorrhage",
    "IPH": "Intraparenchymal haemorrhage",
    "IVH": "Intraventricular haemorrhage",
    "SDH": "Subdural haemorrhage",
    "EDH": "Extradural / epidural haemorrhage",
    "SAH": "Subarachnoid haemorrhage",
    "MassEffect": "Mass effect",
    "MidlineShift": "Midline shift",
}

CHECKPOINT_PATH = Path(__file__).resolve().parent.parent / "checkpoints" / "best_model.pt"
DEFAULT_N_SLICES = 24
DEFAULT_IMG_SIZE = 224


@lru_cache(maxsize=1)
def get_model() -> CQ500MILModel:
    model = CQ500MILModel(num_outputs=len(LABELS))
    model.load_state_dict(torch.load(CHECKPOINT_PATH, map_location="cpu"))
    model.eval()
    return model


def _png_data_uri(img: np.ndarray) -> str:
    """Encode a [0,1] float HxWx3 slice as a base64 PNG for the browser."""
    rgb = (np.clip(img, 0, 1) * 255).astype(np.uint8)
    ok, buf = cv2.imencode(".png", cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
    if not ok:
        return ""
    return "data:image/png;base64," + base64.b64encode(buf.tobytes()).decode("ascii")


def run_inference(
    series_dir: Path,
    n_slices: int = DEFAULT_N_SLICES,
    img_size: int = DEFAULT_IMG_SIZE,
    n_previews: int = 6,
) -> Optional[Dict]:
    paths = list_and_sort_series(str(series_dir), min_slices=1)
    if not paths:
        return None

    keep = evenly_spaced_indices(len(paths), n_slices)
    imgs = np.stack([preprocess_dicom_path(paths[i], size=img_size) for i in keep])
    batch = torch.from_numpy(imgs).permute(0, 3, 1, 2).unsqueeze(0).float()

    with torch.no_grad():
        logits, attn = get_model()(batch)
        probs = torch.sigmoid(logits).squeeze(0).numpy()
        attn = attn.squeeze(0).numpy()

    preview_positions = np.linspace(0, len(imgs) - 1, min(n_previews, len(imgs))).round().astype(int)
    previews: List[Dict] = [
        {
            "index": int(i),
            "attention": float(attn[i]),
            "image": _png_data_uri(imgs[i]),
        }
        for i in preview_positions
    ]

    return {
        "probabilities": {label: float(p) for label, p in zip(LABELS, probs)},
        "attention": [float(a) for a in attn],
        "top_attention_index": int(np.argmax(attn)),
        "n_slices_used": len(keep),
        "n_slices_available": len(paths),
        "previews": previews,
    }
