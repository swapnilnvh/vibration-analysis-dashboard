import React from 'react';
import { Activity, Clock, Cpu, HardDrive, Sun, Moon, Database } from 'lucide-react';

export default function Header({ fileInfo, theme, toggleTheme, onLoadSample, isSampleLoading }) {
  return (
    <header className="dashboard-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)'
        }}>
          <Activity size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            VIBRATION DATA ANALYSIS DASHBOARD
          </h1>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            LabVIEW Throughput File – NVH / Vibration Analysis
          </p>
        </div>
      </div>

      {/* Meta indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {fileInfo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={15} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>File:</span>
              <span className="mono-val" style={{ color: '#38bdf8', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fileInfo.filename}>
                {fileInfo.filename}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={15} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>Fs:</span>
              <span className="mono-val" style={{ color: 'var(--text-main)' }}>
                {fileInfo.sampling_frequency} Hz
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>Dur:</span>
              <span className="mono-val" style={{ color: 'var(--text-main)' }}>
                {fileInfo.duration} s
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-emerald">
                {fileInfo.samples.toLocaleString()} SAMPLES
              </span>
            </div>
          </div>
        ) : (
          <div className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
            No Data Loaded
          </div>
        )}

        {/* Load Sample Dataset Shortcut */}
        <button
          className="btn btn-secondary"
          onClick={onLoadSample}
          disabled={isSampleLoading}
          title="Load pre-configured 6,400-sample LabVIEW NVH test dataset"
          style={{ fontSize: '0.775rem', padding: '6px 12px' }}
        >
          <Database size={14} color="#06b6d4" />
          {isSampleLoading ? 'Loading...' : 'Load Sample File'}
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-secondary"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.785rem',
            fontWeight: 600,
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#f59e0b" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#0284c7" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
