"""DICOM loading, HU conversion, and triple-window rendering.

Preprocessing has to stay identical to what the model saw during training, so
this module is carried over unchanged from the training pipeline rather than
reimplemented here.
"""
from __future__ import annotations

import glob
import os
from typing import List, Optional

import cv2
import numpy as np
import pydicom

# Radiologists read haemorrhage across multiple windows; stacking them as RGB
# channels was the single biggest gain reported in the RSNA-ICH competition.
WINDOW_PRESETS = {
    "brain": (40, 80),
    "subdural": (80, 200),
    "soft_tissue": (40, 380),
}


def list_dicom_files(series_dir: str) -> List[str]:
    return sorted(
        f for f in glob.glob(os.path.join(series_dir, "*"))
        if f.lower().endswith((".dcm", ".dicom"))
    )


def slice_position(ds: pydicom.Dataset) -> float:
    """Anatomical sort key. Filenames like CT000000.dcm are NOT guaranteed to
    be in anatomical order -- always sort by geometry, falling back to
    SliceLocation/InstanceNumber only when ImagePositionPatient is absent."""
    ipp = getattr(ds, "ImagePositionPatient", None)
    if ipp is not None and len(ipp) == 3:
        return float(ipp[2])
    sl_loc = getattr(ds, "SliceLocation", None)
    if sl_loc is not None:
        return float(sl_loc)
    return float(getattr(ds, "InstanceNumber", 0) or 0)


def list_and_sort_series(series_dir: str, min_slices: int = 1) -> Optional[List[str]]:
    """Header-only pass (stop_before_pixels): return DICOM file paths in
    anatomical order without decoding pixel data for slices we may not use."""
    keyed = []
    for p in list_dicom_files(series_dir):
        try:
            ds = pydicom.dcmread(p, stop_before_pixels=True, force=True)
        except Exception:
            continue
        keyed.append((slice_position(ds), p))
    if len(keyed) < min_slices:
        return None
    keyed.sort(key=lambda t: t[0])
    return [p for _, p in keyed]


def get_rescale(ds: pydicom.Dataset):
    slope = float(getattr(ds, "RescaleSlope", 1.0) or 1.0)
    intercept = float(getattr(ds, "RescaleIntercept", 0.0) or 0.0)
    return slope, intercept


def to_hu(ds: pydicom.Dataset) -> np.ndarray:
    """Raw stored pixel values are scanner-dependent; HU is physical and
    comparable across sites -- essential when moving from CQ500/RSNA to a
    different scanner fleet."""
    slope, intercept = get_rescale(ds)
    pixels = ds.pixel_array.astype(np.float64)
    return pixels * slope + intercept


def window(hu: np.ndarray, center: float, width: float) -> np.ndarray:
    lo, hi = center - width / 2, center + width / 2
    return np.clip((hu - lo) / (hi - lo), 0, 1)


def triple_window(hu: np.ndarray) -> np.ndarray:
    """Stack brain/subdural/soft-tissue windows as an HxWx3 float32 image."""
    chans = [window(hu, c, w) for c, w in WINDOW_PRESETS.values()]
    return np.stack(chans, axis=-1).astype(np.float32)


def resize(img: np.ndarray, size: int) -> np.ndarray:
    interp = cv2.INTER_AREA if img.shape[0] > size else cv2.INTER_LINEAR
    return cv2.resize(img, (size, size), interpolation=interp)


def preprocess_dicom_path(path: str, size: int = 224) -> np.ndarray:
    """DICOM path -> HU -> triple-window -> fixed-size HxWx3 float32 in [0,1]."""
    ds = pydicom.dcmread(path, force=True)
    img = triple_window(to_hu(ds))
    return resize(img, size)


def evenly_spaced_indices(n_available: int, n_wanted: int) -> List[int]:
    if n_available <= n_wanted:
        return list(range(n_available))
    return list(np.linspace(0, n_available - 1, n_wanted).round().astype(int))
