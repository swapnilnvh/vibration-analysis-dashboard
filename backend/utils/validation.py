import io
import re
from typing import Tuple, List, Dict, Any
import numpy as np
import pandas as pd

class FileValidationError(Exception):
    def __init__(self, message: str, details: Dict[str, Any] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}

def validate_and_parse_labview_file(content_bytes: bytes, filename: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Validates and parses a LabVIEW Throughput .txt file.
    Expected format: 6 numeric columns:
    [Time_X, X_accel, Time_Y, Y_accel, Time_Z, Z_accel]
    
    Validations:
    - .txt format
    - Exactly 6 numeric columns per data row
    - Numeric values
    - No empty file or all empty rows
    - Monotonic timestamps with positive sampling interval
    - Duplicate timestamp check
    - Consistent sampling frequency
    """
    # 1. Check file extension
    if not filename.lower().endswith(('.txt', '.csv', '.tsv', '.dat')):
        raise FileValidationError(
            f"Invalid file extension: '{filename}'. Expected a .txt file (LabVIEW Throughput format)."
        )

    # 2. Decode text
    try:
        text = content_bytes.decode('utf-8')
    except UnicodeDecodeError:
        try:
            text = content_bytes.decode('latin-1')
        except Exception as e:
            raise FileValidationError("Could not decode file text. Please ensure UTF-8 or standard ASCII encoding.")

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        raise FileValidationError("The uploaded file is empty.")

    # 3. Detect header lines and find where data starts
    data_rows = []
    header_col_names = []
    delimiter = None

    for line_idx, line in enumerate(lines):
        # Skip comment lines
        if line.startswith('#') or line.startswith('//') or line.startswith('%'):
            continue
        
        # Detect delimiter if not yet set
        if delimiter is None:
            if '\t' in line:
                delimiter = '\t'
            elif ',' in line:
                delimiter = ','
            elif ';' in line:
                delimiter = ';'
            else:
                delimiter = r'\s+'

        # Split line
        if delimiter == r'\s+':
            tokens = re.split(r'\s+', line)
        else:
            tokens = [t.strip() for t in line.split(delimiter) if t.strip()]

        if len(tokens) == 0:
            continue

        # Check if first row is header
        is_numeric = True
        try:
            [float(t) for t in tokens]
        except ValueError:
            is_numeric = False

        if not is_numeric:
            if not header_col_names:
                header_col_names = tokens
            continue
        else:
            # It's numeric data
            if len(tokens) != 6:
                raise FileValidationError(
                    f"Row {line_idx + 1} has {len(tokens)} columns. Expected exactly 6 columns: "
                    "[Time_X, X_accel, Time_Y, Y_accel, Time_Z, Z_accel]."
                )
            try:
                numeric_row = [float(t) for t in tokens]
                data_rows.append(numeric_row)
            except ValueError as ve:
                raise FileValidationError(f"Invalid non-numeric value in row {line_idx + 1}: {str(ve)}")

    if len(data_rows) < 10:
        raise FileValidationError(
            f"File contains only {len(data_rows)} valid data rows. Expected at least 100 samples."
        )

    # 4. Create numpy array & DataFrame
    data_arr = np.array(data_rows, dtype=np.float64)
    
    # Check for NaN / Inf
    if np.isnan(data_arr).any() or np.isinf(data_arr).any():
        # Clean or reject
        nan_count = np.isnan(data_arr).sum()
        inf_count = np.isinf(data_arr).sum()
        raise FileValidationError(
            f"File contains invalid numeric values ({nan_count} NaNs, {inf_count} Infs)."
        )

    # Standard columns
    cols = ['Time_X', 'X', 'Time_Y', 'Y', 'Time_Z', 'Z']
    df = pd.DataFrame(data_arr, columns=cols)

    # 5. Timestamp validation
    t_x = df['Time_X'].values
    if len(t_x) != len(np.unique(t_x)):
        duplicates = len(t_x) - len(np.unique(t_x))
        raise FileValidationError(
            f"File contains {duplicates} duplicate timestamps in Time_X column. Timestamps must be unique."
        )

    dt_series = np.diff(t_x)
    if (dt_series <= 0).any():
        non_mono = np.sum(dt_series <= 0)
        raise FileValidationError(
            f"Timestamps are not strictly monotonically increasing ({non_mono} non-positive intervals found)."
        )

    # Calculate sampling stats
    median_dt = float(np.median(dt_series))
    if median_dt <= 0:
        raise FileValidationError("Invalid sampling interval (dt <= 0).")
    
    fs = round(1.0 / median_dt, 4)
    total_samples = int(len(df))
    duration = round(float(t_x[-1] - t_x[0]), 4)

    metadata = {
        "filename": filename,
        "samples": total_samples,
        "sampling_frequency": fs,
        "duration": duration,
        "time_increment_original": median_dt,
        "columns": cols
    }

    return df, metadata
