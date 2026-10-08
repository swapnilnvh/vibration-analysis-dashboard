from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from scipy import signal
from models.schemas import PsychoacousticMetricResponse, PsychoacousticChannelData
from services.file_parser import get_dataset

def hz_to_bark(f: np.ndarray) -> np.ndarray:
    """Zwicker & Terhardt Bark scale conversion."""
    f = np.maximum(0.0, f)
    return 13.0 * np.arctan(0.00076 * f) + 3.5 * np.arctan((f / 7500.0) ** 2)

def din45692_weighting(z: np.ndarray) -> np.ndarray:
    """DIN 45692 high-frequency sharpness weighting function."""
    g = np.ones_like(z)
    high_mask = z > 15.8
    g[high_mask] = 0.15 * np.exp(0.42 * (z[high_mask] - 15.8)) + 0.85
    return g

def _build_channel_data(values: List[float]) -> PsychoacousticChannelData:
    arr = np.array(values) if values else np.array([0.0])
    return PsychoacousticChannelData(
        values=values,
        mean=round(float(np.mean(arr)), 4),
        peak=round(float(np.max(arr)), 4),
        min=round(float(np.min(arr)), 4),
        percentile_95=round(float(np.percentile(arr, 95)), 4)
    )

def _calc_sharpness_signal(sig: np.ndarray, fs: float, frame_length_sec: float, hop_length_sec: float) -> Tuple[List[float], List[float]]:
    n_samples = len(sig)
    frame_size = int(max(64, frame_length_sec * fs))
    hop_size = int(max(16, hop_length_sec * fs))

    time_points = []
    sharpness_values = []

    freqs = np.fft.rfftfreq(frame_size, d=1.0 / fs)
    barks = hz_to_bark(freqs)
    weights = din45692_weighting(barks)
    hann_win = np.hanning(frame_size)

    for start in range(0, n_samples - frame_size + 1, hop_size):
        frame = sig[start:start + frame_size]
        center_t = (start + frame_size / 2.0) / fs
        
        frame_win = (frame - np.mean(frame)) * hann_win
        fft_vals = np.abs(np.fft.rfft(frame_win)) ** 2

        denom = np.sum(fft_vals)
        if denom > 1e-12:
            c = 0.11
            num = np.sum(barks * weights * fft_vals)
            s_val = c * (num / denom)
        else:
            s_val = 0.0

        time_points.append(round(center_t, 4))
        sharpness_values.append(round(float(s_val), 4))

    return time_points, sharpness_values

def _calc_roughness_signal(sig: np.ndarray, fs: float, frame_length_sec: float, hop_length_sec: float) -> Tuple[List[float], List[float]]:
    n_samples = len(sig)
    analytic_signal = signal.hilbert(sig - np.mean(sig))
    envelope = np.abs(analytic_signal)

    frame_size = int(max(64, frame_length_sec * fs))
    hop_size = int(max(16, hop_length_sec * fs))

    time_points = []
    roughness_values = []

    hann_win = np.hanning(frame_size)
    env_freqs = np.fft.rfftfreq(frame_size, d=1.0 / fs)

    rough_mask = (env_freqs >= 20.0) & (env_freqs <= 300.0)
    f_mod = env_freqs[rough_mask]
    
    if len(f_mod) > 0:
        h_weight = (f_mod / 70.0) * np.exp(1.0 - (f_mod / 70.0))
    else:
        h_weight = np.array([])

    for start in range(0, n_samples - frame_size + 1, hop_size):
        env_frame = envelope[start:start + frame_size]
        center_t = (start + frame_size / 2.0) / fs

        dc = np.mean(env_frame)
        if dc > 1e-6:
            ac_frame = (env_frame - dc) * hann_win
            fft_env = (2.0 * np.abs(np.fft.rfft(ac_frame))) / frame_size
            mod_amps = fft_env[rough_mask]

            if len(mod_amps) > 0:
                weighted_mod = np.sum((mod_amps / dc) * h_weight)
                r_val = float(weighted_mod * 1.25)
            else:
                r_val = 0.0
        else:
            r_val = 0.0

        time_points.append(round(center_t, 4))
        roughness_values.append(round(max(0.0, r_val), 4))

    return time_points, roughness_values

