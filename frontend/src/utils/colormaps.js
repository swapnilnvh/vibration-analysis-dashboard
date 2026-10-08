// Siemens Simcenter Testlab & NVH Engineering Colormaps and Color Functions

/**
 * 1. Simcenter Testlab Classic (Siemens / LMS Test.Lab NVH Spectrum):
 * Deep Navy (noise floor) -> Royal Blue -> Azure -> Cyan -> Spring Green -> Yellow -> Orange -> Crimson -> Magenta -> Peak White.
 * This is the signature colormap used in automotive and aerospace NVH laboratories worldwide.
 */
export const SIMCENTER_TESTLAB = [
  [0.0, '#02004a'],
  [0.10, '#001bb0'],
  [0.22, '#0066ee'],
  [0.35, '#00d5d5'],
  [0.48, '#00cc33'],
  [0.62, '#e6de00'],
  [0.75, '#ff7700'],
  [0.86, '#ee1100'],
  [0.94, '#e60099'],
  [1.0, '#ffffff'],
];

/**
 * 2. Simcenter Modern (Siemens Corporate Petrol NVH Theme):
 * Dark Petrol -> Siemens Deep Petrol -> Petrol Cyan -> Mint Teal -> Lime -> Amber -> Flame Red -> White Peak
 */
export const SIMCENTER_MODERN = [
  [0.0, '#001824'],
  [0.12, '#003e4d'],
  [0.28, '#007585'],
  [0.45, '#00a396'],
  [0.60, '#70bd17'],
  [0.74, '#eab308'],
  [0.88, '#ea580c'],
  [0.96, '#dc2626'],
  [1.0, '#ffffff'],
];

/**
 * 3. Simcenter High-Contrast Thermal:
 * Navy -> Purple -> Crimson -> Orange -> Gold -> White
 */
export const SIMCENTER_THERMAL = [
  [0.0, '#000033'],
  [0.15, '#2b0059'],
  [0.35, '#78007a'],
  [0.55, '#c91f42'],
  [0.75, '#f07513'],
  [0.90, '#fac62d'],
  [1.0, '#ffffff'],
];

/**
 * Preset Colormap Definitions
 */
export const COLORMAP_PRESETS = [
  {
    id: 'simcenter',
    name: 'Simcenter Testlab',
    category: 'Siemens NVH',
    description: 'Iconic Siemens Simcenter / LMS Test.Lab NVH rainbow spectrum',
    scale: SIMCENTER_TESTLAB,
    isCustomScale: true,
  },
  {
    id: 'simcenter-modern',
    name: 'Simcenter Modern',
    category: 'Siemens NVH',
    description: 'Modern Siemens petrol teal to amber/crimson corporate theme',
    scale: SIMCENTER_MODERN,
    isCustomScale: true,
  },
  {
    id: 'simcenter-thermal',
    name: 'Simcenter Thermal',
    category: 'Siemens NVH',
    description: 'High-contrast thermal gradient for resonance hotspot detection',
    scale: SIMCENTER_THERMAL,
    isCustomScale: true,
  },
  {
    id: 'Viridis',
    name: 'Viridis',
    category: 'Scientific',
    description: 'Perceptually uniform sequential scale (Plotly standard)',
    scale: 'Viridis',
    isCustomScale: false,
    previewColors: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'],
  },
  {
    id: 'Jet',
    name: 'Jet',
    category: 'Classic',
    description: 'Classic rainbow spectrum (Blue -> Cyan -> Yellow -> Red)',
    scale: 'Jet',
    isCustomScale: false,
    previewColors: ['#00007f', '#007fff', '#7fff7f', '#ff7f00', '#7f0000'],
  },
  {
    id: 'Turbo',
    name: 'Turbo',
    category: 'Scientific',
    description: 'Smooth, improved rainbow color map with enhanced linearity',
    scale: 'Turbo',
    isCustomScale: false,
    previewColors: ['#30123b', '#28bbec', '#a2fc3c', '#fb8022', '#7a0403'],
  },
  {
    id: 'Plasma',
    name: 'Plasma',
    category: 'Scientific',
    description: 'Vibrant blue-purple-pink-orange perceptual scale',
    scale: 'Plasma',
    isCustomScale: false,
    previewColors: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636'],
  },
  {
    id: 'Inferno',
    name: 'Inferno',
    category: 'Scientific',
    description: 'Black to yellow-white thermal intensity scale',
    scale: 'Inferno',
    isCustomScale: false,
    previewColors: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a'],
  },
  {
    id: 'Hot',
    name: 'Hot',
    category: 'Thermal',
    description: 'Black -> Red -> Orange -> Yellow -> White',
    scale: 'Hot',
    isCustomScale: false,
    previewColors: ['#000000', '#e60000', '#ff9900', '#ffff00', '#ffffff'],
  },
  {
    id: 'Coolwarm',
    name: 'Coolwarm',
    category: 'Diverging',
    description: 'Symmetric cool blue to warm red gradient',
    scale: 'Picnic',
    isCustomScale: false,
    previewColors: ['#0000ff', '#88bbff', '#ffffff', '#ff8888', '#ff0000'],
  },
  {
    id: 'Greys',
    name: 'Grayscale',
    category: 'Monochrome',
    description: 'Black and white monochrome for print reproduction',
    scale: 'Greys',
    isCustomScale: false,
    previewColors: ['#ffffff', '#cccccc', '#888888', '#444444', '#000000'],
  },
];

