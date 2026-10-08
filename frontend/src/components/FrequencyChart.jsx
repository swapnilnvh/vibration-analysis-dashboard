import React, { useMemo } from 'react';
import { Zap, Target } from 'lucide-react';
import PlotlyWrapper from './PlotlyWrapper';
import DownloadButtons from './DownloadButtons';

export default function FrequencyChart({
  fftData,
  selectedAxes,
  scale = 'linear',
  filename = 'LabVIEW_Data',
}) {
  const chartId = 'frequency-spectrum-plot';

  const { traces, dominantPoints } = useMemo(() => {
    if (!fftData || !fftData.data) return { traces: [], dominantPoints: [] };

    const traceList = [];
    const domList = [];
    const colors = { X: '#06b6d4', Y: '#f59e0b', Z: '#10b981' };

    ['X', 'Y', 'Z'].forEach((ax) => {
      if (selectedAxes[ax] && fftData.data[ax]) {
        const axData = fftData.data[ax];
        const freqs = axData.frequency;
        const amps = axData.amplitude;

        // Amplitude trace
        traceList.push({
          x: freqs,
          y: amps,
          type: 'scatter',
          mode: 'lines',
          name: `${ax}-Axis Spectrum`,
          line: { color: colors[ax], width: 1.5 },
          hoverinfo: 'x+y+name',
        });

        // Top peaks annotations/markers
        if (axData.top_peaks && axData.top_peaks.length > 0) {
          const peakX = axData.top_peaks.map((p) => p.frequency);
          const peakY = axData.top_peaks.map((p) => p.amplitude);
          const peakText = axData.top_peaks.map(
            (p, idx) => `${ax} Peak #${idx + 1}: ${p.frequency} Hz (${p.amplitude} g)`
          );

          traceList.push({
            x: peakX,
            y: peakY,
            type: 'scatter',
            mode: 'markers',
            name: `${ax} Prominent Peaks`,
            marker: { color: colors[ax], size: 7, symbol: 'diamond' },
            text: peakText,
            hoverinfo: 'text',
            showlegend: false,
          });
        }

        domList.push({
          axis: ax,
          freq: axData.dominant_frequency,
          amp: axData.dominant_amplitude,
          color: colors[ax],
        });
      }
    });

    return { traces: traceList, dominantPoints: domList };
  }, [fftData, selectedAxes]);

  // Construct CSV dataset for export
  const csvRows = useMemo(() => {
    if (!fftData || !fftData.data) return [];
    const primaryAxis = Object.keys(fftData.data)[0];
    if (!primaryAxis) return [];

    const freqs = fftData.data[primaryAxis].frequency;
    const rows = [];
    for (let i = 0; i < freqs.length; i++) {
      const row = { Frequency_Hz: freqs[i] };
      if (fftData.data.X) row.Amplitude_X_g = fftData.data.X.amplitude[i];
      if (fftData.data.Y) row.Amplitude_Y_g = fftData.data.Y.amplitude[i];
      if (fftData.data.Z) row.Amplitude_Z_g = fftData.data.Z.amplitude[i];
      rows.push(row);
    }
    return rows;
  }, [fftData]);

  const layout = {
    title: {
      text: `<b>FFT Amplitude Spectrum</b> (${fftData?.window?.toUpperCase()} Window, Coherent Gain Corrected)`,
      font: { color: '#f8fafc', size: 14 },
      x: 0.02,
      xanchor: 'left',
    },
    xaxis: {
      title: { text: '<b>Frequency (Hz)</b>', font: { color: '#94a3b8', size: 12 } },
      gridcolor: '#1e293b',
      zerolinecolor: '#334155',
      tickfont: { color: '#94a3b8' },
    },
    yaxis: {
      title: { text: scale === 'log' ? '<b>Amplitude (dB ref 1g)</b>' : '<b>Amplitude (g)</b>', font: { color: '#94a3b8', size: 12 } },
      type: scale === 'log' ? 'log' : 'linear',
      gridcolor: '#1e293b',
      zerolinecolor: '#334155',
      tickfont: { color: '#94a3b8' },
    },
    legend: {
      orientation: 'h',
      x: 0.02,
      y: 1.12,
      font: { color: '#e2e8f0', size: 11 },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-area">
          <div className="chart-title">
            <Zap size={18} color="#f59e0b" />
            Frequency vs. Acceleration (FFT Spectrum)
          </div>
          <div className="chart-subtitle">
            Bandwidth: {fftData?.frequency_min || 0} Hz – {fftData?.frequency_max || 'Nyquist'} Hz | Window: {fftData?.window}
          </div>
        </div>

        <DownloadButtons
          chartId={chartId}
          chartTitle={`FFT_Spectrum_${filename}`}
          csvData={csvRows}
          csvFilename={`FFT_Spectrum_${filename}.csv`}
        />
      </div>

      {/* Dominant Peak Badges Bar */}
      {dominantPoints.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '6px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Target size={14} color="#f59e0b" />
            <span>Dominant Frequencies:</span>
          </div>
          {dominantPoints.map((dp) => (
            <div
              key={dp.axis}
              style={{
                fontSize: '0.775rem',
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid ${dp.color}`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <strong style={{ color: dp.color }}>{dp.axis}-Axis:</strong>
              <span className="mono-val" style={{ color: 'var(--text-main)' }}>{dp.freq} Hz</span>
              <span style={{ color: 'var(--text-muted)' }}>({dp.amp} g)</span>
            </div>
          ))}
        </div>
      )}

      <PlotlyWrapper
        chartId={chartId}
        data={traces}
        layout={layout}
        style={{ width: '100%', height: '440px' }}
      />
    </div>
  );
}
