import os
import uuid
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
from utils.validation import validate_and_parse_labview_file, FileValidationError

# In-memory storage for active session datasets
# {file_id: {"raw_df": df, "metadata": dict, "raw_filepath": str}}
DATA_STORE: Dict[str, Dict[str, Any]] = {}

TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp")
SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_data")
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(SAMPLE_DIR, exist_ok=True)


def store_dataset(content_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Validates, parses, and securely stores the uploaded file.
    Original raw data is saved immutably.
    """
    df, metadata = validate_and_parse_labview_file(content_bytes, filename)
    file_id = str(uuid.uuid4())[:8]

    # Save raw backup copy to temp
    raw_path = os.path.join(TEMP_DIR, f"{file_id}_{filename}")
    with open(raw_path, "wb") as f:
        f.write(content_bytes)

    DATA_STORE[file_id] = {
        "raw_df": df.copy(),
        "metadata": metadata,
        "raw_filepath": raw_path,
        "filename": filename
    }

    return {
        "file_id": file_id,
        "filename": filename,
        "samples": metadata["samples"],
        "sampling_frequency": metadata["sampling_frequency"],
        "duration": metadata["duration"],
        "columns": metadata["columns"],
        "time_increment_original": metadata["time_increment_original"],
        "message": "File successfully uploaded, validated, and processed."
    }


def get_dataset(file_id: str) -> Dict[str, Any]:
    """
    Retrieves stored dataset by file_id.
    """
    if file_id not in DATA_STORE:
        raise KeyError(f"Dataset with ID '{file_id}' not found or session expired.")
    return DATA_STORE[file_id]


def generate_sample_dataset() -> Dict[str, Any]:
    """
    Generates a realistic 6,400-sample LabVIEW Throughput dataset for an NVH test:
    - 6,400 samples
    - fs = 1,000 Hz, dt = 0.001 s, duration = 6.4 s
    - X, Y, Z vibration profiles with mechanical harmonics, bearing fault peaks,
      structural resonance, and random sensor noise.
    """
    n_samples = 6400
    fs = 1000.0  # Hz
    dt = 1.0 / fs
    t = np.arange(n_samples) * dt

    # Multi-component NVH vibration signal synthesis
    # 1. 1X Shaft rotation (30 Hz = 1800 RPM)
    # 2. 2X Harmonics (60 Hz)
    # 3. Gear mesh (180 Hz)
    # 4. Bearing defect impacts (BPFO at 105 Hz modulated by 30 Hz shaft speed)
    # 5. Low-frequency structural roll/bounce (4 Hz)
    # 6. High frequency resonance burst (380 Hz)
    
    np.random.seed(42)

    # Modulation envelope for 4 Hz fluctuation & 70 Hz roughness
    mod_slow = 1.0 + 0.35 * np.sin(2 * np.pi * 4.0 * t)
    mod_rough = 1.0 + 0.25 * np.sin(2 * np.pi * 70.0 * t)

    # X-Axis: Dominant shaft unbalance, 1.0 Hz & 12.5 Hz resonance, & gear mesh
    x_vib = (
        0.45 * np.sin(2 * np.pi * 30.0 * t) * mod_slow +
        0.32 * np.sin(2 * np.pi * 1.0 * t) +
        0.28 * np.sin(2 * np.pi * 12.5 * t) +
        0.20 * np.sin(2 * np.pi * 60.0 * t) +
        0.30 * np.sin(2 * np.pi * 180.0 * t) * mod_rough +
        0.12 * np.sin(2 * np.pi * 380.0 * t) +
        0.05 * np.random.normal(0, 1, n_samples)
    )

    # Y-Axis: Lateral cross-coupling, 1.0 Hz & 12.5 Hz resonance, bearing defect signature
    bearing_pulse = 0.25 * np.sin(2 * np.pi * 105.0 * t) * (1.0 + 0.5 * np.sin(2 * np.pi * 30.0 * t))
    y_vib = (
        0.28 * np.sin(2 * np.pi * 30.0 * t + np.pi / 4) +
        0.30 * np.sin(2 * np.pi * 1.0 * t) +
        0.25 * np.sin(2 * np.pi * 12.5 * t) +
        0.15 * np.sin(2 * np.pi * 60.0 * t) +
        bearing_pulse +
        0.22 * np.sin(2 * np.pi * 240.0 * t) * mod_rough +
        0.04 * np.random.normal(0, 1, n_samples)
    )

    # Z-Axis: Vertical floor / thrust bearing, 1.0 Hz & 12.5 Hz resonance, higher frequency content
    z_vib = (
        0.18 * np.sin(2 * np.pi * 30.0 * t + np.pi / 2) +
        0.28 * np.sin(2 * np.pi * 1.0 * t) +
        0.22 * np.sin(2 * np.pi * 12.5 * t) +
        0.35 * np.sin(2 * np.pi * 120.0 * t) +
        0.15 * np.sin(2 * np.pi * 180.0 * t) +
        0.25 * np.sin(2 * np.pi * 420.0 * t) * mod_slow +
        0.06 * np.random.normal(0, 1, n_samples)
    )

    # Build DataFrame
    df = pd.DataFrame({
        'Time_X': np.round(t, 6),
        'X': np.round(x_vib, 5),
        'Time_Y': np.round(t, 6),
        'Y': np.round(y_vib, 5),
        'Time_Z': np.round(t, 6),
        'Z': np.round(z_vib, 5)
    })

    # Save sample text file to sample_data
    sample_filename = "LabVIEW_Throughput_6400_NVH_Test.txt"
    sample_file_path = os.path.join(SAMPLE_DIR, sample_filename)
    
    header_str = "Time_X\tX(g)\tTime_Y\tY(g)\tTime_Z\tZ(g)\n"
    content_lines = [header_str]
    for row in df.itertuples(index=False):
        content_lines.append(f"{row.Time_X:.4f}\t{row.X:.5f}\t{row.Time_Y:.4f}\t{row.Y:.5f}\t{row.Time_Z:.4f}\t{row.Z:.5f}\n")
    
    content_str = "".join(content_lines)
    content_bytes = content_str.encode("utf-8")
    
    with open(sample_file_path, "wb") as f:
        f.write(content_bytes)

    # Store in DATA_STORE
    file_id = "sample_nvh_labview"
    metadata = {
        "filename": sample_filename,
        "samples": n_samples,
        "sampling_frequency": fs,
        "duration": round(float(t[-1]), 4),
        "time_increment_original": dt,
        "columns": ['Time_X', 'X', 'Time_Y', 'Y', 'Time_Z', 'Z']
    }

    DATA_STORE[file_id] = {
        "raw_df": df.copy(),
        "metadata": metadata,
        "raw_filepath": sample_file_path,
        "filename": sample_filename
    }

    return {
        "file_id": file_id,
        "filename": sample_filename,
        "samples": n_samples,
        "sampling_frequency": fs,
        "duration": metadata["duration"],
        "columns": metadata["columns"],
        "time_increment_original": dt,
        "message": "Realistic 6,400-sample LabVIEW NVH test dataset generated and loaded."
    }
