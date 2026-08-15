import React from 'react';
import { KeyframePoint, SpringParams, BounceParams } from '../../types';

interface PhysicsParametersPanelProps {
  selectedKeyframes: KeyframePoint[];
  allKeyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function PhysicsParametersPanel({
  selectedKeyframes,
  allKeyframes,
  onUpdateKeyframes,
}: PhysicsParametersPanelProps) {
  const targetKf = selectedKeyframes[0] || allKeyframes[0];
  if (!targetKf) return null;

  const spring: SpringParams = targetKf.springParams || {
    stiffness: 120,
    damping: 14,
    mass: 1,
    amplitude: 100,
    frequency: 3.5,
  };

  const bounce: BounceParams = targetKf.bounceParams || {
    bounces: 3,
    decay: 0.65,
    gravity: 9.8,
  };

  const handleUpdateSpring = (updates: Partial<SpringParams>) => {
    const newSpring = { ...spring, ...updates };
    const updated = allKeyframes.map((k) => {
      if (selectedKeyframes.length === 0 || selectedKeyframes.some((sk) => sk.id === k.id)) {
        return { ...k, ease: 'spring' as const, springParams: newSpring };
      }
      return k;
    });
    onUpdateKeyframes(updated);
  };

  const handleUpdateBounce = (updates: Partial<BounceParams>) => {
    const newBounce = { ...bounce, ...updates };
    const updated = allKeyframes.map((k) => {
      if (selectedKeyframes.length === 0 || selectedKeyframes.some((sk) => sk.id === k.id)) {
        return { ...k, ease: 'bounce' as const, bounceParams: newBounce };
      }
      return k;
    });
    onUpdateKeyframes(updated);
  };

  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>⚛</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Physics Graph Controls
          </span>
        </div>
      </div>

      {/* Spring Physics Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>
          <span>SPRING OSCILLATION</span>
          <button
            onClick={() => handleUpdateSpring({})}
            style={{ background: 'transparent', color: '#38bdf8', border: 'none', cursor: 'pointer', fontSize: 10 }}
          >
            Apply Spring
          </button>
        </div>

        {/* Stiffness */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
          <span style={{ width: 60, color: '#64748b' }}>Stiffness:</span>
          <input
            type="range"
            min={20}
            max={300}
            value={spring.stiffness}
            onChange={(e) => handleUpdateSpring({ stiffness: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#38bdf8' }}
          />
          <span style={{ width: 30, fontFamily: 'monospace', color: '#f1f5f9' }}>{spring.stiffness}</span>
        </div>

        {/* Damping */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
          <span style={{ width: 60, color: '#64748b' }}>Damping:</span>
          <input
            type="range"
            min={4}
            max={35}
            value={spring.damping}
            onChange={(e) => handleUpdateSpring({ damping: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#38bdf8' }}
          />
          <span style={{ width: 30, fontFamily: 'monospace', color: '#f1f5f9' }}>{spring.damping}</span>
        </div>

        {/* Mass */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
          <span style={{ width: 60, color: '#64748b' }}>Mass:</span>
          <input
            type="range"
            min={0.2}
            max={5}
            step={0.1}
            value={spring.mass}
            onChange={(e) => handleUpdateSpring({ mass: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#38bdf8' }}
          />
          <span style={{ width: 30, fontFamily: 'monospace', color: '#f1f5f9' }}>{spring.mass.toFixed(1)}</span>
        </div>
      </div>

      {/* Gravity Bounce Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>
          <span>GRAVITY BOUNCE</span>
          <button
            onClick={() => handleUpdateBounce({})}
            style={{ background: 'transparent', color: '#f59e0b', border: 'none', cursor: 'pointer', fontSize: 10 }}
          >
            Apply Bounce
          </button>
        </div>

        {/* Bounces */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
          <span style={{ width: 60, color: '#64748b' }}>Bounces:</span>
          <input
            type="range"
            min={1}
            max={6}
            value={bounce.bounces}
            onChange={(e) => handleUpdateBounce({ bounces: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#f59e0b' }}
          />
          <span style={{ width: 30, fontFamily: 'monospace', color: '#f1f5f9' }}>{bounce.bounces}</span>
        </div>

        {/* Decay */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
          <span style={{ width: 60, color: '#64748b' }}>Decay:</span>
          <input
            type="range"
            min={0.2}
            max={0.9}
            step={0.05}
            value={bounce.decay}
            onChange={(e) => handleUpdateBounce({ decay: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#f59e0b' }}
          />
          <span style={{ width: 30, fontFamily: 'monospace', color: '#f1f5f9' }}>{bounce.decay.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
