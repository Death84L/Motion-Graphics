import React, { useState, useEffect, useMemo } from 'react';
import {
  VectorShapeType,
  SAMPLE_SHAPE_MORPH_PAIRS,
} from '../../../core/shapes/universalVectorSchema';
import { VectorEngine } from '../../../core/shapes/vectorEngine';
import {
  KineticTypographyConfig,
  TypographyAnimationMode,
  SAMPLE_TYPOGRAPHY_PRESETS,
  AnimatedCharacterState,
} from '../../../core/typography/universalTypographySchema';
import { UniversalTypographyEngine } from '../../../core/typography/universalTypographyEngine';
import {
  ExtendedKineticTextEngine,
  ExtendedTypographyStyle,
  KineticTextCharacterState,
} from '../../../core/typography/extendedKineticTextEngine';
import {
  UiMicroInteractionEngine,
  DynamicIslandState,
  ToggleSwitchState,
} from '../../../core/ui/uiMicroInteractionEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface ShapeTypographyStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function ShapeTypographyStudioView({ onBakeKeyframesToEditor }: ShapeTypographyStudioViewProps) {
  const [activeTab, setActiveTab] = useState<'vector' | 'typography' | 'ui-micro'>('typography');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  // --- VECTOR SHAPE STATE ---
  const [shapeTypeA, setShapeTypeA] = useState<VectorShapeType>('circle');
  const [shapeTypeB, setShapeTypeB] = useState<VectorShapeType>('star');
  const [morphRatio, setMorphRatio] = useState<number>(0.5);
  const [trimEnd, setTrimEnd] = useState<number>(1.0);
  const [repeaterCount, setRepeaterCount] = useState<number>(1);
  const [strokeColor, setStrokeColor] = useState<string>('#ec4899');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // --- TYPOGRAPHY STATE ---
  const [text, setText] = useState<string>('MOTION STUDIO');
  const [typoStyle, setTypoStyle] = useState<ExtendedTypographyStyle>('liquid-chrome');
  const [fontSize, setFontSize] = useState<number>(36);

  // --- UI MICRO-INTERACTION STATE ---
  const [toggleState, setToggleState] = useState<boolean>(true);

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

  // Compute Extended Kinetic Typography Character States
  const charStates: KineticTextCharacterState[] = useMemo(() => {
    return ExtendedKineticTextEngine.evaluateExtendedStyle(text, typoStyle, currentTimeSec, fontSize, 0.6);
  }, [text, typoStyle, currentTimeSec, fontSize]);

  // Compute Dynamic Island State
  const dynamicIsland: DynamicIslandState = useMemo(() => {
    const progress = (currentTimeSec % 2.0) / 2.0;
    return UiMicroInteractionEngine.evaluateDynamicIsland(progress);
  }, [currentTimeSec]);

  // 1-Click Bake Action
  const handleBake = () => {
    let baked: KeyframePoint[] = [];
    if (activeTab === 'vector') {
      baked = [
        { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.2, y: 1.0 } },
        { id: 2, time: 100, value: 100, type: 'bezier', handleIn: { x: 0.2, y: 1.0 } },
      ];
    } else {
      baked = ExtendedKineticTextEngine.bakeStyleToKeyframes(text, typoStyle, 2.0, 60);
    }

    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Text/UI Style • ${typoStyle}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '290px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: CONTROLS & STYLE PICKER */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🔤</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Text & UI Studio
          </span>
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

        {/* 8 Extended Kinetic Typography Style Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Kinetic Styles (150 Suggestions)
          </span>
          {[
            { id: 'liquid-chrome', name: 'Liquid Molten Chrome', desc: 'Molten mercury specular wave glints' },
            { id: 'alex-hormozi', name: 'Alex Hormozi Captions', desc: 'Punchy high-contrast yellow keyword pop' },
            { id: 'mrbeast-comic', name: 'MrBeast Comic Stroke', desc: 'Bold tilted comic text with heavy drop shadow' },
            { id: 'split-flap', name: 'Split-Flap Airport Board', desc: 'Mechanical cascading flip board' },
            { id: 'cyberpunk-neon', name: 'Cyberpunk Neon Tube', desc: 'Electrical arc ignition and buzzing glow' },
            { id: 'origami-fold', name: 'Origami 3D Paper Fold', desc: 'Geometric angular paper folding rotations' },
            { id: 'ascii-terminal', name: 'ASCII Matrix Terminal', desc: 'Retro green command line monospace' },
            { id: 'chalkboard', name: 'Textured Chalkboard', desc: 'Dusty chalkboard writing' },
          ].map((st) => {
            const isSel = typoStyle === st.id;
            return (
              <div
                key={st.id}
                onClick={() => setTypoStyle(st.id as ExtendedTypographyStyle)}
                style={{
                  background: isSel ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSel ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: isSel ? '#38bdf8' : '#f8fafc' }}>
                  {st.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{st.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: LIVE SIMULATION STAGE */}
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
        {/* Top Tab Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {(['typography', 'ui-micro', 'vector'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#38bdf8' : '#1e293b',
                  color: activeTab === tab ? '#080d1a' : '#94a3b8',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

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

        {/* Live Stage Viewport */}
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
          {activeTab === 'typography' && (
            /* Kinetic Typography Stage */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2, padding: 16 }}>
              {charStates.map((cs) => (
                <span
                  key={cs.index}
                  style={{
                    display: 'inline-block',
                    fontSize: fontSize,
                    fontFamily: typoStyle === 'ascii-terminal' ? 'monospace' : 'system-ui, sans-serif',
                    fontWeight: cs.fontWeight,
                    color: cs.color,
                    backgroundColor: cs.backgroundColor,
                    padding: cs.backgroundColor ? '2px 4px' : undefined,
                    borderRadius: cs.backgroundColor ? '4px' : undefined,
                    transform: `translateY(${cs.y}px) scale(${cs.scale}) rotate(${cs.rotationDeg}deg)`,
                    opacity: cs.opacity,
                    boxShadow: cs.shadow,
                    filter: cs.filter,
                    textShadow: cs.shadow,
                    WebkitTextStroke: cs.strokeWidth ? `${cs.strokeWidth}px ${cs.strokeColor}` : undefined,
                    transition: 'transform 0.05s ease, opacity 0.05s ease',
                  }}
                >
                  {cs.displayChar === ' ' ? '\u00A0' : cs.displayChar}
                </span>
              ))}
            </div>
          )}

          {activeTab === 'ui-micro' && (
            /* UI Micro-Interactions Stage (Dynamic Island & Neumorphism) */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              {/* Dynamic Island */}
              <div
                style={{
                  width: `${dynamicIsland.width}px`,
                  height: `${dynamicIsland.height}px`,
                  borderRadius: `${dynamicIsland.borderRadius}px`,
                  background: '#000000',
                  border: '1px solid #27272a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                  transition: 'all 0.05s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 10, fontWeight: 700 }}>Recording</span>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#38bdf8' }}>02:45</span>
              </div>

              {/* Neumorphic Interactive Card */}
              <div
                style={{
                  background: '#090e1a',
                  borderRadius: 16,
                  padding: '16px 24px',
                  boxShadow: UiMicroInteractionEngine.getNeumorphicShadow(8, false),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc' }}>
                  Neumorphic Button:
                </span>
                <button
                  onClick={() => setToggleState((t) => !t)}
                  style={{
                    background: '#090e1a',
                    border: 'none',
                    borderRadius: 20,
                    padding: '8px 16px',
                    color: toggleState ? '#38bdf8' : '#64748b',
                    fontWeight: 800,
                    fontSize: 10,
                    cursor: 'pointer',
                    boxShadow: UiMicroInteractionEngine.getNeumorphicShadow(4, toggleState),
                  }}
                >
                  {toggleState ? '● ACTIVE' : '○ INACTIVE'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'vector' && (
            /* Vector Morphing Stage */
            <svg width="320" height="320" viewBox="-160 -160 320 320" style={{ overflow: 'visible' }}>
              <path
                d={vectorSvgPath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 12px ${strokeColor}88)` }}
              />
            </svg>
          )}
        </div>
      </div>

      {/* 3. RIGHT COLUMN: RESPONSIVE TYPOGRAPHY & DESIGN TOKENS */}
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
          Design Tokens & Fluid Math
        </div>

        {/* Font Size Slider */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Font Size:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{fontSize}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="64"
            step="2"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Fluid CSS clamp() Math Readout */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Fluid clamp() Token
          </span>
          <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#10b981', wordBreak: 'break-all' }}>
            {UiMicroInteractionEngine.calculateFluidFontSize(20, fontSize)}
          </div>
        </div>

        {/* 8px Spacing Scale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            8px Grid Spacing Tokens
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {['4px (xs)', '8px (sm)', '16px (md)', '24px (lg)', '32px (xl)', '48px (2xl)'].map((sp) => (
              <div
                key={sp}
                style={{
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  padding: '4px 6px',
                  borderRadius: 4,
                  fontSize: 9,
                  color: '#f8fafc',
                  fontFamily: 'monospace',
                }}
              >
                {sp}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
