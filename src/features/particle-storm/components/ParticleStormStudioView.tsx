import React, { useState, useEffect, useRef } from 'react';
import {
  ParticleStormEngine,
  ParticleEmitterType,
  Particle,
} from '../../../core/particles/particleStormEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface ParticleStormStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function ParticleStormStudioView({ onBakeKeyframesToEditor }: ParticleStormStudioViewProps) {
  const [emitterType, setEmitterType] = useState<ParticleEmitterType>('sparks-embers');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [gravity, setGravity] = useState<number>(0.08);
  const [isBaked, setIsBaked] = useState<boolean>(false);
  const particlesRef = useRef<Particle[]>(ParticleStormEngine.spawnParticles('sparks-embers', 70, 480, 320));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Restart Emitter when type changes
  useEffect(() => {
    particlesRef.current = ParticleStormEngine.spawnParticles(emitterType, 70, 480, 320);
  }, [emitterType]);

  // 60FPS Canvas Animation Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      if (isPlaying) {
        particlesRef.current = ParticleStormEngine.stepSimulation(particlesRef.current, 480, 320, gravity);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#040711';
          ctx.fillRect(0, 0, 480, 320);

          particlesRef.current.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalAlpha = 1.0;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gravity]);

  const handleBake = () => {
    const baked = ParticleStormEngine.bakeParticleToKeyframes(particlesRef.current);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Particles • ${emitterType.toUpperCase()}`);
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
      {/* 1. LEFT COLUMN: EMITTER PRESETS */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🌌</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Particle Storm Studio
          </span>
        </div>

        {/* Emitter Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>EMITTER PRESETS:</span>
          {[
            { id: 'sparks-embers', name: 'Sparks & Fire Embers', desc: 'Rising glowing embers' },
            { id: 'falling-snow', name: 'Falling Snow & Frost', desc: 'Drifting winter flakes' },
            { id: 'confetti-popper', name: 'Confetti Popper Burst', desc: 'Multi-color party confetti' },
            { id: 'smoke-plume', name: 'Smoke & Fog Cloud', desc: 'Soft dispersing puffs' },
          ].map((em) => {
            const isSel = emitterType === em.id;
            return (
              <div
                key={em.id}
                onClick={() => setEmitterType(em.id as ParticleEmitterType)}
                style={{
                  background: isSel ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSel ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: isSel ? '#38bdf8' : '#f8fafc' }}>
                  {em.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{em.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Gravity Slider */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Gravity Well:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{gravity.toFixed(2)}G</span>
          </div>
          <input
            type="range"
            min="-0.2"
            max="0.4"
            step="0.02"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>
      </div>

      {/* 2. CENTER COLUMN: 60FPS HTML5 CANVAS */}
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
        {/* Top Control Bar */}
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
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #ec4899)',
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

        {/* 60FPS Particle Canvas */}
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
            style={{ borderRadius: 8, boxShadow: '0 0 24px rgba(0,0,0,0.8)' }}
          />
        </div>
      </div>

      {/* 3. RIGHT COLUMN: PHYSICS PROPERTIES */}
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
          Physics Simulation Spec
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          60 FPS deterministic particle simulation with velocity integration and boundary collision bouncing.
        </div>
      </div>
    </div>
  );
}
