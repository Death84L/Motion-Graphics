import React, { useState } from 'react';
import { SAMPLE_REFERENCE_CURVES, ReferenceMotionCurve, parseReferenceMotionData } from '../../../../core/math/referenceMotionOverlay';
import { KeyframePoint } from '../../types';
import { transferMotionFeel } from '../../../../core/math/motionMatchingEngine';

interface ReferenceMotionModalProps {
  isOpen: boolean;
  currentKeyframes: KeyframePoint[];
  onClose: () => void;
  onApplyMatchedKeyframes: (matchedKeyframes: KeyframePoint[]) => void;
}

export function ReferenceMotionModal({
  isOpen,
  currentKeyframes,
  onClose,
  onApplyMatchedKeyframes,
}: ReferenceMotionModalProps) {
  const [selectedRef, setSelectedRef] = useState<ReferenceMotionCurve>(SAMPLE_REFERENCE_CURVES[0]);
  const [customJson, setCustomJson] = useState<string>('');
  const [matchStrength, setMatchStrength] = useState<number>(0.85);

  if (!isOpen) return null;

  const handleMatch = () => {
    const matched = transferMotionFeel(selectedRef.keyframes, currentKeyframes, matchStrength);
    onApplyMatchedKeyframes(matched);
    onClose();
  };

  const handleLoadCustom = () => {
    const parsed = parseReferenceMotionData(customJson, 'Imported Reference');
    if (parsed) {
      setSelectedRef(parsed);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#090e1a',
          border: '1px solid #1e293b',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#38bdf8', fontSize: 16 }}>🎯</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
              Reference Motion Overlay & Kinematic Match
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 16, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          Transfer the kinetic easing and physical bounce from a reference curve onto your current animation.
        </div>

        {/* Reference Curve Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Built-in Reference Curves
          </span>
          {SAMPLE_REFERENCE_CURVES.map((rc) => (
            <div
              key={rc.id}
              onClick={() => setSelectedRef(rc)}
              style={{
                background: selectedRef.id === rc.id ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                border: `1px solid ${selectedRef.id === rc.id ? '#38bdf8' : '#1e293b'}`,
                borderRadius: 6,
                padding: 8,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>{rc.name}</span>
              <span style={{ fontSize: 9, color: rc.color }}>{rc.keyframes.length} Keyframes</span>
            </div>
          ))}
        </div>

        {/* Custom JSON Paste */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>PASTE JSON KEYFRAMES</span>
            {customJson && (
              <button
                onClick={handleLoadCustom}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: 9, cursor: 'pointer', fontWeight: 700 }}
              >
                Load Custom
              </button>
            )}
          </div>
          <textarea
            placeholder='[{"time": 0, "value": 0}, {"time": 0.5, "value": 100}]'
            value={customJson}
            onChange={(e) => setCustomJson(e.target.value)}
            rows={3}
            style={{ width: '100%', background: '#040711', border: '1px solid #1e293b', borderRadius: 6, color: '#f8fafc', padding: 6, fontSize: 10, fontFamily: 'monospace' }}
          />
        </div>

        {/* Match Strength Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Motion Match Transfer Strength:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{(matchStrength * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={matchStrength}
            onChange={(e) => setMatchStrength(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ background: '#11182c', border: '1px solid #1e293b', color: '#cbd5e1', borderRadius: 6, padding: '6px 14px', fontSize: 11, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleMatch}
            style={{ background: 'linear-gradient(135deg, #38bdf8, #2563eb)', color: '#080d1a', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
          >
            ✨ Match Reference
          </button>
        </div>
      </div>
    </div>
  );
}
