import React from 'react';
import { Download, FileSpreadsheet, Database, Table, CheckCircle2, Info } from 'lucide-react';
import { api } from '../services/api';

export default function DataExport({ fileInfo, timeIncrement, kpis }) {
  if (!fileInfo) {
    return (
      <div className="chart-card" style={{ textAlign: 'center', padding: '40px' }}>
        <Info size={32} color="#06b6d4" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No Data Loaded</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Please upload a LabVIEW Throughput .txt file or load the sample file from the top header to enable data export.
        </p>
      </div>
    );
  }

  const rawUrl = api.getRawCsvUrl(fileInfo.file_id);
  const processedUrl = api.getProcessedCsvUrl(fileInfo.file_id, timeIncrement);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Cards for Downloads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Card 1: Raw Data Export */}
        <div className="kpi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Database size={20} color="#06b6d4" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Download Raw Data CSV
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Exact unmodified representation of the uploaded LabVIEW Throughput data file containing all 6 original channels with native timestamps.
            </p>

            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.775rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>Columns included:</div>
              <div style={{ color: '#38bdf8' }}>Time_X, X_Vibration_g</div>
              <div style={{ color: '#fbbf24' }}>Time_Y, Y_Vibration_g</div>
              <div style={{ color: '#34d399' }}>Time_Z, Z_Vibration_g</div>
            </div>
          </div>

          <a
            href={rawUrl}
            download={`Raw_Vibration_${fileInfo.filename}.csv`}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            <Download size={16} color="#06b6d4" />
            Download Raw Data CSV ({fileInfo.samples?.toLocaleString()} Rows)
          </a>
        </div>

        {/* Card 2: Processed Data Export */}
        <div className="kpi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FileSpreadsheet size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Download Processed Data CSV
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Consolidated engineering export including resampled time-series data, sliding RMS envelopes, FFT frequency spectrum, and psychoacoustic metrics.
            </p>

            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.775rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>Columns included:</div>
              <div style={{ color: 'var(--text-main)' }}>Time_s, X_Vibration_g, Y_Vibration_g, Z_Vibration_g</div>
              <div style={{ color: '#a78bfa' }}>RMS_X_g, RMS_Y_g, RMS_Z_g</div>
              <div style={{ color: '#f59e0b' }}>Frequency_Hz, FFT_X_g, FFT_Y_g, FFT_Z_g</div>
              <div style={{ color: '#10b981' }}>Sharpness, Roughness, Fluctuation_Strength</div>
            </div>
          </div>

          <a
            href={processedUrl}
            download={`Processed_NVH_Analysis_${fileInfo.filename}.csv`}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            <Download size={16} color="#ffffff" />
            Download Processed Data CSV
          </a>
        </div>
      </div>

      {/* Dataset Health Verification Card */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <CheckCircle2 size={18} color="#10b981" />
            Dataset Provenance & Engineering Audit Information
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.825rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>File Name:</span>
            <div className="mono-val" style={{ color: 'var(--text-main)', marginTop: '2px' }}>{fileInfo.filename}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Sampling Interval:</span>
            <div className="mono-val" style={{ color: 'var(--text-main)', marginTop: '2px' }}>{fileInfo.time_increment_original} s</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Effective Export dt:</span>
            <div className="mono-val" style={{ color: '#38bdf8', marginTop: '2px' }}>
              {timeIncrement === 'auto' ? `${fileInfo.time_increment_original} s (Native)` : `${timeIncrement} s`}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Duration:</span>
            <div className="mono-val" style={{ color: 'var(--text-main)', marginTop: '2px' }}>{fileInfo.duration} seconds</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Format:</span>
            <div className="mono-val" style={{ color: '#10b981', marginTop: '2px' }}>LabVIEW 6-Column Throughput</div>
          </div>
        </div>
      </div>
    </div>
  );
}
