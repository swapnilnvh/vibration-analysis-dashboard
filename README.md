# NVH Vibration Data Analysis Dashboard
### Professional Vibration Analysis Software for Engineering Laboratories

An interactive, laboratory-grade **Vibration Data Analysis Dashboard** designed for **NVH (Noise, Vibration, and Harshness) and structural dynamics testing laboratories**.

The application parses, validates, and analyzes multi-channel vibration data obtained from **LabVIEW Throughput `.txt` files** (approximately 6,400 samples or larger datasets), separating user-facing visualization (**React.js + Plotly.js**) from high-performance numerical and signal processing (**Python FastAPI + NumPy + SciPy + Pandas**).

---

## 1. System Architecture

```text
                 ┌──────────────────────────────────────────────┐
                 │             React.js Frontend                │
                 │   (Vite + Plotly.js + Modern NVH Theme)      │
                 │                                              │
                 │  • Interactive Multi-Axis Time Series        │
                 │  • Coherent-Gain Corrected FFT Spectrum      │
                 │  • 3 Independent Spectrogram Colormaps       │
                 │  • Psychoacoustic Metrics (Sharpness, etc.)  │
                 │  • KPI Summary Cards & Provenance Audit      │
                 │  • PNG High-Res Graph & CSV Data Exports     │
                 └──────────────────────┬───────────────────────┘
                                        │
                                   REST API
                                        │
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │               FastAPI Backend                │
                 │                                              │
                 │  • LabVIEW Throughput Validator & Parser     │
                 │  • Non-Destructive Signal Resampling         │
                 │  • Statistical & Peak Feature Extraction     │
                 │  • Single-Sided FFT Spectrum & Welch PSD     │
                 │  • STFT Time-Frequency Spectrograms          │
                 │  • Hilbert Envelope Demodulation             │
                 │  • Raw & Processed CSV Streaming             │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │       NumPy / SciPy / Pandas Engine          │
                 │                                              │
                 │  • scipy.signal (stft, hilbert, windows)     │
                 │  • numpy.fft (rfft, rfftfreq)                │
                 │  • scipy.stats (kurtosis, skewness)          │
                 └──────────────────────────────────────────────┘
```

---

## 2. LabVIEW Throughput Input File Format

The application accepts standard **LabVIEW Throughput `.txt` files** containing 6 numeric columns:

| Column | Header / Metric | Units | Description |
| :--- | :--- | :--- | :--- |
| **Col 1** | `Time_X` | seconds (s) | Timestamp array for X-axis sensor |
| **Col 2** | `X(g)` | $g$ | X-axis instantaneous acceleration |
| **Col 3** | `Time_Y` | seconds (s) | Timestamp array for Y-axis sensor |
| **Col 4** | `Y(g)` | $g$ | Y-axis instantaneous acceleration |
| **Col 5** | `Time_Z` | seconds (s) | Timestamp array for Z-axis sensor |
| **Col 6** | `Z(g)` | $g$ | Z-axis instantaneous acceleration |

### Automated File Validation
The backend automatically validates:
* File extension (`.txt`, `.tsv`, `.csv`, `.dat`)
* Exactly 6 numeric columns per data row
* Monotonic timestamp progression ($\Delta t > 0$)
* Duplicate timestamp detection
* Sampling frequency calculation ($f_s = 1 / \Delta t$)
* Identification of NaN, null, or infinite values

---

## 3. Engineering Calculations & Methodology

### Time Domain Metrics
* **Root Mean Square (RMS):**
  $$RMS = \sqrt{\frac{1}{N} \sum_{i=1}^N x_i^2}$$
* **Peak Acceleration:** $\max(|x_i|)$
* **Peak-to-Peak (P-P):** $\max(x_i) - \min(x_i)$
* **Crest Factor:** $\frac{\text{Peak}}{RMS}$ (diagnostic indicator for bearing impulsive faults)
* **Kurtosis:** Fourth normalized statistical moment indicating impulsive mechanical shock.

### Non-Destructive Resampling
When selecting time increments (`Auto`, `0.001s`, `0.005s`, `0.010s`, `0.050s`, `0.100s`, `0.500s`, `1.000s`, or `Custom`):
* **The original raw data is never overwritten or mutated.**
* Raw data is preserved immutably in memory and disk backup.
* Linear interpolation/decimation generates an analyzed visualization copy.

### Frequency Domain (FFT Spectrum)
* SciPy single-sided Real Fast Fourier Transform (`rfft`).
* **Coherent Gain Window Compensation:**
  $$CF = \frac{1}{\frac{1}{N}\sum_{i=1}^N w_i}$$
  Ensures that pure sinusoidal components accurately read their true physical acceleration amplitude in $g$.
