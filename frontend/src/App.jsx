import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import TimeDomain from './pages/TimeDomain';
import FrequencyDomain from './pages/FrequencyDomain';
import Psychoacoustic from './pages/Psychoacoustic';
import SharpnessChart from './components/SharpnessChart';
import RoughnessChart from './components/RoughnessChart';
import FluctuationChart from './components/FluctuationChart';
import SpectrogramPage from './pages/SpectrogramPage';
import DataExport from './pages/DataExport';
import { api } from './services/api';
import {
  LayoutDashboard,
  Activity,
  Zap,
  Eye,
  Waves,
  Wind,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import './styles/dashboard.css';

export default function App() {
  // Persistent Theme state (Dark / Light with persistence)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('nvh_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('nvh_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview');

  // File metadata
  const [fileInfo, setFileInfo] = useState(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Notifications
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Axis selection
  const [selectedAxes, setSelectedAxes] = useState({ X: true, Y: true, Z: true });

  // Time increment
  const [timeIncrement, setTimeIncrement] = useState('auto');
  const [customIncrement, setCustomIncrement] = useState('');

  // Processing settings
  const [fftSettings, setFftSettings] = useState({
    window: 'hanning',
    freqMin: 0,
    freqMax: null,
    scale: 'linear',
  });

  const [specSettings, setSpecSettings] = useState({
    fftSize: 1000,
    freqResolution: 1.0,
    overlap: 0.5,
    window: 'hann',
    scale: 'db',
  });

  // Psychoacoustic active axis
  const [psychoAxis, setPsychoAxis] = useState('X');

  // Analysis data caches
  const [kpis, setKpis] = useState(null);
  const [timeData, setTimeData] = useState(null);
  const [fftData, setFftData] = useState(null);
  const [sharpnessData, setSharpnessData] = useState(null);
  const [roughnessData, setRoughnessData] = useState(null);
  const [fluctuationData, setFluctuationData] = useState(null);
  const [specDataX, setSpecDataX] = useState(null);
  const [specDataY, setSpecDataY] = useState(null);
  const [specDataZ, setSpecDataZ] = useState(null);

  // Toggle axis
  const toggleAxis = (axis) => {
    setSelectedAxes((prev) => {
      const next = { ...prev, [axis]: !prev[axis] };
      // Ensure at least one axis is enabled
      if (!next.X && !next.Y && !next.Z) {
        return prev;
      }
      return next;
    });
  };

  // Load active axes array
  const getEnabledAxesList = useCallback(() => {
    return ['X', 'Y', 'Z'].filter((a) => selectedAxes[a]);
  }, [selectedAxes]);

  // Fetch KPI data
  const fetchKPIs = useCallback(async (fileId) => {
    try {
      const res = await api.getKPIs(fileId);
      setKpis(res);
    } catch (err) {
      console.error('KPI fetch error:', err);
    }
  }, []);

  // Fetch Time-Domain data
  const fetchTimeDomain = useCallback(async (fileId, inc, axes) => {
    try {
      const effectiveInc = inc === 'custom' ? (parseFloat(customIncrement) || 'auto') : inc;
      const res = await api.getTimeDomain(fileId, effectiveInc, axes);
      setTimeData(res);
    } catch (err) {
      console.error('Time domain error:', err);
    }
  }, [customIncrement]);

  // Fetch FFT data
  const fetchFFT = useCallback(async (fileId, settings, axes) => {
    try {
      const res = await api.getFFT(
        fileId,
        settings.freqMin,
        settings.freqMax,
        axes,
        settings.window,
        settings.scale
      );
      setFftData(res);
    } catch (err) {
      console.error('FFT error:', err);
    }
  }, []);

  // Fetch Spectrograms for X, Y, Z (with 1.0 Hz frequency resolution)
  const fetchSpectrograms = useCallback(async (fileId, settings) => {
    try {
      const freqRes = settings.freqResolution || 1.0;
      const [resX, resY, resZ] = await Promise.all([
        api.getSpectrogram(fileId, 'X', settings.fftSize, settings.overlap, settings.window, 0, null, settings.scale, freqRes),
        api.getSpectrogram(fileId, 'Y', settings.fftSize, settings.overlap, settings.window, 0, null, settings.scale, freqRes),
        api.getSpectrogram(fileId, 'Z', settings.fftSize, settings.overlap, settings.window, 0, null, settings.scale, freqRes),
      ]);
      setSpecDataX(resX);
      setSpecDataY(resY);
      setSpecDataZ(resZ);
    } catch (err) {
      console.error('Spectrogram fetch error:', err);
    }
  }, []);

  // Fetch 3-Axis Psychoacoustics (X, Y, Z, Triaxial)
  const fetchPsychoacoustics = useCallback(async (fileId) => {
    try {
      const [sharpRes, roughRes, flucRes] = await Promise.all([
        api.getSharpness(fileId, 'ALL'),
        api.getRoughness(fileId, 'ALL'),
        api.getFluctuation(fileId, 'ALL'),
      ]);
      setSharpnessData(sharpRes);
      setRoughnessData(roughRes);
      setFluctuationData(flucRes);
    } catch (err) {
      console.error('Psychoacoustic fetch error:', err);
    }
  }, []);

  // Full refresh of all datasets for current file
  const refreshAllData = useCallback(async (info) => {
    if (!info?.file_id) return;
    setIsLoading(true);
    const axes = ['X', 'Y', 'Z'];
    try {
      await Promise.all([
        fetchKPIs(info.file_id),
        fetchTimeDomain(info.file_id, timeIncrement, axes),
        fetchFFT(info.file_id, fftSettings, axes),
        fetchPsychoacoustics(info.file_id),
        fetchSpectrograms(info.file_id, specSettings),
      ]);
    } catch (err) {
      setErrorMsg('Failed to process one or more vibration analyses.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchKPIs, fetchTimeDomain, timeIncrement, fetchFFT, fftSettings, fetchPsychoacoustics, fetchSpectrograms, specSettings]);

  // Initial load: fetch pre-seeded sample LabVIEW dataset
  useEffect(() => {
    const init = async () => {
      try {
        const sampleInfo = await api.loadSample();
        setFileInfo(sampleInfo);
        await refreshAllData(sampleInfo);
      } catch (err) {
        console.warn('Initial sample load note:', err);
      }
    };
    init();
  }, []);

  // Update time domain when time increment changes
  useEffect(() => {
    if (fileInfo) {
      const axes = getEnabledAxesList();
      fetchTimeDomain(fileInfo.file_id, timeIncrement, axes);
    }
  }, [timeIncrement, customIncrement, fileInfo, getEnabledAxesList, fetchTimeDomain]);

  // Update FFT when settings change
  useEffect(() => {
    if (fileInfo) {
      const axes = getEnabledAxesList();
      fetchFFT(fileInfo.file_id, fftSettings, axes);
    }
  }, [fftSettings, fileInfo, getEnabledAxesList, fetchFFT]);

  // Update psychoacoustics when axis changes
  useEffect(() => {
    if (fileInfo) {
      fetchPsychoacoustics(fileInfo.file_id, psychoAxis);
    }
  }, [psychoAxis, fileInfo, fetchPsychoacoustics]);

  // Handle uploaded file
  const handleUploadSuccess = (uploadedInfo) => {
    setFileInfo(uploadedInfo);
    setErrorMsg(null);
    setSuccessMsg(`File "${uploadedInfo.filename}" successfully loaded and validated!`);
    refreshAllData(uploadedInfo);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Handle load sample button
  const handleLoadSample = async () => {
    setIsSampleLoading(true);
    setErrorMsg(null);
    try {
      const sample = await api.loadSample();
      setFileInfo(sample);
      setSuccessMsg('Pre-configured 6,400-sample LabVIEW NVH dataset loaded successfully.');
      await refreshAllData(sample);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setErrorMsg('Could not load sample dataset.');
    } finally {
      setIsSampleLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Header */}
      <Header
        fileInfo={fileInfo}
        theme={theme}
        toggleTheme={toggleTheme}
        onLoadSample={handleLoadSample}
        isSampleLoading={isSampleLoading}
      />

      <div className="dashboard-body">
        {/* Sidebar / Left Control Panel */}
        <Sidebar
          fileInfo={fileInfo}
          onUploadSuccess={handleUploadSuccess}
          onError={(msg) => setErrorMsg(msg)}
          selectedAxes={selectedAxes}
          toggleAxis={toggleAxis}
          timeIncrement={timeIncrement}
          setTimeIncrement={setTimeIncrement}
          customIncrement={customIncrement}
          setCustomIncrement={setCustomIncrement}
          fftSettings={fftSettings}
          setFftSettings={setFftSettings}
          specSettings={specSettings}
          setSpecSettings={setSpecSettings}
        />

        {/* Main Content Area */}
        <main className="main-content">
          {/* Notifications */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#ef4444" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#6ee7b7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#10b981" />
                <span>{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Navigation Tabs (Prompt Section 22) */}
          <nav className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={15} /> Overview
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'time-domain' ? 'active' : ''}`}
              onClick={() => setActiveTab('time-domain')}
            >
              <Activity size={15} /> Time Domain
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'frequency-domain' ? 'active' : ''}`}
              onClick={() => setActiveTab('frequency-domain')}
            >
              <Zap size={15} /> Frequency Domain
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'sharpness' ? 'active' : ''}`}
              onClick={() => setActiveTab('sharpness')}
            >
              <Eye size={15} /> Sharpness
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'roughness' ? 'active' : ''}`}
              onClick={() => setActiveTab('roughness')}
            >
              <Waves size={15} /> Roughness
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'fluctuation' ? 'active' : ''}`}
              onClick={() => setActiveTab('fluctuation')}
            >
              <Wind size={15} /> Fluctuation Strength
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'spectrogram' ? 'active' : ''}`}
              onClick={() => setActiveTab('spectrogram')}
            >
              <Layers size={15} /> Spectrogram (3 Colormaps)
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'data-export' ? 'active' : ''}`}
              onClick={() => setActiveTab('data-export')}
            >
              <FileSpreadsheet size={15} /> Data Export
            </button>
          </nav>

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <Overview
              kpis={kpis}
              timeData={timeData}
              fftData={fftData}
              selectedAxes={selectedAxes}
              timeIncrement={timeIncrement}
              fftSettings={fftSettings}
              fileInfo={fileInfo}
            />
          )}

          {activeTab === 'time-domain' && (
            <TimeDomain
              timeData={timeData}
              selectedAxes={selectedAxes}
              fileInfo={fileInfo}
              timeIncrement={timeIncrement}
              kpis={kpis}
            />
          )}

          {activeTab === 'frequency-domain' && (
            <FrequencyDomain
              fftData={fftData}
              selectedAxes={selectedAxes}
              fftSettings={fftSettings}
              fileInfo={fileInfo}
            />
          )}

          {activeTab === 'sharpness' && (
            <SharpnessChart
              sharpnessData={sharpnessData}
              filename={fileInfo?.filename}
            />
          )}

          {activeTab === 'roughness' && (
            <RoughnessChart
              roughnessData={roughnessData}
              filename={fileInfo?.filename}
            />
          )}

          {activeTab === 'fluctuation' && (
            <FluctuationChart
              fluctuationData={fluctuationData}
              filename={fileInfo?.filename}
            />
          )}

          {activeTab === 'spectrogram' && (
            <SpectrogramPage
              specDataX={specDataX}
              specDataY={specDataY}
              specDataZ={specDataZ}
              fileInfo={fileInfo}
              specSettings={specSettings}
              setSpecSettings={setSpecSettings}
              onRefresh={(updatedSettings) => {
                if (fileInfo) fetchSpectrograms(fileInfo.file_id, updatedSettings);
              }}
            />
          )}

          {activeTab === 'data-export' && (
            <DataExport
              fileInfo={fileInfo}
              timeIncrement={timeIncrement}
              kpis={kpis}
            />
          )}
        </main>
      </div>
    </div>
  );
}
