import React, { useState } from 'react';

export interface VersionSnapshot {
  id: string;
  name: string;
  timestamp: string;
  author: string;
  notes: string;
}

export const SAMPLE_VERSION_HISTORY: VersionSnapshot[] = [
  { id: 'v-1', name: 'v1.0 - Initial Draft', timestamp: '10:15 AM', author: 'Motion Designer', notes: 'Base slide animation without overshoot.' },
  { id: 'v-2', name: 'v1.1 - Added Harmonic Springs', timestamp: '11:30 AM', author: 'Motion Designer', notes: 'Tuned spring damping to 14 for snappy bounce.' },
  { id: 'v-3', name: 'v2.0 - Final Approved', timestamp: '01:45 PM', author: 'Art Director', notes: 'Balanced color glow and tracking expansion.' },
];

export function VersionReviewComparisonView() {
  const [versions] = useState<VersionSnapshot[]>(SAMPLE_VERSION_HISTORY);
  const [versionA, setVersionA] = useState<string>(SAMPLE_VERSION_HISTORY[0].id);
  const [versionB, setVersionB] = useState<string>(SAMPLE_VERSION_HISTORY[2].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* Synchronized Side-by-Side Viewport */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: 16,
          background: '#060913',
        }}
      >
        {/* Version A Card */}
        <div
          style={{
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            border: '1px solid #1e293b',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>
            VERSION A (Initial)
          </div>

          <div
            style={{
              width: 140,
              height: 80,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              border: '1px solid #38bdf888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            Linear Slide
          </div>

          <div style={{ fontSize: 9, color: '#64748b' }}>Smoothness: 78% | Jerk: Moderate</div>
        </div>

        {/* Version B Card */}
        <div
          style={{
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
            border: '1px solid #10b981',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 800, color: '#10b981' }}>
            VERSION B (Harmonic Spring Final)
          </div>

          <div
            style={{
              width: 140,
              height: 80,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #065f46, #047857)',
              border: '1px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#f8fafc',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            Elastic Spring Pop
          </div>

          <div style={{ fontSize: 9, color: '#10b981' }}>Smoothness: 96% | Jerk: Near-Zero</div>
        </div>
      </div>

      {/* Right Column: Version History Snapshot Log */}
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
          Version Snapshots & History
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {versions.map((v) => (
            <div
              key={v.id}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{v.name}</span>
                <span style={{ fontSize: 8, color: '#64748b' }}>{v.timestamp}</span>
              </div>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>{v.notes}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
