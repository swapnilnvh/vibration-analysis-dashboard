import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function FileUpload({ onUploadSuccess, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.dat')) {
      onError('Invalid file format. Please upload a LabVIEW Throughput .txt file.');
      return;
    }

    setIsLoading(true);
    setCurrentFile(file.name);

    try {
      const result = await api.uploadFile(file);
      onUploadSuccess(result);
    } catch (err) {
      const msg = err.response?.data?.detail?.message || err.message || 'File upload and validation failed.';
      onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="control-section">
      <div className="control-title">
        <UploadCloud size={14} color="#06b6d4" />
        LabVIEW Throughput File Upload
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#06b6d4' : 'var(--border-light)'}`,
          backgroundColor: isDragging ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-surface)',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".txt,.dat,.csv"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={24} className="animate-spin" color="#06b6d4" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Validating 6-column format & sampling rate...
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <UploadCloud size={24} color={isDragging ? '#06b6d4' : 'var(--text-muted)'} />
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Choose LabVIEW .txt File
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>
              Drag & drop or browse (6 columns: Time_X, X, Time_Y, Y, Time_Z, Z)
            </div>
          </div>
        )}
      </div>

      {currentFile && !isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          padding: '4px 8px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '4px'
        }}>
          <FileCheck size={14} color="#10b981" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentFile}
          </span>
        </div>
      )}
    </div>
  );
}
