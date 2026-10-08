from typing import Dict, Any, List, Optional
import numpy as np
from scipy import signal
from models.schemas import SpectrogramResponse
from services.file_parser import get_dataset

def compute_spectrogram(
    file_id: str,
    axis: str = "X",
    fft_size: Optional[int] = None,
    freq_resolution: Optional[float] = 1.0,
    overlap: float = 0.5,
    window: str = "hann",
    frequency_min: Optional[float] = 0.0,
    frequency_max: Optional[float] = None,
    scale: str = "db"
) -> SpectrogramResponse:
    """
    Computes STFT Spectrogram for a single axis (X, Y, or Z).
    Supports selectable frequency resolution (default 1.0 Hz).
    Returns 2D matrix suitable for Plotly Heatmap visualization.
    """
    ds = get_dataset(file_id)
    df = ds["raw_df"]
    fs = ds["metadata"]["sampling_frequency"]

    axis_clean = axis.upper().strip()
    if axis_clean not in ["X", "Y", "Z"]:
        axis_clean = "X"

    sig = df[axis_clean].values
    # Detrend
    sig = sig - np.mean(sig)

    # Determine nperseg / nfft based on frequency resolution (default 1.0 Hz)
    if freq_resolution is not None and freq_resolution > 0:
        # For fs = 1000 Hz and df = 1.0 Hz -> nperseg = 1000 / 1.0 = 1000 samples
        n_target = max(16, int(round(fs / float(freq_resolution))))
    elif fft_size is not None and int(fft_size) > 0:
        n_target = int(fft_size)
    else:
        n_target = 1000  # Default to 1.0 Hz for fs=1000 Hz

    nperseg = min(len(sig), n_target)
    if nperseg < 16:
        nperseg = 16

    overlap_frac = max(0.0, min(0.95, float(overlap)))
    noverlap = int(nperseg * overlap_frac)
    if noverlap >= nperseg:
        noverlap = nperseg - 1

    # Compute spectrogram using scipy.signal.spectrogram
    f, t, Sxx = signal.spectrogram(
        sig,
        fs=fs,
        window=window.lower(),
        nperseg=nperseg,
        noverlap=noverlap,
        nfft=n_target,
        scaling='spectrum',
        mode='magnitude'
    )

    # Calculate actual frequency resolution step (e.g. 12.5 Hz)
    actual_df = round(float(f[1] - f[0]), 2) if len(f) > 1 else round(float(fs / n_target), 2)

    # For single-sided spectrum of real vibration signals, scale AC components (f > 0)
    # so that sinusoidal peaks represent true physical single-sided peak vibration amplitudes (g)
    Sxx_scaled = Sxx.copy()
    if len(f) > 1:
        ac_mask = (f > 0) & (f < (fs / 2.0))
        Sxx_scaled[ac_mask, :] *= 2.0

    # Frequency filtering
    f_min = max(0.0, frequency_min or 0.0)
    nyquist = fs / 2.0
    f_max = min(nyquist, frequency_max if (frequency_max and frequency_max > 0) else nyquist)
    if f_min >= f_max:
        f_min = 0.0
        f_max = nyquist

    f_mask = (f >= f_min) & (f <= f_max)
    f_sliced = f[f_mask]
    Sxx_sliced = Sxx_scaled[f_mask, :]

    # Convert to dB if requested
    if scale.lower() == "db":
        # Reference 1.0 g: 20 * log10(magnitude / 1g)
        eps = 1e-9
        Z = 20.0 * np.log10(np.maximum(Sxx_sliced, eps))
        units = "dB (ref 1g)"
    else:
        Z = Sxx_sliced
        units = "Amplitude (g)"

    min_val = float(np.min(Z))
    max_val = float(np.max(Z))

    # Convert to rounded lists for JSON serialization
    z_list = [[round(float(val), 4) for val in row] for row in Z]

    return SpectrogramResponse(
        file_id=file_id,
        axis=axis_clean,
        time=[round(float(tv), 4) for tv in t],
        frequency=[round(float(fv), 2) for fv in f_sliced],
        amplitude=z_list,
        min_value=round(min_val, 2),
        max_value=round(max_val, 2),
        units=units,
        fft_size=nperseg,
        freq_resolution=actual_df,
        overlap=overlap_frac,
        window=window
    )
