import React, { useState, useRef } from 'react';
import { calculateMagneticDisplacement, MagneticOffsetResult } from '../../../core/ui/magneticCursorEngine';
import { COMPONENT_MOTION_BLUEPRINTS, ComponentMotionBlueprint } from '../../../core/ui/componentMotionPresets';
import { MotionTokensPanel } from './MotionTokensPanel';

export function UIComponentMotionStudio() {
  const [activeBlueprint, setActiveBlueprint] = useState<ComponentMotionBlueprint>(
    COMPONENT_MOTION_BLUEPRINTS[0]
  );
  const [toggleState, setToggleState] = useState<boolean>(false);
  const [magneticOffset, setMagneticOffset] = useState<MagneticOffsetResult>({
    offsetX: 0,
    offsetY: 0,
    rotationDeg: 0,
    isAttracted: false,
  });

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!buttonRef.current || !activeBlueprint.isMagnetic) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const res = calculateMagneticDisplacement(centerX, centerY, e.clientX, e.clientY);
    setMagneticOffset(res);
  };

  const handlePointerLeave = () => {
    setMagneticOffset({ offsetX: 0, offsetY: 0, rotationDeg: 0, isAttracted: false });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 340px',
        height: '100%',
        background: '#060913',
        overflow: 'hidden',
      }}
    >
      {/* Left Column: Component Blueprints */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 10,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 16 }}>🖱️</span>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>
            UI Motion Studio
          </span>
        </div>

        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Test tactile micro-interactions, magnetic proximity physics, and responsive state transitions.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {COMPONENT_MOTION_BLUEPRINTS.map((bp) => (
            <div
              key={bp.id}
              onClick={() => setActiveBlueprint(bp)}
              style={{
                background: activeBlueprint.id === bp.id ? 'rgba(16, 185, 129, 0.15)' : '#11182c',
                border: `1px solid ${activeBlueprint.id === bp.id ? '#10b981' : '#1e293b'}`,
                borderRadius: 6,
                padding: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>{bp.name}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{bp.description}</div>
              {bp.isMagnetic && (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    borderRadius: 3,
                    padding: '1px 5px',
                    fontSize: 8,
                    fontWeight: 700,
                  }}
                >
                  🧲 MAGNETIC PROXIMITY
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center Column: Live Interactive Component Stage */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #0e1526 0%, #03060f 100%)',
          padding: 24,
          position: 'relative',
          userSelect: 'none',
        }}
      >
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 24 }}>
          Interactive Tactile Stage (Move cursor near elements or click to trigger states)
        </div>

        {/* Primary Interactive Sandbox Target */}
        {activeBlueprint.category === 'button' && (
          <button
            ref={buttonRef}
            style={{
              padding: '14px 32px',
              fontSize: 14,
              fontWeight: 800,
              color: '#080d1a',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: 30,
              cursor: 'pointer',
              boxShadow: `0 10px 30px rgba(16, 185, 129, 0.4), 0 0 ${activeBlueprint.hover.glowPx}px #10b981`,
              transform: `translate(${magneticOffset.offsetX}px, ${magneticOffset.offsetY}px) rotate(${magneticOffset.rotationDeg}deg)`,
              transition: magneticOffset.isAttracted ? 'none' : `transform ${activeBlueprint.transitionDurationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
            }}
          >
            {activeBlueprint.name} {activeBlueprint.isMagnetic ? '🧲' : '⚡'}
          </button>
        )}

        {activeBlueprint.category === 'card' && (
          <div
            style={{
              width: 260,
              height: 160,
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 16,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              transform: `translate(${magneticOffset.offsetX * 0.5}px, ${magneticOffset.offsetY * 0.5}px) rotateX(${-magneticOffset.offsetY * 0.4}deg) rotateY(${magneticOffset.offsetX * 0.4}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#38bdf8' }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>Glass Card 3D</div>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>3D Tilt & Magnetic Cursor Attraction</div>
          </div>
        )}

        {activeBlueprint.category === 'toggle' && (
          <div
            onClick={() => setToggleState(!toggleState)}
            style={{
              width: 64,
              height: 36,
              background: toggleState ? '#10b981' : '#1e293b',
              borderRadius: 18,
              padding: 3,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                background: '#ffffff',
                transform: `translateX(${toggleState ? 28 : 0}px)`,
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        )}

        {magneticOffset.isAttracted && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              background: '#090e1a',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 10,
              color: '#38bdf8',
              fontFamily: 'monospace',
            }}
          >
            🧲 Magnetic Displacement: X: {magneticOffset.offsetX}px | Y: {magneticOffset.offsetY}px
          </div>
        )}
      </div>

      {/* Right Column: Motion Tokens Manager */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          overflowY: 'auto',
        }}
      >
        <MotionTokensPanel onUpdateTokens={() => {}} />
      </div>
    </div>
  );
}
