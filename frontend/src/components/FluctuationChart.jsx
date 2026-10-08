import React, { useState, useMemo } from 'react';
import { Wind, Info } from 'lucide-react';
import PlotlyWrapper from './PlotlyWrapper';
import DownloadButtons from './DownloadButtons';

export default function FluctuationChart({ fluctuationData, filename = 'LabVIEW_Data' }) {
  const chartId = 'fluctuation-plot-3axis';

  // Local state for which channels to display
  const [activeChannels, setActiveChannels] = useState({
    X: true,
    Y: true,
    Z: true,
    Triaxial: true,
  });

  const toggleChannel = (chan) => {
    setActiveChannels((prev) => {
      const next = { ...prev, [chan]: !prev[chan] };
      if (!next.X && !next.Y && !next.Z && !next.Triaxial) return prev;
      return next;
    });
  };

  const channelConfig = [
    { key: 'X', label: 'X-Axis', color: '#06b6d4', width: 1.5, dash: 'solid', dataObj: fluctuationData?.x },
    { key: 'Y', label: 'Y-Axis', color: '#f59e0b', width: 1.5, dash: 'solid', dataObj: fluctuationData?.y },
    { key: 'Z', label: 'Z-Axis', color: '#10b981', width: 1.5, dash: 'solid', dataObj: fluctuationData?.z },
    { key: 'Triaxial', label: 'Triaxial Resultant (XYZ)', color: '#a855f7', width: 2.2, dash: 'solid', dataObj: fluctuationData?.triaxial },
  ];

  const traces = useMemo(() => {
    if (!fluctuationData || !fluctuationData.time) return [];
    const list = [];
    const t = fluctuationData.time;

    channelConfig.forEach((cfg) => {
      if (activeChannels[cfg.key] && cfg.dataObj?.values) {
        list.push({
          x: t,
          y: cfg.dataObj.values,
          type: 'scatter',
          mode: 'lines',
          name: cfg.label,
          line: { color: cfg.color, width: cfg.width, dash: cfg.dash },
          hoverinfo: 'x+y+name',
        });
      }
    });

    if (list.length === 0 && fluctuationData.values) {
      list.push({
        x: t,
        y: fluctuationData.values,
        type: 'scatter',
        mode: 'lines',
        name: 'Fluctuation Strength',
        line: { color: '#10b981', width: 2 },
        hoverinfo: 'x+y+name',
      });
    }

    return list;
  }, [fluctuationData, activeChannels]);

  // Construct consolidated CSV dataset with all 3 axes + Triaxial
  const csvRows = useMemo(() => {
    if (!fluctuationData || !fluctuationData.time) return [];
    const t = fluctuationData.time;
    return t.map((timeVal, idx) => {
      const row = { Time_s: timeVal };
      if (fluctuationData.x?.values) row.Fluctuation_X_vacil = fluctuationData.x.values[idx];
      if (fluctuationData.y?.values) row.Fluctuation_Y_vacil = fluctuationData.y.values[idx];
      if (fluctuationData.z?.values) row.Fluctuation_Z_vacil = fluctuationData.z.values[idx];
      if (fluctuationData.triaxial?.values) row.Fluctuation_Triaxial_vacil = fluctuationData.triaxial.values[idx];
      return row;
    });
  }, [fluctuationData]);

  const layout = {
    title: {
      text: `<b>3-Axis Vibration Fluctuation Strength vs. Time</b> | Fastl Low-Frequency Envelope Demodulation`,
      font: { color: '#f8fafc', size: 14 },
      x: 0.02,
      xanchor: 'left',
    },
    xaxis: {
      title: { text: '<b>Time (s)</b>', font: { color: '#94a3b8', size: 12 } },
      gridcolor: '#1e293b',
      zerolinecolor: '#334155',
      tickfont: { color: '#94a3b8' },
    },
    yaxis: {
      title: { text: '<b>Fluctuation Strength (vacil - estimated)</b>', font: { color: '#94a3b8', size: 12 } },
      gridcolor: '#1e293b',
      zerolinecolor: '#334155',
      tickfont: { color: '#94a3b8' },
    },
    legend: {
      orientation: 'h',
      x: 0.02,
      y: 1.14,
      font: { color: '#e2e8f0', size: 11 },
    },
  };

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-area">
          <div className="chart-title">
            <Wind size={18} color="#10b981" />
            3-Axis Fluctuation Strength – Amplitude vs. Time
            <span className="badge badge-emerald" style={{ marginLeft: '6px' }}>ESTIMATED METRIC</span>
          </div>
          <div className="chart-subtitle">
            Slow modulation envelope (0.5–20 Hz, 4 Hz peak) across X, Y, Z, and Triaxial resultant magnitude
          </div>
        </div>

        <DownloadButtons
          chartId={chartId}
          chartTitle={`3Axis_Fluctuation_${filename}`}
          csvData={csvRows}
          csvFilename={`3Axis_Fluctuation_${filename}.csv`}
        />
      </div>

      {/* Interactive 3-Axis Channel Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '4px 0' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
          Channels:
        </span>
        {channelConfig.map((cfg) => {
          const isActive = activeChannels[cfg.key];
          return (
            <button
              key={cfg.key}
              type="button"
              onClick={() => toggleChannel(cfg.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.775rem',
                fontWeight: 600,
                border: `1px solid ${isActive ? cfg.color : 'var(--border-color)'}`,
                backgroundColor: isActive ? 'rgba(255,255,255,0.04)' : 'var(--bg-surface)',
                color: isActive ? cfg.color : 'var(--text-dim)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? cfg.color : 'transparent',
                  border: `1px solid ${cfg.color}`,
                }}
              />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Channel Summary Metrics Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {channelConfig.map((cfg) => {
          if (!activeChannels[cfg.key] || !cfg.dataObj) return null;
          return (
            <div
              key={cfg.key}
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid var(--border-color)`,
                borderLeft: `3px solid ${cfg.color}`,
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: cfg.color, fontWeight: 700, marginBottom: '2px' }}>
                <span>{cfg.label}</span>
                <span>vacil</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Mean: <strong className="mono-val" style={{ color: 'var(--text-main)' }}>{cfg.dataObj.mean.toFixed(3)}</strong></span>
                <span>Peak: <strong className="mono-val" style={{ color: 'var(--text-main)' }}>{cfg.dataObj.peak.toFixed(3)}</strong></span>
                <span>P95: <strong className="mono-val" style={{ color: 'var(--text-main)' }}>{cfg.dataObj.percentile_95.toFixed(3)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <PlotlyWrapper
        chartId={chartId}
        data={traces}
        layout={layout}
        style={{ width: '100%', height: '420px' }}
      />

      {/* Engineering Methodology Note */}
      <div className="methodology-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Info size={15} color="#10b981" />
          <strong>3-Axis Methodology & Assumptions:</strong>
        </div>
        <p>
          {fluctuationData?.methodology || (
            "Vibration Fluctuation Strength evaluates slow envelope modulations (< 20 Hz) extracted via Hilbert " +
            "transform demodulation for X, Y, Z, and Triaxial magnitude. A bandpass weighting curve peaking at 4 Hz (Fastl model adaptation) quantifies " +
            "cyclic shudder, engine hunting, structural surge, and beat sensations across all vibration dimensions."
          )}
        </p>
      </div>
    </div>
  );
}
