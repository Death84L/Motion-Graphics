import React, { useState, useEffect, useMemo } from 'react';
import { ChartType, DataPoint, SAMPLE_CHART_DATA } from '../../../core/charts/chartSchema';
import { InfographicsEngine } from '../../../core/charts/infographicsEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface InfographicsStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function InfographicsStudioView({ onBakeKeyframesToEditor }: InfographicsStudioViewProps) {
  const [chartType, setChartType] = useState<ChartType>('racing-bar');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(SAMPLE_CHART_DATA);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  // 60FPS Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => (p + 0.015) % 1.0);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const evaluatedBars = useMemo(() => {
    return InfographicsEngine.evaluateBars(dataPoints, progress, true);
  }, [dataPoints, progress]);

  const lineSvgPath = useMemo(() => {
    return InfographicsEngine.generateLinePath(dataPoints, 400, 200, progress);
  }, [dataPoints, progress]);

  const handleBake = () => {
    const baked = InfographicsEngine.bakeInfographicToKeyframes(dataPoints, 2.0);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Infographics • ${chartType.toUpperCase()}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: DATASET & CHART TYPE */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>📊</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Data-Driven Infographics
          </span>
        </div>

        {/* Chart Type Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>CHART FORMAT:</span>
          {(['racing-bar', 'line-graph', 'donut-pie', 'counter-odometer'] as ChartType[]).map((ct) => (
            <button
              key={ct}
              onClick={() => setChartType(ct)}
              style={{
                background: chartType === ct ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
                border: `1px solid ${chartType === ct ? '#38bdf8' : '#1e293b'}`,
                color: chartType === ct ? '#38bdf8' : '#94a3b8',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {ct.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Data Points List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Dataset Series ({dataPoints.length} Items)
          </span>
          {dataPoints.map((dp, idx) => (
            <div
              key={idx}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: dp.color }} />
                <span style={{ fontSize: 10, color: '#f8fafc', fontWeight: 600 }}>{dp.label}</span>
              </div>
              <input
                type="number"
                value={dp.value}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setDataPoints((prev) => prev.map((p, i) => (i === idx ? { ...p, value: val } : p)));
                }}
                style={{
                  width: 50,
                  background: '#090e1a',
                  border: '1px solid #1e293b',
                  color: '#38bdf8',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 4px',
                  borderRadius: 4,
                  textAlign: 'right',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER COLUMN: LIVE CANVAS PREVIEW */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        {/* Top Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              background: isPlaying ? '#ef4444' : '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={handleBake}
            style={{
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
          </button>
        </div>

        {/* Live Canvas Area */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '360px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          {chartType === 'racing-bar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 460 }}>
              {evaluatedBars.map((b) => (
                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700 }}>
                    <span>{b.label}</span>
                    <span style={{ color: b.color }}>{b.currentValue.toFixed(0)}%</span>
                  </div>
                  <div style={{ background: '#11182c', height: 16, borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${b.widthPercent}%`,
                        height: '100%',
                        background: b.color,
                        borderRadius: 4,
                        boxShadow: `0 0 10px ${b.color}66`,
                        transition: 'width 0.05s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {chartType === 'line-graph' && (
            <svg width="400" height="200" style={{ overflow: 'visible' }}>
              <path
                d={lineSvgPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 12px #38bdf888)' }}
              />
            </svg>
          )}

          {(chartType === 'donut-pie' || chartType === 'counter-odometer') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                ${(progress * 1420500).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Dynamic Odometer Ticker</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT COLUMN: EXPORT CONFIG */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          Infographic Properties
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          Infographic datasets animate smoothly using zero-cost local calculus formulas and can be baked into Premiere Pro, After Effects, or DaVinci Resolve.
        </div>
      </div>
    </div>
  );
}
