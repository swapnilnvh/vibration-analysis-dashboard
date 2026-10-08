import React from 'react';
import FrequencyChart from '../components/FrequencyChart';
import { Target, Zap, Activity } from 'lucide-react';

export default function FrequencyDomain({
  fftData,
  selectedAxes,
  fftSettings,
  fileInfo,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FrequencyChart
        fftData={fftData}
        selectedAxes={selectedAxes}
        scale={fftSettings?.scale || 'linear'}
        filename={fileInfo?.filename}
      />

      {/* Harmonic Peak Identification Table */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <Target size={16} color="#f59e0b" />
            Spectral Peak Identification & NVH Diagnostic Indicators
          </div>
          <div className="chart-subtitle">
            Coherent-gain normalized peaks for vibration harmonic analysis
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {['X', 'Y', 'Z'].map((ax) => {
            if (!selectedAxes[ax] || !fftData?.data?.[ax]) return null;
            const axData = fftData.data[ax];
            const color = ax === 'X' ? '#06b6d4' : ax === 'Y' ? '#f59e0b' : '#10b981';

            return (
              <div
                key={ax}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: `1px solid var(--border-color)`,
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: color, fontSize: '0.95rem', fontWeight: 700 }}>
                    {ax}-Axis Top Peaks
                  </h4>
                  <span className="mono-val" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Dominant: {axData.dominant_frequency} Hz
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {axData.top_peaks?.map((pk, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        padding: '6px 8px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>#{idx + 1}</span>
                        <span className="mono-val" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {pk.frequency.toFixed(2)} Hz
                        </span>
                      </div>
                      <span className="mono-val" style={{ color: color, fontWeight: 600 }}>
                        {pk.amplitude.toFixed(4)} g
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
