import axios from 'axios';

// Environment-variable-based API URL configuration
// Local dev: http://localhost:8000 (or proxy '/api')
// Production: https://YOUR-RENDER-BACKEND.onrender.com
const API_URL = import.meta.env.VITE_API_URL || '';

// Cleanly construct API base path ensuring proper /api suffix without duplicates
export const API_BASE = API_URL
  ? (API_URL.endsWith('/api') ? API_URL : `${API_URL.replace(/\/+$/, '')}/api`)
  : '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s timeout accommodates potential cloud cold starts
});

export const api = {
  // Upload LabVIEW file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Load built-in sample LabVIEW dataset (6,400 samples)
  loadSample: async () => {
    const response = await client.post('/upload/sample');
    return response.data;
  },

  // KPI Overview
  getKPIs: async (fileId) => {
    const response = await client.post('/analysis/kpi', { file_id: fileId });
    return response.data;
  },

  // Time Domain Series
  getTimeDomain: async (fileId, timeIncrement = 'auto', axes = ['X', 'Y', 'Z']) => {
    const response = await client.post('/analysis/time-domain', {
      file_id: fileId,
      time_increment: timeIncrement,
      axes: axes,
    });
    return response.data;
  },

  // FFT Spectrum
  getFFT: async (fileId, freqMin = 0, freqMax = null, axes = ['X', 'Y', 'Z'], window = 'hanning', scale = 'linear') => {
    const response = await client.post('/analysis/fft', {
      file_id: fileId,
      frequency_min: freqMin,
      frequency_max: freqMax,
      axes: axes,
      window: window,
      scale: scale,
    });
    return response.data;
  },

  // STFT Spectrogram (default 1.0 Hz frequency resolution)
  getSpectrogram: async (fileId, axis = 'X', fftSize = null, overlap = 0.5, window = 'hann', freqMin = 0, freqMax = null, scale = 'db', freqResolution = 1.0) => {
    const response = await client.post('/analysis/spectrogram', {
      file_id: fileId,
      axis: axis,
      fft_size: fftSize,
      freq_resolution: freqResolution,
      overlap: overlap,
      window: window,
      frequency_min: freqMin,
      frequency_max: freqMax,
      scale: scale,
    });
    return response.data;
  },

  // Sharpness (estimated psychoacoustic 3-axis)
  getSharpness: async (fileId, axis = 'ALL', frameLengthSec = 0.1, hopLengthSec = 0.05) => {
    const response = await client.post('/analysis/sharpness', {
      file_id: fileId,
      axis: axis,
      frame_length_sec: frameLengthSec,
      hop_length_sec: hopLengthSec,
    });
    return response.data;
  },

  // Roughness (3-axis)
  getRoughness: async (fileId, axis = 'ALL', frameLengthSec = 0.1, hopLengthSec = 0.05) => {
    const response = await client.post('/analysis/roughness', {
      file_id: fileId,
      axis: axis,
      frame_length_sec: frameLengthSec,
      hop_length_sec: hopLengthSec,
    });
    return response.data;
  },

  // Fluctuation Strength (3-axis)
  getFluctuation: async (fileId, axis = 'ALL', frameLengthSec = 0.25, hopLengthSec = 0.1) => {
    const response = await client.post('/analysis/fluctuation-strength', {
      file_id: fileId,
      axis: axis,
      frame_length_sec: frameLengthSec,
      hop_length_sec: hopLengthSec,
    });
    return response.data;
  },

  // Download URLs
  getRawCsvUrl: (fileId) => `${API_BASE}/download/raw/${fileId}`,
  getProcessedCsvUrl: (fileId, timeIncrement = 'auto') =>
    `${API_BASE}/download/processed/${fileId}?time_increment=${timeIncrement}`,
};
