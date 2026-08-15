import React, { useState } from 'react';
import {
  Camera3DRig,
  DEFAULT_CAMERA_RIG,
  SAMPLE_3D_SCENE_LAYERS,
  Layer3DDepthNode,
  calculate3DLayerTransform,
} from '../../../core/scene3d/scene3dEngine';
import { simulateParticlesAtFrame } from '../../../core/vfx/particleEngine';

export function Scene3DStudioView() {
  const [camera, setCamera] = useState<Camera3DRig>(DEFAULT_CAMERA_RIG);
  const [layers, setLayers] = useState<Layer3DDepthNode[]>(SAMPLE_3D_SCENE_LAYERS);
  const [currentFrame, setCurrentFrame] = useState<number>(15);
  const [showParticles, setShowParticles] = useState<boolean>(true);

  const particles = showParticles ? simulateParticlesAtFrame(undefined, currentFrame, 0, 0) : [];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* 3D Viewport */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'radial-gradient(circle at center, #0e1526 0%, #02050e 100%)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10 }}>
          <span style={{ color: '#ec4899', fontSize: 16 }}>🎥</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            2.5D / 3D Scene & Camera Studio
          </span>
        </div>

        {/* 3D Transform Stage Box */}
        <div
          style={{
            width: 480,
            height: 300,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {layers.map((l) => (
            <div
              key={l.id}
              style={{
                position: 'absolute',
                padding: '16px 24px',
                background: l.id === 'l3d-card' ? 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))' : 'transparent',
                border: l.id === 'l3d-card' ? '1px solid rgba(56, 189, 248, 0.4)' : undefined,
                borderRadius: 14,
                color: '#f8fafc',
                fontSize: l.id === 'l3d-text' ? 24 : 14,
                fontWeight: 800,
                boxShadow: l.id === 'l3d-card' ? '0 20px 50px rgba(0,0,0,0.8)' : undefined,
                transform: calculate3DLayerTransform(l, camera, currentFrame),
                opacity: l.opacity,
                transition: 'transform 0.1s ease-out',
                userSelect: 'none',
              }}
            >
              {l.name} (Z: {l.zDepth}px)
            </div>
          ))}

          {/* Procedural Particle Simulation */}
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: p.color,
                opacity: p.opacity,
                boxShadow: `0 0 6px ${p.color}`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Column: Camera & Z-Depth Controls */}
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
          Camera Rig & Depth Controls
        </div>

        {/* Camera Dolly (Z Position) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Camera Dolly (Z Position):</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{camera.positionZ}px</span>
          </div>
          <input
            type="range"
            min="-300"
            max="400"
            value={camera.positionZ}
            onChange={(e) => setCamera({ ...camera, positionZ: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Camera Orbit X */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Camera Orbit Pitch (X):</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>{camera.orbitAngleX}°</span>
          </div>
          <input
            type="range"
            min="-45"
            max="45"
            value={camera.orbitAngleX}
            onChange={(e) => setCamera({ ...camera, orbitAngleX: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        {/* Camera Orbit Y */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Camera Orbit Yaw (Y):</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{camera.orbitAngleY}°</span>
          </div>
          <input
            type="range"
            min="-45"
            max="45"
            value={camera.orbitAngleY}
            onChange={(e) => setCamera({ ...camera, orbitAngleY: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        {/* Particles Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#11182c', padding: 8, borderRadius: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>✨ 2D Procedural Particles</span>
          <button
            onClick={() => setShowParticles(!showParticles)}
            style={{
              background: showParticles ? '#10b981' : '#1e293b',
              color: showParticles ? '#080d1a' : '#64748b',
              border: 'none',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 9,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {showParticles ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
