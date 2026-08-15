import React, { useState, useMemo } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  AnimationGitManager,
  calculateMotionDiff,
  MotionBranch,
} from '../../../core/git/animationGitEngine';

interface AnimationGitViewProps {
  currentKeyframes: KeyframePoint[];
}

export function AnimationGitView({ currentKeyframes }: AnimationGitViewProps) {
  const gitManager = useMemo(() => {
    const mgr = new AnimationGitManager(currentKeyframes);
    mgr.createBranch('cinematic-drift', [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.4, y: 0.1 } },
      { id: 2, time: 60, value: 100, type: 'bezier', handleIn: { x: 0.2, y: 1.0 } },
    ], 'Lead Animator');
    mgr.createBranch('social-snappy', [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.15, y: 1.2 } },
      { id: 2, time: 20, value: 115, type: 'bezier', handleIn: { x: 0.2, y: 1.0 } },
      { id: 3, time: 35, value: 100, type: 'bezier', handleIn: { x: 0.4, y: 1.0 } },
    ], 'Motion Editor');
    return mgr;
  }, [currentKeyframes]);

  const [branches, setBranches] = useState<MotionBranch[]>(gitManager.getBranches());
  const [selectedBranch, setSelectedBranch] = useState<MotionBranch>(branches[1] || branches[0]);
  const [newBranchName, setNewBranchName] = useState<string>('');

  const diff = useMemo(() => {
    return calculateMotionDiff(currentKeyframes, selectedBranch.keyframes);
  }, [currentKeyframes, selectedBranch]);

  const handleCreateBranch = () => {
    if (!newBranchName) return;
    const created = gitManager.createBranch(newBranchName, currentKeyframes);
    setBranches(gitManager.getBranches());
    setSelectedBranch(created);
    setNewBranchName('');
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* Left Column: Branch Explorer */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🔀</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Animation Git & Motion Diff
          </span>
        </div>

        {/* Create Branch Input */}
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="text"
            placeholder="New branch name..."
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            style={{ flex: 1, background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px 6px', fontSize: 10, color: '#f8fafc' }}
          />
          <button
            onClick={handleCreateBranch}
            style={{ background: '#38bdf8', color: '#080d1a', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
          >
            + Branch
          </button>
        </div>

        {/* Branch List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBranch(b)}
              style={{
                background: selectedBranch.id === b.id ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                border: `1px solid ${selectedBranch.id === b.id ? '#38bdf8' : '#1e293b'}`,
                borderRadius: 6,
                padding: 8,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>⎇ {b.name}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{b.author}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Semantic Motion Diff Matrix */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          gap: 16,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 900, color: '#f8fafc' }}>
          Motion Diff: <span style={{ color: '#38bdf8' }}>main</span> ➔ <span style={{ color: '#10b981' }}>{selectedBranch.name}</span>
        </div>

        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 8, padding: 12, fontSize: 11, color: '#cbd5e1' }}>
          {diff.summary}
        </div>

        {/* Diff Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 10, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: '#64748b' }}>DURATION DELTA</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: diff.durationDeltaMs >= 0 ? '#38bdf8' : '#ec4899', marginTop: 2 }}>
              {diff.durationDeltaMs >= 0 ? `+${diff.durationDeltaMs}` : diff.durationDeltaMs}ms
            </div>
          </div>

          <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 10, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: '#64748b' }}>ENERGY DELTA</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: diff.energyDelta >= 0 ? '#10b981' : '#f59e0b', marginTop: 2 }}>
              {diff.energyDelta >= 0 ? `+${diff.energyDelta}` : diff.energyDelta}
            </div>
          </div>

          <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 10, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: '#64748b' }}>OVERSHOOT DELTA</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: diff.overshootDeltaPercent >= 0 ? '#ec4899' : '#38bdf8', marginTop: 2 }}>
              {diff.overshootDeltaPercent >= 0 ? `+${diff.overshootDeltaPercent}` : diff.overshootDeltaPercent}%
            </div>
          </div>

          <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 10, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: '#64748b' }}>PEAK VELOCITY</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: diff.peakVelocityDelta >= 0 ? '#38bdf8' : '#64748b', marginTop: 2 }}>
              {diff.peakVelocityDelta >= 0 ? `+${diff.peakVelocityDelta}` : diff.peakVelocityDelta}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
