import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UniversalParticleStormEngine,
  Particle3D,
  EmitterShape3D,
  ParticleRenderStyle,
  ParticleSimulationConfig,
  DEFAULT_PARTICLE_CONFIG,
  ForceField3D,
  ParticleSpringLink,
} from '../../../core/particles/universalParticleStormEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface ParticleStormStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function ParticleStormStudioView({ onBakeKeyframesToEditor }: ParticleStormStudioViewProps) {
  const [config, setConfig] = useState<ParticleSimulationConfig>(DEFAULT_PARTICLE_CONFIG);
  const [particles, setParticles] = useState<Particle3D[]>([]);
  const [springLinks, setSpringLinks] = useState<ParticleSpringLink[]>([]);
  const [activeForce, setActiveForce] = useState<ForceField3D>({
    type: 'vortex-tornado',
    x: 240,
    y: 160,
    z: 0,
    strength: 12.0,
    radius: 180,
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [collisionCount, setCollisionCount] = useState<number>(0);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleIdCounter = useRef<number>(1);

  // Initialize Initial Particle Pool
  useEffect(() => {
    const initial: Particle3D[] = [];
    for (let i = 0; i < config.maxParticles / 2; i++) {
      initial.push(
        UniversalParticleStormEngine.spawnParticle(
          particleIdCounter.current++,
          240,
          280,
          0,
          config
        )
      );
    }
    setParticles(initial);
  }, []);

  // 60FPS Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setParticles((prev) => {
        // 1. Spawn new particles if below max
        const currentPool = [...prev];
        if (currentPool.length < config.maxParticles) {
          for (let b = 0; b < config.birthRate; b++) {
            currentPool.push(
              UniversalParticleStormEngine.spawnParticle(
                particleIdCounter.current++,
                240,
                280,
                0,
                config
              )
            );
          }
        }

        // 2. Step physics simulation
        const stepResult = UniversalParticleStormEngine.stepSimulation(
          currentPool,
          config,
          [activeForce],
          { minX: 10, maxX: 470, minY: 10, maxY: 310, minZ: -100, maxZ: 100 }
        );

        setSpringLinks(stepResult.springLinks);
        setCollisionCount((c) => c + stepResult.collisionEventCount);
        return stepResult.updatedParticles;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isPlaying, config, activeForce]);

  // 60FPS Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, 480, 320);

    // 1. Draw Mesh Spring Connections (Constellation Network)
    if (config.meshConnections.enabled && springLinks.length > 0) {
      const pMap = new Map<number, Particle3D>(particles.map((p) => [p.id, p]));
      springLinks.forEach((link) => {
        const p1 = pMap.get(link.p1Id);
        const p2 = pMap.get(link.p2Id);
        if (p1 && p2) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${link.alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    }

    // 2. Draw Force Field Gizmo
    ctx.save();
    ctx.strokeStyle = activeForce.type === 'point-attractor' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(236, 72, 153, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(activeForce.x, activeForce.y, activeForce.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Center Crosshair
    ctx.fillStyle = activeForce.type === 'point-attractor' ? '#38bdf8' : '#ec4899';
    ctx.beginPath();
    ctx.arc(activeForce.x, activeForce.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Draw Particles
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      // 3D Depth Scale Approximation
      const depthScale = Math.max(0.4, (p.z + 200) / 200);
      const renderSize = p.size * depthScale;

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [particles, springLinks, activeForce, config]);

  // Click Canvas to Reposition Force Field
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setActiveForce((prev) => ({ ...prev, x: Math.round(x), y: Math.round(y) }));
  };

  const handleBake = () => {
    const baked = UniversalParticleStormEngine.bakeParticleSimulationToKeyframes(particles, 3.0);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Particle Storm • ${config.emitterShape.toUpperCase()}`);
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
      {/* 1. LEFT COLUMN: EMITTER GEOMETRIES & PRESETS */}
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
            3D Particle Storm Studio
          </span>
        </div>

        {/* Emitter Shapes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>EMITTER GEOMETRY:</span>
          {(['point', 'circle', 'sphere', 'tornado-vortex', 'line'] as EmitterShape3D[]).map((shape) => (
            <button
              key={shape}
              onClick={() => setConfig((c) => ({ ...c, emitterShape: shape }))}
              style={{
                background: config.emitterShape === shape ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
                border: `1px solid ${config.emitterShape === shape ? '#38bdf8' : '#1e293b'}`,
                color: config.emitterShape === shape ? '#38bdf8' : '#94a3b8',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 9,
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {shape.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Force Field Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>ACTIVE FORCE FIELD:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['vortex-tornado', 'point-attractor', 'point-repulsor'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveForce((f) => ({ ...f, type }))}
                style={{
                  flex: 1,
                  background: activeForce.type === type ? '#38bdf8' : '#11182c',
                  color: activeForce.type === type ? '#040711' : '#94a3b8',
                  border: 'none',
                  padding: '5px 2px',
                  borderRadius: 4,
                  fontSize: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {type.split('-')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Stats */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Live Particles:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{particles.length} / {config.maxParticles}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Spring Links:</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{springLinks.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Floor Collisions:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{collisionCount}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTER COLUMN: 60FPS REAL-TIME CANVAS */}
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
              Click viewport to move force center ({activeForce.x}, {activeForce.y})
            </span>
          </div>

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
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
          </button>
        </div>

        {/* Viewport Canvas */}
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

      {/* 3. RIGHT COLUMN: PHYSICS & MODULATION INSPECTOR */}
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
          Physics & Modulation Inspector
        </div>

        {/* Max Particles Slider */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Max Particles:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{config.maxParticles}</span>
          </div>
          <input
            type="range"
            min="60"
            max="400"
            step="20"
            value={config.maxParticles}
            onChange={(e) => setConfig((c) => ({ ...c, maxParticles: parseInt(e.target.value) }))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Gravity & Bounce */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Gravity Y:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{config.gravity.y.toFixed(2)}G</span>
          </div>
          <input
            type="range"
            min="-0.2"
            max="0.4"
            step="0.02"
            value={config.gravity.y}
            onChange={(e) => setConfig((c) => ({ ...c, gravity: { ...c.gravity, y: parseFloat(e.target.value) } }))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginTop: 4 }}>
            <span style={{ color: '#94a3b8' }}>Floor Bounce Restitution:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{(config.bounceRestitution * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.95"
            step="0.05"
            value={config.bounceRestitution}
            onChange={(e) => setConfig((c) => ({ ...c, bounceRestitution: parseFloat(e.target.value) }))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        {/* Mesh Connections & Boids Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700 }}>Proximity Mesh Lines</div>
            <button
              onClick={() => setConfig((c) => ({ ...c, meshConnections: { ...c.meshConnections, enabled: !c.meshConnections.enabled } }))}
              style={{
                background: config.meshConnections.enabled ? '#10b981' : '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 8,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {config.meshConnections.enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700 }}>Flocking & Boids Physics</div>
            <button
              onClick={() => setConfig((c) => ({ ...c, flocking: { ...c.flocking, enabled: !c.flocking.enabled } }))}
              style={{
                background: config.flocking.enabled ? '#10b981' : '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 8,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {config.flocking.enabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
