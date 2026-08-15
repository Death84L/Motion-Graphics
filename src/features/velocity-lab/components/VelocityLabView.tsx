import React, { useState, useMemo } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  analyzeVelocityProfile,
  normalizeVelocityPeak,
  clampVelocityProfile,
  retimePreservingVelocityCharacter,
} from '../../../core/velocity/velocityLabEngine';

interface VelocityLabViewProps {
  currentKeyframes: KeyframePoint[];
  onApplyKeyframes: (updated: KeyframePoint[]) => void;
}

export function VelocityLabView({ currentKeyframes, onApplyKeyframes }: VelocityLabViewProps) {
  const [targetPeakVel, setTargetPeakVel] = useState<number>(2.0);
  const [velocityCap, setVelocityCap] = useState<number>(2.5);
  const [retimeMs, setRetimeMs] = useState<number>(600);

  const { derivatives, summary } = useMemo(
    () => analyzeVelocityProfile(currentKeyframes, 60),
    [currentKeyframes]
  );

  const width = 640;
  const height = 110;

  // 1. Position Path
  const maxPos = Math.max(1, ...currentKeyframes.map((k) => Math.abs(k.value)));
  const posPath = currentKeyframes
    .map((k, i) => {
      const x = (k.time / (currentKeyframes[currentKeyframes.length - 1]?.time || 100)) * width;
      const y = height - (k.value / maxPos) * (height * 0.8) - 10;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // 2. Velocity Path
  const maxVel = Math.max(0.1, summary.peakVelocity);
  const velPath = derivatives
    .map((d, i) => {
      const x = (i / (derivatives.length - 1)) * width;
      const y = height / 2 - (d.velocity / maxVel) * (height * 0.4);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // 3. Acceleration Path
  const maxAccel = Math.max(0.1, summary.peakAcceleration);
  const accelPath = derivatives
    .map((d, i) => {
      const x = (i / (derivatives.length - 1)) * width;
      const y = height / 2 - (d.acceleration / maxAccel) * (height * 0.4);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

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
      {/* Center Column: Triple Synchronized Graphs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 18,
          gap: 12,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#38bdf8', fontSize: 16 }}>📈</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
              Velocity & Kinematics Lab
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 9, color: '#10b981', background: '#11182c', padding: '2px 6px', borderRadius: 4 }}>
              SMOOTHNESS: {summary.smoothnessScore}/100
            </span>
            <span style={{ fontSize: 9, color: '#f59e0b', background: '#11182c', padding: '2px 6px', borderRadius: 4 }}>
              JERK: {summary.jerkScore}
            </span>
          </div>
        </div>

        {/* Graph 1: Position-Time */}
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 8, padding: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
            <span>1. POSITION–TIME CURVE (x)</span>
            <span style={{ color: '#64748b' }}>Peak: {maxPos.toFixed(1)}%</span>
          </div>
          <svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <line x1="0" y1={height - 10} x2={width} y2={height - 10} stroke="#334155" strokeDasharray="3 3" />
            <path d={posPath} fill="none" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Graph 2: Velocity-Time (v = dx/dt) */}
        <div style={{ background: '#090e1a', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 8, padding: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800, color: '#38bdf8', marginBottom: 4 }}>
            <span>2. VELOCITY–TIME CURVE (v = dx/dt)</span>
            <span style={{ color: '#38bdf8' }}>Peak: ±{summary.peakVelocity} units/s</span>
          </div>
          <svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
            <path d={velPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Graph 3: Acceleration-Time (a = dv/dt) */}
        <div style={{ background: '#090e1a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, padding: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800, color: '#f59e0b', marginBottom: 4 }}>
            <span>3. ACCELERATION–TIME CURVE (a = dv/dt)</span>
            <span style={{ color: '#f59e0b' }}>Peak: ±{summary.peakAcceleration} units/s²</span>
          </div>
          <svg width="100%" height="80" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
            <path d={accelPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Right Column: Velocity Control Tools */}
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
          Kinematic Modifiers
        </div>

        {/* Velocity Normalization */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Target Peak Velocity:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{targetPeakVel.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={targetPeakVel}
            onChange={(e) => setTargetPeakVel(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
          <button
            onClick={() => onApplyKeyframes(normalizeVelocityPeak(currentKeyframes, targetPeakVel))}
            style={{ background: '#38bdf8', color: '#080d1a', border: 'none', borderRadius: 4, padding: '5px 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
          >
            ⚡ Normalize Velocity Peak
          </button>
        </div>

        {/* Velocity Clamping */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Max Velocity Cap:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>{velocityCap.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.1"
            value={velocityCap}
            onChange={(e) => setVelocityCap(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
          <button
            onClick={() => onApplyKeyframes(clampVelocityProfile(currentKeyframes, velocityCap))}
            style={{ background: '#ec4899', color: '#ffffff', border: 'none', borderRadius: 4, padding: '5px 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
          >
            ✂ Clamp Velocity Spikes
          </button>
        </div>

        {/* Velocity-Preserving Retiming */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Retime Duration:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{retimeMs}ms</span>
          </div>
          <input
            type="range"
            min="200"
            max="1500"
            step="50"
            value={retimeMs}
            onChange={(e) => setRetimeMs(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
          <button
            onClick={() => onApplyKeyframes(retimePreservingVelocityCharacter(currentKeyframes, retimeMs))}
            style={{ background: '#10b981', color: '#ffffff', border: 'none', borderRadius: 4, padding: '5px 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
          >
            ⏱ Velocity-Preserving Retime
          </button>
        </div>
      </div>
    </div>
  );
}
