import React, { useState, useMemo } from 'react';
import {
  UniversalConstraintDefinition,
  UniversalPropertyBinding,
  RigPreset,
  SAMPLE_RIG_PRESETS,
} from '../../../core/constraints/universalConstraintSchema';
import { IkRiggingEngine, IkSolveResult2D } from '../../../core/constraints/ikRiggingEngine';
import { PropertyBindingEngine } from '../../../core/constraints/propertyBindingEngine';
import { AutoRigEngine } from '../../../core/constraints/autoRigEngine';
import { INITIAL_UNIVERSAL_COMPOSITION } from '../../../core/timeline/universalTimelineSchema';

export function ConstraintRiggingStudioView() {
  const [selectedPreset, setSelectedPreset] = useState<RigPreset>(SAMPLE_RIG_PRESETS[0]);
  const [constraints, setConstraints] = useState<UniversalConstraintDefinition[]>(SAMPLE_RIG_PRESETS[0].constraints);
  const [bindings, setBindings] = useState<UniversalPropertyBinding[]>(SAMPLE_RIG_PRESETS[0].bindings);
  const [activeConstraintId, setActiveConstraintId] = useState<string>(SAMPLE_RIG_PRESETS[0].constraints[0]?.id || '');
  
  // Interactive IK Simulation Coordinates
  const [ikTargetPos, setIkTargetPos] = useState<{ x: number; y: number }>({ x: 220, y: 120 });
  const [ikFlip, setIkFlip] = useState<boolean>(false);
  const [ikWeight, setIkWeight] = useState<number>(1.0);

  // Auto-Rig UI Simulation State
  const [buttonText, setButtonText] = useState<string>('Get Started Now');

  // Compute 2-Bone IK Solution
  const ikSolveResult: IkSolveResult2D = useMemo(() => {
    const rawIk = IkRiggingEngine.solve2BoneIk({ x: 80, y: 80 }, ikTargetPos, 80, 70, ikFlip);
    const rawFk = {
      root: { x: 80, y: 80, angleDeg: 0 },
      elbow: { x: 160, y: 80, angleDeg: 0 },
      effector: { x: 230, y: 80, angleDeg: 0 },
      isReachable: true,
    };
    return IkRiggingEngine.blendFkIk(rawFk, rawIk, ikWeight);
  }, [ikTargetPos, ikFlip, ikWeight]);

  // Check Circular Dependencies
  const dependencyCheck = useMemo(() => {
    return PropertyBindingEngine.detectCircularBindings(bindings);
  }, [bindings]);

  // Handle 1-Click Auto-Rig
  const handleTriggerAutoRig = () => {
    const autoRig = AutoRigEngine.generateAutoRig(
      INITIAL_UNIVERSAL_COMPOSITION.tracks[1], // Container Card
      [INITIAL_UNIVERSAL_COMPOSITION.tracks[0]] // Text child
    );
    setSelectedPreset(autoRig);
    setConstraints(autoRig.constraints);
    setBindings(autoRig.bindings);
    setActiveConstraintId(autoRig.constraints[0]?.id || '');
  };

  const dynamicButtonWidth = Math.max(120, buttonText.length * 10 + 40);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: CONSTRAINT STACK & RIG PRESETS */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🦾</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Constraints & Rigging
          </span>
        </div>

        {/* 1-Click Auto Rig Button */}
        <button
          onClick={handleTriggerAutoRig}
          style={{
            background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
            color: '#080d1a',
            border: 'none',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
          }}
        >
          ✨ 1-Click Auto-Rig UI System
        </button>

        {/* Rig Presets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Rig Preset Templates
          </span>
          {SAMPLE_RIG_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset);
                  setConstraints(preset.constraints);
                  setBindings(preset.bindings);
                  setActiveConstraintId(preset.constraints[0]?.id || '');
                }}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{preset.description}</div>
              </div>
            );
          })}
        </div>

        {/* Active Constraints Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Constraint Stack ({constraints.length})
          </span>
          {constraints.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveConstraintId(c.id)}
              style={{
                background: activeConstraintId === c.id ? 'rgba(236, 72, 153, 0.15)' : '#11182c',
                border: `1px solid ${activeConstraintId === c.id ? '#ec4899' : '#1e293b'}`,
                borderRadius: 6,
                padding: '6px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{c.name}</div>
                <div style={{ fontSize: 8, color: '#64748b' }}>{c.category} • {c.space} space</div>
              </div>
              <span style={{ fontSize: 9, color: '#ec4899', fontWeight: 800 }}>{(c.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER COLUMN: INTERACTIVE RIG CANVAS & IK VIEWPORT */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Interactive Rig Viewport & IK Joint Solver
          </span>
          <span style={{ fontSize: 9, color: ikSolveResult.isReachable ? '#10b981' : '#ef4444', background: '#11182c', padding: '2px 6px', borderRadius: 4 }}>
            IK Status: {ikSolveResult.isReachable ? 'Reachable' : 'Target Out of Reach'}
          </span>
        </div>

        {/* 2-Bone IK Interactive Canvas */}
        <div
          style={{
            background: '#090e1a',
            border: '1px solid #1e293b',
            borderRadius: 10,
            height: '240px',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setIkTargetPos({
              x: Math.round(e.clientX - rect.left),
              y: Math.round(e.clientY - rect.top),
            });
          }}
        >
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Bone 1 (Root to Elbow) */}
            <line
              x1={ikSolveResult.root.x}
              y1={ikSolveResult.root.y}
              x2={ikSolveResult.elbow.x}
              y2={ikSolveResult.elbow.y}
              stroke="#38bdf8"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Bone 2 (Elbow to Effector) */}
            <line
              x1={ikSolveResult.elbow.x}
              y1={ikSolveResult.elbow.y}
              x2={ikSolveResult.effector.x}
              y2={ikSolveResult.effector.y}
              stroke="#ec4899"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Target Crosshair */}
            <circle cx={ikTargetPos.x} cy={ikTargetPos.y} r="8" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 2" />
            {/* Root Joint */}
            <circle cx={ikSolveResult.root.x} cy={ikSolveResult.root.y} r="6" fill="#ffffff" />
            {/* Elbow Joint */}
            <circle cx={ikSolveResult.elbow.x} cy={ikSolveResult.elbow.y} r="5" fill="#38bdf8" />
            {/* Effector Joint */}
            <circle cx={ikSolveResult.effector.x} cy={ikSolveResult.effector.y} r="6" fill="#ec4899" />
          </svg>

          <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 9, color: '#64748b' }}>
            Move mouse to manipulate 2-Bone IK Target effector in real time.
          </div>
        </div>

        {/* Responsive Auto-Layout UI Simulation */}
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc' }}>
            Responsive Layout Auto-Hug Simulation
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Edit Text:</span>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, color: '#38bdf8', padding: '4px 8px', fontSize: 11 }}
            />
          </div>

          {/* Simulated Responsive Button Card */}
          <div
            style={{
              width: `${dynamicButtonWidth}px`,
              height: '42px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.2))',
              border: '1px solid #38bdf8',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '0 16px',
              transition: 'width 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.25)',
            }}
          >
            <span style={{ color: '#38bdf8', fontSize: 14 }}>⚡</span>
            <span style={{ color: '#f8fafc', fontSize: 12, fontWeight: 800 }}>{buttonText}</span>
          </div>
          <div style={{ fontSize: 8, color: '#64748b' }}>
            Container dynamically scales width to {dynamicButtonWidth}px hugging content + 16px padding constraint.
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: PROPERTY BINDINGS & DEPENDENCY DEBUGGER */}
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
          Universal Property Bindings
        </div>

        {/* Dependency Health Check Banner */}
        <div
          style={{
            background: dependencyCheck.hasCycle ? '#881337' : '#064e3b',
            border: `1px solid ${dependencyCheck.hasCycle ? '#f43f5e' : '#10b981'}`,
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 9,
            color: dependencyCheck.hasCycle ? '#fecdd3' : '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{dependencyCheck.hasCycle ? '⚠️' : '✓'}</span>
          <span>
            {dependencyCheck.hasCycle
              ? `Circular Dependency: ${dependencyCheck.cycleNodes.join(' -> ')}`
              : 'Dependency Graph Clean: 0 Cycles Detected'}
          </span>
        </div>

        {/* IK Weight Slider */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>FK / IK Blend Weight:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>{(ikWeight * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={ikWeight}
            onChange={(e) => setIkWeight(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#cbd5e1', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={ikFlip}
              onChange={(e) => setIkFlip(e.target.checked)}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>Flip Elbow Direction</span>
          </label>
        </div>

        {/* Property Bindings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Active Property Drivers ({bindings.length})
          </span>
          {bindings.map((b) => (
            <div
              key={b.id}
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
              <div style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>{b.name}</div>
              <div style={{ fontSize: 8, color: '#94a3b8' }}>
                {b.sourceTrackId}.{b.sourceProperty} ➔ {b.targetTrackId}.{b.targetProperty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
