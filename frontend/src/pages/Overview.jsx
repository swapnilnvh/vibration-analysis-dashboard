import React from 'react';
import KPICards from '../components/KPICards';
import TimeDomainChart from '../components/TimeDomainChart';
import FrequencyChart from '../components/FrequencyChart';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Overview({
  kpis,
  timeData,
  fftData,
  selectedAxes,
  timeIncrement,
  fftSettings,
  fileInfo,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. KPI Cards */}
      <KPICards kpis={kpis} timeIncrement={timeIncrement} selectedAxes={selectedAxes} />

      {/* 2. Combined Time Domain Graph */}
      <TimeDomainChart
        timeData={timeData}
        selectedAxes={selectedAxes}
        filename={fileInfo?.filename}
        timeIncrement={timeIncrement}
      />

      {/* 3. Combined Frequency Domain Graph */}
      <FrequencyChart
        fftData={fftData}
        selectedAxes={selectedAxes}
        scale={fftSettings?.scale || 'linear'}
        filename={fileInfo?.filename}
      />
    </div>
  );
}
