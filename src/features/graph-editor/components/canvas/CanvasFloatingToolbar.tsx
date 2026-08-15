import React from 'react';
import { KeyframePoint, GraphViewport, EasingType, KeyframeType } from '../../types';
import { applyTangentType } from '../../../../core/math/tangentMath';

interface CanvasFloatingToolbarProps {
  selectedKeyframes: KeyframePoint[];
  allKeyframes: KeyframePoint[];
  viewport: GraphViewport;
  width: number;
  height: number;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function CanvasFloatingToolbar({
  selectedKeyframes,
  allKeyframes,
  viewport,
  width,
  height,
  onUpdateKeyframes,
}: CanvasFloatingToolbarProps) {
  if (selectedKeyframes.length === 0) return null;

  const times = selectedKeyframes.map((k) => k.time);
  const values = selectedKeyframes.map((k) => k.value);
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const maxVal = Math.max(...values);

  const screenX = ((avgTime / 100) * width + viewport.x) * viewport.scaleX;
  const screenY = height / 2 - ((maxVal - 50) / 100) * height * 0.7 * viewport.scaleY + viewport.y - 40;

  const handleSetInterpolation = (type: KeyframeType, ease: EasingType) => {
    const selectedIds = selectedKeyframes.map((k) => k.id);
    const updated = allKeyframes.map((k) => {
      if (!selectedIds.includes(k.id)) return k;
      const modified = { ...k, type, ease };
      if (type === 'linear') return applyTangentType(modified, 'linear');
      if (type === 'auto') return applyTangentType(modified, 'auto');
      if (type === 'hold') return { ...modified, tangentType: 'flat' as const };
      return applyTangentType(modified, 'auto');
    });
    onUpdateKeyframes(updated);
  };

  return (
    <foreignObject
      x={Math.max(20, Math.min(width - 320, screenX - 150))}
      y={Math.max(10, screenY)}
      width={320}
      height={36}
      style={{ overflow: 'visible', pointerEvents: 'auto' }}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '3px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', padding: '0 4px' }}>EASE:</span>

        {[
          { label: 'Linear', type: 'linear' as const, ease: 'linear' as const, icon: '◆' },
          { label: 'Bezier', type: 'bezier' as const, ease: 'bezier' as const, icon: '●' },
          { label: 'Auto', type: 'auto' as const, ease: 'easeInOut' as const, icon: '◇' },
          { label: 'Hold', type: 'hold' as const, ease: 'hold' as const, icon: '■' },
          { label: 'In-Out', type: 'bezier' as const, ease: 'easeInOut' as const, icon: '∿' },
          { label: 'Out', type: 'bezier' as const, ease: 'easeOut' as const, icon: '⌝' },
          { label: 'In', type: 'bezier' as const, ease: 'easeIn' as const, icon: '⌞' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => handleSetInterpolation(item.type, item.ease)}
            style={{
              padding: '3px 6px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 4,
              color: '#f8fafc',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
            title={`Set ${item.label}`}
          >
            <span style={{ color: '#38bdf8' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </foreignObject>
  );
}
