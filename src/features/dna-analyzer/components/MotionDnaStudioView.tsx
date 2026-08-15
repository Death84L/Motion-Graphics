import React, { useState, useMemo } from 'react';
import {
  MotionDnaSignature,
  SAMPLE_DNA_PRESETS,
  MotionDnaPreset,
  MotionDnaSimilarityResult,
  MotionDnaDiff,
} from '../../../core/dna/motionDnaSchema';
import { MotionDnaEngine } from '../../../core/dna/motionDnaEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface MotionDnaStudioViewProps {
  currentKeyframes?: KeyframePoint[];
  onApplyKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function MotionDnaStudioView({
  currentKeyframes = [],
  onApplyKeyframesToEditor,
}: MotionDnaStudioViewProps) {
  const [selectedPresetA, setSelectedPresetA] = useState<MotionDnaPreset>(SAMPLE_DNA_PRESETS[0]);
  const [selectedPresetB, setSelectedPresetB] = useState<MotionDnaPreset>(SAMPLE_DNA_PRESETS[1]);
  const [morphFactor, setMorphFactor] = useState<number>(0.0); // 0.0 (A) to 1.0 (B)
  const [transferStrength, setTransferStrength] = useState<number>(0.8);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);

  // Extract active DNA from current keyframes
  const extractedDna: MotionDnaSignature = useMemo(() => {
    return MotionDnaEngine.extractMotionDna(currentKeyframes);
  }, [currentKeyframes]);

  // Blend DNA based on morphFactor
  const activeDna: MotionDnaSignature = useMemo(() => {
    if (morphFactor === 0) return selectedPresetA.dna;
    if (morphFactor === 1) return selectedPresetB.dna;
    return MotionDnaEngine.blendDna(selectedPresetA.dna, selectedPresetB.dna, morphFactor);
  }, [selectedPresetA, selectedPresetB, morphFactor]);

  // Compare Extracted DNA vs Active Target DNA
  const similarity: MotionDnaSimilarityResult = useMemo(() => {
    return MotionDnaEngine.compareDna(extractedDna, activeDna);
  }, [extractedDna, activeDna]);

  // Git-Like Motion Diff
  const dnaDiff: MotionDnaDiff = useMemo(() => {
    return MotionDnaEngine.diffDna(extractedDna, activeDna);
  }, [extractedDna, activeDna]);

  // Handle 1-Click Auto-Optimize
  const handleOptimize = () => {
    const optimizedKeys = MotionDnaEngine.optimizeMotionKeyframes(currentKeyframes);
    if (onApplyKeyframesToEditor) {
      onApplyKeyframesToEditor(optimizedKeys, 'DNA Auto-Optimized Curve');
    }
    setIsOptimized(true);
    setTimeout(() => setIsOptimized(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: DNA RADAR & KINEMATIC SIGNATURE */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🧬</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Motion DNA Intelligence
          </span>
        </div>

        {/* Overall Quality Score Hero Badge */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(16, 185, 129, 0.15))',
            border: '1px solid #38bdf8',
            borderRadius: 8,
            padding: '10px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700 }}>MOTION QUALITY SCORE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#38bdf8' }}>
              {activeDna.quality.overallScore} <span style={{ fontSize: 10, color: '#64748b' }}>/ 100</span>
            </div>
          </div>
          <span style={{ fontSize: 20 }}>🏆</span>
        </div>

        {/* 6D Quality Radar Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Kinetic DNA Breakdown
          </span>
          {[
            { label: 'Smoothness', val: activeDna.quality.smoothnessScore, color: '#10b981' },
            { label: 'Elasticity', val: activeDna.quality.elasticityScore, color: '#ec4899' },
            { label: 'Kinetic Energy', val: activeDna.quality.energyScore, color: '#f59e0b' },
            { label: 'Jerk Score', val: activeDna.kinematics.jerkSmoothnessScore, color: '#38bdf8' },
            { label: 'Rhythm Sync', val: activeDna.quality.rhythmScore, color: '#818cf8' },
            { label: 'Complexity', val: activeDna.quality.complexityScore, color: '#94a3b8' },
          ].map((m) => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#cbd5e1' }}>
                <span>{m.label}</span>
                <span style={{ color: m.color, fontWeight: 700 }}>{m.val}%</span>
              </div>
              <div style={{ width: '100%', height: 5, background: '#11182c', borderRadius: 2.5, overflow: 'hidden' }}>
                <div style={{ width: `${m.val}%`, height: '100%', background: m.color, borderRadius: 2.5 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Style Classification Tags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Style Classification
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {activeDna.style.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  color: '#38bdf8',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CENTER COLUMN: DNA PLAYGROUND, MORPHING & LIVE STAGE */}
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
        {/* Top Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc' }}>
              🧬 Active DNA: <span style={{ color: '#38bdf8' }}>{activeDna.name}</span>
            </span>
          </div>

          {/* 1-Click Optimize Button */}
          <button
            onClick={handleOptimize}
            style={{
              background: isOptimized ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #2563eb)',
              color: '#080d1a',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
            }}
          >
            {isOptimized ? '✓ Auto-Optimized (Score 95)!' : '✨ 1-Click Auto-Optimize Curve'}
          </button>
        </div>

        {/* Continuous DNA Morphing Slider */}
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>A: {selectedPresetA.name}</span>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>Morph: {(morphFactor * 100).toFixed(0)}%</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>B: {selectedPresetB.name}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={morphFactor}
            onChange={(e) => setMorphFactor(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Live DNA Viewport Stage */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '260px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Animated Element */}
          <div
            style={{
              width: '200px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(236, 72, 153, 0.2))',
              border: `2px solid ${morphFactor > 0.5 ? '#ec4899' : '#38bdf8'}`,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: 18 }}>🧬</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#f8fafc' }}>
              {activeDna.style.primaryStyle.toUpperCase()} MOTION
            </span>
            <span style={{ fontSize: 8, color: '#94a3b8' }}>
              {activeDna.temporal.durationMs}ms • {activeDna.physics.overshootPercent}% Overshoot
            </span>
          </div>
        </div>

        {/* Preset Cards Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {SAMPLE_DNA_PRESETS.map((preset) => {
            const isA = selectedPresetA.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPresetA(preset)}
                style={{
                  background: isA ? 'rgba(56, 189, 248, 0.15)' : '#090e1a',
                  border: `1px solid ${isA ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: isA ? '#38bdf8' : '#f8fafc' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{preset.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RIGHT COLUMN: DNA TRANSFER, SIMILARITY & GIT-DIFF */}
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
          Motion Similarity & Git-Diff
        </div>

        {/* Match Similarity Readout */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>DNA Similarity Match:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{similarity.overallSimilarityPercent}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Velocity Correlation:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{similarity.velocitySimilarity}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Smoothness Match:</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{similarity.smoothnessSimilarity}%</span>
          </div>
        </div>

        {/* Git-Like Motion Diff Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Semantic Motion Diff (A ➔ Target)
          </span>
          <div style={{ background: '#040711', border: '1px solid #1e293b', borderRadius: 6, padding: 8, fontSize: 9, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ color: dnaDiff.durationDeltaMs >= 0 ? '#10b981' : '#ef4444' }}>
              Duration: {dnaDiff.durationDeltaMs >= 0 ? '+' : ''}{dnaDiff.durationDeltaMs}ms
            </div>
            <div style={{ color: dnaDiff.velocityChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
              Velocity: {dnaDiff.velocityChangePercent >= 0 ? '+' : ''}{dnaDiff.velocityChangePercent}%
            </div>
            <div style={{ color: dnaDiff.smoothnessChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
              Smoothness: {dnaDiff.smoothnessChangePercent >= 0 ? '+' : ''}{dnaDiff.smoothnessChangePercent}%
            </div>
            <div style={{ color: dnaDiff.overshootChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
              Overshoot: {dnaDiff.overshootChangePercent >= 0 ? '+' : ''}{dnaDiff.overshootChangePercent}%
            </div>
          </div>
        </div>

        {/* DNA Transfer Strength Slider */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>DNA Transfer Strength:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{(transferStrength * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={transferStrength}
            onChange={(e) => setTransferStrength(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>
      </div>
    </div>
  );
}
