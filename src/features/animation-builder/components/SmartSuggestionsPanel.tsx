import React from 'react';
import {
  SMART_ANIMATION_TEMPLATES,
  SmartAnimationTemplate,
} from '../../../core/engine/smartSuggestionsEngine';
import { ObjectAnimationModel } from '../../../core/engine/universalAnimationModel';

interface SmartSuggestionsPanelProps {
  onApplyTemplate: (template: SmartAnimationTemplate) => void;
}

export function SmartSuggestionsPanel({ onApplyTemplate }: SmartSuggestionsPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: '#090e1a',
        padding: 12,
        borderRadius: 10,
        border: '1px solid #1e293b',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#ec4899', fontSize: 12 }}>🪄</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
          1-Click Smart Templates
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SMART_ANIMATION_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
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
              <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>{tpl.name}</span>
              <button
                onClick={() => onApplyTemplate(tpl)}
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                  color: '#080d1a',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>
            <span style={{ fontSize: 9, color: '#94a3b8' }}>{tpl.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
