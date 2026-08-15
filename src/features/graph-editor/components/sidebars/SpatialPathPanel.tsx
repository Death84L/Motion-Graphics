import React from 'react';
import { KeyframePoint } from '../../types';
import { CanvasSpatialMotionPath } from '../canvas/CanvasSpatialMotionPath';
import { evaluateVectorKinematicsAtTime } from '../../../../core/spatial/vectorGraphMath';
import { reparameterizeForConstantSpeed } from '../../../../core/spatial/arcLengthParam';
import { reverseSpatialPath, offsetSpatialPath, buildSpatialPathNodes, syncSpatialNodesToKeyframes } from '../../../../core/spatial/motionPathEngine';

interface SpatialPathPanelProps {
  xKeyframes: KeyframePoint[];
  yKeyframes: KeyframePoint[];
  currentTime: number;
  onUpdateSpatialKeyframes: (xKeyframes: KeyframePoint[], yKeyframes: KeyframePoint[]) => void;
}

export function SpatialPathPanel({
  xKeyframes,
  yKeyframes,
  currentTime,
  onUpdateSpatialKeyframes,
}: SpatialPathPanelProps) {
  const kinematics = evaluateVectorKinematicsAtTime(xKeyframes, yKeyframes, currentTime);

  const handleEnforceConstantSpeed = () => {
    const res = reparameterizeForConstantSpeed(xKeyframes, yKeyframes);
    onUpdateSpatialKeyframes(res.xKeyframes, res.yKeyframes);
  };

  const handleReversePath = () => {
    const nodes = buildSpatialPathNodes(xKeyframes, yKeyframes);
    const reversed = reverseSpatialPath(nodes);
    const { xKeyframes: newX, yKeyframes: newY } = syncSpatialNodesToKeyframes(reversed);
    onUpdateSpatialKeyframes(newX, newY);
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
        <span style={{ color: '#38bdf8', fontSize: 13 }}>🧭</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>2D Spatial Motion Path</span>
      </div>

      {/* 2D Spatial Motion Canvas */}
      <CanvasSpatialMotionPath
        xKeyframes={xKeyframes}
        yKeyframes={yKeyframes}
        currentTime={currentTime}
        width={270}
        height={180}
        onUpdateSpatialKeyframes={onUpdateSpatialKeyframes}
      />

      {/* Vector Kinematics Readout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b', fontSize: 10 }}>
        <div>
          <span style={{ color: '#64748b' }}>Magnitude:</span> <strong style={{ color: '#38bdf8' }}>{kinematics.magnitude}px</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Direction:</span> <strong style={{ color: '#ec4899' }}>{kinematics.angleDeg}°</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Path Velocity:</span> <strong style={{ color: '#10b981' }}>{kinematics.velocity}px/s</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Path Accel:</span> <strong style={{ color: '#f59e0b' }}>{kinematics.acceleration}px/s²</strong>
        </div>
      </div>

      {/* Spatial Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          onClick={handleEnforceConstantSpeed}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            color: '#38bdf8',
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ⚡ Constant Speed
        </button>

        <button
          onClick={handleReversePath}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            color: '#f8fafc',
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ⇄ Reverse Path
        </button>
      </div>
    </div>
  );
}
