from typing import Dict, Any, List, Optional
import numpy as np
from scipy import signal
from models.schemas import FFTResponse, FFTAxisData, PeakInfo
from services.file_parser import get_dataset

WINDOW_MAP = {
    "hanning": signal.windows.hann,
    "hann": signal.windows.hann,
    "hamming": signal.windows.hamming,
    "blackman": signal.windows.blackman,
    "flattop": signal.windows.flattop,
    "rectangular": lambda n: np.ones(n),
    "none": lambda n: np.ones(n)
}

def compute_fft_spectrum(
    file_id: str,
    frequency_min: Optional[float] = 0.0,
    frequency_max: Optional[float] = None,
    axes: Optional[List[str]] = None,
    window_name: str = "hanning"
) -> FFTResponse:
    """
    Computes single-sided FFT amplitude spectrum for selected axes.
    Applies coherent gain window compensation so sinusoidal peaks
    accurately reflect true physical vibration amplitude in g.
    """
    ds = get_dataset(file_id)
    df = ds["raw_df"]
    fs = ds["metadata"]["sampling_frequency"]
    nyquist = fs / 2.0

    if axes is None:
        axes = ["X", "Y", "Z"]
    axes = [a.upper() for a in axes if a.upper() in ["X", "Y", "Z"]]

    f_min = max(0.0, frequency_min or 0.0)
    f_max = min(nyquist, frequency_max if (frequency_max and frequency_max > 0) else nyquist)
    if f_min >= f_max:
        f_min = 0.0
        f_max = nyquist

    w_key = window_name.lower().strip()
    window_func = WINDOW_MAP.get(w_key, signal.windows.hann)

    n_samples = len(df)
    # Generate window and compute amplitude coherent gain
    win = window_func(n_samples)
    coherent_gain = np.mean(win)
    if coherent_gain < 1e-6:
        coherent_gain = 1.0

    freqs = np.fft.rfftfreq(n_samples, d=1.0 / fs)

    # Slice indices within [f_min, f_max]
    mask = (freqs >= f_min) & (freqs <= f_max)
    sliced_freqs = freqs[mask]

    axes_results: Dict[str, FFTAxisData] = {}

    for ax in axes:
        sig = df[ax].values
        # Detrend signal to remove DC bias
        detrended_sig = sig - np.mean(sig)

        # Apply window
        windowed_sig = detrended_sig * win

        # Real FFT
        fft_vals = np.fft.rfft(windowed_sig)
        
        # Amplitude spectrum: 2 * |FFT| / (N * coherent_gain)
        amps = (2.0 * np.abs(fft_vals)) / (n_samples * coherent_gain)
        if len(amps) > 0:
            amps[0] = amps[0] / 2.0  # DC term

        sliced_amps = amps[mask]

        if len(sliced_amps) == 0:
            axes_results[ax] = FFTAxisData(
                frequency=[], amplitude=[],
                dominant_frequency=0.0, dominant_amplitude=0.0,
                top_peaks=[], total_energy=0.0
            )
            continue

        # Dominant frequency
        max_idx = np.argmax(sliced_amps)
        dom_freq = float(sliced_freqs[max_idx])
        dom_amp = float(sliced_amps[max_idx])

        # Find prominent peaks
        peaks, props = signal.find_peaks(sliced_amps, distance=max(1, len(sliced_amps) // 50), prominence=dom_amp * 0.05)
        top_peaks_list = []
        if len(peaks) > 0:
            peak_amps = sliced_amps[peaks]
            sorted_order = np.argsort(peak_amps)[::-1][:5]
            for p_idx in sorted_order:
                peak_i = peaks[p_idx]
                top_peaks_list.append(PeakInfo(
                    frequency=round(float(sliced_freqs[peak_i]), 2),
                    amplitude=round(float(sliced_amps[peak_i]), 4)
                ))
        else:
            top_peaks_list.append(PeakInfo(frequency=round(dom_freq, 2), amplitude=round(dom_amp, 4)))

        total_energy = float(np.sum(sliced_amps ** 2))

        axes_results[ax] = FFTAxisData(
            frequency=[round(float(f), 3) for f in sliced_freqs],
            amplitude=[round(float(a), 5) for a in sliced_amps],
            dominant_frequency=round(dom_freq, 2),
            dominant_amplitude=round(dom_amp, 4),
            top_peaks=top_peaks_list,
            total_energy=round(total_energy, 4)
        )

    return FFTResponse(
        file_id=file_id,
        window=window_name,
        frequency_min=round(f_min, 2),
        frequency_max=round(f_max, 2),
        sampling_frequency=round(fs, 2),
        data=axes_results
    )
