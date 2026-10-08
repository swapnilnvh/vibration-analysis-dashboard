import io
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
import numpy as np
import pandas as pd
from services.file_parser import get_dataset
from services.signal_processing import resample_time_series
from services.fft_analysis import compute_fft_spectrum
from services.psychoacoustic import compute_sharpness_series, compute_roughness_series, compute_fluctuation_series

router = APIRouter(prefix="/api/download", tags=["Download"])

@router.get("/raw/{file_id}")
async def download_raw_csv(file_id: str):
    """
    Downloads original, unmodified raw data in CSV format with columns:
    Time_X, X_Vibration_g, Time_Y, Y_Vibration_g, Time_Z, Z_Vibration_g
    """
    try:
        ds = get_dataset(file_id)
        df = ds["raw_df"].copy()
        
        # Standardize column names as required by prompt
        df.columns = [
            "Time_X", "X_Vibration_g",
            "Time_Y", "Y_Vibration_g",
            "Time_Z", "Z_Vibration_g"
        ]

        stream = io.StringIO()
        df.to_csv(stream, index=False)
        stream.seek(0)

        filename = f"Raw_Vibration_Data_{file_id}.csv"
        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail=str(ke))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")


@router.get("/processed/{file_id}")
async def download_processed_csv(file_id: str, time_increment: str = "auto"):
    """
    Generates and downloads a comprehensive processed CSV dataset containing:
    Time, X_Vibration_g, Y_Vibration_g, Z_Vibration_g,
    RMS_X, RMS_Y, RMS_Z, Frequency, FFT_X, FFT_Y, FFT_Z,
    Sharpness, Roughness, Fluctuation_Strength
    """
    try:
        ds = get_dataset(file_id)
        raw_df = ds["raw_df"]

        # Resample time domain
        time_arr, data_dict, _ = resample_time_series(file_id, target_dt=time_increment, axes=["X", "Y", "Z"])
        n_len = len(time_arr)

        # FFT
        fft_res = compute_fft_spectrum(file_id, axes=["X", "Y", "Z"])
        fft_freqs = fft_res.data["X"].frequency if "X" in fft_res.data else []
        fft_x = fft_res.data["X"].amplitude if "X" in fft_res.data else []
        fft_y = fft_res.data["Y"].amplitude if "Y" in fft_res.data else []
        fft_z = fft_res.data["Z"].amplitude if "Z" in fft_res.data else []

        # Psychoacoustics for primary X axis
        sharp_res = compute_sharpness_series(file_id, axis="X")
        rough_res = compute_roughness_series(file_id, axis="X")
        fluc_res = compute_fluctuation_series(file_id, axis="X")

        # Rolling RMS (50-sample window)
        win = min(50, n_len)
        rms_x = pd.Series(data_dict["X"]).rolling(win, min_periods=1).apply(lambda w: np.sqrt(np.mean(w**2))).values
        rms_y = pd.Series(data_dict["Y"]).rolling(win, min_periods=1).apply(lambda w: np.sqrt(np.mean(w**2))).values
        rms_z = pd.Series(data_dict["Z"]).rolling(win, min_periods=1).apply(lambda w: np.sqrt(np.mean(w**2))).values

        # Interpolate 3-axis psychoacoustic metrics onto time_arr grid
        sharp_x = np.interp(time_arr, sharp_res.time, sharp_res.x.values) if (sharp_res.time and sharp_res.x) else np.zeros(n_len)
        sharp_y = np.interp(time_arr, sharp_res.time, sharp_res.y.values) if (sharp_res.time and sharp_res.y) else np.zeros(n_len)
        sharp_z = np.interp(time_arr, sharp_res.time, sharp_res.z.values) if (sharp_res.time and sharp_res.z) else np.zeros(n_len)
        sharp_tri = np.interp(time_arr, sharp_res.time, sharp_res.triaxial.values) if (sharp_res.time and sharp_res.triaxial) else np.zeros(n_len)

        rough_x = np.interp(time_arr, rough_res.time, rough_res.x.values) if (rough_res.time and rough_res.x) else np.zeros(n_len)
        rough_y = np.interp(time_arr, rough_res.time, rough_res.y.values) if (rough_res.time and rough_res.y) else np.zeros(n_len)
        rough_z = np.interp(time_arr, rough_res.time, rough_res.z.values) if (rough_res.time and rough_res.z) else np.zeros(n_len)
        rough_tri = np.interp(time_arr, rough_res.time, rough_res.triaxial.values) if (rough_res.time and rough_res.triaxial) else np.zeros(n_len)

        fluc_x = np.interp(time_arr, fluc_res.time, fluc_res.x.values) if (fluc_res.time and fluc_res.x) else np.zeros(n_len)
        fluc_y = np.interp(time_arr, fluc_res.time, fluc_res.y.values) if (fluc_res.time and fluc_res.y) else np.zeros(n_len)
        fluc_z = np.interp(time_arr, fluc_res.time, fluc_res.z.values) if (fluc_res.time and fluc_res.z) else np.zeros(n_len)
        fluc_tri = np.interp(time_arr, fluc_res.time, fluc_res.triaxial.values) if (fluc_res.time and fluc_res.triaxial) else np.zeros(n_len)

        # Map FFT to same row length (padded with NaN where lengths differ)
        fft_freq_padded = [fft_freqs[i] if i < len(fft_freqs) else None for i in range(n_len)]
        fft_x_padded = [fft_x[i] if i < len(fft_x) else None for i in range(n_len)]
        fft_y_padded = [fft_y[i] if i < len(fft_y) else None for i in range(n_len)]
        fft_z_padded = [fft_z[i] if i < len(fft_z) else None for i in range(n_len)]

        processed_df = pd.DataFrame({
            "Time_s": np.round(time_arr, 5),
            "X_Vibration_g": np.round(data_dict["X"], 5),
            "Y_Vibration_g": np.round(data_dict["Y"], 5),
            "Z_Vibration_g": np.round(data_dict["Z"], 5),
            "RMS_X_g": np.round(rms_x, 5),
            "RMS_Y_g": np.round(rms_y, 5),
            "RMS_Z_g": np.round(rms_z, 5),
            "Frequency_Hz": fft_freq_padded,
            "FFT_X_g": fft_x_padded,
            "FFT_Y_g": fft_y_padded,
            "FFT_Z_g": fft_z_padded,
            "Sharpness_X_acum": np.round(sharp_x, 4),
            "Sharpness_Y_acum": np.round(sharp_y, 4),
            "Sharpness_Z_acum": np.round(sharp_z, 4),
            "Sharpness_Triaxial_acum": np.round(sharp_tri, 4),
            "Roughness_X_asper": np.round(rough_x, 4),
            "Roughness_Y_asper": np.round(rough_y, 4),
            "Roughness_Z_asper": np.round(rough_z, 4),
            "Roughness_Triaxial_asper": np.round(rough_tri, 4),
            "Fluctuation_X_vacil": np.round(fluc_x, 4),
            "Fluctuation_Y_vacil": np.round(fluc_y, 4),
            "Fluctuation_Z_vacil": np.round(fluc_z, 4),
            "Fluctuation_Triaxial_vacil": np.round(fluc_tri, 4)
        })

        stream = io.StringIO()
        processed_df.to_csv(stream, index=False)
        stream.seek(0)

        filename = f"Processed_NVH_Analysis_{file_id}.csv"
        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except KeyError as ke:
        raise HTTPException(status_code=404, detail=str(ke))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processed CSV error: {str(e)}")
