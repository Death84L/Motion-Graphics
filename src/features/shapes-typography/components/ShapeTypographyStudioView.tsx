import React, { useState, useEffect, useMemo } from 'react';
import {
  VectorShapeType,
  UniversalVectorShape,
  SAMPLE_SHAPE_MORPH_PAIRS,
  ShapeMorphPair,
} from '../../../core/shapes/universalVectorSchema';
import { VectorEngine } from '../../../core/shapes/vectorEngine';
import {
  KineticTypographyConfig,
  TypographyAnimationMode,
  SAMPLE_TYPOGRAPHY_PRESETS,
  AnimatedCharacterState,
} from '../../../core/typography/universalTypographySchema';
import { UniversalTypographyEngine } from '../../../core/typography/universalTypographyEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface ShapeTypographyStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function ShapeTypographyStudioView({ onBakeKeyframesToEditor }: ShapeTypographyStudioViewProps) {
  const [activeTab, setActiveTab] = useState<'vector' | 'typography'>('vector');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  // --- VECTOR SHAPE STATE ---
  const [shapeTypeA, setShapeTypeA] = useState<VectorShapeType>('circle');
  const [shapeTypeB, setShapeTypeB] = useState<VectorShapeType>('star');
  const [morphRatio, setMorphRatio] = useState<number>(0.5);
  const [trimEnd, setTrimEnd] = useState<number>(1.0);
  const [repeaterCount, setRepeaterCount] = useState<number>(1);
  const [fillColor, setFillColor] = useState<string>('#38bdf8');
  const [strokeColor, setStrokeColor] = useState<string>('#ec4899');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // --- TYPOGRAPHY STATE ---
  const [text, setText] = useState<string>('MOTION STUDIO');
  const [typoMode, setTypoMode] = useState<TypographyAnimationMode>('scramble-matrix');
  const [staggerMs, setStaggerMs] = useState<number>(45);
  const [fontSize, setFontSize] = useState<number>(32);
  const [letterSpacing, setLetterSpacing] = useState<number>(4);

  // 60FPS Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => (prev + 0.016) % 2.5);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute Morphed Vector Path
  const vectorSvgPath = useMemo(() => {
    const points = VectorEngine.morphShapes(shapeTypeA, shapeTypeB, morphRatio, 160, 160, 48);
    return VectorEngine.pointsToSvgPath(points, true);
  }, [shapeTypeA, shapeTypeB, morphRatio]);

  // Compute Kinetic Typography Character States
  const typoConfig: KineticTypographyConfig = useMemo(() => {
    return {
      text,
      fontSize,
      letterSpacingPx: letterSpacing,
      lineHeightPx: fontSize * 1.2,
      animationMode: typoMode,
      progress: (currentTimeSec % 2.0) / 2.0,
      staggerMs,
      durationMs: 1200,
      fillColor: '#f8fafc',
      glowColor: '#38bdf8',
    };
  }, [text, fontSize, letterSpacing, typoMode, staggerMs, currentTimeSec]);

  const charStates: AnimatedCharacterState[] = useMemo(() => {
    return UniversalTypographyEngine.evaluateTypography(typoConfig, currentTimeSec);
  }, [typoConfig, currentTimeSec]);

  // 1-Click Bake Action
  const handleBake = () => {
    let baked: KeyframePoint[] = [];
    if (activeTab === 'vector') {
      baked = [
        { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.2, y: 1.0 } },
        { id: 2, time: 100, value: 100, type: 'bezier', handleIn: { x: 0.2, y: 1.0 } },
      ];
    } else {
      baked = UniversalTypographyEngine.bakeTypographyToKeyframes(typoConfig, 2.0, 60);
    }

    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, activeTab === 'vector' ? 'Vector Shape Morph' : `Kinetic Type • ${typoMode}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: VECTOR & SHAPE CONTROLS */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🎨</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Vector & Shape Engine
          </span>
        </div>

        {/* Morph Shape Selectors */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>SHAPE A:</span>
            <select
              value={shapeTypeA}
              onChange={(e) => setShapeTypeA(e.target.value as VectorShapeType)}
              style={{ background: '#090e1a', border: '1px solid #334155', color: '#38bdf8', fontSize: 9, borderRadius: 4, padding: '2px 4px' }}
            >
              <option value="circle">Circle</option>
              <option value="star">5-Point Star</option>
              <option value="polygon">Hexagon</option>
              <option value="heart">Heart</option>
              <option value="diamond">Diamond</option>
              <option value="rounded-rect">Rounded Rect</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>SHAPE B:</span>
            <select
              value={shapeTypeB}
              onChange={(e) => setShapeTypeB(e.target.value as VectorShapeType)}
              style={{ background: '#090e1a', border: '1px solid #334155', color: '#ec4899', fontSize: 9, borderRadius: 4, padding: '2px 4px' }}
            >
              <option value="star">5-Point Star</option>
              <option value="circle">Circle</option>
              <option value="polygon">Hexagon</option>
              <option value="heart">Heart</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>

          {/* Morph Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#cbd5e1' }}>
              <span>Shape Morph:</span>
              <span style={{ color: '#38bdf8', fontWeight: 800 }}>{(morphRatio * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={morphRatio}
              onChange={(e) => setMorphRatio(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>
        </div>

        {/* Trim Path Write-On */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#cbd5e1' }}>
            <span>Trim Path (Write-On):</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{(trimEnd * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={trimEnd}
            onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        {/* Radial Repeater */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#cbd5e1' }}>
            <span>Radial Repeater:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>{repeaterCount} copies</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={repeaterCount}
            onChange={(e) => setRepeaterCount(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>
      </div>

      {/* 2. CENTER COLUMN: LIVE VECTOR & TYPOGRAPHY STAGE */}
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
        {/* Top Action & Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setActiveTab('vector')}
              style={{
                background: activeTab === 'vector' ? '#38bdf8' : '#1e293b',
                color: activeTab === 'vector' ? '#080d1a' : '#94a3b8',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🎨 Vector Shapes
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              style={{
                background: activeTab === 'typography' ? '#ec4899' : '#1e293b',
                color: activeTab === 'typography' ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔤 Kinetic Typography
            </button>
          </div>

          {/* 1-Click Bake Action */}
          <button
            onClick={handleBake}
            style={{
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #ec4899)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
          </button>
        </div>

        {/* Live Simulation Viewport */}
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
          {activeTab === 'vector' ? (
            /* SVG Vector Canvas */
            <svg width="340" height="340" viewBox="-170 -170 340 340" style={{ overflow: 'visible' }}>
              {Array.from({ length: repeaterCount }).map((_, rIdx) => {
                const angle = (rIdx / repeaterCount) * 360;
                const scale = 1.0 - rIdx * 0.08;
                return (
                  <path
                    key={rIdx}
                    d={vectorSvgPath}
                    transform={`rotate(${angle}) scale(${scale})`}
                    fill="none"
                    stroke={rIdx === 0 ? strokeColor : '#38bdf8'}
                    strokeWidth={strokeWidth}
                    strokeDasharray="500"
                    strokeDashoffset={500 * (1 - trimEnd)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${strokeColor}88)`,
                      transition: 'all 0.1s ease',
                    }}
                  />
                );
              })}
            </svg>
          ) : (
            /* Kinetic Typography Canvas */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' }}>
              {charStates.map((cs) => (
                <span
                  key={cs.charIndex}
                  style={{
                    display: 'inline-block',
                    fontSize: fontSize,
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    color: cs.color,
                    transform: `translateY(${cs.y}px) scale(${cs.scale}) rotate(${cs.rotationDeg}deg)`,
                    opacity: cs.opacity,
                    filter: `blur(${cs.blurPx}px) drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))`,
                    marginRight: `${letterSpacing}px`,
                    transition: 'transform 0.05s ease, opacity 0.05s ease',
                  }}
                >
                  {cs.displayChar === ' ' ? '\u00A0' : cs.displayChar}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT COLUMN: KINETIC TYPOGRAPHY INSPECTOR */}
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
          Kinetic Typography Studio
        </div>

        {/* Text Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>ANIMATED TEXT:</span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: '#f8fafc',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 800,
            }}
          />
        </div>

        {/* Animation Mode Preset Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Typography Presets
          </span>
          {SAMPLE_TYPOGRAPHY_PRESETS.map((preset) => {
            const isSelected = typoMode === preset.mode;
            return (
              <div
                key={preset.id}
                onClick={() => setTypoMode(preset.mode)}
                style={{
                  background: isSelected ? 'rgba(236, 72, 153, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#ec4899' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: isSelected ? '#ec4899' : '#f8fafc' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{preset.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Stagger & Timing Controls */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#cbd5e1' }}>
            <span>Character Stagger:</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{staggerMs}ms</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={staggerMs}
            onChange={(e) => setStaggerMs(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>
      </div>
    </div>
  );
}
