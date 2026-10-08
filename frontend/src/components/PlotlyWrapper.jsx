import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

export default function PlotlyWrapper({
  data = [],
  layout = {},
  config = {},
  style = { width: '100%', height: '420px' },
  chartId = 'plotly-chart',
  theme = null,
  onPlotLoaded = null,
}) {
  const containerRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (theme) return theme;
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  // Watch for theme changes on documentElement
  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
      return;
    }

    const observer = new MutationObserver(() => {
      const active = document.documentElement.getAttribute('data-theme') || 'dark';
      setCurrentTheme(active);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    if (!containerRef.current) return;

    const isLight = currentTheme === 'light';

    // Engineering palette calibrated for contrast
    const textColor = isLight ? '#0f172a' : '#f8fafc';
    const labelColor = isLight ? '#334155' : '#94a3b8';
    const gridColor = isLight ? '#e2e8f0' : '#1e293b';
    const zerolineColor = isLight ? '#cbd5e1' : '#334155';

    // Themed base layout
    const baseLayout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        family: "'JetBrains Mono', 'Inter', monospace",
        color: labelColor,
        size: 11,
      },
      margin: { l: 65, r: 35, t: 40, b: 50 },
      autosize: true,
      hovermode: 'closest',
      ...layout,
      // Apply theme overrides to axes & titles
      title: layout.title
        ? {
            ...layout.title,
            font: {
              color: textColor,
              size: layout.title?.font?.size || 14,
            },
          }
        : undefined,
      xaxis: layout.xaxis
        ? {
            ...layout.xaxis,
            gridcolor: gridColor,
            zerolinecolor: zerolineColor,
            tickfont: { color: labelColor },
            title: layout.xaxis.title
              ? {
                  ...layout.xaxis.title,
                  font: { color: labelColor, size: 12 },
                }
              : undefined,
          }
        : undefined,
      yaxis: layout.yaxis
        ? {
            ...layout.yaxis,
            gridcolor: gridColor,
            zerolinecolor: zerolineColor,
            tickfont: { color: labelColor },
            title: layout.yaxis.title
              ? {
                  ...layout.yaxis.title,
                  font: { color: labelColor, size: 12 },
                }
              : undefined,
          }
        : undefined,
      legend: layout.legend
        ? {
            ...layout.legend,
            font: { color: textColor, size: 11 },
          }
        : undefined,
      hoverlabel: {
        bgcolor: isLight ? '#0f172a' : '#1e293b',
        bordercolor: isLight ? '#334155' : '#475569',
        font: { color: '#ffffff', family: "'JetBrains Mono', monospace" },
      },
    };

    // Themed traces (adapt colorbars and line accents for maximum contrast)
    const themedData = (data || []).map((trace) => {
      const cloned = { ...trace };

      // In heatmaps, update colorbar fonts
      if (cloned.type === 'heatmap' && cloned.colorbar) {
        cloned.colorbar = {
          ...cloned.colorbar,
          title: {
            ...cloned.colorbar.title,
            font: { color: labelColor, size: 11 },
          },
          tickfont: { color: labelColor, size: 10 },
        };
      }

      // In scatter line traces, adapt light-mode colors if needed
      if (isLight && cloned.line?.color) {
        let col = cloned.line.color;
        if (col === '#06b6d4') col = '#0284c7'; // Sky 600
        else if (col === '#f59e0b') col = '#d97706'; // Amber 600
        else if (col === '#10b981') col = '#059669'; // Emerald 600
        cloned.line = { ...cloned.line, color: col };
      }

      return cloned;
    });

    const baseConfig = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: `${chartId}_export`,
        height: 600,
        width: 1000,
        scale: 2,
      },
      ...config,
    };

    Plotly.react(containerRef.current, themedData, baseLayout, baseConfig);

    if (onPlotLoaded) {
      onPlotLoaded(containerRef.current);
    }

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, layout, config, chartId, currentTheme]);

  return <div id={chartId} ref={containerRef} style={style} />;
}
