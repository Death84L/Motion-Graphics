import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  CurveConstraints,
  DEFAULT_CURVE_CONSTRAINTS,
  enforceCurveConstraints,
} from '../../../../core/solvers/curveConstraints';
import {
  solveOptimalTangents,
  TangentSolverObjective,
} from '../../../../core/solvers/tangentAutoSolver';

interface CurveConstraintsPanelProps {
  keyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function CurveConstraintsPanel({
  keyframes,
  onUpdateKeyframes,
}: CurveConstraintsPanelProps) {
  const [constraints, setConstraints] = useState<CurveConstraints>(DEFAULT_CURVE_CONSTRAINTS);

  const handleToggleConstraint = (key: keyof CurveConstraints) => {
    const updated = { ...constraints, [key]: !constraints[key] };
    setConstraints(updated);
    const enforced = enforceCurveConstraints(keyframes, updated);
    onUpdateKeyframes(enforced);
  };

  const handleSolveObjective = (objective: TangentSolverObjective) => {
    const solved = solveOptimalTangents(keyframes, objective);
    onUpdateKeyframes(solved);
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
        <span style={{ color: '#38bdf8', fontSize: 13 }}>⚖️</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Constraints & Auto-Solver</span>
      </div>

      {/* 1. Mathematical Hard Constraints */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>GRAPH CONSTRAINTS</span>

        {[
          { key: 'startZeroVelocity' as const, label: 'Start Velocity = 0 (Rest)' },
          { key: 'endZeroVelocity' as const, label: 'End Velocity = 0 (Smooth Settle)' },
          { key: 'noOvershoot' as const, label: 'No Overshoot (Clamp 0-100%)' },
          { key: 'monotonic' as const, label: 'Monotonic (Strictly increasing)' },
        ].map((item) => (
          <label
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: '#f8fafc',
              cursor: 'pointer',
              background: '#11182c',
              padding: '6px 8px',
              borderRadius: 6,
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(constraints[item.key])}
              onChange={() => handleToggleConstraint(item.key)}
              style={{ accentColor: '#38bdf8' }}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      {/* 2. Tangent Auto-Solver */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>TANGENT AUTO-SOLVER</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { id: 'smoothest' as const, label: 'Smoothest' },
            { id: 'least-jerk' as const, label: 'Least Jerk' },
            { id: 'least-acceleration' as const, label: 'Least Accel' },
            { id: 'no-overshoot' as const, label: 'No Overshoot' },
          ].map((obj) => (
            <button
              key={obj.id}
              onClick={() => handleSolveObjective(obj.id)}
              style={{
                padding: '6px 8px',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                color: '#38bdf8',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Solve: {obj.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
