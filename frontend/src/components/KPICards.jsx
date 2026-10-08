import React from 'react';
import { Activity, Gauge, ArrowUpDown, TrendingUp, Info } from 'lucide-react';

export default function KPICards({ kpis, timeIncrement, selectedAxes }) {
  if (!kpis) return null;

  const renderAxisCard = (axisName, metrics, colorClass, colorHex) => {
    if (!metrics) return null;
    return (
      <div className={`kpi-card ${colorClass}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: colorHex,
              boxShadow: `0 0 8px ${colorHex}`
            }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {axisName}-Axis Vibration
            </h3>
          </div>
          <span className="badge" style={{ backgroundColor: 'var(--bg-surface)', color: colorHex }}>
            ACCELERATION (g)
          </span>
        </div>

        {/* Primary Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '14px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>RMS (g)</div>
            <div className="mono-val" style={{ fontSize: '1.25rem', color: colorHex }}>
              {metrics.rms.toFixed(4)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Peak (|g|)</div>
            <div className="mono-val" style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
              {metrics.peak.toFixed(4)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Peak-to-Peak (g)</div>
            <div className="mono-val" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
              {metrics.peak_to_peak.toFixed(4)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Crest Factor</div>
            <div className="mono-val" style={{ fontSize: '1.1rem', color: '#a78bfa' }}>
              {metrics.crest_factor.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Secondary Detailed Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Max: <span className="mono-val" style={{ color: 'var(--text-main)' }}>+{metrics.maximum.toFixed(3)} g</span>
          </div>
          <div>
            Min: <span className="mono-val" style={{ color: 'var(--text-main)' }}>{metrics.minimum.toFixed(3)} g</span>
          </div>
          <div>
            Kurtosis: <span className="mono-val" style={{ color: 'var(--text-main)' }}>{metrics.kurtosis.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Test Parameters Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="#06b6d4" />
          <span style={{ color: 'var(--text-muted)' }}>Dataset Samples:</span>
          <span className="mono-val" style={{ color: 'var(--text-main)' }}>
            {kpis.samples?.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gauge size={16} color="#f59e0b" />
          <span style={{ color: 'var(--text-muted)' }}>Sampling Rate:</span>
          <span className="mono-val" style={{ color: 'var(--text-main)' }}>
            {kpis.sampling_frequency} Hz
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="#10b981" />
          <span style={{ color: 'var(--text-muted)' }}>Test Duration:</span>
          <span className="mono-val" style={{ color: 'var(--text-main)' }}>
            {kpis.duration} s
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={16} color="#a78bfa" />
          <span style={{ color: 'var(--text-muted)' }}>Effective Increment:</span>
          <span className="mono-val" style={{ color: '#38bdf8' }}>
            {timeIncrement === 'auto' ? `${kpis.time_increment} s (Auto)` : `${timeIncrement} s`}
          </span>
        </div>
      </div>

      {/* Axis KPI Cards Grid */}
      <div className="kpi-grid">
        {selectedAxes.X && renderAxisCard('X', kpis.x_axis, 'axis-x', '#06b6d4')}
        {selectedAxes.Y && renderAxisCard('Y', kpis.y_axis, 'axis-y', '#f59e0b')}
        {selectedAxes.Z && renderAxisCard('Z', kpis.z_axis, 'axis-z', '#10b981')}
      </div>
    </div>
  );
}