/**
 * Convert hex color to [r, g, b]
 */
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Convert [r, g, b] to hex string
 */
function rgbToHex([r, g, b]) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Interpolate between two RGB colors
 */
function lerpRgb(rgb1, rgb2, t) {
  return [
    rgb1[0] + (rgb2[0] - rgb1[0]) * t,
    rgb1[1] + (rgb2[1] - rgb1[1]) * t,
    rgb1[2] + (rgb2[2] - rgb1[2]) * t,
  ];
}

/**
 * Interpolate color at normalized value t (0..1) along a colorscale
 */
export function sampleColorscale(scaleArray, t) {
  const clampedT = Math.max(0, Math.min(1, t));
  if (clampedT <= scaleArray[0][0]) return scaleArray[0][1];
  if (clampedT >= scaleArray[scaleArray.length - 1][0]) {
    return scaleArray[scaleArray.length - 1][1];
  }

  for (let i = 0; i < scaleArray.length - 1; i++) {
    const [t0, c0] = scaleArray[i];
    const [t1, c1] = scaleArray[i + 1];
    if (clampedT >= t0 && clampedT <= t1) {
      const segT = (clampedT - t0) / (t1 - t0 || 1);
      const rgb0 = hexToRgb(c0);
      const rgb1 = hexToRgb(c1);
      return rgbToHex(lerpRgb(rgb0, rgb1, segT));
    }
  }
  return scaleArray[scaleArray.length - 1][1];
}

/**
 * Build a custom colorscale from 3 or 4 user-selected colors
 */
export function buildCustomGradient(lowColor, midColor, highColor, peakColor = '#ffffff') {
  return [
    [0.0, lowColor],
    [0.35, midColor],
    [0.75, highColor],
    [1.0, peakColor],
  ];
}

/**
 * Quantize / step a continuous colorscale into discrete bands (e.g. 8, 16, 32 bands)
 * A classic Siemens Simcenter Testlab display feature for discrete dB band inspection.
 */
export function quantizeColorscale(scaleArray, numBands = 16) {
  if (numBands <= 0 || !Array.isArray(scaleArray)) return scaleArray;

  const result = [];
  const step = 1 / numBands;

  for (let b = 0; b < numBands; b++) {
    const tStart = b * step;
    const tEnd = (b + 1) * step;
    const tMid = tStart + step * 0.5;
    const color = sampleColorscale(scaleArray, tMid);

    result.push([parseFloat(tStart.toFixed(4)), color]);
    result.push([parseFloat(tEnd.toFixed(4)), color]);
  }

  return result;
}

/**
 * Invert a colorscale array
 */
