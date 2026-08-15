import React from 'react';
import {
  UniversalMotionControllerConfig,
  DEFAULT_MOTION_CONTROLLER,
} from '../../../core/controllers/motionControllerEngine';

interface UniversalControllersPanelProps {
  controller: UniversalMotionControllerConfig;
  onUpdateController: (updates: Partial<UniversalMotionControllerConfig>) => void;
}

export function UniversalControllersPanel({
  controller = DEFAULT_MOTION_CONTROLLER,
  onUpdateController,
}: UniversalControllersPanelProps) {
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
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🎛️</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Universal Master Controller
          </span>
        </div>
        <span style={{ fontSize: 9, color: '#64748b' }}>Multi-Channel Driver</span>
      </div>

      {/* Speed Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
          <span>Global Speed:</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{controller.speed.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.25"
          max="3.0"
          step="0.05"
          value={controller.speed}
          onChange={(e) => onUpdateController({ speed: parseFloat(e.target.value) })}
          style={{ width: '100%', accentColor: '#38bdf8' }}
        />
      </div>

      {/* Master Intensity Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
          <span>Master Intensity:</span>
          <span style={{ color: '#10b981', fontWeight: 700 }}>{controller.intensity.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="2.5"
          step="0.05"
          value={controller.intensity}
          onChange={(e) => onUpdateController({ intensity: parseFloat(e.target.value) })}
          style={{ width: '100%', accentColor: '#10b981' }}
        />
      </div>

      {/* Direction Angle Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
          <span>Motion Direction:</span>
          <span style={{ color: '#a855f7', fontWeight: 700 }}>{controller.directionAngle}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="5"
          value={controller.directionAngle}
          onChange={(e) => onUpdateController({ directionAngle: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: '#a855f7' }}
        />
      </div>

      {/* Randomness / Jitter Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
          <span>Randomness / Organic Drift:</span>
          <span style={{ color: '#ec4899', fontWeight: 700 }}>{controller.randomness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={controller.randomness}
          onChange={(e) => onUpdateController({ randomness: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: '#ec4899' }}
        />
      </div>

      {/* Channel Multipliers Matrix */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {controller.propertyWeights.map((w) => (
          <span
            key={w.property}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 9,
              color: '#94a3b8',
            }}
          >
            {w.property}: <strong style={{ color: '#38bdf8' }}>{w.weight}x</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
