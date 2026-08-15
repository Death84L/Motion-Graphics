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
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);

  // 🎯 Source Point & Impulse Throw Controls
  const [sourcePoint, setSourcePoint] = useState<{ x: number; y: number }>({ x: 80, y: 220 });
  const [throwVelocity, setThrowVelocity] = useState<{ vx: number; vy: number }>({ vx: 7.5, vy: -6.5 });
  const [throwBurstCount, setThrowBurstCount] = useState<number>(45);
  const [isAiming, setIsAiming] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customImgRef = useRef<HTMLImageElement | null>(null);
  const particleIdCounter = useRef<number>(1);

  // Ballistic Trajectory Arc
  const trajectoryArc = useMemo(() => {
    return UniversalParticleStormEngine.computeBallisticTrajectory(
      sourcePoint,
      throwVelocity,
      config.gravity.y,
      35
    );
  }, [sourcePoint, throwVelocity, config.gravity.y]);

  // Handle Custom Particle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        customImgRef.current = img;
        setUploadedImageName(file.name);
        setConfig((c) => ({
          ...c,
          spriteType: 'custom-image',
          customImageSrc: dataUrl,
        }));
      };
    };
    reader.readAsDataURL(file);
  };

  // 🚀 Trigger Impulse Throw from Source Point
  const handleFireThrow = () => {
    const newThrowParticles = UniversalParticleStormEngine.launchThrowBurst(
      particleIdCounter.current,
      { x: sourcePoint.x, y: sourcePoint.y, z: 0 },
      { vx: throwVelocity.vx, vy: throwVelocity.vy, vz: 0 },
      throwBurstCount,
      config.spreadAngleDeg,
      config
    );
    particleIdCounter.current += throwBurstCount;

    setParticles((prev) => [...prev.slice(-config.maxParticles), ...newThrowParticles]);
  };

  // 60FPS Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setParticles((prev) => {
        // Step physics simulation
        const stepResult = UniversalParticleStormEngine.stepSimulation(
          prev,
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

    // 1. Draw Ballistic Trajectory Aim Line
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    trajectoryArc.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.restore();

    // 2. Draw Source Emitter Origin Crosshair & Cannon Indicator
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sourcePoint.x, sourcePoint.y, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(sourcePoint.x, sourcePoint.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Aim Velocity Vector Line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sourcePoint.x, sourcePoint.y);
    ctx.lineTo(sourcePoint.x + throwVelocity.vx * 6, sourcePoint.y + throwVelocity.vy * 6);
    ctx.stroke();
    ctx.restore();

    // 3. Draw Mesh Spring Connections (Constellation Network)
    if (config.meshConnections.enabled && springLinks.length > 0 && config.spriteType === 'glow-dot') {
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

    // 4. Draw Particles (Sprites vs Custom Image vs Glow Dots)
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      const depthScale = Math.max(0.4, (p.z + 200) / 200);
      const renderSize = p.size * depthScale;

      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotZ * Math.PI) / 180);

      if (config.spriteType === 'custom-image' && customImgRef.current) {
        const s = renderSize * 4;
        ctx.drawImage(customImgRef.current, -s / 2, -s / 2, s, s);
      } else if (config.spriteType === 'coin') {
        ctx.font = `${Math.round(renderSize * 3.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪙', 0, 0);
      } else if (config.spriteType === 'star') {
        ctx.font = `${Math.round(renderSize * 3.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 0);
      } else if (config.spriteType === 'heart') {
        ctx.font = `${Math.round(renderSize * 3.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', 0, 0);
      } else if (config.spriteType === 'fire') {
        ctx.font = `${Math.round(renderSize * 3.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥', 0, 0);
      } else if (config.spriteType === 'leaf') {
        ctx.font = `${Math.round(renderSize * 3.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍃', 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, renderSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }, [particles, springLinks, sourcePoint, throwVelocity, trajectoryArc, config]);

  // Click & Drag Canvas to Reposition Source Point & Aim Velocity
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setSourcePoint({ x, y });
    setIsAiming(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAiming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    const dx = (curX - sourcePoint.x) * 0.15;
    const dy = (curY - sourcePoint.y) * 0.15;
    setThrowVelocity({ vx: Math.round(dx * 10) / 10, vy: Math.round(dy * 10) / 10 });
  };

  const handleMouseUp = () => {
    if (isAiming) {
      setIsAiming(false);
      handleFireThrow(); // Launch on release!
    }
  };

  const handleBake = () => {
    const baked = UniversalParticleStormEngine.bakeParticleSimulationToKeyframes(particles, 3.0);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Particle Throw • (${sourcePoint.x}, ${sourcePoint.y})`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 310px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: SOURCE POINT, SPRITE IMAGE & EMITTERS */}
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
            Source Point & Impulse Throw
          </span>
        </div>

        {/* 🚀 Fire Throw Button */}
        <button
          onClick={handleFireThrow}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '10px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          🚀 Launch Impulse Throw ({throwBurstCount} Particles)
        </button>

        {/* Upload Custom Sprite Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>
            CUSTOM PARTICLE IMAGE:
          </span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: config.spriteType === 'custom-image' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
              border: `1px dashed ${config.spriteType === 'custom-image' ? '#38bdf8' : '#64748b'}`,
              borderRadius: 6,
              color: '#38bdf8',
              padding: '8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            🖼️ {uploadedImageName ? `Loaded: ${uploadedImageName}` : 'Upload Particle PNG/SVG/JPG'}
          </button>
        </div>

        {/* Quick Sprite Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>
            SPRITE SHAPE / ICON:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {[
              { id: 'glow-dot', label: '✦ Dot' },
              { id: 'coin', label: '🪙 Coin' },
              { id: 'star', label: '⭐ Star' },
              { id: 'heart', label: '❤️ Heart' },
              { id: 'fire', label: '🔥 Fire' },
              { id: 'leaf', label: '🍃 Leaf' },
            ].map((spr) => (
              <button
                key={spr.id}
                onClick={() => setConfig((c) => ({ ...c, spriteType: spr.id as any }))}
                style={{
                  background: config.spriteType === spr.id ? '#38bdf8' : '#11182c',
                  color: config.spriteType === spr.id ? '#040711' : '#f8fafc',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 4px',
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {spr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source Point Coordinates */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Source Origin:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>X: {sourcePoint.x} | Y: {sourcePoint.y}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Velocity Vector:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>vx: {throwVelocity.vx} | vy: {throwVelocity.vy}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Active Particles:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{particles.length}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTER COLUMN: 60FPS REAL-TIME CANVAS WITH SLINGSHOT AIM */}
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
              🎯 Click & Drag on viewport to aim and release to throw!
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ borderRadius: 8, cursor: 'crosshair', boxShadow: '0 0 32px rgba(0,0,0,0.8)' }}
          />
        </div>
      </div>

      {/* 3. RIGHT COLUMN: THROW CONTROLS & PHYSICS INSPECTOR */}
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
          Throw & Physics Inspector
        </div>

        {/* Throw Burst Count */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Throw Burst Count:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>{throwBurstCount} Particles</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={throwBurstCount}
            onChange={(e) => setThrowBurstCount(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>

        {/* Spread Angle */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Throw Spread Angle:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{config.spreadAngleDeg}°</span>
          </div>
          <input
            type="range"
            min="5"
            max="90"
            value={config.spreadAngleDeg}
            onChange={(e) => setConfig((c) => ({ ...c, spreadAngleDeg: parseInt(e.target.value) }))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Gravity & Bounce Restitution */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Gravity Y:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{config.gravity.y.toFixed(2)}G</span>
          </div>
          <input
            type="range"
            min="0.02"
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
      </div>
    </div>
  );
}
