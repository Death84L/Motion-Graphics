import React, { useState, useMemo } from 'react';
import {
  DeviceBreakpointId,
  DEVICE_PROFILES,
  DeviceProfile,
  AdaptationLevel,
  SemanticMotionIntent,
} from '../../../core/responsive/responsiveMotionSchema';
import {
  ResponsiveMotionLabEngine,
  ResponsiveEvaluationResult,
} from '../../../core/responsive/responsiveMotionLabEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface ResponsiveMotionLabViewProps {
  currentKeyframes?: KeyframePoint[];
}

export function ResponsiveMotionLabView({ currentKeyframes = [] }: ResponsiveMotionLabViewProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceBreakpointId>('mobile-portrait');
  const [viewportWidth, setViewportWidth] = useState<number>(390);
  const [viewportHeight, setViewportHeight] = useState<number>(844);
  const [adaptationLevel, setAdaptationLevel] = useState<AdaptationLevel>('level5-semantic');
  const [showSafeArea, setShowSafeArea] = useState<boolean>(true);
  const [activeCodeTab, setActiveCodeTab] = useState<'css' | 'framer' | 'gsap'>('css');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [multiDeviceView, setMultiDeviceView] = useState<boolean>(false);

  const profile: DeviceProfile = useMemo(() => {
    return DEVICE_PROFILES[selectedDevice] || DEVICE_PROFILES['desktop-hd'];
  }, [selectedDevice]);

  // Handle device switch
  const handleSelectDevice = (devId: DeviceBreakpointId) => {
    setSelectedDevice(devId);
    const dev = DEVICE_PROFILES[devId];
    if (dev) {
      setViewportWidth(dev.width > 1200 ? 640 : dev.width); // Scale down desktop preview to fit UI
      setViewportHeight(dev.height > 1000 ? 400 : dev.height);
    }
  };

  // Evaluate Responsive Motion
  const evaluation: ResponsiveEvaluationResult = useMemo(() => {
    return ResponsiveMotionLabEngine.evaluateResponsiveMotion(
      viewportWidth,
      viewportHeight,
      400, // base Position X
      120, // base Position Y
      1.0, // base Scale
      800, // base Duration
      adaptationLevel,
      { mode: 'dock-edge-right', edgeMarginPx: 24 },
      profile
    );
  }, [viewportWidth, viewportHeight, adaptationLevel, profile]);

  const generatedCss = useMemo(() => {
    return ResponsiveMotionLabEngine.generateResponsiveCss(currentKeyframes);
  }, [currentKeyframes]);

  const generatedFramer = useMemo(() => {
    return ResponsiveMotionLabEngine.generateFramerMotionCode();
  }, []);

  const handleCopyCode = () => {
    const textToCopy = activeCodeTab === 'css' ? generatedCss : generatedFramer;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: DEVICE MATRIX & 5-LEVEL ADAPTATION */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🎯</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Responsive Motion Lab
          </span>
        </div>

        {/* 5-Level Adaptive Motion Hierarchy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Adaptation Intelligence Level
          </span>
          {[
            { id: 'level5-semantic', name: 'Level 5 — Semantic Intent', desc: 'Perceptual kinetic intent & safe docking' },
            { id: 'level4-constraint', name: 'Level 4 — Constraint Dock', desc: 'Edge margins & dynamic clamping' },
            { id: 'level3-relative', name: 'Level 3 — Relative (vw/vh)', desc: 'Direct proportional percentage scaling' },
            { id: 'level2-fluid', name: 'Level 2 — Fluid Smoothstep', desc: 'Continuous mathematical lerp scaling' },
            { id: 'level1-fixed', name: 'Level 1 — Fixed Breakpoint', desc: 'Static breakpoint override steps' },
          ].map((lvl) => {
            const isSelected = adaptationLevel === lvl.id;
            return (
              <div
                key={lvl.id}
                onClick={() => setAdaptationLevel(lvl.id as AdaptationLevel)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                  {lvl.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8' }}>{lvl.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Device Breakpoint Profiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Device & Aspect Profiles
          </span>
          {Object.values(DEVICE_PROFILES).map((dev) => {
            const isSelected = selectedDevice === dev.id;
            return (
              <div
                key={dev.id}
                onClick={() => handleSelectDevice(dev.id)}
                style={{
                  background: isSelected ? 'rgba(236, 72, 153, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#ec4899' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{dev.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{dev.name}</div>
                    <div style={{ fontSize: 8, color: '#64748b' }}>
                      {dev.width}×{dev.height} ({dev.aspectRatio})
                    </div>
                  </div>
                </div>
                {dev.safeArea.hasNotch && <span style={{ fontSize: 8, color: '#ec4899', fontWeight: 800 }}>NOTCH</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: SIMULTANEOUS MULTI-DEVICE VIEWPORT STAGE */}
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
        {/* Top Controls: Interactive Slider & Notch Toggles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>VIEWPORT WIDTH:</span>
            <input
              type="range"
              min="320"
              max="1440"
              value={viewportWidth}
              onChange={(e) => setViewportWidth(parseInt(e.target.value))}
              style={{ width: '140px', accentColor: '#38bdf8' }}
            />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 800 }}>
              {viewportWidth}px
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showSafeArea}
                onChange={(e) => setShowSafeArea(e.target.checked)}
                style={{ accentColor: '#ec4899' }}
              />
              <span>Show Safe-Area</span>
            </label>

            <button
              onClick={() => setMultiDeviceView((m) => !m)}
              style={{
                background: multiDeviceView ? '#38bdf8' : '#11182c',
                color: multiDeviceView ? '#080d1a' : '#94a3b8',
                border: '1px solid #1e293b',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {multiDeviceView ? 'Single Frame' : '3-Device Matrix'}
            </button>
          </div>
        </div>

        {/* Live Device Stage Viewport */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '380px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
          }}
        >
          {/* Simulated Device Frame */}
          <div
            style={{
              width: `${Math.min(520, viewportWidth)}px`,
              height: '340px',
              background: '#090e1a',
              border: '2px solid #334155',
              borderRadius: 24,
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
              overflow: 'hidden',
              transition: 'width 0.1s ease',
            }}
          >
            {/* Dynamic Island / Notch Overlay */}
            {showSafeArea && profile.safeArea.hasNotch && (
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90px',
                  height: '24px',
                  background: '#000000',
                  borderRadius: 12,
                  zIndex: 20,
                  border: '1px solid #1e293b',
                }}
              />
            )}

            {/* Home Indicator Bar */}
            {showSafeArea && profile.safeArea.hasNotch && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '110px',
                  height: '4px',
                  background: '#64748b',
                  borderRadius: 2,
                  zIndex: 20,
                }}
              />
            )}

            {/* Simulated Animated Responsive Card */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.max(10, Math.min(viewportWidth - 160, evaluation.adaptedPositionX * (Math.min(520, viewportWidth) / viewportWidth)))}px`,
                top: `${evaluation.adaptedPositionY}px`,
                transform: `scale(${evaluation.adaptedScale})`,
                transformOrigin: 'top left',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.2))',
                border: `1.5px solid ${evaluation.isInsideSafeArea ? '#38bdf8' : '#ef4444'}`,
                borderRadius: 10,
                padding: '10px 14px',
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(56, 189, 248, 0.25)',
                transition: `all ${evaluation.adaptedDurationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
            >
              <span style={{ fontSize: 16 }}>⚡</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800 }}>Responsive Hero Element</div>
                <div style={{ fontSize: 8, color: '#94a3b8' }}>
                  {evaluation.adaptedDurationMs}ms • {evaluation.adaptedScale}x Scale
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: RESPONSIVE INSPECTOR & CODE EXPORT */}
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
          Adaptive Kinetic Inspector
        </div>

        {/* Live Evaluation Badges */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Adapted X Position:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{evaluation.adaptedPositionX}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Adapted Scale:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{evaluation.adaptedScale}×</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Adapted Duration:</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{evaluation.adaptedDurationMs}ms</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Adapted Stagger:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{evaluation.adaptedStaggerMs}ms</span>
          </div>
        </div>

        {/* Safe-Area Health Check */}
        <div
          style={{
            background: evaluation.isInsideSafeArea ? '#064e3b' : '#881337',
            border: `1px solid ${evaluation.isInsideSafeArea ? '#10b981' : '#f43f5e'}`,
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 9,
            color: evaluation.isInsideSafeArea ? '#6ee7b7' : '#fecdd3',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{evaluation.isInsideSafeArea ? '✓' : '⚠️'}</span>
          <span>
            {evaluation.isInsideSafeArea
              ? 'Safe-Area Protected: 0 Notch/Home Bar Overlaps'
              : evaluation.safeAreaViolationMessage}
          </span>
        </div>

        {/* Code Generator Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Export Responsive Code
            </span>
            <button
              onClick={handleCopyCode}
              style={{
                background: isCopied ? '#10b981' : '#38bdf8',
                color: '#080d1a',
                border: 'none',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isCopied ? '✓ Copied' : 'Copy Code'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 4, background: '#11182c', padding: 2, borderRadius: 6 }}>
            <button
              onClick={() => setActiveCodeTab('css')}
              style={{
                flex: 1,
                padding: '4px',
                fontSize: 9,
                fontWeight: 700,
                background: activeCodeTab === 'css' ? '#38bdf8' : 'transparent',
                color: activeCodeTab === 'css' ? '#080d1a' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              CSS @media
            </button>
            <button
              onClick={() => setActiveCodeTab('framer')}
              style={{
                flex: 1,
                padding: '4px',
                fontSize: 9,
                fontWeight: 700,
                background: activeCodeTab === 'framer' ? '#38bdf8' : 'transparent',
                color: activeCodeTab === 'framer' ? '#080d1a' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Framer Motion
            </button>
          </div>

          <pre
            style={{
              background: '#040711',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: 8,
              fontSize: 8,
              fontFamily: 'monospace',
              color: '#94a3b8',
              overflowX: 'auto',
              maxHeight: '160px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {activeCodeTab === 'css' ? generatedCss : generatedFramer}
          </pre>
        </div>
      </div>
    </div>
  );
}
