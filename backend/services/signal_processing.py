from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from scipy import signal, stats
from models.schemas import KPIAxisMetrics, KPIOverviewResponse
from services.file_parser import get_dataset

def calculate_axis_kpis(values: np.ndarray) -> KPIAxisMetrics:
    """
    Computes key NVH vibration parameters for a single axis:
    - RMS (Root Mean Square)
    - Peak (|x|_max)
    - Peak-to-Peak (max - min)
    - Maximum
    - Minimum
    - Crest Factor (Peak / RMS)
    - Kurtosis (Impulsive fault indicator)
    - Standard Deviation
    """
    if len(values) == 0:
        return KPIAxisMetrics(
            rms=0.0, peak=0.0, peak_to_peak=0.0,
            maximum=0.0, minimum=0.0, crest_factor=0.0,
            kurtosis=0.0, std_dev=0.0
        )

    v_max = float(np.max(values))
    v_min = float(np.min(values))
    peak = float(np.max(np.abs(values)))
    rms = float(np.sqrt(np.mean(values ** 2)))
    p_to_p = float(v_max - v_min)
    crest_factor = float(peak / rms) if rms > 1e-12 else 0.0
    kurt = float(stats.kurtosis(values, fisher=True)) # Fisher's kurtosis (0 for normal)
    std_dev = float(np.std(values))

    return KPIAxisMetrics(
        rms=round(rms, 5),
        peak=round(peak, 5),
        peak_to_peak=round(p_to_p, 5),
        maximum=round(v_max, 5),
        minimum=round(v_min, 5),
        crest_factor=round(crest_factor, 4),
        kurtosis=round(kurt, 4),
        std_dev=round(std_dev, 5)
    )


def compute_kpi_overview(file_id: str) -> KPIOverviewResponse:
    """
    Computes KPI metrics across X, Y, and Z axes from raw dataset.
    """
    ds = get_dataset(file_id)
    df = ds["raw_df"]
    meta = ds["metadata"]

    kpi_x = calculate_axis_kpis(df['X'].values)
    kpi_y = calculate_axis_kpis(df['Y'].values)
    kpi_z = calculate_axis_kpis(df['Z'].values)

    return KPIOverviewResponse(
        file_id=file_id,
        filename=meta["filename"],
        samples=meta["samples"],
        sampling_frequency=meta["sampling_frequency"],
        duration=meta["duration"],
        time_increment=meta["time_increment_original"],
        x_axis=kpi_x,
        y_axis=kpi_y,
        z_axis=kpi_z
    )


def resample_time_series(
    file_id: str,
    target_dt: Optional[Union[float, str]] = "auto",
    axes: Optional[List[str]] = None
) -> Tuple[np.ndarray, Dict[str, np.ndarray], float]:
    """
    Resamples time-series data according to the selected time increment.
    Original raw data is never modified.
    
    Returns:
    - time_array
    - dict of axis_name -> resampled_array
    - effective_dt
    """
    ds = get_dataset(file_id)
    df = ds["raw_df"]
    orig_dt = ds["metadata"]["time_increment_original"]
    total_len = len(df)

    t_orig = df['Time_X'].values
    t_start, t_end = t_orig[0], t_orig[-1]

    if axes is None:
        axes = ["X", "Y", "Z"]
    axes = [a.upper() for a in axes if a.upper() in ["X", "Y", "Z"]]

    # Determine desired delta t
    if target_dt is None or str(target_dt).lower() in ["auto", "none", ""]:
        # If dataset is huge (> 15000 points), downsample for smooth browser charting
        if total_len > 15000:
            target_step = int(np.ceil(total_len / 10000))
            eff_dt = orig_dt * target_step
            indices = np.arange(0, total_len, target_step)
            t_res = t_orig[indices]
            res_dict = {ax: df[ax].values[indices] for ax in axes}
            return t_res, res_dict, float(eff_dt)
        else:
            return t_orig, {ax: df[ax].values for ax in axes}, float(orig_dt)

    try:
        dt_val = float(target_dt)
    except (ValueError, TypeError):
        dt_val = orig_dt

    if dt_val <= 0:
        dt_val = orig_dt

    # If requested dt is practically equal to original dt (within 2%)
    if abs(dt_val - orig_dt) / orig_dt < 0.02:
        return t_orig, {ax: df[ax].values for ax in axes}, float(orig_dt)

    # If requested dt is coarser than original dt, resample cleanly
    new_t = np.arange(t_start, t_end + (dt_val / 2.0), dt_val)
    if len(new_t) > 50000:
        # Cap to prevent out-of-memory on accidental microsecond inputs
        new_t = np.linspace(t_start, t_end, 50000)
        dt_val = float((t_end - t_start) / 50000)

    res_dict = {}
    for ax in axes:
        # Linear interpolation onto new uniform time grid
        orig_y = df[ax].values
        interp_y = np.interp(new_t, t_orig, orig_y)
        res_dict[ax] = interp_y

    return new_t, res_dict, float(dt_val)
