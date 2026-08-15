import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import { injectProceduralNoise } from '../../../../core/dynamics/noiseGenerator';
import { denoiseKeyframes, DenoiseAlgorithm } from '../../../../core/dynamics/noiseFilter';
import { evaluateSpringChain } from '../../../../core/dynamics/springChain';
import { generateFollowerCurve } from '../../../../core/dynamics/followMotion';
import { calculateInertiaContinuation } from '../../../../core/dynamics/inertiaEngine';
import { generateSecondaryMotion } from '../../../../core/dynamics/secondaryMotion';

interface DynamicsPhysicsPanelProps {
  keyframes: KeyframePoint[];
  currentTime: number;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function DynamicsPhysicsPanel({
  keyframes,
  currentTime,
  onUpdateKeyframes,
}: DynamicsPhysicsPanelProps) {
  const [noiseAmp, setNoiseAmp] = useState(6);
  const [noiseFreq, setNoiseFreq] = useState(0.2);

  const handleInjectNoise = () => {
    const noisy = injectProceduralNoise(keyframes, {
      amplitude: noiseAmp,
      frequency: noiseFreq,
      octaves: 3,
      seed: 42,
      falloff: 'none',
    });
    onUpdateKeyframes(noisy);
  };

  const handleDenoise = (algo: DenoiseAlgorithm) => {
    const cleaned = denoiseKeyframes(keyframes, algo);
    onUpdateKeyframes(cleaned);
  };

  const handleSpringChain = () => {
    const chain = evaluateSpringChain([
      { stiffness: 220, damping: 14, mass: 1.0 },
      { stiffness: 160, damping: 10, mass: 0.8 },
    ]);
    onUpdateKeyframes(chain);
  };

  const handleFollower = () => {
    const follower = generateFollowerCurve(keyframes, {
      delayFrames: 6,
      damping: 0.85,
      elasticity: 0.2,
      offsetValue: 0,
    });
    onUpdateKeyframes(follower);
  };

  const handleInertia = () => {
    const inertia = calculateInertiaContinuation(keyframes, currentTime);
    onUpdateKeyframes(inertia);
  };

  const handleSecondary = () => {
    const sec = generateSecondaryMotion(keyframes);
    onUpdateKeyframes(sec);
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
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#ec4899', fontSize: 13 }}>🌊</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Physics & Dynamics Suite</span>
      </div>

      {/* 1. Procedural Noise Injection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
          <span>Noise Amplitude: <strong>{noiseAmp}%</strong></span>
          <span>Freq: <strong>{noiseFreq}</strong></span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={noiseAmp}
          onChange={(e) => setNoiseAmp(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#ec4899' }}
        />
        <button
          onClick={handleInjectNoise}
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🎲 Inject Organic Noise
        </button>
      </div>

      {/* 2. Denoising DSP Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>NOISE FILTERING & DE-JITTER</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          <button
            onClick={() => handleDenoise('savitzky-golay')}
            style={{ padding: '5px 6px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}
          >
            Savitzky-Golay
          </button>
          <button
            onClick={() => handleDenoise('gaussian')}
            style={{ padding: '5px 6px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}
          >
            Gaussian
          </button>
          <button
            onClick={() => handleDenoise('median')}
            style={{ padding: '5px 6px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}
          >
            Median
          </button>
        </div>
      </div>

      {/* 3. Physics Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          onClick={handleSpringChain}
          style={{ padding: '6px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#f8fafc', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          🌀 Spring Chain
        </button>

        <button
          onClick={handleFollower}
          style={{ padding: '6px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#f8fafc', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          👥 Chase Follower
        </button>

        <button
          onClick={handleInertia}
          style={{ padding: '6px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#f8fafc', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          ⚡ Momentum Throw
        </button>

        <button
          onClick={handleSecondary}
          style={{ padding: '6px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#f8fafc', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          💫 Secondary Wobble
        </button>
      </div>
    </div>
  );
}
