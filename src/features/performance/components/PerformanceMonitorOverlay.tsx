import React, { useState, useEffect } from 'react';
import {
  PerformanceProfiler,
  PerformanceTelemetrySnapshot,
} from '../../../core/performance/performanceProfiler';

export function PerformanceMonitorOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<PerformanceTelemetrySnapshot>(() =>
    PerformanceProfiler.getSnapshot()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      PerformanceProfiler.tick();
      setSnapshot(PerformanceProfiler.getSnapshot());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          zIndex: 9999,
          background: 'rgba(9, 14, 26, 0.85)',
          border: `1px solid ${snapshot.fps < 45 ? '#ef4444' : '#1e293b'}`,
          color: snapshot.fps < 45 ? '#ef4444' : '#38bdf8',
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 10,
          fontFamily: 'monospace',
          fontWeight: 700,
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
        }}
      >
        ⚡ {snapshot.fps} FPS ({snapshot.frameTimeMs}ms)
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 9999,
        width: 280,
        background: '#090e1a',
        border: '1px solid #1e293b',
        borderRadius: 10,
        padding: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
        fontSize: 10,
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, color: '#f8fafc' }}>⚡ Performance Telemetry</span>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4 }}>
          <div style={{ color: '#64748b' }}>FPS</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: snapshot.fps >= 55 ? '#10b981' : '#f59e0b' }}>
            {snapshot.fps} FPS
          </div>
        </div>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4 }}>
          <div style={{ color: '#64748b' }}>FRAME TIME</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#38bdf8' }}>
            {snapshot.frameTimeMs} ms
          </div>
        </div>
      </div>

      {/* Subsystem timings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, background: '#040711', padding: 6, borderRadius: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
          <span>Graph Eval:</span>
          <span>{snapshot.graphEvalTimeMs} ms</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
          <span>Physics Engine:</span>
          <span>{snapshot.physicsTimeMs} ms</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
          <span>Rendering:</span>
          <span>{snapshot.renderTimeMs} ms</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
          <span>Memory Heap:</span>
          <span>{snapshot.memoryMb} MB</span>
        </div>
      </div>

      {snapshot.detectedBottleneck && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: 6, borderRadius: 4, fontSize: 9 }}>
          ⚠ {snapshot.detectedBottleneck}
        </div>
      )}
    </div>
  );
}