export function invertColorscale(scaleArray) {
  if (!Array.isArray(scaleArray)) return scaleArray;
  const n = scaleArray.length;
  const inverted = [];
  for (let i = 0; i < n; i++) {
    const t = scaleArray[i][0];
    const origColor = scaleArray[n - 1 - i][1];
    inverted.push([t, origColor]);
  }
  return inverted;
}

/**
 * Resolves the effective Plotly colorscale object or string from user options:
 * - presetId: 'simcenter', 'simcenter-modern', 'Viridis', etc.
 * - isInverted: boolean
 * - bands: 'continuous' | 8 | 16 | 32
 * - customColors: { low, mid, high, peak }
 */
export function resolvePlotlyColorscale({
  presetId = 'simcenter',
  isInverted = false,
  bands = 'continuous',
  customColors = null,
}) {
  let baseScale;

  if (presetId === 'custom' && customColors) {
    baseScale = buildCustomGradient(
      customColors.low || '#02004a',
      customColors.mid || '#00d5d5',
      customColors.high || '#ee1100',
      customColors.peak || '#ffffff'
    );
  } else {
    const found = COLORMAP_PRESETS.find((p) => p.id === presetId);
    if (found && found.isCustomScale) {
      baseScale = found.scale;
    } else if (found && !found.isCustomScale) {
      if (!isInverted && bands === 'continuous') {
        return found.scale; // Plotly native string
      }
      // If we need to invert or quantize a native scale, sample it first
      baseScale = sampleNativeScaleToStops(found.id);
    } else {
      // Default to Simcenter Testlab
      baseScale = SIMCENTER_TESTLAB;
    }
  }

  let finalScale = [...baseScale];

  // Invert if requested
  if (isInverted) {
    finalScale = invertColorscale(finalScale);
  }

  // Quantize if stepped bands requested
  if (bands !== 'continuous' && Number(bands) > 0) {
    finalScale = quantizeColorscale(finalScale, Number(bands));
  }

  return finalScale;
}

/**
 * Sample a native Plotly scale into stops for transformation
 */
function sampleNativeScaleToStops(name) {
  const map = {
    Viridis: [
      [0.0, '#440154'],
      [0.25, '#3b528b'],
      [0.5, '#21918c'],
      [0.75, '#5ec962'],
      [1.0, '#fde725'],
    ],
    Jet: [
      [0.0, '#000080'],
      [0.25, '#00ffff'],
      [0.5, '#00ff00'],
      [0.75, '#ffff00'],
      [0.9, '#ff0000'],
      [1.0, '#800000'],
    ],
    Hot: [
      [0.0, '#000000'],
      [0.33, '#e60000'],
      [0.66, '#ffff00'],
      [1.0, '#ffffff'],
    ],
  };
  return map[name] || SIMCENTER_TESTLAB;
}

/**
 * Get CSS linear-gradient string for UI preview swatch
 */
export function getColorscaleCssGradient(presetOrScale, isInverted = false) {
  if (typeof presetOrScale === 'string') {
    const preset = COLORMAP_PRESETS.find((p) => p.id === presetOrScale);
    if (preset) {
      if (preset.isCustomScale) {
        return stopsToCssGradient(preset.scale, isInverted);
      }
      if (preset.previewColors) {
        const colors = isInverted ? [...preset.previewColors].reverse() : preset.previewColors;
        return `linear-gradient(to right, ${colors.join(', ')})`;
      }
    }
  }

  if (Array.isArray(presetOrScale)) {
    return stopsToCssGradient(presetOrScale, isInverted);
  }

  return stopsToCssGradient(SIMCENTER_TESTLAB, isInverted);
}

function stopsToCssGradient(stops, isInverted = false) {
  if (!Array.isArray(stops)) return 'linear-gradient(to right, #000, #fff)';
  const effectiveStops = isInverted ? invertColorscale(stops) : stops;
  const parts = effectiveStops.map(([pos, color]) => `${color} ${Math.round(pos * 100)}%`);
  return `linear-gradient(to right, ${parts.join(', ')})`;
}
