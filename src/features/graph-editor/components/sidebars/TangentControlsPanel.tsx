import React from 'react';
import { KeyframePoint, TangentType } from '../../types';
import { applyTangentType, calculateDelta } from '../../../../core/math/tangentMath';
import { applyEulerFilter, resolveGimbalLockTangents } from '../../../../core/math/eulerFilter';

interface TangentControlsPanelProps {
  selectedKeyframes: KeyframePoint[];
  allKeyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function TangentControlsPanel({
  selectedKeyframes,
  allKeyframes,
  onUpdateKeyframes,
}: TangentControlsPanelProps) {
  const hasSelection = selectedKeyframes.length > 0;

  const handleApplyTangent = (type: TangentType) => {
    if (!hasSelection) return;
    const sorted = [...allKeyframes].sort((a, b) => a.time - b.time);

    const updated = sorted.map((kf, i) => {
      if (selectedKeyframes.some((sk) => sk.id === kf.id)) {
        const prev = i > 0 ? sorted[i - 1] : null;
        const next = i < sorted.length - 1 ? sorted[i + 1] : null;
        return applyTangentType(kf, type, prev, next);
      }
      return kf;
    });

    onUpdateKeyframes(updated);
  };

  // 1. Align all selected tangents horizontal
  const handleAlignHorizontal = () => {
    if (!hasSelection) return;
    const updated = allKeyframes.map((kf) => {
      if (selectedKeyframes.some((sk) => sk.id === kf.id)) {
        const lenIn = kf.handleIn?.length || 15;
        const lenOut = kf.handleOut?.length || 15;
        return {
          ...kf,
          type: 'bezier' as const,
          handleIn: { x: -lenIn, y: 0, angle: 180, length: lenIn },
          handleOut: { x: lenOut, y: 0, angle: 0, length: lenOut },
        };
      }
      return kf;
    });
    onUpdateKeyframes(updated);
  };

  // 2. Match tangent slope across all selected keyframes
  const handleMatchSlope = () => {
    if (selectedKeyframes.length < 2) return;
    const sortedSel = [...selectedKeyframes].sort((a, b) => a.time - b.time);
    const overallSlope =
      (sortedSel[sortedSel.length - 1].value - sortedSel[0].value) /
      (sortedSel[sortedSel.length - 1].time - sortedSel[0].time || 1);

    const updated = allKeyframes.map((kf) => {
      if (selectedKeyframes.some((sk) => sk.id === kf.id)) {
        const lenIn = kf.handleIn?.length || 12;
        const lenOut = kf.handleOut?.length || 12;
        const dxIn = -lenIn * 0.8;
        const dyIn = -overallSlope * dxIn;
        const dxOut = lenOut * 0.8;
        const dyOut = overallSlope * dxOut;

        return {
          ...kf,
          type: 'bezier' as const,
          handleIn: { x: dxIn, y: dyIn, length: lenIn },
          handleOut: { x: dxOut, y: dyOut, length: lenOut },
        };
      }
      return kf;
    });
    onUpdateKeyframes(updated);
  };

  // 3. Equalize handle lengths (uniform radius)
  const handleEqualizeLengths = (targetLen = 15) => {
    if (!hasSelection) return;
    const updated = allKeyframes.map((kf) => {
      if (selectedKeyframes.some((sk) => sk.id === kf.id)) {
        const inAngle = kf.handleIn?.angle ?? 180;
        const outAngle = kf.handleOut?.angle ?? 0;
        const dIn = calculateDelta(inAngle, targetLen);
        const dOut = calculateDelta(outAngle, targetLen);

        return {
          ...kf,
          handleIn: { x: dIn.x, y: dIn.y, angle: inAngle, length: targetLen },
          handleOut: { x: dOut.x, y: dOut.y, angle: outAngle, length: targetLen },
          symmetrical: true,
        };
      }
      return kf;
    });
    onUpdateKeyframes(updated);
  };

  // 4. Euler Filter (unwraps 360° phase flips)
  const handleEulerFilter = () => {
    const { keyframes: filtered } = applyEulerFilter(allKeyframes);
    onUpdateKeyframes(filtered);
  };

  // 5. Gimbal Lock Normalizer
  const handleResolveGimbal = () => {
    const resolved = resolveGimbalLockTangents(allKeyframes);
    onUpdateKeyframes(resolved);
  };

  const handleToggleSymmetry = () => {
    if (!hasSelection) return;
    const updated = allKeyframes.map((kf) => {
      if (selectedKeyframes.some((sk) => sk.id === kf.id)) {
        return { ...kf, symmetrical: !kf.symmetrical };
      }
      return kf;
    });
    onUpdateKeyframes(updated);
  };

  const handleResetHandles = () => {
    if (!hasSelection) return;
    const updated = allKeyframes.map((kf) => {
      if (selectedKeyframes.some((sk) => sk.id === kf.id)) {
        return {
          ...kf,
          handleIn: { x: -15, y: 0, angle: 180, length: 15 },
          handleOut: { x: 15, y: 0, angle: 0, length: 15 },
          symmetrical: true,
        };
      }
      return kf;
    });
    onUpdateKeyframes(updated);
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
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>∿</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Tangent & Handle Controls
          </span>
        </div>
      </div>

      {/* Tangent Mode Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { id: 'auto', label: 'Auto Ease', icon: '◇', desc: 'Auto smooth without overshoot' },
          { id: 'flat', label: 'Flat Tangent', icon: '—', desc: 'Horizontal zero slope' },
          { id: 'linear', label: 'Linear Direct', icon: '◆', desc: 'Straight line between points' },
          { id: 'continuous', label: 'Continuous', icon: '∿', desc: 'Smooth angle-locked handles' },
          { id: 'broken', label: 'Broken / Corner', icon: '∠', desc: 'Independent sharp handles' },
          { id: 'free', label: 'Free Tangent', icon: '☍', desc: 'Unconstrained manipulation' },
        ].map((btn) => (
          <button
            key={btn.id}
            disabled={!hasSelection}
            onClick={() => handleApplyTangent(btn.id as TangentType)}
            style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: hasSelection ? '#f1f5f9' : '#475569',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: hasSelection ? 'pointer' : 'default',
              textAlign: 'left',
            }}
            title={btn.desc}
          >
            <span style={{ color: '#38bdf8' }}>{btn.icon}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Alignment Actions (Feature 1) */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Tangent Alignment
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button
            disabled={!hasSelection}
            onClick={handleAlignHorizontal}
            style={{
              padding: '5px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              color: hasSelection ? '#38bdf8' : '#475569',
              border: '1px solid #1e293b',
              borderRadius: 6,
              cursor: hasSelection ? 'pointer' : 'default',
            }}
            title="Make all selected handles horizontal (zero slope)"
          >
            ↔ Horizontal
          </button>

          <button
            disabled={selectedKeyframes.length < 2}
            onClick={handleMatchSlope}
            style={{
              padding: '5px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              color: selectedKeyframes.length >= 2 ? '#38bdf8' : '#475569',
              border: '1px solid #1e293b',
              borderRadius: 6,
              cursor: selectedKeyframes.length >= 2 ? 'pointer' : 'default',
            }}
            title="Match average slope across selected keyframes"
          >
            ⇗ Match Slopes
          </button>

          <button
            disabled={!hasSelection}
            onClick={() => handleEqualizeLengths(16)}
            style={{
              padding: '5px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              color: hasSelection ? '#f1f5f9' : '#475569',
              border: '1px solid #1e293b',
              borderRadius: 6,
              cursor: hasSelection ? 'pointer' : 'default',
            }}
            title="Equalize handle lengths to uniform size"
          >
            ⚖ Equalize Lengths
          </button>

          <button
            disabled={!hasSelection}
            onClick={handleToggleSymmetry}
            style={{
              padding: '5px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: selectedKeyframes.some((k) => k.symmetrical) ? '#1e3a8a' : '#11182c',
              color: selectedKeyframes.some((k) => k.symmetrical) ? '#38bdf8' : '#94a3b8',
              border: '1px solid #1e293b',
              borderRadius: 6,
              cursor: hasSelection ? 'pointer' : 'default',
            }}
          >
            Mirror Symmetrical
          </button>
        </div>
      </div>

      {/* Rotation Specializations: Euler Filter & Gimbal Resolver (Feature 6) */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Rotation & Gimbal Math
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button
            onClick={handleEulerFilter}
            style={{
              padding: '5px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              color: '#a855f7',
              border: '1px solid #3b0764',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            title="Unwrap 360° phase flips on rotation curves"
          >
            🌀 Euler Filter
          </button>

          <button
            onClick={handleResolveGimbal}
            style={{
              padding: '5px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              color: '#a855f7',
              border: '1px solid #3b0764',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            title="Resolve gimbal singularities near ±90°"
          >
            ⎊ Fix Gimbal Lock
          </button>
        </div>
      </div>
    </div>
  );
}
