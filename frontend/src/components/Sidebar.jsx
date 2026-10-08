import React, { useState } from 'react';
import { Sliders, Clock, Layers, Zap, Waves, Settings2, Download } from 'lucide-react';
import FileUpload from './FileUpload';
import { api } from '../services/api';

export default function Sidebar({
  fileInfo,
  onUploadSuccess,
  onError,
  selectedAxes,
  toggleAxis,
  timeIncrement,
  setTimeIncrement,
  customIncrement,
  setCustomIncrement,
  fftSettings,
  setFftSettings,
  specSettings,
  setSpecSettings,
}) {
  const [isCustomMode, setIsCustomMode] = useState(timeIncrement === 'custom');

  const handleIncrementChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomMode(true);
      setTimeIncrement('custom');
    } else {
      setIsCustomMode(false);
      setTimeIncrement(val);
    }
  };

  return (
    <aside className="sidebar">
      {/* 1. File Upload Section */}
      <FileUpload onUploadSuccess={onUploadSuccess} onError={onError} />

      <hr style={{ borderColor: 'var(--border-color)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

      {/* 2. Time Increment Section */}
      <div className="control-section">
        <div className="control-title">
          <Clock size={14} color="#f59e0b" />
          Time Increment (Resampling)
        </div>
        <select
          className="select-input"
          value={isCustomMode ? 'custom' : timeIncrement}
          onChange={handleIncrementChange}
        >
          <option value="auto">Auto (Default Native / Optimized)</option>
          <option value="0.001">0.001 s (1 ms - High Res)</option>
          <option value="0.005">0.005 s (5 ms)</option>
          <option value="0.010">0.010 s (10 ms)</option>
          <option value="0.050">0.050 s (50 ms)</option>
          <option value="0.100">0.100 s (100 ms)</option>
          <option value="0.500">0.500 s (500 ms)</option>
          <option value="1.000">1.000 s (1.0 s)</option>
          <option value="custom">Custom...</option>
        </select>

        {isCustomMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              max="10.0"
              className="text-input"
              placeholder="e.g. 0.02"
              value={customIncrement}
              onChange={(e) => setCustomIncrement(e.target.value)}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>sec</span>
          </div>
        )}
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          Non-destructive resampling. Raw data remains untouched.
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

      {/* 3. Axis Selection Section */}
      <div className="control-section">
        <div className="control-title">
          <Layers size={14} color="#10b981" />
          Axis Selection
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            className={`axis-toggle-btn axis-x ${selectedAxes.X ? 'active' : ''}`}
            onClick={() => toggleAxis('X')}
          >
            <span>X-Axis Vibration</span>
            <span className="mono-val" style={{ fontSize: '0.8rem' }}>{selectedAxes.X ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            className={`axis-toggle-btn axis-y ${selectedAxes.Y ? 'active' : ''}`}
            onClick={() => toggleAxis('Y')}
          >
            <span>Y-Axis Vibration</span>
            <span className="mono-val" style={{ fontSize: '0.8rem' }}>{selectedAxes.Y ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            className={`axis-toggle-btn axis-z ${selectedAxes.Z ? 'active' : ''}`}
            onClick={() => toggleAxis('Z')}
          >
            <span>Z-Axis Vibration</span>
            <span className="mono-val" style={{ fontSize: '0.8rem' }}>{selectedAxes.Z ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

      {/* 4. FFT Processing Controls */}
      <div className="control-section">
        <div className="control-title">
          <Zap size={14} color="#8b5cf6" />
          FFT Parameters
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Window Function</label>
          <select
            className="select-input"
            value={fftSettings.window}
            onChange={(e) => setFftSettings({ ...fftSettings, window: e.target.value })}
          >
            <option value="hanning">Hanning (Hann)</option>
            <option value="hamming">Hamming</option>
            <option value="flattop">Flat Top (Amplitude Accurate)</option>
            <option value="blackman">Blackman</option>
            <option value="rectangular">Rectangular (None)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min Freq (Hz)</label>
            <input
              type="number"
              className="text-input"
              value={fftSettings.freqMin}
              onChange={(e) => setFftSettings({ ...fftSettings, freqMin: Number(e.target.value) })}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Freq (Hz)</label>
            <input
              type="number"
              className="text-input"
              value={fftSettings.freqMax || ''}
              placeholder={fileInfo ? String(fileInfo.sampling_frequency / 2) : 'Nyquist'}
              onChange={(e) => setFftSettings({ ...fftSettings, freqMax: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            className={`btn ${fftSettings.scale === 'linear' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '5px' }}
            onClick={() => setFftSettings({ ...fftSettings, scale: 'linear' })}
          >
            Linear
          </button>
          <button
            type="button"
            className={`btn ${fftSettings.scale === 'log' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '5px' }}
            onClick={() => setFftSettings({ ...fftSettings, scale: 'log' })}
          >
            Log (dB)
          </button>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

      {/* 5. Spectrogram Settings */}
      <div className="control-section">
        <div className="control-title">
          <Waves size={14} color="#06b6d4" />
          Spectrogram Parameters
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FFT Size</label>
            <select
              className="select-input"
              value={specSettings.fftSize}
              onChange={(e) => setSpecSettings({ ...specSettings, fftSize: Number(e.target.value) })}
            >
              <option value="128">128</option>
              <option value="256">256</option>
              <option value="512">512</option>
              <option value="1024">1024</option>
              <option value="2048">2048</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overlap</label>
            <select
              className="select-input"
              value={specSettings.overlap}
              onChange={(e) => setSpecSettings({ ...specSettings, overlap: Number(e.target.value) })}
            >
              <option value="0.25">25 %</option>
              <option value="0.50">50 %</option>
              <option value="0.75">75 %</option>
              <option value="0.90">90 %</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Download Links */}
      {fileInfo && (
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            href={api.getRawCsvUrl(fileInfo.file_id)}
            download
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={14} color="#38bdf8" />
            Download Raw CSV
          </a>
          <a
            href={api.getProcessedCsvUrl(fileInfo.file_id, timeIncrement)}
            download
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={14} color="#ffffff" />
            Download Processed CSV
          </a>
        </div>
      )}
    </aside>
  );
}
