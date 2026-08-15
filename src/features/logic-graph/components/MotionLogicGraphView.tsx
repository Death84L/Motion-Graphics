import React, { useState, useMemo } from 'react';
import {
  MotionLogicGraphSchema,
  DEFAULT_SAMPLE_LOGIC_GRAPH,
  evaluateMotionLogicGraph,
} from '../../../core/nodes/motionLogicGraph';

export function MotionLogicGraphView() {
  const [graph] = useState<MotionLogicGraphSchema>(DEFAULT_SAMPLE_LOGIC_GRAPH);
  const [currentFrame, setCurrentFrame] = useState<number>(25);
  const [audioBass, setAudioBass] = useState<number>(0.85);

  const evaluated = useMemo(() => {
    return evaluateMotionLogicGraph(graph, currentFrame, audioBass);
  }, [graph, currentFrame, audioBass]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* Visual Graph Canvas Viewport */}
      <div
        style={{
          position: 'relative',
          background: 'radial-gradient(circle at 50% 50%, #090e1a 0%, #02050e 100%)',
          overflow: 'hidden',
          padding: 20,
        }}
      >
        <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10 }}>
          <span style={{ color: '#a855f7', fontSize: 16 }}>🧠</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Visual Motion Logic Graph
          </span>
        </div>

        {/* Node Blocks on Canvas */}
        <div style={{ position: 'relative', width: '100%', height: '100%', marginTop: 24 }}>
          {graph.nodes.map((node) => {
            const isOutput = node.category === 'output';
            const isInput = node.category === 'input';
            const borderColor = isOutput ? '#10b981' : isInput ? '#38bdf8' : '#a855f7';

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.positionX,
                  top: node.positionY,
                  width: 170,
                  background: '#090e1a',
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: 8,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 10px ${borderColor}33`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, color: borderColor, textTransform: 'uppercase' }}>
                  {node.name}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8' }}>
                  <span>{node.category}</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700, fontFamily: 'monospace' }}>
                    {node.outputs[0]?.value.toFixed(1) || node.inputs[0]?.value.toFixed(1) || ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Controls & Live Output Readouts */}
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
          Graph Execution Context
        </div>

        {/* Audio Bass Input Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Simulated Audio Bass:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{(audioBass * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={audioBass}
            onChange={(e) => setAudioBass(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Evaluated Outputs Card */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Live Evaluated Motion Outputs
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#cbd5e1' }}>Target Scale:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{evaluated.scale.toFixed(1)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#cbd5e1' }}>Target Glow Bloom:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{evaluated.glow.toFixed(1)}px</span>
          </div>
        </div>

        {/* Target Element Simulation */}
        <div
          style={{
            marginTop: 'auto',
            height: 120,
            background: '#040711',
            borderRadius: 8,
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              transform: `scale(${evaluated.scale / 100})`,
              boxShadow: `0 0 ${evaluated.glow}px #38bdf8`,
              transition: 'transform 0.05s ease, box-shadow 0.05s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
