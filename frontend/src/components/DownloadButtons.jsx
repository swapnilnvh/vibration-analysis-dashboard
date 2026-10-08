import React from 'react';
import { Download, Image, FileSpreadsheet } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';

export default function DownloadButtons({
  chartId,
  chartTitle = 'Vibration_Chart',
  csvData = null,
  csvFilename = 'chart_data.csv',
  customActions = null
}) {
  const downloadChartPng = () => {
    const el = document.getElementById(chartId);
    if (!el) return;

    Plotly.downloadImage(el, {
      format: 'png',
      width: 1200,
      height: 700,
      filename: `${chartTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`,
    });
  };

  const downloadCsv = () => {
    if (!csvData) return;

    let csvContent = '';
    if (typeof csvData === 'string') {
      csvContent = csvData;
    } else if (Array.isArray(csvData)) {
      // Array of objects
      if (csvData.length > 0) {
        const headers = Object.keys(csvData[0]);
        csvContent = headers.join(',') + '\n';
        csvContent += csvData
          .map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
          .join('\n');
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', csvFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {chartId && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={downloadChartPng}
          title="Download high-resolution PNG of this graph"
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
        >
          <Image size={14} color="#06b6d4" />
          Download PNG
        </button>
      )}

      {csvData && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={downloadCsv}
          title="Download data points as CSV"
          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
        >
          <FileSpreadsheet size={14} color="#10b981" />
          Download CSV
        </button>
      )}

      {customActions}
    </div>
  );
}
