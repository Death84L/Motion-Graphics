import React, { useState } from 'react';
import {
  DEFAULT_EVENT_BINDINGS,
  MotionEventBinding,
  MotionEventType,
} from '../../../core/events/motionTriggerEngine';

interface TriggerEventsPanelProps {
  onFireEvent: (eventType: MotionEventType) => void;
}

export function TriggerEventsPanel({ onFireEvent }: TriggerEventsPanelProps) {
  const [bindings, setBindings] = useState<MotionEventBinding[]>(DEFAULT_EVENT_BINDINGS);

  const handleToggleBinding = (id: string) => {
    setBindings(bindings.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#090e1a',
        padding: 12,
        borderRadius: 10,
        border: '1px solid #1e293b',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>⚡</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Event & Trigger System
          </span>
        </div>
        <span style={{ fontSize: 9, color: '#64748b' }}>Interactive Bindings</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {bindings.map((b) => (
          <div
            key={b.id}
            style={{
              background: '#11182c',
              border: `1px solid ${b.enabled ? '#10b98144' : '#1e293b'}`,
              borderRadius: 6,
              padding: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{b.eventType}</div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>
                ➔ {b.actionType} ({b.targetState})
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => onFireEvent(b.eventType)}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Fire
              </button>
              <button
                onClick={() => handleToggleBinding(b.id)}
                style={{
                  background: b.enabled ? '#1e293b' : '#080d1a',
                  color: b.enabled ? '#10b981' : '#64748b',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {b.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
