import React, { useState } from 'react';
import { CurveLayer, KeyframePoint } from '../../types';
import {
  CurveDriverRelationship,
  DEFAULT_DRIVERS,
  computeDrivenCurve,
} from '../../../../core/drivers/curveDriverEngine';

interface CurveDriversPanelProps {
  curveLayers: CurveLayer[];
  onApplyDrivenCurve: (drivenLayerId: string, keyframes: KeyframePoint[]) => void;
}

export function CurveDriversPanel({ curveLayers, onApplyDrivenCurve }: CurveDriversPanelProps) {
  const [drivers, setDrivers] = useState<CurveDriverRelationship[]>(DEFAULT_DRIVERS);

  const handleUpdateDriver = (id: string, updates: Partial<CurveDriverRelationship>) => {
    const updated = drivers.map((d) => (d.id === id ? { ...d, ...updates } : d));
    setDrivers(updated);
  };

  const handleExecuteDriver = (rel: CurveDriverRelationship) => {
    const driverLayer = curveLayers.find((l) => l.id === rel.driverLayerId) || curveLayers[0];
    const drivenKeys = computeDrivenCurve(driverLayer.keyframes, rel);
    onApplyDrivenCurve(rel.drivenLayerId, drivenKeys);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#a855f7', fontSize: 13 }}>🔗</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Drivers & Layer Dependencies
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Drive child properties (Rotation, Opacity, Scale) automatically from master driver curves with math expressions and lag.
      </div>

      {/* Driver List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {drivers.map((drv) => (
          <div
            key={drv.id}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>
                {drv.driverPropertyName} ➔ <span style={{ color: '#a855f7' }}>{drv.drivenPropertyName}</span>
              </div>
              <button
                onClick={() => handleExecuteDriver(drv)}
                style={{
                  background: '#a855f7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sync Curve
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <span style={{ fontSize: 9, color: '#64748b' }}>MULTIPLIER</span>
                <input
                  type="number"
                  step="0.1"
                  value={drv.multiplier}
                  onChange={(e) => handleUpdateDriver(drv.id, { multiplier: parseFloat(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    background: '#080d1a',
                    border: '1px solid #1e293b',
                    borderRadius: 4,
                    color: '#38bdf8',
                    padding: '2px 4px',
                    fontSize: 10,
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: 9, color: '#64748b' }}>TIME LAG (FRAMES)</span>
                <input
                  type="number"
                  value={drv.timeLagFrames}
                  onChange={(e) => handleUpdateDriver(drv.id, { timeLagFrames: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    background: '#080d1a',
                    border: '1px solid #1e293b',
                    borderRadius: 4,
                    color: '#f8fafc',
                    padding: '2px 4px',
                    fontSize: 10,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
