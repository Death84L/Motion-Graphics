import React, { useMemo } from 'react';
import { profileMotionPerformance } from '../../../core/debugger/motionDebuggerEngine';

interface MotionDebuggerPanelProps {
  activeLayerCount: number;
  activePhysicsNodes: number;
  activeShaders: number;
}

export function MotionDebuggerPanel({
  activeLayerCount = 6,
  activePhysicsNodes = 3,
  activeShaders = 2,
}: MotionDebuggerPanelProps) {
  const metrics = useMemo(() => {
    return profileMotionPerformance(activeLayerCount, activePhysicsNodes, activeShaders, 16.6);
  }, [activeLayerCount, activePhysicsNodes, activeShaders]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#090e1a',
        padding: 12,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>🩺</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Motion Performance Profiler
          </span>
        </div>
        <span style={{ fontSize: 9, color: '#10b981', fontWeight: 800 }}>60 FPS STABLE</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#64748b' }}>FRAME TIME</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>{metrics.frameTimeMs}ms</div>
        </div>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#64748b' }}>LAYERS</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#cbd5e1' }}>{metrics.activeLayerCount}</div>
        </div>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#64748b' }}>PHYSICS</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#a855f7' }}>{metrics.activePhysicsNodes}</div>
        </div>
      </div>

      {metrics.suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {metrics.suggestions.map((s, i) => (
            <div key={i} style={{ fontSize: 9, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: 4, borderRadius: 4 }}>
              ⚠ {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
