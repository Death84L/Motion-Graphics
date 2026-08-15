import React, { useState, useMemo } from 'react';
import { CurveLayer } from '../../graph-editor/types';
import {
  BatchProcessingParams,
  DEFAULT_BATCH_PARAMS,
  processLayerBatch,
  LayerTypeFilter,
} from '../../../core/batch/motionBatchProcessor';

interface MotionBatchProcessorViewProps {
  curveLayers: CurveLayer[];
  onApplyBatchLayers: (updatedLayers: CurveLayer[]) => void;
}

export function MotionBatchProcessorView({
  curveLayers,
  onApplyBatchLayers,
}: MotionBatchProcessorViewProps) {
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(curveLayers.map((l) => l.id));
  const [params, setParams] = useState<BatchProcessingParams>(DEFAULT_BATCH_PARAMS);
  const [typeFilter, setTypeFilter] = useState<LayerTypeFilter>('all');
  const [showPreview, setShowPreview] = useState<boolean>(true);

  const filteredLayers = useMemo(() => {
    return curveLayers.filter((l) => typeFilter === 'all' || l.property === typeFilter);
  }, [curveLayers, typeFilter]);

  const { updatedLayers, previews } = useMemo(() => {
    return processLayerBatch(curveLayers, selectedLayerIds, params);
  }, [curveLayers, selectedLayerIds, params]);

  const handleToggleSelectAll = () => {
    if (selectedLayerIds.length === filteredLayers.length) {
      setSelectedLayerIds([]);
    } else {
      setSelectedLayerIds(filteredLayers.map((l) => l.id));
    }
  };

  const handleApply = () => {
    onApplyBatchLayers(updatedLayers);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* Column 1: Multi-Layer Selection & Filtering */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 10,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🧩</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Motion Batch Processor
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['all', 'translate-x', 'translate-y', 'scale', 'rotate', 'opacity'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as LayerTypeFilter)}
              style={{
                padding: '3px 6px',
                fontSize: 9,
                fontWeight: typeFilter === t ? 800 : 500,
                background: typeFilter === t ? '#38bdf8' : '#11182c',
                color: typeFilter === t ? '#080d1a' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: 6 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            {selectedLayerIds.length} of {filteredLayers.length} selected
          </span>
          <button
            onClick={handleToggleSelectAll}
            style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}
          >
            {selectedLayerIds.length === filteredLayers.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Layer Checkbox List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
          {filteredLayers.map((l) => {
            const isSelected = selectedLayerIds.includes(l.id);
            return (
              <div
                key={l.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedLayerIds(selectedLayerIds.filter((id) => id !== l.id));
                  } else {
                    setSelectedLayerIds([...selectedLayerIds, l.id]);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: '#38bdf8' }} />
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{l.name}</div>
                  <div style={{ fontSize: 8, color: '#64748b' }}>{l.property} ({l.keyframes.length} keys)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2: Batch Preview & Comparison Matrix */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
            Batch Live Preview & Comparison Matrix
          </span>
          <span style={{ fontSize: 9, color: '#64748b', background: '#11182c', padding: '2px 6px', borderRadius: 4 }}>
            Non-Destructive Dry Run
          </span>
        </div>

        {/* Before vs After Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {previews.map((pv) => (
            <div
              key={pv.layerId}
              style={{
                background: '#090e1a',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: 10,
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>{pv.layerName}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>{pv.layerType}</div>
              </div>

              {/* Before Duration & Velocity Sparkline */}
              <div style={{ background: '#11182c', padding: 6, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#64748b' }}>
                  <span>BEFORE</span>
                  <span>{pv.originalDurationFrames}f</span>
                </div>
                <div style={{ height: 18, display: 'flex', alignItems: 'flex-end', gap: 2, marginTop: 4 }}>
                  {pv.beforeDerivatives.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${Math.min(100, Math.abs(d.velocity) * 20)}%`,
                        background: '#64748b',
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* After Duration & Velocity Sparkline */}
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: 6, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#38bdf8' }}>
                  <span>AFTER</span>
                  <span>{pv.newDurationFrames}f (+{params.staggerStepFrames}f stagger)</span>
                </div>
                <div style={{ height: 18, display: 'flex', alignItems: 'flex-end', gap: 2, marginTop: 4 }}>
                  {pv.afterDerivatives.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${Math.min(100, Math.abs(d.velocity) * 20)}%`,
                        background: '#38bdf8',
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3: Batch Operations Sliders & Apply */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          Batch Parameters
        </div>

        {/* Speed / Duration Scale */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Duration Multiplier:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{params.durationScale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={params.durationScale}
            onChange={(e) => setParams({ ...params, durationScale: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Stagger Step */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Stagger Step:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>+{params.staggerStepFrames} frames</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="2"
            value={params.staggerStepFrames}
            onChange={(e) => setParams({ ...params, staggerStepFrames: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        {/* Intensity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Intensity Multiplier:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{(params.intensityMultiplier * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={params.intensityMultiplier}
            onChange={(e) => setParams({ ...params, intensityMultiplier: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        {/* Spring Overshoot */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Add Spring Overshoot:</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>+{params.addSpringOvershootPercent || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="2"
            value={params.addSpringOvershootPercent || 0}
            onChange={(e) => setParams({ ...params, addSpringOvershootPercent: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>

        {/* Checkbox Toggles */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#cbd5e1', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={params.reverseTiming}
            onChange={(e) => setParams({ ...params, reverseTiming: e.target.checked })}
            style={{ accentColor: '#38bdf8' }}
          />
          <span>Reverse Timing Sequence</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#cbd5e1', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={params.smoothTangents}
            onChange={(e) => setParams({ ...params, smoothTangents: e.target.checked })}
            style={{ accentColor: '#38bdf8' }}
          />
          <span>Smooth Tangents (Jerk Reduction)</span>
        </label>

        <button
          onClick={handleApply}
          style={{
            background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
            color: '#080d1a',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 11,
            fontWeight: 900,
            cursor: 'pointer',
            marginTop: 'auto',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
          }}
        >
          ✨ Apply to {selectedLayerIds.length} Layers
        </button>
      </div>
    </div>
  );
}
