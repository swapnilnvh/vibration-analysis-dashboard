import React, { useState } from 'react';
import Spectrogram from '../components/Spectrogram';
import ColormapFunctionModal from '../components/ColormapFunctionModal';
import {
  Palette,
  Sliders,
  Waves,
  Layers,
  RotateCcw,
  Activity,
  Sparkles,
  Flame,
} from 'lucide-react';
import {
  COLORMAP_PRESETS,
  getColorscaleCssGradient,
} from '../utils/colormaps';

export default function SpectrogramPage({
  specDataX,
  specDataY,
  specDataZ,
  fileInfo,
  specSettings,
  setSpecSettings,
  onRefresh,
}) {
  // Global Colormap Configuration (Siemens Simcenter Testlab by default)
  const [colorConfig, setColorConfig] = useState({
    presetId: 'simcenter', // Siemens Simcenter Testlab NVH Palette
    isInverted: false,
    bands: 'continuous',
    customColors: {
      low: '#02004a',
      mid: '#00d5d5',
      high: '#ee1100',
      peak: '#ffffff',
    },
  });

  const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);

  // Global editable amplitude range
  const [globalAmpMin, setGlobalAmpMin] = useState('');
  const [globalAmpMax, setGlobalAmpMax] = useState('');

  const freqResOptions = [
    { label: '1.0 Hz', value: 1.0 },
    { label: '12.5 Hz', value: 12.5 },
    { label: '2.0 Hz', value: 2.0 },
    { label: '5.0 Hz', value: 5.0 },
    { label: '10.0 Hz', value: 10.0 },
    { label: '25.0 Hz', value: 25.0 },
  ];

  const overlapOptions = [
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.50 },
    { label: '75%', value: 0.75 },
    { label: '90%', value: 0.90 },
  ];

  const windowOptions = ['hann', 'hamming', 'blackman', 'flattop'];

  const handleFreqResChange = (newDf) => {
    const updated = { ...specSettings, freqResolution: newDf };
    setSpecSettings(updated);
    if (onRefresh) onRefresh(updated);
  };

  const handleOverlapChange = (newOverlap) => {
    const updated = { ...specSettings, overlap: newOverlap };
    setSpecSettings(updated);
    if (onRefresh) onRefresh(updated);
  };

  const handleWindowChange = (newWindow) => {
    const updated = { ...specSettings, window: newWindow };
    setSpecSettings(updated);
    if (onRefresh) onRefresh(updated);
  };

  const handleScaleChange = (newScale) => {
    const updated = { ...specSettings, scale: newScale };
    setSpecSettings(updated);
    setGlobalAmpMin('');
    setGlobalAmpMax('');
    if (onRefresh) onRefresh(updated);
  };

  const handleResetGlobalAmp = () => {
    setGlobalAmpMin('');
    setGlobalAmpMax('');
  };

  const handleQuickPresetSelect = (presetId) => {
    setColorConfig((prev) => ({
      ...prev,
      presetId,
    }));
  };

  const currentDf = specSettings.freqResolution || 1.0;

  // Active colormap CSS gradient preview string
  const activeGradient =
    colorConfig.presetId === 'custom'
      ? `linear-gradient(to right, ${colorConfig.customColors.low}, ${colorConfig.customColors.mid}, ${colorConfig.customColors.high}, ${colorConfig.customColors.peak})`
      : getColorscaleCssGradient(colorConfig.presetId, colorConfig.isInverted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Global Colormap & Processing Toolbar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '14px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Row 1: Colormap Selection & Colors Function */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          {/* Palette Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={16} color="#06b6d4" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Colormap:
              </span>
              <select
                className="select-input"
                style={{ width: '175px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 500 }}
                value={colorConfig.presetId}
                onChange={(e) => handleQuickPresetSelect(e.target.value)}
              >
                <optgroup label="Siemens NVH Palettes (Industry Standard)">
                  <option value="simcenter">Simcenter Testlab (Siemens)</option>
                  <option value="simcenter-modern">Simcenter Modern (Petrol)</option>
                  <option value="simcenter-thermal">Simcenter Thermal</option>
                </optgroup>
                <optgroup label="Scientific Palettes">
                  <option value="Viridis">Viridis</option>
                  <option value="Jet">Jet</option>
                  <option value="Turbo">Turbo</option>
                  <option value="Plasma">Plasma</option>
                  <option value="Inferno">Inferno</option>
                  <option value="Hot">Hot</option>
                  <option value="Coolwarm">Coolwarm</option>
                  <option value="Greys">Grayscale</option>
                </optgroup>
                {colorConfig.presetId === 'custom' && (
                  <option value="custom">Custom Color Scheme</option>
                )}
              </select>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <button
                type="button"
                className={`btn ${colorConfig.presetId === 'simcenter' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: colorConfig.presetId === 'simcenter' ? 700 : 500,
                  boxShadow: colorConfig.presetId === 'simcenter' ? '0 0 10px rgba(6, 182, 212, 0.4)' : 'none',
                }}
                onClick={() => handleQuickPresetSelect('simcenter')}
                title="Siemens Simcenter Testlab classic NVH spectrum"
              >
                <Flame size={12} color={colorConfig.presetId === 'simcenter' ? '#ffffff' : '#06b6d4'} />
                Simcenter Testlab
              </button>

              <button
                type="button"
                className={`btn ${colorConfig.presetId === 'simcenter-modern' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                onClick={() => handleQuickPresetSelect('simcenter-modern')}
                title="Siemens modern petrol teal palette"
              >
                Simcenter Modern
              </button>

              <button
                type="button"
                className={`btn ${colorConfig.presetId === 'Jet' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                onClick={() => handleQuickPresetSelect('Jet')}
              >
                Jet
              </button>

              <button
                type="button"
                className={`btn ${colorConfig.presetId === 'Viridis' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                onClick={() => handleQuickPresetSelect('Viridis')}
              >
                Viridis
              </button>
            </div>

            {/* Dedicated Colors Function Modal Trigger Button */}
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '4px 10px',
                fontSize: '0.785rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                color: '#38bdf8',
                fontWeight: 600,
              }}
              onClick={() => setIsColorsModalOpen(true)}
              title="Open Colormap & Colors Function settings"
            >
              <Sliders size={13} color="#38bdf8" /> Colors Function...
            </button>
          </div>

          {/* Active Gradient Swatch Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Colorbar:</span>
            <div
              onClick={() => setIsColorsModalOpen(true)}
              style={{
                width: '130px',
                height: '18px',
                borderRadius: '4px',
                border: '1px solid #475569',
                background: activeGradient,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
              title="Click to open Colors Function customization"
            />
          </div>
        </div>

        {/* Row 2: Amplitude Limits, Units, Frequency Resolution & Overlap */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          {/* Amplitude Scale Unit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Unit:</span>
            <button
              type="button"
              className={`btn ${specSettings.scale === 'db' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              onClick={() => handleScaleChange('db')}
            >
              dB (ref 1g)
            </button>
            <button
              type="button"
              className={`btn ${specSettings.scale === 'linear' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              onClick={() => handleScaleChange('linear')}
            >
              Linear (g)
            </button>
          </div>

          {/* Global Editable Amplitude Limits */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Global Amp Limits:</span>
            <input
              type="number"
              step={specSettings.scale === 'db' ? '5' : '0.01'}
              placeholder={specSettings.scale === 'db' ? '-100' : '0.0'}
              value={globalAmpMin}
              onChange={(e) => setGlobalAmpMin(e.target.value)}
              className="text-input"
              style={{ width: '60px', padding: '2px 5px', fontSize: '0.75rem', height: '24px' }}
              title="Set minimum amplitude threshold"
            />
            <span style={{ color: 'var(--text-dim)' }}>to</span>
            <input
              type="number"
              step={specSettings.scale === 'db' ? '5' : '0.01'}
              placeholder={specSettings.scale === 'db' ? '0' : '1.0'}
              value={globalAmpMax}
              onChange={(e) => setGlobalAmpMax(e.target.value)}
              className="text-input"
              style={{ width: '60px', padding: '2px 5px', fontSize: '0.75rem', height: '24px' }}
              title="Set maximum amplitude threshold"
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '2px 6px', fontSize: '0.7rem', height: '24px' }}
              onClick={handleResetGlobalAmp}
              title="Reset to automatic data amplitude range"
            >
              <RotateCcw size={11} /> Auto
            </button>
          </div>

          {/* Frequency Resolution (df) Buttons: 1.0 Hz (Default), 12.5 Hz, 2 Hz, 5 Hz, etc. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={13} color="#06b6d4" />
              Freq Resolution (df):
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {freqResOptions.map((opt) => {
                const isSelected = Math.abs(currentDf - opt.value) < 0.05;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '3px 7px',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      boxShadow: isSelected ? '0 0 8px rgba(2, 132, 199, 0.4)' : 'none',
                    }}
                    onClick={() => handleFreqResChange(opt.value)}
                    title={`Set spectrogram frequency resolution to ${opt.value} Hz`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overlap & Window Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Overlap:
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {overlapOptions.map((opt) => {
                  const isSelected = Math.abs(specSettings.overlap - opt.value) < 0.01;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '3px 7px', fontSize: '0.75rem' }}
                      onClick={() => handleOverlapChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Window:</span>
              <select
                className="select-input"
                style={{ width: '90px', padding: '3px 6px', fontSize: '0.75rem' }}
                value={specSettings.window}
                onChange={(e) => handleWindowChange(e.target.value)}
              >
                {windowOptions.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Axis Orientation & Colormap Status Bar */}
      <div style={{
        backgroundColor: 'rgba(6, 182, 212, 0.06)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '8px',
        padding: '10px 16px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <strong style={{ color: '#06b6d4' }}>Spectrogram Configuration:</strong>{' '}
          Horizontal <strong>X-Axis = Frequency (Hz, df: {currentDf} Hz)</strong> • Vertical <strong>Y-Axis = Time (s)</strong> • <strong>Colormap: {
            colorConfig.presetId === 'simcenter'
              ? 'Siemens Simcenter Testlab'
              : colorConfig.presetId === 'simcenter-modern'
              ? 'Siemens Simcenter Modern'
              : colorConfig.presetId
          }</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <span>Scale: <strong style={{ color: '#38bdf8' }}>{specSettings.scale === 'db' ? 'dB ref 1g' : 'Linear (g)'}</strong></span>
          <span>•</span>
          <span>Overlap: <strong style={{ color: 'var(--text-main)' }}>{Math.round(specSettings.overlap * 100)}%</strong></span>
          <span>•</span>
          <span>Bands: <strong style={{ color: 'var(--text-main)' }}>{colorConfig.bands === 'continuous' ? 'Continuous' : `${colorConfig.bands} Discrete`}</strong></span>
        </div>
      </div>

      {/* 3 Separate Colormaps (Never combined, as strictly specified in Requirement 13) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Spectrogram
          specData={specDataX}
          axis="X"
          filename={fileInfo?.filename}
          colorConfig={colorConfig}
          globalAmpMin={globalAmpMin}
          globalAmpMax={globalAmpMax}
        />

        <Spectrogram
          specData={specDataY}
          axis="Y"
          filename={fileInfo?.filename}
          colorConfig={colorConfig}
          globalAmpMin={globalAmpMin}
          globalAmpMax={globalAmpMax}
        />

        <Spectrogram
          specData={specDataZ}
          axis="Z"
          filename={fileInfo?.filename}
          colorConfig={colorConfig}
          globalAmpMin={globalAmpMin}
          globalAmpMax={globalAmpMax}
        />
      </div>

      {/* Full Colormap & Colors Function Configuration Modal */}
      <ColormapFunctionModal
        isOpen={isColorsModalOpen}
        onClose={() => setIsColorsModalOpen(false)}
        colorConfig={colorConfig}
        onChangeColorConfig={setColorConfig}
      />
    </div>
  );
}
