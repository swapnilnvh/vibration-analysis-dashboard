import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layers, Palette, Sliders, RotateCcw, Zap } from 'lucide-react';
import PlotlyWrapper from './PlotlyWrapper';
import DownloadButtons from './DownloadButtons';
import ColormapFunctionModal from './ColormapFunctionModal';
import {
  COLORMAP_PRESETS,
  SIMCENTER_TESTLAB,
  resolvePlotlyColorscale,
  getColorscaleCssGradient,
} from '../utils/colormaps';

export default function Spectrogram({
  specData,
  axis = 'X',
  filename = 'LabVIEW_Data',
  colorScale = 'simcenter',
  colorConfig = null,
  globalAmpMin = '',
  globalAmpMax = '',
}) {
  const chartId = `spectrogram-${axis.toLowerCase()}-plot`;

  // Local editable amplitude limits
  const [localMin, setLocalMin] = useState(globalAmpMin);
  const [localMax, setLocalMax] = useState(globalAmpMax);
  const [isAuto, setIsAuto] = useState(globalAmpMin === '' && globalAmpMax === '');

  // Local color override if user wants this specific axis to have different colors
  const [localColorConfig, setLocalColorConfig] = useState(null);
  const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);

  // Reset local limits when data units change (e.g. dB vs Linear)
  const lastUnitsRef = useRef(specData?.units);
  useEffect(() => {
    if (specData?.units && lastUnitsRef.current && specData.units !== lastUnitsRef.current) {
      setLocalMin('');
      setLocalMax('');
      setIsAuto(true);
    }
    lastUnitsRef.current = specData?.units;
  }, [specData?.units]);

  // Sync with global amplitude limits if updated from parent
  useEffect(() => {
    if (globalAmpMin !== '' || globalAmpMax !== '') {
      setLocalMin(globalAmpMin);
      setLocalMax(globalAmpMax);
      setIsAuto(false);
    }
  }, [globalAmpMin, globalAmpMax]);

  // Transpose amplitude matrix: X axis = Frequency, Y axis = Time
  // Original scipy specData.amplitude is [n_freq][n_time]
  // In Plotly, when x = frequency (n_freq) and y = time (n_time),
  // z must be of shape [n_time][n_freq], so row t is time and col f is frequency.
  const transposedZ = useMemo(() => {
    if (!specData?.amplitude || !specData.time || !specData.frequency) return [];
    const nFreq = specData.frequency.length;
    const nTime = specData.time.length;
    const result = [];
    for (let t = 0; t < nTime; t++) {
      const row = new Array(nFreq);
      for (let f = 0; f < nFreq; f++) {
        row[f] = specData.amplitude[f][t];
      }
      result.push(row);
    }
    return result;
  }, [specData]);

  // Determine effective amplitude range
  const dataMin = specData?.min_value !== undefined ? Number(specData.min_value) : 0;
  const dataMax = specData?.max_value !== undefined ? Number(specData.max_value) : 1;
  const isDb = specData?.units?.includes('dB');

  const numMin = localMin !== '' && !isNaN(Number(localMin)) ? Number(localMin) : null;
  const numMax = localMax !== '' && !isNaN(Number(localMax)) ? Number(localMax) : null;

  const hasCustomLimit = !isAuto && (numMin !== null || numMax !== null);

  let effectiveZmin = null;
  let effectiveZmax = null;

  if (hasCustomLimit) {
    effectiveZmin = numMin !== null ? numMin : dataMin;
    effectiveZmax = numMax !== null ? numMax : dataMax;

    if (effectiveZmin >= effectiveZmax) {
      effectiveZmax = effectiveZmin + (isDb ? 1.0 : 0.01);
    }
  }

  // Resolve active Plotly colorscale
  const effectiveColorscale = useMemo(() => {
    if (localColorConfig) {
      return resolvePlotlyColorscale(localColorConfig);
    }
    if (colorConfig) {
      return resolvePlotlyColorscale(colorConfig);
    }
    if (Array.isArray(colorScale)) {
      return colorScale;
    }
    if (typeof colorScale === 'string') {
      if (colorScale === 'simcenter' || colorScale.toLowerCase().includes('simcenter')) {
        return resolvePlotlyColorscale({ presetId: colorScale });
      }
      return colorScale;
    }
    return SIMCENTER_TESTLAB;
  }, [colorScale, colorConfig, localColorConfig]);

  const trace = useMemo(() => {
    if (!specData || !specData.time || !specData.frequency || !transposedZ.length) return [];

    return [
      {
        z: transposedZ,
        x: specData.frequency, // X-Axis: Frequency (Hz)
        y: specData.time,      // Y-Axis: Time (s)
        type: 'heatmap',
        colorscale: effectiveColorscale,
        zauto: !hasCustomLimit,
        zmin: hasCustomLimit ? effectiveZmin : null,
        zmax: hasCustomLimit ? effectiveZmax : null,
        colorbar: {
          title: { text: specData.units || 'dB', font: { color: '#94a3b8', size: 11 } },
          tickfont: { color: '#94a3b8', size: 10 },
          len: 0.9,
          thickness: 16,
        },
        hoverongaps: false,
        hovertemplate: 'Freq: %{x:.1f} Hz<br>Time: %{y:.3f} s<br>Amp: %{z:.3f} ' + (specData.units || '') + '<extra></extra>',
      },
    ];
  }, [specData, transposedZ, effectiveColorscale, hasCustomLimit, effectiveZmin, effectiveZmax]);

  // CSV export representation (Time rows x Frequency columns)
  const csvData = useMemo(() => {
    if (!specData || !specData.time || !specData.frequency || !transposedZ.length) return '';
    const times = specData.time;
    const freqs = specData.frequency;

    let csv = 'Time_s,' + freqs.map((f) => `Freq_${f}Hz`).join(',') + '\n';
    for (let tIdx = 0; tIdx < times.length; tIdx++) {
      const row = [times[tIdx], ...transposedZ[tIdx]];
      csv += row.join(',') + '\n';
    }
    return csv;
  }, [specData, transposedZ]);

  const currentDf = specData?.freq_resolution || 1.0;

  const layout = useMemo(() => ({
    title: {
      text: `<b>${axis}-Axis Vibration Spectrogram</b> | STFT (Resolution: ${currentDf} Hz, Overlap: ${Math.round((specData?.overlap || 0.5) * 100)}%)`,
      font: { color: '#f8fafc', size: 13 },
      x: 0.02,
      xanchor: 'left',
    },
    xaxis: {
      title: { text: `<b>Frequency (Hz)</b> [Resolution: ${currentDf} Hz]`, font: { color: '#94a3b8', size: 12 } },
      gridcolor: '#1e293b',
      tickfont: { color: '#94a3b8' },
    },
    yaxis: {
      title: { text: '<b>Time (s)</b>', font: { color: '#94a3b8', size: 12 } },
      gridcolor: '#1e293b',
      tickfont: { color: '#94a3b8' },
    },
    uirevision: hasCustomLimit ? `${effectiveZmin}-${effectiveZmax}` : 'auto',
  }), [axis, currentDf, specData?.overlap, hasCustomLimit, effectiveZmin, effectiveZmax]);

  const getAxisThemeColor = (ax) => {
    if (ax === 'X') return '#06b6d4';
    if (ax === 'Y') return '#f59e0b';
    return '#10b981';
  };

  const handleResetAuto = () => {
    setLocalMin('');
    setLocalMax('');
    setIsAuto(true);
  };

  const handleQuickDynamicRange = (rangeType) => {
    setIsAuto(false);
    if (isDb) {
      if (rangeType === '40db') {
        const pMax = Math.round(dataMax);
        setLocalMin(String(pMax - 40));
        setLocalMax(String(pMax));
      } else if (rangeType === '60db') {
        const pMax = Math.round(dataMax);
        setLocalMin(String(pMax - 60));
        setLocalMax(String(pMax));
      }
    } else {
      if (rangeType === 'peak') {
        setLocalMin('0');
        setLocalMax(String(dataMax));
      } else if (rangeType === 'focus') {
        const low = Math.round(dataMax * 0.3 * 1000) / 1000;
        setLocalMin(String(low));
        setLocalMax(String(dataMax));
      }
    }
  };

  const handleLocalPresetChange = (presetId) => {
    if (presetId === 'global') {
      setLocalColorConfig(null);
    } else {
      setLocalColorConfig({
        presetId,
        isInverted: false,
        bands: 'continuous',
      });
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-area">
          <div className="chart-title">
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: getAxisThemeColor(axis),
                display: 'inline-block',
                boxShadow: `0 0 8px ${getAxisThemeColor(axis)}`,
              }}
            />
            Colormap {axis === 'X' ? '1' : axis === 'Y' ? '2' : '3'}: {axis}-Axis Vibration Spectrogram
          </div>
          <div className="chart-subtitle">
            X-Axis: Frequency (Hz) • Resolution (df): {currentDf} Hz | Y-Axis: Time (s) | Data Range: {specData?.min_value} to {specData?.max_value} {specData?.units}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Colors Function & Palette Selection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
          }}>
            <Palette size={13} color="#06b6d4" />
            <select
              className="select-input"
              style={{ width: '135px', padding: '2px 6px', fontSize: '0.72rem', height: '24px' }}
              value={localColorConfig ? localColorConfig.presetId : 'global'}
              onChange={(e) => handleLocalPresetChange(e.target.value)}
              title="Select colormap palette for this axis"
            >
              <option value="global">Palette (Global Sync)</option>
              <optgroup label="Siemens NVH Palettes">
                <option value="simcenter">Simcenter Testlab</option>
                <option value="simcenter-modern">Simcenter Modern</option>
                <option value="simcenter-thermal">Simcenter Thermal</option>
              </optgroup>
              <optgroup label="Scientific Palettes">
                <option value="Viridis">Viridis</option>
                <option value="Jet">Jet</option>
                <option value="Turbo">Turbo</option>
                <option value="Plasma">Plasma</option>
                <option value="Inferno">Inferno</option>
                <option value="Hot">Hot</option>
                <option value="Greys">Grayscale</option>
              </optgroup>
            </select>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '2px 7px', fontSize: '0.7rem', height: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setIsColorsModalOpen(true)}
              title="Open full Colormap Colors Function"
            >
              <Sliders size={11} color="#38bdf8" /> Colors
            </button>
          </div>

          {/* Editable Amplitude Range Controls for this Colormap */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: hasCustomLimit ? '1px solid #0284c7' : '1px solid var(--border-color)',
            boxShadow: hasCustomLimit ? '0 0 8px rgba(2, 132, 199, 0.25)' : 'none',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: hasCustomLimit ? '#38bdf8' : 'var(--text-dim)', fontWeight: 600 }}>
              Amp Limits:
            </span>
            <input
              type="number"
              step={isDb ? '5' : '0.01'}
              placeholder={specData?.min_value !== undefined ? String(specData.min_value) : 'Min'}
              value={localMin}
              onChange={(e) => {
                setLocalMin(e.target.value);
                setIsAuto(false);
              }}
              className="text-input"
              style={{
                width: '62px',
                padding: '2px 5px',
                fontSize: '0.72rem',
                height: '24px',
                borderColor: localMin !== '' ? '#0284c7' : 'var(--border-color)',
              }}
              title="Edit minimum amplitude for colorbar (e.g. noise floor)"
            />
            <span style={{ color: 'var(--text-dim)' }}>to</span>
            <input
              type="number"
              step={isDb ? '5' : '0.01'}
              placeholder={specData?.max_value !== undefined ? String(specData.max_value) : 'Max'}
              value={localMax}
              onChange={(e) => {
                setLocalMax(e.target.value);
                setIsAuto(false);
              }}
              className="text-input"
              style={{
                width: '62px',
                padding: '2px 5px',
                fontSize: '0.72rem',
                height: '24px',
                borderColor: localMax !== '' ? '#0284c7' : 'var(--border-color)',
              }}
              title="Edit maximum amplitude for colorbar (e.g. peak saturation)"
            />

            {/* Quick Dynamic Range Buttons */}
            {isDb ? (
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '2px 5px', fontSize: '0.68rem', height: '24px' }}
                  onClick={() => handleQuickDynamicRange('40db')}
                  title="Set dynamic range to Top 40 dB"
                >
                  40dB
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '2px 5px', fontSize: '0.68rem', height: '24px' }}
                  onClick={() => handleQuickDynamicRange('60db')}
                  title="Set dynamic range to Top 60 dB"
                >
                  60dB
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '3px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '2px 5px', fontSize: '0.68rem', height: '24px' }}
                  onClick={() => handleQuickDynamicRange('peak')}
                  title="Set dynamic range from 0 to Peak"
                >
                  0-Peak
                </button>
              </div>
            )}

            <button
              type="button"
              className={`btn ${isAuto ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '2px 6px', fontSize: '0.7rem', height: '24px' }}
              onClick={handleResetAuto}
              title="Reset to automatic data amplitude range"
            >
              <RotateCcw size={11} /> Auto
            </button>
          </div>

          <DownloadButtons
            chartId={chartId}
            chartTitle={`Spectrogram_${axis}_${filename}`}
            csvData={csvData}
            csvFilename={`Spectrogram_${axis}_${filename}.csv`}
          />
        </div>
      </div>

      <PlotlyWrapper
        chartId={chartId}
        data={trace}
        layout={layout}
        style={{ width: '100%', height: '380px' }}
      />

      {/* Axis-specific Colors Function Modal */}
      <ColormapFunctionModal
        isOpen={isColorsModalOpen}
        onClose={() => setIsColorsModalOpen(false)}
        colorConfig={localColorConfig || colorConfig || { presetId: 'simcenter', isInverted: false, bands: 'continuous' }}
        onChangeColorConfig={(newConfig) => setLocalColorConfig(newConfig)}
      />
    </div>
  );
}
