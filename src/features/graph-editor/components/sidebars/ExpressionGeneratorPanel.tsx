import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  bakeExpressionToKeyframes,
  POPULAR_EXPRESSIONS,
} from '../../../../core/procedural/expressionEngine';

interface ExpressionGeneratorPanelProps {
  onApplyExpressionKeyframes: (keyframes: KeyframePoint[]) => void;
}

export function ExpressionGeneratorPanel({
  onApplyExpressionKeyframes,
}: ExpressionGeneratorPanelProps) {
  const [formula, setFormula] = useState('Math.sin((t / 100) * Math.PI * 4) * 40 + 50');

  const handleBake = () => {
    if (!formula.trim()) return;
    const baked = bakeExpressionToKeyframes(formula);
    onApplyExpressionKeyframes(baked);
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
        <span style={{ color: '#38bdf8', fontSize: 13 }}>∑</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Expression / Formula Curve</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Generate motion curves procedurally from JavaScript math expressions.
      </div>

      <textarea
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          background: '#11182c',
          border: '1px solid #1e293b',
          borderRadius: 6,
          padding: '6px 8px',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
          color: '#38bdf8',
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={handleBake}
        style={{
          background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
          color: '#041124',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ✨ Bake Expression to Keyframes
      </button>

      {/* Preset Formulas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>FORMULA PRESETS</span>
        {POPULAR_EXPRESSIONS.map((expr) => (
          <div
            key={expr.name}
            onClick={() => setFormula(expr.formula)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '5px 8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{expr.name}</span>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>{expr.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
