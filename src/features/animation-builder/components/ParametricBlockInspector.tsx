import React from 'react';
import { ParametricBlockConfig, BlockBlendMode } from '../../../core/engine/universalAnimationModel';
import { EasingType } from '../../graph-editor/types';

interface ParametricBlockInspectorProps {
  block: ParametricBlockConfig | null;
  onUpdateBlock: (updates: Partial<ParametricBlockConfig>) => void;
}

export function ParametricBlockInspector({
  block,
  onUpdateBlock,
}: ParametricBlockInspectorProps) {
  if (!block) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 11, textAlign: 'center' }}>
        Select an animation block from the stage timeline to inspect and tune parameters.
      </div>
    );
  }

  const handleParamChange = (paramKey: string, value: number) => {
    onUpdateBlock({
      params: {
        ...block.params,
        [paramKey]: value,
      },
    });
  };

  const handleRandomize = () => {
    onUpdateBlock({
      intensity: Math.round((0.8 + Math.random() * 0.8) * 10) / 10,
      params: {
        ...block.params,
        stiffness: Math.round(100 + Math.random() * 150),
        damping: Math.round(8 + Math.random() * 16),
        overshootPercent: Math.round(10 + Math.random() * 25),
      },
    });
  };

  const handleReset = () => {
    onUpdateBlock({
      intensity: 1.0,
      startValue: 0,
      targetValue: 100,
      params: {
        stiffness: 140,
        damping: 12,
        mass: 1.0,
        overshootPercent: 15,
        amplitude: 10,
        frequency: 2.5,
      },
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#090e1a',
        padding: 14,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
            {block.category} block
          </span>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', marginTop: 1 }}>{block.name}</div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleRandomize}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 4,
              color: '#a855f7',
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 6px',
              cursor: 'pointer',
            }}
            title="Randomize Parameters"
          >
            🎲 Dice
          </button>
          <button
            onClick={handleReset}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 4,
              color: '#64748b',
              fontSize: 10,
              padding: '3px 6px',
              cursor: 'pointer',
            }}
            title="Reset Defaults"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Target Properties Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {block.targetProperties.map((p) => (
          <span
            key={p}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Timing Controls (Start, Duration, Delay) */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>START (f)</span>
          <input
            type="number"
            value={block.startFrame}
            onChange={(e) => onUpdateBlock({ startFrame: parseInt(e.target.value) || 0 })}
            style={{ width: '100%', background: '#080d1a', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 4px', fontSize: 10, color: '#f8fafc' }}
          />
        </div>

        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>DUR (f)</span>
          <input
            type="number"
            value={block.durationFrames}
            onChange={(e) => onUpdateBlock({ durationFrames: parseInt(e.target.value) || 1 })}
            style={{ width: '100%', background: '#080d1a', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 4px', fontSize: 10, color: '#f8fafc' }}
          />
        </div>

        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>DELAY (f)</span>
          <input
            type="number"
            value={block.delayFrames}
            onChange={(e) => onUpdateBlock({ delayFrames: parseInt(e.target.value) || 0 })}
            style={{ width: '100%', background: '#080d1a', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 4px', fontSize: 10, color: '#f8fafc' }}
          />
        </div>
      </div>

      {/* Easing & Blend Mode */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>STAGE EASING</span>
          <select
            value={block.ease}
            onChange={(e) => onUpdateBlock({ ease: e.target.value as EasingType })}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px', fontSize: 10, color: '#38bdf8' }}
          >
            <option value="easeInOut">Ease In Out</option>
            <option value="easeOut">Ease Out</option>
            <option value="easeIn">Ease In</option>
            <option value="back">Back (Overshoot)</option>
            <option value="spring">Spring</option>
            <option value="elastic">Elastic</option>
            <option value="bounce">Bounce</option>
            <option value="linear">Linear</option>
          </select>
        </div>

        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>BLEND MODE</span>
          <select
            value={block.blendMode}
            onChange={(e) => onUpdateBlock({ blendMode: e.target.value as BlockBlendMode })}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px', fontSize: 10, color: '#ec4899' }}
          >
            <option value="replace">Replace</option>
            <option value="additive">Additive (+)</option>
            <option value="multiply">Multiply (×)</option>
            <option value="overlay">Overlay</option>
          </select>
        </div>
      </div>

      {/* Intensity Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
          <span>Motion Intensity:</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{block.intensity.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="2.5"
          step="0.1"
          value={block.intensity}
          onChange={(e) => onUpdateBlock({ intensity: parseFloat(e.target.value) })}
          style={{ width: '100%', accentColor: '#38bdf8' }}
        />
      </div>

      {/* Dynamic Physics / Procedural Sliders */}
      {block.params.stiffness !== undefined && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Spring Stiffness:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{block.params.stiffness}</span>
          </div>
          <input
            type="range"
            min="40"
            max="300"
            value={block.params.stiffness}
            onChange={(e) => handleParamChange('stiffness', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>
      )}

      {block.params.damping !== undefined && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Spring Damping:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{block.params.damping}</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={block.params.damping}
            onChange={(e) => handleParamChange('damping', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>
      )}

      {block.params.overshootPercent !== undefined && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Overshoot Magnitude:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>+{block.params.overshootPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={block.params.overshootPercent}
            onChange={(e) => handleParamChange('overshootPercent', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>
      )}

      {block.params.frequency !== undefined && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Frequency (Hz):</span>
            <span style={{ color: '#a855f7', fontWeight: 700 }}>{block.params.frequency}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="8.0"
            step="0.5"
            value={block.params.frequency}
            onChange={(e) => handleParamChange('frequency', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#a855f7' }}
          />
        </div>
      )}

      {/* Loop & Ping-Pong Toggles */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', gap: 6 }}>
        <button
          onClick={() => onUpdateBlock({ pingPong: !block.pingPong })}
          style={{
            flex: 1,
            padding: '4px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            background: block.pingPong ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
            border: `1px solid ${block.pingPong ? '#38bdf8' : '#1e293b'}`,
            color: block.pingPong ? '#38bdf8' : '#64748b',
            cursor: 'pointer',
          }}
        >
          ⇄ Ping-Pong
        </button>

        <button
          onClick={() => onUpdateBlock({ reverse: !block.reverse })}
          style={{
            flex: 1,
            padding: '4px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            background: block.reverse ? 'rgba(236, 72, 153, 0.2)' : '#11182c',
            border: `1px solid ${block.reverse ? '#ec4899' : '#1e293b'}`,
            color: block.reverse ? '#ec4899' : '#64748b',
            cursor: 'pointer',
          }}
        >
          ↺ Invert Direction
        </button>
      </div>
    </div>
  );
}
