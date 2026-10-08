import React, { useState } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Layers,
  ArrowRightLeft,
  Flame,
} from 'lucide-react';
import {
  COLORMAP_PRESETS,
  SIMCENTER_TESTLAB,
  SIMCENTER_MODERN,
  getColorscaleCssGradient,
  resolvePlotlyColorscale,
} from '../utils/colormaps';

export default function ColormapFunctionModal({
  isOpen,
  onClose,
  colorConfig,
  onChangeColorConfig,
}) {
  if (!isOpen) return null;

  // Local state for editing within modal
  const [activePreset, setActivePreset] = useState(colorConfig?.presetId || 'simcenter');
  const [isInverted, setIsInverted] = useState(colorConfig?.isInverted || false);
  const [bands, setBands] = useState(colorConfig?.bands || 'continuous');
  const [customColors, setCustomColors] = useState(
    colorConfig?.customColors || {
      low: '#02004a',
      mid: '#00d5d5',
      high: '#ee1100',
      peak: '#ffffff',
    }
  );

  const handleApply = () => {
    onChangeColorConfig({
      presetId: activePreset,
      isInverted,
      bands,
      customColors,
    });
    onClose();
  };

  const handleResetSimcenter = () => {
    setActivePreset('simcenter');
    setIsInverted(false);
    setBands('continuous');
    setCustomColors({
      low: '#02004a',
      mid: '#00d5d5',
      high: '#ee1100',
      peak: '#ffffff',
    });
  };

  // Preview gradient CSS
  const previewGradient =
    activePreset === 'custom'
      ? `linear-gradient(to right, ${customColors.low}, ${customColors.mid}, ${customColors.high}, ${customColors.peak})`
      : getColorscaleCssGradient(activePreset, isInverted);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-main)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Palette size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Colormap & Colors Function
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Siemens Simcenter Testlab NVH Palettes, Discrete Bands & Custom Color Mapping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px', borderRadius: '6px', height: '32px', width: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Active Preview Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#06b6d4" /> Active Colorbar Preview:
            </span>
            <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
              {activePreset === 'simcenter'
                ? 'Siemens Simcenter Testlab (Active)'
                : activePreset === 'simcenter-modern'
                ? 'Siemens Simcenter Modern'
                : activePreset === 'custom'
                ? 'Custom User Colorscale'
                : `${activePreset} Preset`}
              {isInverted ? ' [Inverted]' : ''}
              {bands !== 'continuous' ? ` [${bands} Bands]` : ' [Continuous]'}
            </span>
          </div>

          <div
            style={{
              height: '24px',
              borderRadius: '6px',
              border: '1px solid var(--border-light)',
              background: previewGradient,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            <span>Noise Floor / Low Amp</span>
            <span>Transition / Mid</span>
            <span>Resonance Peak / Max Amp</span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Siemens Simcenter Palettes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={15} color="#0284c7" /> Siemens Simcenter NVH Palettes (Industry Standard)
              </span>
              <span style={{ fontSize: '0.7rem', color: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                Recommended for NVH Testing
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
              {COLORMAP_PRESETS.filter((p) => p.category === 'Siemens NVH').map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setActivePreset(preset.id)}
                    style={{
                      border: `1.5px solid ${isSelected ? '#0284c7' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 10px rgba(2, 132, 199, 0.25)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#0284c7' : 'var(--text-main)' }}>
                        {preset.name}
                      </span>
                      {isSelected && <Check size={14} color="#0284c7" />}
                    </div>
                    <div
                      style={{
                        height: '14px',
                        borderRadius: '4px',
                        background: getColorscaleCssGradient(preset.id, isInverted),
                        marginBottom: '6px',
                        border: '1px solid var(--border-light)',
                      }}
                    />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {preset.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Standard Scientific Palettes */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Scientific & Standard Colormaps
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {COLORMAP_PRESETS.filter((p) => p.category !== 'Siemens NVH').map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setActivePreset(preset.id)}
                    style={{
                      border: `1px solid ${isSelected ? '#0284c7' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: isSelected ? '#0284c7' : 'var(--text-main)' }}>
                        {preset.name}
                      </span>
                      {isSelected && <Check size={12} color="#0284c7" />}
                    </div>
                    <div
                      style={{
                        height: '10px',
                        borderRadius: '3px',
                        background: getColorscaleCssGradient(preset.id, isInverted),
                        border: '1px solid var(--border-light)',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Colors Customization Functions (Discrete Bands, Inversion, Custom Gradients) */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={15} color="#0284c7" /> Colormap Transformation Functions
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Stepped / Discrete Bands Function */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Discrete Amplitude Bands (Simcenter Display Mode):
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { label: 'Continuous', value: 'continuous' },
                    { label: '8 Bands', value: 8 },
                    { label: '16 Bands', value: 16 },
                    { label: '32 Bands', value: 32 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`btn ${bands === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '3px 7px', fontSize: '0.72rem', flex: 1 }}
                      onClick={() => setBands(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invert Colormap Function */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Invert Direction / Polarities:
                </label>
                <button
                  type="button"
                  className={`btn ${isInverted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => setIsInverted(!isInverted)}
                >
                  <ArrowRightLeft size={13} />
                  {isInverted ? 'Inverted (Reversed Colors)' : 'Standard (Low to High)'}
                </button>
              </div>
            </div>

            {/* Custom 4-Color Gradient Function */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  Custom Multi-Stop Color Function:
                </span>
                <button
                  type="button"
                  className={`btn ${activePreset === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.7rem', padding: '2px 8px', height: '24px' }}
                  onClick={() => setActivePreset('custom')}
                >
                  {activePreset === 'custom' ? 'Active' : 'Use Custom Palette'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px' }}>
                    1. Low (Noise):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={customColors.low}
                      onChange={(e) => {
                        setCustomColors({ ...customColors, low: e.target.value });
                        setActivePreset('custom');
                      }}
                      style={{ width: '28px', height: '26px', border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      {customColors.low}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px' }}>
                    2. Mid (Transition):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={customColors.mid}
                      onChange={(e) => {
                        setCustomColors({ ...customColors, mid: e.target.value });
                        setActivePreset('custom');
                      }}
                      style={{ width: '28px', height: '26px', border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      {customColors.mid}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px' }}>
                    3. High (Resonance):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={customColors.high}
                      onChange={(e) => {
                        setCustomColors({ ...customColors, high: e.target.value });
                        setActivePreset('custom');
                      }}
                      style={{ width: '28px', height: '26px', border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      {customColors.high}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '3px' }}>
                    4. Peak (Saturation):
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="color"
                      value={customColors.peak}
                      onChange={(e) => {
                        setCustomColors({ ...customColors, peak: e.target.value });
                        setActivePreset('custom');
                      }}
                      style={{ width: '28px', height: '26px', border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      {customColors.peak}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetSimcenter}
            style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={13} /> Reset to Simcenter Default
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApply}
              style={{
                fontSize: '0.8rem',
                padding: '6px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                boxShadow: '0 0 12px rgba(2, 132, 199, 0.35)',
              }}
            >
              <Check size={15} /> Apply Colors Function
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