def _calc_fluctuation_signal(sig: np.ndarray, fs: float, frame_length_sec: float, hop_length_sec: float) -> Tuple[List[float], List[float]]:
    n_samples = len(sig)
    analytic_signal = signal.hilbert(sig - np.mean(sig))
    envelope = np.abs(analytic_signal)

    frame_size = int(max(128, frame_length_sec * fs))
    hop_size = int(max(32, hop_length_sec * fs))

    time_points = []
    fluct_values = []

    hann_win = np.hanning(frame_size)
    env_freqs = np.fft.rfftfreq(frame_size, d=1.0 / fs)

    fluc_mask = (env_freqs >= 0.5) & (env_freqs <= 20.0)
    f_mod = env_freqs[fluc_mask]

    if len(f_mod) > 0:
        f_weight = (f_mod / 4.0) * np.exp(1.0 - (f_mod / 4.0))
    else:
        f_weight = np.array([])

    for start in range(0, n_samples - frame_size + 1, hop_size):
        env_frame = envelope[start:start + frame_size]
        center_t = (start + frame_size / 2.0) / fs

        dc = np.mean(env_frame)
        if dc > 1e-6:
            ac_frame = (env_frame - dc) * hann_win
            fft_env = (2.0 * np.abs(np.fft.rfft(ac_frame))) / frame_size
            mod_amps = fft_env[fluc_mask]

            if len(mod_amps) > 0:
                weighted_mod = np.sum((mod_amps / dc) * f_weight)
                fluc_val = float(weighted_mod * 1.5)
            else:
                fluc_val = 0.0
        else:
            fluc_val = 0.0

        time_points.append(round(center_t, 4))
        fluct_values.append(round(max(0.0, fluc_val), 4))

    return time_points, fluct_values

def compute_sharpness_series(
    file_id: str,
    axis: str = "ALL",
    frame_length_sec: float = 0.1,
    hop_length_sec: float = 0.05
) -> PsychoacousticMetricResponse:
    """
    Computes time-varying Vibration Sharpness across 3-Axis (X, Y, Z) and Triaxial Resultant magnitude.
    Method: Adapted DIN 45692 / von Bismarck spectral centroid model for mechanical acceleration.
    """
    ds = get_dataset(file_id)
    df = ds["raw_df"]
    fs = ds["metadata"]["sampling_frequency"]

    sig_x = df['X'].values
    sig_y = df['Y'].values
    sig_z = df['Z'].values
    # Triaxial vector magnitude
    sig_tri = np.sqrt(sig_x**2 + sig_y**2 + sig_z**2)

    t_pts, vals_x = _calc_sharpness_signal(sig_x, fs, frame_length_sec, hop_length_sec)
    _, vals_y = _calc_sharpness_signal(sig_y, fs, frame_length_sec, hop_length_sec)
    _, vals_z = _calc_sharpness_signal(sig_z, fs, frame_length_sec, hop_length_sec)
    _, vals_tri = _calc_sharpness_signal(sig_tri, fs, frame_length_sec, hop_length_sec)

    chan_x = _build_channel_data(vals_x)
    chan_y = _build_channel_data(vals_y)
    chan_z = _build_channel_data(vals_z)
    chan_tri = _build_channel_data(vals_tri)

    # Pick representative primary channel
    primary_chan = chan_tri if axis.upper() in ["ALL", "TRIAXIAL"] else (
        chan_x if axis.upper() == "X" else (chan_y if axis.upper() == "Y" else chan_z)
    )

    return PsychoacousticMetricResponse(
        file_id=file_id,
        axis=axis.upper(),
        metric="Sharpness",
        unit="acum (estimated)",
        time=t_pts,
        values=primary_chan.values,
        mean=primary_chan.mean,
        peak=primary_chan.peak,
        min=primary_chan.min,
        percentile_95=primary_chan.percentile_95,
        x=chan_x,
        y=chan_y,
        z=chan_z,
        triaxial=chan_tri,
        methodology=(
            "Estimated 3-Axis Vibration Sharpness calculated using DIN 45692 spectral centroid "
            "weighting over critical Bark bands adapted for 3-axis acceleration signals and triaxial vector magnitude. "
            "Note: This is an engineering vibration estimate rather than an acoustic sound pressure measurement."
        ),
        is_estimated=True
    )

