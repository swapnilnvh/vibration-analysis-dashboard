from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    samples: int
    sampling_frequency: float
    duration: float
    columns: List[str]
    time_increment_original: float
    message: str

class AxisSelection(BaseModel):
    x: bool = True
    y: bool = True
    z: bool = True

class TimeDomainRequest(BaseModel):
    file_id: str
    time_increment: Optional[Union[float, str]] = "auto"
    axes: List[str] = Field(default_factory=lambda: ["X", "Y", "Z"])

class TimeDomainResponse(BaseModel):
    file_id: str
    time_increment: float
    samples_returned: int
    time: List[float]
    x: Optional[List[float]] = None
    y: Optional[List[float]] = None
    z: Optional[List[float]] = None

class FFTRequest(BaseModel):
    file_id: str
    frequency_min: Optional[float] = 0.0
    frequency_max: Optional[float] = None
    axes: List[str] = Field(default_factory=lambda: ["X", "Y", "Z"])
    window: Optional[str] = "hanning"
    scale: Optional[str] = "linear"

class PeakInfo(BaseModel):
    frequency: float
    amplitude: float

class FFTAxisData(BaseModel):
    frequency: List[float]
    amplitude: List[float]
    dominant_frequency: float
    dominant_amplitude: float
    top_peaks: List[PeakInfo]
    total_energy: float

class FFTResponse(BaseModel):
    file_id: str
    window: str
    frequency_min: float
    frequency_max: float
    sampling_frequency: float
    data: Dict[str, FFTAxisData]

class SpectrogramRequest(BaseModel):
    file_id: str
    axis: str = "X"
    fft_size: Optional[int] = None
    freq_resolution: Optional[float] = 1.0  # default 1.0 Hz resolution
    overlap: float = 0.5
    window: str = "hann"
    frequency_min: Optional[float] = 0.0
    frequency_max: Optional[float] = None
    scale: str = "db"  # 'db' or 'linear'

class SpectrogramResponse(BaseModel):
    file_id: str
    axis: str
    time: List[float]
    frequency: List[float]
    amplitude: List[List[float]]  # 2D grid [freq_idx][time_idx]
    min_value: float
    max_value: float
    units: str
    fft_size: int
    freq_resolution: float
    overlap: float
    window: str

class PsychoacousticChannelData(BaseModel):
    values: List[float]
    mean: float
    peak: float
    min: float
    percentile_95: float

class PsychoacousticRequest(BaseModel):
    file_id: str
    axis: Optional[str] = "ALL"
    frame_length_sec: Optional[float] = 0.1
    hop_length_sec: Optional[float] = 0.05

class PsychoacousticMetricResponse(BaseModel):
    file_id: str
    axis: str = "ALL"
    metric: str
    unit: str
    time: List[float]
    values: Optional[List[float]] = None
    mean: Optional[float] = None
    peak: Optional[float] = None
    min: Optional[float] = None
    percentile_95: Optional[float] = None
    x: Optional[PsychoacousticChannelData] = None
    y: Optional[PsychoacousticChannelData] = None
    z: Optional[PsychoacousticChannelData] = None
    triaxial: Optional[PsychoacousticChannelData] = None
    methodology: str
    is_estimated: bool = True

class KPIAxisMetrics(BaseModel):
    rms: float
    peak: float
    peak_to_peak: float
    maximum: float
    minimum: float
    crest_factor: float
    kurtosis: float
    std_dev: float

class KPIOverviewResponse(BaseModel):
    file_id: str
    filename: str
    samples: int
    sampling_frequency: float
    duration: float
    time_increment: float
    x_axis: Optional[KPIAxisMetrics] = None
    y_axis: Optional[KPIAxisMetrics] = None
    z_axis: Optional[KPIAxisMetrics] = None

class ErrorResponse(BaseModel):
    error: bool = True
    message: str
    details: Optional[Dict[str, Any]] = None
