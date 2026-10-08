from fastapi import APIRouter, HTTPException, status
from models.schemas import (
    TimeDomainRequest, TimeDomainResponse,
    FFTRequest, FFTResponse,
    SpectrogramRequest, SpectrogramResponse,
    PsychoacousticRequest, PsychoacousticMetricResponse,
    KPIOverviewResponse, ErrorResponse
)
from services.signal_processing import compute_kpi_overview, resample_time_series
from services.fft_analysis import compute_fft_spectrum
from services.spectrogram import compute_spectrogram
from services.psychoacoustic import (
    compute_sharpness_series,
    compute_roughness_series,
    compute_fluctuation_series
)

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

@router.post("/kpi", response_model=KPIOverviewResponse, responses={400: {"model": ErrorResponse}})
async def get_kpis(req: dict):
    file_id = req.get("file_id")
    if not file_id:
        raise HTTPException(status_code=400, detail={"error": True, "message": "file_id is required."})
    try:
        return compute_kpi_overview(file_id)
    except KeyError as ke:
        raise HTTPException(status_code=404, detail={"error": True, "message": str(ke)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "message": f"KPI calculation error: {str(e)}"})


@router.post("/time-domain", response_model=TimeDomainResponse, responses={400: {"model": ErrorResponse}})
async def get_time_domain(req: TimeDomainRequest):
    """
    Returns time-series vibration data resampled to the requested time increment.
    Original raw data is never modified.
    """
    try:
        time_arr, data_dict, eff_dt = resample_time_series(
            file_id=req.file_id,
            target_dt=req.time_increment,
            axes=req.axes
        )
        return TimeDomainResponse(
            file_id=req.file_id,
            time_increment=round(float(eff_dt), 6),
            samples_returned=len(time_arr),
            time=[round(float(t), 5) for t in time_arr],
            x=[round(float(v), 5) for v in data_dict.get("X", [])] if "X" in data_dict else None,
            y=[round(float(v), 5) for v in data_dict.get("Y", [])] if "Y" in data_dict else None,
            z=[round(float(v), 5) for v in data_dict.get("Z", [])] if "Z" in data_dict else None,
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail={"error": True, "message": str(ke)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "message": f"Time-domain error: {str(e)}"})


@router.post("/fft", response_model=FFTResponse, responses={400: {"model": ErrorResponse}})
async def get_fft(req: FFTRequest):
    """
    Performs FFT analysis using SciPy/NumPy with windowing and coherent gain compensation.
    """
    try:
        return compute_fft_spectrum(
            file_id=req.file_id,
            frequency_min=req.frequency_min,
            frequency_max=req.frequency_max,
            axes=req.axes,
            window_name=req.window or "hanning"
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail={"error": True, "message": str(ke)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "message": f"FFT calculation error: {str(e)}"})


@router.post("/spectrogram", response_model=SpectrogramResponse, responses={400: {"model": ErrorResponse}})
async def get_spectrogram(req: SpectrogramRequest):
    """
    Generates STFT spectrogram colormap data for an individual axis (X, Y, or Z).
    """
    try:
        return compute_spectrogram(
            file_id=req.file_id,
            axis=req.axis,
            fft_size=req.fft_size,
            freq_resolution=req.freq_resolution,
            overlap=req.overlap,
            window=req.window,
            frequency_min=req.frequency_min,
            frequency_max=req.frequency_max,
            scale=req.scale
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail={"error": True, "message": str(ke)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "message": f"Spectrogram error: {str(e)}"})


@router.post("/sharpness", response_model=PsychoacousticMetricResponse, responses={400: {"model": ErrorResponse}})
async def get_sharpness(req: PsychoacousticRequest):
    """
    Computes Time vs Sharpness across 3-Axis (X, Y, Z) and Triaxial Resultant.
    """
    try:
        return compute_sharpness_series(
            file_id=req.file_id,
            axis=req.axis or "ALL",
            frame_length_sec=req.frame_length_sec or 0.1,
            hop_length_sec=req.hop_length_sec or 0.05
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail={"error": True, "message": str(ke)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "message": f"Sharpness calculation error: {str(e)}"})


@router.post("/roughness", response_model=PsychoacousticMetricResponse, responses={400: {"model": ErrorResponse}})
async def get_roughness(req: PsychoacousticRequest):
    """
    Computes Time vs Roughness across 3-Axis (X, Y, Z) and Triaxial Resultant.
    """
    try:
        return compute_roughness_series(
            file_id=req.file_id,
            axis=req.axis or "ALL",
            frame_length_sec=req.frame_length_sec or 0.1,
            hop_length_sec=req.hop_length_sec or 0.05
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail={"error": True, "message": str(ke)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "message": f"Roughness calculation error: {str(e)}"})


@router.post("/fluctuation-strength", response_model=PsychoacousticMetricResponse, responses={400: {"model": ErrorResponse}})
async def get_fluctuation(req: PsychoacousticRequest):
    """
    Computes Time vs Fluctuation Strength across 3-Axis (X, Y, Z) and Triaxial Resultant.
    """
    try:
        return compute_fluctuation_series(
            file_id=req.file_id,
            axis=req.axis or "ALL",
            frame_length_sec=req.frame_length_sec or 0.25,
            hop_length_sec=req.hop_length_sec or 0.1
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail={"error": True, "message": str(ke)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "message": f"Fluctuation calculation error: {str(e)}"})