def compute_roughness_series(
    file_id: str,
    axis: str = "ALL",
    frame_length_sec: float = 0.1,
    hop_length_sec: float = 0.05
) -> PsychoacousticMetricResponse:
    """
    Computes time-varying Vibration Roughness across 3-Axis (X, Y, Z) and Triaxial Resultant magnitude.
    Method: Hilbert envelope demodulation for 20-300 Hz modulations (Daniel & Weber adaptation).
    """
    ds = get_dataset(file_id)
    df = ds["raw_df"]
    fs = ds["metadata"]["sampling_frequency"]

    sig_x = df['X'].values
    sig_y = df['Y'].values
    sig_z = df['Z'].values
    sig_tri = np.sqrt(sig_x**2 + sig_y**2 + sig_z**2)

    t_pts, vals_x = _calc_roughness_signal(sig_x, fs, frame_length_sec, hop_length_sec)
    _, vals_y = _calc_roughness_signal(sig_y, fs, frame_length_sec, hop_length_sec)
    _, vals_z = _calc_roughness_signal(sig_z, fs, frame_length_sec, hop_length_sec)
    _, vals_tri = _calc_roughness_signal(sig_tri, fs, frame_length_sec, hop_length_sec)

    chan_x = _build_channel_data(vals_x)
    chan_y = _build_channel_data(vals_y)
    chan_z = _build_channel_data(vals_z)
    chan_tri = _build_channel_data(vals_tri)

    primary_chan = chan_tri if axis.upper() in ["ALL", "TRIAXIAL"] else (
        chan_x if axis.upper() == "X" else (chan_y if axis.upper() == "Y" else chan_z)
    )

    return PsychoacousticMetricResponse(
        file_id=file_id,
        axis=axis.upper(),
        metric="Roughness",
        unit="asper (estimated)",
        time=t_pts,
        values=primary_chan.values,
        mean=primary_chan.mean,
        peak=primary_chan.peak,
        min=primary_chan.min,
        percentile_95=primary_chan.percentile_95,
        x=chan_x,
        y=chan_y,
        z=chan_z,
        triaxial=chan_tri,
        methodology=(
            "Estimated 3-Axis Vibration Roughness computed via Hilbert analytic signal demodulation. "
            "Evaluates rapid modulation depth in the 20–300 Hz range with peak human/mechanical sensitivity "
            "weighting at 70 Hz (Daniel & Weber envelope adaptation) across X, Y, Z, and Triaxial magnitude."
        ),
        is_estimated=True
    )

def compute_fluctuation_series(
    file_id: str,
    axis: str = "ALL",
    frame_length_sec: float = 0.25,
    hop_length_sec: float = 0.1
) -> PsychoacousticMetricResponse:
    """
    Computes time-varying Fluctuation Strength across 3-Axis (X, Y, Z) and Triaxial Resultant magnitude.
    Method: Hilbert envelope demodulation for slow modulations (< 20 Hz, peak ~4 Hz, Fastl model).
    """
    ds = get_dataset(file_id)
    df = ds["raw_df"]
    fs = ds["metadata"]["sampling_frequency"]

    sig_x = df['X'].values
    sig_y = df['Y'].values
    sig_z = df['Z'].values
    sig_tri = np.sqrt(sig_x**2 + sig_y**2 + sig_z**2)

    t_pts, vals_x = _calc_fluctuation_signal(sig_x, fs, frame_length_sec, hop_length_sec)
    _, vals_y = _calc_fluctuation_signal(sig_y, fs, frame_length_sec, hop_length_sec)
    _, vals_z = _calc_fluctuation_signal(sig_z, fs, frame_length_sec, hop_length_sec)
    _, vals_tri = _calc_fluctuation_signal(sig_tri, fs, frame_length_sec, hop_length_sec)

    chan_x = _build_channel_data(vals_x)
    chan_y = _build_channel_data(vals_y)
    chan_z = _build_channel_data(vals_z)
    chan_tri = _build_channel_data(vals_tri)

    primary_chan = chan_tri if axis.upper() in ["ALL", "TRIAXIAL"] else (
        chan_x if axis.upper() == "X" else (chan_y if axis.upper() == "Y" else chan_z)
    )

    return PsychoacousticMetricResponse(
        file_id=file_id,
        axis=axis.upper(),
        metric="Fluctuation Strength",
        unit="vacil (estimated)",
        time=t_pts,
        values=primary_chan.values,
        mean=primary_chan.mean,
        peak=primary_chan.peak,
        min=primary_chan.min,
        percentile_95=primary_chan.percentile_95,
        x=chan_x,
        y=chan_y,
        z=chan_z,
        triaxial=chan_tri,
        methodology=(
            "Estimated 3-Axis Vibration Fluctuation Strength computed via Hilbert envelope demodulation. "
            "Measures low-frequency amplitude modulations in the 0.5–20 Hz band with peak weighting "
            "at 4 Hz corresponding to human vibration shudder/surge perception (Fastl model adaptation) "
            "across X, Y, Z, and Triaxial magnitude."
        ),
        is_estimated=True
    )
