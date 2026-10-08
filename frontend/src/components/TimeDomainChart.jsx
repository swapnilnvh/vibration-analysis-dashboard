import React, { useMemo } from 'react';
import { Activity, Clock } from 'lucide-react';
import PlotlyWrapper from './PlotlyWrapper';
import DownloadButtons from './DownloadButtons';

export default function TimeDomainChart({
  timeData,
  selectedAxes,
  filename = 'LabVIEW_Data',
  timeIncrement = 'auto',
}) {
  const chartId = 'time-domain-plot';

  // Construct Plotly traces
  const traces = useMemo(() => {
    if (!timeData || !timeData.time) return [];

    const list = [];
    const t = timeData.time;

    if (selectedAxes.X && timeData.x) {
      list.push({
        x: t,
        y: timeData.x,
        type: 'scatter',
        mode: 'lines',
        name: 'X-Axis Vibration',
        line: { color: '#06b6d4', width: 1.5 },
        hoverinfo: 'x+y+name',
      });
    }

    if (selectedAxes.Y && timeData.y) {
      list.push({
        x: t,
        y: timeData.y,
        type: 'scatter',
        mode: 'lines',
        name: 'Y-Axis Vibration',
        line: { color: '#f59e0b', width: 1.5 },
        hoverinfo: 'x+y+name',
      });
    }

    if (selectedAxes.Z && timeData.z) {
      list.push({
        x: t,
        y: timeData.z,
        type: 'scatter',
        mode: 'lines',
        name: 'Z-Axis Vibration',
        line: { color: '#10b981', width: 1.5 },
        hoverinfo: 'x+y+name',
      });
    }

    return list;
  }, [timeData, selectedAxes]);

  // Construct CSV dataset for download
  const csvRows = useMemo(() => {
    if (!timeData || !timeData.time) return [];
    const rows = [];
    const t = timeData.time;
    for (let i = 0; i < t.length; i++) {
      const row = { Time_s: t[i] };
      if (timeData.x) row.X_Vibration_g = timeData.x[i];
      if (timeData.y) row.Y_Vibration_g = timeData.y[i];
      if (timeData.z) row.Z_Vibration_g = timeData.z[i];
      rows.push(row);
    }
    return rows;
  }, [timeData]);

  const layout = {
    title: {
      text: `<b>Time Domain Acceleration</b> | ${filename}`,
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
      title: { text: '<b>Acceleration (g)</b>', font: { color: '#94a3b8', size: 12 } },
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
            <Activity size={18} color="#06b6d4" />
            Time vs. Acceleration
          </div>
          <div className="chart-subtitle">
            Interactive multi-axis time series | Effective increment: {timeData?.time_increment} s ({timeData?.samples_returned?.toLocaleString()} pts)
          </div>
        </div>

        <DownloadButtons
          chartId={chartId}
          chartTitle={`Time_Domain_${filename}`}
          csvData={csvRows}
          csvFilename={`Time_Domain_${filename}.csv`}
        />
      </div>

      <PlotlyWrapper
        chartId={chartId}
        data={traces}
        layout={layout}
        style={{ width: '100%', height: '440px' }}
      />
    </div>
  );
}
