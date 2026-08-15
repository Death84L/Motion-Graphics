import React, { useState, useMemo, useEffect } from 'react';
import {
  ProceduralGraphSchema,
  ProceduralNode,
  EvaluationContext,
} from '../../../core/nodes/proceduralGraphSchema';
import {
  ProceduralGraphEngine,
  SAMPLE_PROCEDURAL_PRESETS,
} from '../../../core/nodes/proceduralGraphEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface MotionLogicGraphViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function MotionLogicGraphView({ onBakeKeyframesToEditor }: MotionLogicGraphViewProps) {
  const [selectedPreset, setSelectedPreset] = useState<ProceduralGraphSchema>(SAMPLE_PROCEDURAL_PRESETS[0]);
  const [graph, setGraph] = useState<ProceduralGraphSchema>(SAMPLE_PROCEDURAL_PRESETS[0]);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  // Real-time Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => (prev + 0.016) % 2.0);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Context for real-time procedural evaluation
  const evalContext: EvaluationContext = useMemo(() => {
    return {
      timeSeconds: currentTimeSec,
      frameIndex: Math.round(currentTimeSec * 60),
      fps: 60,
      audioBass: Math.sin(currentTimeSec * 8) > 0.3 ? 0.95 : 0.15,
      audioBeat: Math.round(currentTimeSec * 60) % 30 < 2,
      audioTreble: 0.5,
      mouseDistancePx: 80,
      charIndex: 0,
    };
  }, [currentTimeSec]);

  // Live Evaluation Result
  const evalResult = useMemo(() => {
    return ProceduralGraphEngine.evaluateGraph(graph, evalContext);
  }, [graph, evalContext]);

  // Node Parameter Updates
  const updateNodeParam = (nodeId: string, paramKey: string, val: number) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, params: { ...n.params, [paramKey]: val } } : n
      ),
    }));
  };

  // 1-Click Bake to Keyframes
  const handleBakeKeyframes = () => {
    const targetOut = graph.nodes.find((n) => n.category === 'output')?.kind || 'out-scale';
    const baked = ProceduralGraphEngine.bakeGraphToKeyframes(graph, targetOut, 2.0, 60);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Procedural Graph • ${graph.name}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  const scaleVal = evalResult.outputs['out-scale'] ?? 100;
  const shakeVal = evalResult.outputs['out-camera-shake'] ?? 0;
  const glowVal = evalResult.outputs['out-glow-aura'] ?? 0;
  const rotVal = evalResult.outputs['out-rotation'] ?? 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT: INFINITE VISUAL GRAPH CANVAS VIEWPORT */}
      <div
        style={{
          position: 'relative',
          background: 'radial-gradient(circle at 50% 50%, #090e1a 0%, #02050e 100%)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Graph Control Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(9, 14, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #1e293b',
            padding: '10px 16px',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#38bdf8', fontSize: 16 }}>🧠</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
              Procedural Motion Graph
            </span>
            <span style={{ fontSize: 10, color: '#64748b' }}>• Visual Programming</span>
          </div>

          {/* Preset Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const found = SAMPLE_PROCEDURAL_PRESETS.find((p) => p.id === e.target.value);
                if (found) {
                  setSelectedPreset(found);
                  setGraph(found);
                }
              }}
              style={{
                background: '#11182c',
                border: '1px solid #334155',
                color: '#38bdf8',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {SAMPLE_PROCEDURAL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>

            {/* 1-Click Bake Action */}
            <button
              onClick={handleBakeKeyframes}
              style={{
                background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
                color: '#ffffff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
              }}
            >
              {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Keyframes'}
            </button>
          </div>
        </div>

        {/* Interactive Graph Node Canvas */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', padding: 24 }}>
          {/* SVG Connection Wires */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {graph.wires.map((wire) => {
              const fromNode = graph.nodes.find((n) => n.id === wire.fromNodeId);
              const toNode = graph.nodes.find((n) => n.id === wire.toNodeId);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.positionX + 160;
              const y1 = fromNode.positionY + 36;
              const x2 = toNode.positionX;
              const y2 = toNode.positionY + 36;
              const cx = (x1 + x2) / 2;

              return (
                <g key={wire.id}>
                  <path
                    d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    opacity="0.85"
                  />
                  <circle cx={x2} cy={y2} r="3" fill="#38bdf8" />
                </g>
              );
            })}
          </svg>

          {/* Draggable / Rendered Node Blocks */}
          {graph.nodes.map((node) => {
            const isOutput = node.category === 'output';
            const isInput = node.category === 'input';
            const isDynamics = node.category === 'spring-physics';
            const borderColor = isOutput ? '#10b981' : isInput ? '#38bdf8' : isDynamics ? '#ec4899' : '#a855f7';
            const nodeVal = evalResult.nodeValues[node.id] ?? 0;

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.positionX,
                  top: node.positionY,
                  width: 160,
                  background: '#090e1a',
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: 10,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.7), 0 0 12px ${borderColor}33`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  zIndex: 2,
                }}
              >
                {/* Node Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: borderColor, textTransform: 'uppercase' }}>
                    {node.name}
                  </span>
                  <span style={{ fontSize: 9, color: '#f8fafc', fontWeight: 800, fontFamily: 'monospace' }}>
                    {nodeVal}
                  </span>
                </div>

                {/* Node Parameters (if any) */}
                {Object.keys(node.params).map((pKey) => (
                  <div key={pKey} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8' }}>
                      <span>{pKey}:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>{node.params[pKey]}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={node.params[pKey]}
                      onChange={(e) => updateNodeParam(node.id, pKey, parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: borderColor }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT: LIVE SIMULATION STAGE & OUTPUT METERS */}
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
          Procedural Simulation Stage
        </div>

        {/* Live Output Signal Meters */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Scale Output:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{scaleVal}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Camera Shake:</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{shakeVal}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Glow Aura:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{glowVal}px</span>
          </div>
        </div>

        {/* Live Simulation Viewport */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '240px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transform: `translate(${Math.sin(currentTimeSec * 20) * shakeVal}px, ${Math.cos(currentTimeSec * 22) * shakeVal}px)`,
          }}
        >
          {/* Animated Procedural Element */}
          <div
            style={{
              transform: `scale(${scaleVal / 100}) rotate(${rotVal}deg)`,
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(139, 92, 246, 0.25))',
              border: '2px solid #38bdf8',
              borderRadius: 16,
              padding: '20px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 0 ${glowVal}px rgba(56, 189, 248, 0.8), 0 10px 30px rgba(0,0,0,0.8)`,
              transition: 'transform 0.04s ease',
            }}
          >
            <span style={{ fontSize: 24 }}>⚡</span>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#f8fafc' }}>
              Procedural Node Motion
            </div>
            <div style={{ fontSize: 8, color: '#38bdf8' }}>
              Time: {currentTimeSec.toFixed(2)}s • F: {Math.round(currentTimeSec * 60)}
            </div>
          </div>
        </div>

        {/* Transport Scrubber */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#cbd5e1' }}>
            <span>Playhead Time:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{currentTimeSec.toFixed(2)}s</span>
          </div>
          <input
            type="range"
            min="0"
            max="2.0"
            step="0.02"
            value={currentTimeSec}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentTimeSec(parseFloat(e.target.value));
            }}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>
      </div>
    </div>
  );
}
