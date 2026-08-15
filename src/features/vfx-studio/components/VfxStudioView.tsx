import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ExtendedVfxEngine,
  VfxCategory,
  VfxEffectType,
  LensFlareElement,
} from '../../../core/vfx/extendedVfxEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface VfxStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function VfxStudioView({ onBakeKeyframesToEditor }: VfxStudioViewProps) {
  const [selectedEffect, setSelectedEffect] = useState<VfxEffectType>('anamorphic-lens-flare');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightPos, setLightPos] = useState<{ x: number; y: number }>({ x: 140, y: 110 });
  const [intensity, setIntensity] = useState<number>(1.0);
  const [streakColor, setStreakColor] = useState<string>('#38bdf8');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeSec, setTimeSec] = useState<number>(0);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 60FPS Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeSec((t) => (t + 0.02) % 10.0);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Evaluated Lens Flare Elements
  const flareElements: LensFlareElement[] = useMemo(() => {
    return ExtendedVfxEngine.evaluateLensFlare(lightPos.x, lightPos.y, 480, 320, intensity, streakColor);
  }, [lightPos, intensity, streakColor]);

  // Evaluated Glitch Bands
  const glitchBands = useMemo(() => {
    return ExtendedVfxEngine.evaluateGlitchBands(timeSec, 320, intensity);
  }, [timeSec, intensity]);

  // 60FPS Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, 480, 320);

    if (selectedEffect === 'anamorphic-lens-flare') {
      // Draw Flare Elements
      flareElements.forEach((el) => {
        ctx.save();
        ctx.globalAlpha = el.opacity;
        if (el.type === 'horizontal-streak') {
          // Horizontal streak gradient
          const grad = ctx.createLinearGradient(el.x - el.size, el.y, el.x + el.size, el.y);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(0.5, el.color);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(el.x - el.size, el.y - 4, el.size * 2, 8);
        } else {
          // Circular ghost / core
          const radGrad = ctx.createRadialGradient(el.x, el.y, 0, el.x, el.y, el.size);
          radGrad.addColorStop(0, el.color);
          radGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    } else if (selectedEffect === 'digital-glitch-displace') {
      // Draw Glitch Bands
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(80, 60, 320, 200);

      glitchBands.forEach((b) => {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(80 + b.shiftX, b.y, 320, b.height);
      });
    } else if (selectedEffect === 'lightning-electric-arc') {
      // Draw Lightning Arc
      const arc = ExtendedVfxEngine.generateLightningArc(60, 160, 420, 160, 14, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3 * intensity;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      arc.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }
  }, [selectedEffect, flareElements, glitchBands, intensity]);

  // Drag Light Source
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLightPos({ x: Math.round(x), y: Math.round(y) });
  };

  const handleBake = () => {
    const baked = ExtendedVfxEngine.bakeVfxToKeyframes(selectedEffect, 2.0);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `VFX • ${selectedEffect.toUpperCase()}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '290px 1fr 310px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: VFX SUITE PRESETS */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>✨</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            VFX Shaders & Optics
          </span>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['All', 'Optics', 'Glitch', 'Atmospheric'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#38bdf8' : '#11182c',
                color: selectedCategory === cat ? '#040711' : '#94a3b8',
                border: 'none',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* VFX Presets Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'anamorphic-lens-flare', name: 'Anamorphic Lens Flare', desc: 'Core hotspot, horizontal blue streak, and ghosts' },
            { id: 'digital-glitch-displace', name: 'Digital Glitch Displace', desc: 'Horizontal scanline block shift & RGB split' },
            { id: 'lightning-electric-arc', name: 'High-Voltage Lightning', desc: 'Jagged procedural electrical arc discharge' },
            { id: 'heat-wave-distortion', name: 'Heat Wave Shimmer', desc: 'Atmospheric desert mirage normal displacement' },
          ].map((vfx) => {
            const isSel = selectedEffect === vfx.id;
            return (
              <div
                key={vfx.id}
                onClick={() => setSelectedEffect(vfx.id as VfxEffectType)}
                style={{
                  background: isSel ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSel ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: isSel ? '#38bdf8' : '#f8fafc' }}>
                  {vfx.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{vfx.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: INTERACTIVE 60FPS SHADER CANVAS */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Click canvas to reposition light source ({lightPos.x}, {lightPos.y})
            </span>
          </div>

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
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
          </button>
        </div>

        {/* Canvas Area */}
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
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            width={480}
            height={320}
            onClick={handleCanvasClick}
            style={{ borderRadius: 8, cursor: 'crosshair', boxShadow: '0 0 32px rgba(0,0,0,0.8)' }}
          />
        </div>
      </div>

      {/* 3. RIGHT COLUMN: PARAMETRIC CONTROLS */}
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
          Parametric VFX Inspector
        </div>

        {/* Intensity Slider */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Effect Intensity:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{(intensity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Streak Color Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>STREAK TINT:</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#38bdf8', '#ec4899', '#f59e0b', '#10b981', '#ffffff'].map((col) => (
              <div
                key={col}
                onClick={() => setStreakColor(col)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: col,
                  cursor: 'pointer',
                  border: streakColor === col ? '2px solid #ffffff' : '1px solid #334155',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
