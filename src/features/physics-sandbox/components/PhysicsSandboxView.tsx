import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PhysicsBody,
  PhysicsSpringConstraint,
  PhysicsWorldConfig,
  MATERIAL_PRESETS,
  PhysicsMaterialType,
  PhysicsPreset,
  PhysicsTelemetry,
} from '../../../core/physics/universalPhysicsSchema';
import {
  UniversalPhysicsEngine,
  SAMPLE_PHYSICS_PRESETS,
} from '../../../core/physics/universalPhysicsEngine';
import { PhysicsKeyframeBaker } from '../../../core/physics/physicsKeyframeBaker';
import { KeyframePoint } from '../../graph-editor/types';

interface PhysicsSandboxViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function PhysicsSandboxView({ onBakeKeyframesToEditor }: PhysicsSandboxViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPreset, setSelectedPreset] = useState<PhysicsPreset>(SAMPLE_PHYSICS_PRESETS[0]);
  const [bodies, setBodies] = useState<PhysicsBody[]>(SAMPLE_PHYSICS_PRESETS[0].bodies);
  const [constraints, setConstraints] = useState<PhysicsSpringConstraint[]>(SAMPLE_PHYSICS_PRESETS[0].constraints);
  const [world, setWorld] = useState<PhysicsWorldConfig>(SAMPLE_PHYSICS_PRESETS[0].world);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState<PhysicsTelemetry>({
    kineticEnergy: 0,
    potentialEnergy: 0,
    totalMomentum: 0,
    peakVelocity: 0,
    activeCollisionCount: 0,
  });
  const [isBaked, setIsBaked] = useState<boolean>(false);
  const [draggedBodyId, setDraggedBodyId] = useState<string | null>(null);

  // Load Preset
  const handleSelectPreset = (preset: PhysicsPreset) => {
    setSelectedPreset(preset);
    setBodies(preset.bodies.map((b) => ({ ...b })));
    setConstraints(preset.constraints.map((c) => ({ ...c })));
    setWorld({ ...preset.world });
  };

  // Reset World
  const handleResetWorld = () => {
    setBodies(selectedPreset.bodies.map((b) => ({ ...b })));
    setConstraints(selectedPreset.constraints.map((c) => ({ ...c })));
  };

  // Real-time Physics Simulation Loop (60 FPS)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const res = UniversalPhysicsEngine.stepSimulation(bodies, constraints, world, 1 / 60);
      setBodies(res.bodies);
      setTelemetry(res.telemetry);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying, bodies, constraints, world]);

  // Render Simulation on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Floor Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Spring Constraints
    constraints.forEach((c) => {
      const bA = bodies.find((b) => b.id === c.bodyAId);
      const bB = bodies.find((b) => b.id === c.bodyBId);
      if (!bA || !bB) return;

      ctx.beginPath();
      ctx.moveTo(bA.x, bA.y);
      ctx.lineTo(bB.x, bB.y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw Bodies
    bodies.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y);

      // Body Circle
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = b.id === draggedBodyId ? 20 : 8;
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = b.isPinned ? 3 : 1.5;
      ctx.stroke();

      // Pin indicator
      if (b.isPinned) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -3, 6, 6);
      }

      ctx.restore();
    });
  }, [bodies, constraints, draggedBodyId]);

  // Mouse Interaction (Click & Drag Throw)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedBody = bodies.find((b) => {
      const dx = b.x - mouseX;
      const dy = b.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= b.radius + 10;
    });

    if (clickedBody && !clickedBody.isPinned) {
      setDraggedBodyId(clickedBody.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedBodyId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setBodies((prev) =>
      prev.map((b) =>
        b.id === draggedBodyId
          ? { ...b, x: mouseX, y: mouseY, vx: (mouseX - b.x) * 10, vy: (mouseY - b.y) * 10 }
          : b
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedBodyId(null);
  };

  // 1-Click Bake Simulation to Keyframes
  const handleBakeSimulation = () => {
    const targetBody = bodies.find((b) => !b.isPinned) || bodies[0];
    const baked = PhysicsKeyframeBaker.bakeSimulationToKeyframes(
      bodies,
      constraints,
      world,
      targetBody.id,
      'y',
      3.0,
      60
    );

    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Physics Sim • ${targetBody.name}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: WORLD & FORCE CONTROLS */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🧪</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Physics World & Forces
          </span>
        </div>

        {/* Gravity Controls */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Gravity Y:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{world.gravityY} px/s²</span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={world.gravityY}
            onChange={(e) => setWorld((w) => ({ ...w, gravityY: parseFloat(e.target.value) }))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Wind Force Controls */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Wind Force X:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{world.windForceX} px/s</span>
          </div>
          <input
            type="range"
            min="-500"
            max="500"
            step="20"
            value={world.windForceX}
            onChange={(e) => setWorld((w) => ({ ...w, windForceX: parseFloat(e.target.value) }))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        {/* Material Presets Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Apply Material Physics
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {(['rubber', 'metal', 'jelly', 'ice', 'foam', 'fabric'] as PhysicsMaterialType[]).map((mat) => {
              const info = MATERIAL_PRESETS[mat];
              return (
                <button
                  key={mat}
                  onClick={() => {
                    setBodies((prev) =>
                      prev.map((b) => (b.isPinned ? b : { ...b, material: mat }))
                    );
                  }}
                  style={{
                    background: '#11182c',
                    border: '1px solid #1e293b',
                    color: '#f8fafc',
                    borderRadius: 4,
                    padding: '4px 6px',
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {info.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Physics Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Simulation Presets
          </span>
          {SAMPLE_PHYSICS_PRESETS.map((preset: PhysicsPreset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{preset.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: INTERACTIVE 60FPS SIMULATION STAGE */}
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
        {/* Simulation Action Bar */}
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
              {isPlaying ? '⏸ Pause' : '▶ Play Sim'}
            </button>
            <button
              onClick={handleResetWorld}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Reset World
            </button>
          </div>

          {/* 1-Click Bake Action */}
          <button
            onClick={handleBakeSimulation}
            style={{
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
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
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor & Timeline'}
          </button>
        </div>

        {/* Canvas Simulation Stage */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
          }}
        >
          <canvas
            ref={canvasRef}
            width={500}
            height={380}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: draggedBodyId ? 'grabbing' : 'grab' }}
          />
        </div>

        <div style={{ fontSize: 9, color: '#64748b', textAlign: 'center' }}>
          💡 Click and drag any sphere on the stage to throw it with mouse impulse velocity!
        </div>
      </div>

      {/* 3. RIGHT COLUMN: TELEMETRY & KINETIC METERS */}
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
          Simulation Telemetry
        </div>

        {/* Energy Meters */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Kinetic Energy (Ek):</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{telemetry.kineticEnergy} J</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Potential Energy (Ep):</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{telemetry.potentialEnergy} J</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Peak Velocity:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>{telemetry.peakVelocity} px/s</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Momentum:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{telemetry.totalMomentum} kg·px/s</span>
          </div>
        </div>

        {/* Active Bodies List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Active Bodies ({bodies.length})
          </span>
          {bodies.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{b.name}</span>
              </div>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>
                {b.material.toUpperCase()} {b.isPinned ? '(PINNED)' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
