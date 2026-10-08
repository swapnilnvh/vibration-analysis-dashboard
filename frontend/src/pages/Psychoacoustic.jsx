import React, { useState } from 'react';
import SharpnessChart from '../components/SharpnessChart';
import RoughnessChart from '../components/RoughnessChart';
import FluctuationChart from '../components/FluctuationChart';
import { Eye, Waves, Wind, Layers, AlertCircle, BarChart3 } from 'lucide-react';

export default function Psychoacoustic({
  sharpnessData,
  roughnessData,
  fluctuationData,
  fileInfo,
}) {
  const [activeSubMetric, setActiveSubMetric] = useState('all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={18} color="#8b5cf6" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            3-Axis Vibration Psychoacoustics
          </span>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
            Triaxial + XYZ
          </span>
        </div>

        {/* Filter View */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.775rem',
              borderColor: activeSubMetric === 'all' ? '#8b5cf6' : 'var(--border-color)',
              color: activeSubMetric === 'all' ? '#fff' : 'var(--text-muted)',
              backgroundColor: activeSubMetric === 'all' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-surface)',
            }}
            onClick={() => setActiveSubMetric('all')}
          >
            Show All 3-Axis Metrics
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.775rem',
              borderColor: activeSubMetric === 'sharpness' ? '#8b5cf6' : 'var(--border-color)',
              color: activeSubMetric === 'sharpness' ? '#8b5cf6' : 'var(--text-muted)',
              backgroundColor: activeSubMetric === 'sharpness' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-surface)',
            }}
            onClick={() => setActiveSubMetric('sharpness')}
          >
            <Eye size={13} /> Sharpness
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.775rem',
              borderColor: activeSubMetric === 'roughness' ? '#f59e0b' : 'var(--border-color)',
              color: activeSubMetric === 'roughness' ? '#f59e0b' : 'var(--text-muted)',
              backgroundColor: activeSubMetric === 'roughness' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface)',
            }}
            onClick={() => setActiveSubMetric('roughness')}
          >
            <Waves size={13} /> Roughness
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.775rem',
              borderColor: activeSubMetric === 'fluctuation' ? '#10b981' : 'var(--border-color)',
              color: activeSubMetric === 'fluctuation' ? '#10b981' : 'var(--text-muted)',
              backgroundColor: activeSubMetric === 'fluctuation' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
            }}
            onClick={() => setActiveSubMetric('fluctuation')}
          >
            <Wind size={13} /> Fluctuation Strength
          </button>
        </div>
      </div>

      {/* ISO / DIN Engineering Statement */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.08)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <AlertCircle size={18} color="#8b5cf6" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--text-main)' }}>3-Axis Multi-Dimensional Psychoacoustic Analysis:</strong>{' '}
          Calculates vibration sharpness (DIN 45692 spectral centroid), roughness (20–300 Hz modulation envelope), and fluctuation strength (0.5–20 Hz slow envelope)
          simultaneously across <strong style={{ color: '#06b6d4' }}>X-Axis</strong>, <strong style={{ color: '#f59e0b' }}>Y-Axis</strong>, <strong style={{ color: '#10b981' }}>Z-Axis</strong>, and the <strong style={{ color: '#a855f7' }}>Triaxial Resultant Magnitude</strong> ($\sqrt{X^2 + Y^2 + Z^2}$).
        </div>
      </div>

      {/* 1. Sharpness Chart */}
      {(activeSubMetric === 'all' || activeSubMetric === 'sharpness') && (
        <SharpnessChart
          sharpnessData={sharpnessData}
          filename={fileInfo?.filename}
        />
      )}

      {/* 2. Roughness Chart */}
      {(activeSubMetric === 'all' || activeSubMetric === 'roughness') && (
        <RoughnessChart
          roughnessData={roughnessData}
          filename={fileInfo?.filename}
        />
      )}

      {/* 3. Fluctuation Strength Chart */}
      {(activeSubMetric === 'all' || activeSubMetric === 'fluctuation') && (
        <FluctuationChart
          fluctuationData={fluctuationData}
          filename={fileInfo?.filename}
        />
      )}

      {/* 3-Axis Multi-Channel Comparative Summary Table */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <BarChart3 size={16} color="#8b5cf6" />
            3-Axis Channel Comparison Table
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Channel / Component</th>
                <th style={{ padding: '10px 14px' }}>Sharpness Mean (acum)</th>
                <th style={{ padding: '10px 14px' }}>Sharpness Peak</th>
                <th style={{ padding: '10px 14px' }}>Roughness Mean (asper)</th>
                <th style={{ padding: '10px 14px' }}>Roughness Peak</th>
                <th style={{ padding: '10px 14px' }}>Fluctuation Mean (vacil)</th>
                <th style={{ padding: '10px 14px' }}>Fluctuation Peak</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'X-Axis', color: '#06b6d4', s: sharpnessData?.x, r: roughnessData?.x, f: fluctuationData?.x },
                { name: 'Y-Axis', color: '#f59e0b', s: sharpnessData?.y, r: roughnessData?.y, f: fluctuationData?.y },
                { name: 'Z-Axis', color: '#10b981', s: sharpnessData?.z, r: roughnessData?.z, f: fluctuationData?.z },
                { name: 'Triaxial Resultant (XYZ)', color: '#a855f7', s: sharpnessData?.triaxial, r: roughnessData?.triaxial, f: fluctuationData?.triaxial },
              ].map((row) => (
                <tr key={row.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: row.color }}>
                    {row.name}
                  </td>
                  <td className="mono-val" style={{ padding: '12px 14px' }}>{row.s?.mean?.toFixed(3) ?? '-'}</td>
                  <td className="mono-val" style={{ padding: '12px 14px' }}>{row.s?.peak?.toFixed(3) ?? '-'}</td>
                  <td className="mono-val" style={{ padding: '12px 14px' }}>{row.r?.mean?.toFixed(3) ?? '-'}</td>
                  <td className="mono-val" style={{ padding: '12px 14px' }}>{row.r?.peak?.toFixed(3) ?? '-'}</td>
                  <td className="mono-val" style={{ padding: '12px 14px' }}>{row.f?.mean?.toFixed(3) ?? '-'}</td>
                  <td className="mono-val" style={{ padding: '12px 14px' }}>{row.f?.peak?.toFixed(3) ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