* **Window Functions:** Hanning, Hamming, Flat Top (amplitude calibrated), Blackman, Rectangular.
* Automatic dominant frequency detection and top-5 prominent spectral peak extraction.

### Three Independent Spectrogram Colormaps
* STFT-based time-frequency analysis using `scipy.signal.spectrogram`.
* Generates **3 separate graphs** for X, Y, and Z axes (never combined):
  * **Colormap 1:** X-Axis Vibration Spectrogram
  * **Colormap 2:** Y-Axis Vibration Spectrogram
  * **Colormap 3:** Z-Axis Vibration Spectrogram
* Configurable parameters: FFT block size (128–2048), window overlap (25%–90%), amplitude units (dB ref 1g or linear $g$), and color palettes (Viridis, Plasma, Inferno, Turbo, Jet).

### 3-Axis Psychoacoustic Vibration Metrics (X, Y, Z + Triaxial Magnitude)
* **3-Axis Vibration Sharpness (acum):** Evaluated using a DIN 45692 spectral centroid adaptation mapped over critical Bark frequency bands with exponential weighting above 15.8 Bark, computed across X, Y, Z, and the Triaxial Resultant Magnitude ($\sqrt{X^2 + Y^2 + Z^2}$).
* **3-Axis Vibration Roughness (asper):** Computed via Hilbert transform analytic signal demodulation ($e(t) = |\mathcal{H}\{x(t)\}|$) evaluated in the 20–300 Hz modulation band with 70 Hz peak sensitivity weighting (Daniel & Weber adaptation) across X, Y, Z, and Triaxial magnitude.
* **3-Axis Vibration Fluctuation Strength (vacil):** Extracted via envelope demodulation in the 0.5–20 Hz range with 4 Hz peak weighting (Fastl model adaptation) across X, Y, Z, and Triaxial magnitude to quantify cyclic shudder and surging.
* **Interactive Multi-Axis Visualization:** Each psychoacoustic graph supports independent channel toggles (`[x] X-Axis`, `[x] Y-Axis`, `[x] Z-Axis`, `[x] Triaxial (XYZ)`), individual KPI cards (Mean, Peak, 95th Percentile), and comprehensive CSV export with all 4 channels.

---

## 4. API Endpoints

### File Ingestion
* `POST /api/upload`: Multipart file upload, validation, and storage.
* `POST /api/upload/sample`: Instantly loads the built-in realistic 6,400-sample LabVIEW NVH dataset.

### Analysis
* `POST /api/analysis/kpi`: Calculates RMS, Peak, P-P, Crest Factor, and Kurtosis for X, Y, Z.
* `POST /api/analysis/time-domain`: Returns resampled time series for enabled axes.
* `POST /api/analysis/fft`: Returns coherent-gain corrected FFT spectrum and peak list.
* `POST /api/analysis/spectrogram`: Returns 2D STFT time-frequency matrix for an individual axis.
* `POST /api/analysis/sharpness`: Returns Time vs. Sharpness series.
* `POST /api/analysis/roughness`: Returns Time vs. Roughness series.
* `POST /api/analysis/fluctuation-strength`: Returns Time vs. Fluctuation Strength series.

### Data Exports
* `GET /api/download/raw/{file_id}`: Streams the unmodified raw data CSV (`Time_X, X_Vibration_g, Time_Y, Y_Vibration_g, Time_Z, Z_Vibration_g`).
* `GET /api/download/processed/{file_id}`: Streams the consolidated processed CSV including resampled signals, rolling RMS, FFT peaks, and psychoacoustic metrics.

---

## 5. Quick Start & Execution

### Option A: One-Click Startup (Recommended for Windows)
Double-click `start_dashboard.bat` (or execute `start_dashboard.ps1` in PowerShell). This launches both the FastAPI backend and the Vite frontend.

### Option B: Manual Execution

#### 1. Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* API Server: [http://localhost:8000](http://localhost:8000)
* Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 2. Frontend (React.js + Vite)
```bash
cd frontend
npm install
npm run dev
```
* Dashboard Interface: [http://localhost:5173](http://localhost:5173)

---

## 6. Pre-Packaged Sample Dataset
A realistic 6,400-sample LabVIEW Throughput dataset is included at:
`sample_files/LabVIEW_Throughput_6400_NVH_Test.txt`

It models:
* 1X Shaft unbalance at 30.0 Hz (1800 RPM)
* 2X and 3X harmonic distortion (60 Hz, 90 Hz)
* Gear mesh frequency at 180 Hz
* Outer-race bearing defect pulses (BPFO at 105 Hz modulated by shaft speed)
* Structural resonance band at 380 Hz
* 4 Hz low-frequency vehicle heave / engine fluctuation
* Sensor Gaussian background noise
