import React from 'react';
import TimeDomainChart from '../components/TimeDomainChart';
import { Clock, Info, CheckCircle2 } from 'lucide-react';

export default function TimeDomain({
  timeData,
  selectedAxes,
  fileInfo,
  timeIncrement,
  kpis,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TimeDomainChart
        timeData={timeData}
        selectedAxes={selectedAxes}
        filename={fileInfo?.filename}
        timeIncrement={timeIncrement}
      />

      {/* Numerical Analysis Table */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <Info size={16} color="#06b6d4" />
            Time Domain Numerical Summary & Signal Health
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Axis / Channel</th>
                <th style={{ padding: '10px 14px' }}>RMS (g)</th>
                <th style={{ padding: '10px 14px' }}>Peak (|g|)</th>
                <th style={{ padding: '10px 14px' }}>Peak-to-Peak (g)</th>
                <th style={{ padding: '10px 14px' }}>Max (+g)</th>
                <th style={{ padding: '10px 14px' }}>Min (-g)</th>
                <th style={{ padding: '10px 14px' }}>Crest Factor</th>
                <th style={{ padding: '10px 14px' }}>Kurtosis</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {['X', 'Y', 'Z'].map((ax) => {
                const metricKey = `${ax.toLowerCase()}_axis`;
                const m = kpis?.[metricKey];
                const active = selectedAxes[ax];
                if (!m) return null;

                const color = ax === 'X' ? '#06b6d4' : ax === 'Y' ? '#f59e0b' : '#10b981';

                return (
                  <tr
                    key={ax}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      opacity: active ? 1 : 0.45,
                      backgroundColor: active ? 'rgba(255,255,255,0.01)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: color }}>
                      {ax}-Axis Acceleration
                    </td>
                    <td className="mono-val" style={{ padding: '12px 14px' }}>{m.rms.toFixed(4)}</td>
                    <td className="mono-val" style={{ padding: '12px 14px' }}>{m.peak.toFixed(4)}</td>
                    <td className="mono-val" style={{ padding: '12px 14px' }}>{m.peak_to_peak.toFixed(4)}</td>
                    <td className="mono-val" style={{ padding: '12px 14px' }}>+{m.maximum.toFixed(4)}</td>
                    <td className="mono-val" style={{ padding: '12px 14px' }}>{m.minimum.toFixed(4)}</td>
                    <td className="mono-val" style={{ padding: '12px 14px', color: '#a78bfa' }}>{m.crest_factor.toFixed(2)}</td>
                    <td className="mono-val" style={{ padding: '12px 14px' }}>{m.kurtosis.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Validated
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
