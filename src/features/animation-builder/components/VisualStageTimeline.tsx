import React from 'react';
import {
  AnimationStageSequence,
  ParametricBlockConfig,
  AnimationStageCategory,
} from '../../../core/engine/universalAnimationModel';

interface VisualStageTimelineProps {
  stages: AnimationStageSequence[];
  selectedBlockId: string | null;
  currentTime: number;
  totalDurationFrames: number;
  onSelectBlock: (block: ParametricBlockConfig) => void;
  onToggleStage: (stageId: string) => void;
  onToggleBlock: (stageId: string, blockId: string) => void;
  onAddBlockToStage: (stageId: string) => void;
}

export function VisualStageTimeline({
  stages,
  selectedBlockId,
  currentTime,
  totalDurationFrames = 100,
  onSelectBlock,
  onToggleStage,
  onToggleBlock,
  onAddBlockToStage,
}: VisualStageTimelineProps) {
  const getStageColor = (category: AnimationStageCategory) => {
    switch (category) {
      case 'entrance':
        return '#38bdf8';
      case 'emphasis':
        return '#10b981';
      case 'interaction':
        return '#a855f7';
      case 'exit':
        return '#ec4899';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#040711',
        padding: 14,
        borderRadius: 10,
        border: '1px solid #1e293b',
        userSelect: 'none',
      }}
    >
      {/* Top Playhead Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🧱</span>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>
            Visual Stage Sequencer
          </span>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
          {currentTime.toFixed(0)}f / {totalDurationFrames}f
        </span>
      </div>

      {/* Stages Array */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stages.map((stage) => {
          const color = getStageColor(stage.stage);

          return (
            <div
              key={stage.id}
              style={{
                background: '#090e1a',
                border: `1px solid ${stage.enabled ? `${color}44` : '#1e293b'}`,
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Stage Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
                    {stage.name} ({stage.stage})
                  </span>
                  <span style={{ fontSize: 9, color: '#64748b' }}>
                    [{stage.startFrame}f – {stage.startFrame + stage.durationFrames}f]
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => onAddBlockToStage(stage.id)}
                    style={{
                      background: '#11182c',
                      border: '1px solid #1e293b',
                      color: color,
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 9,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Block
                  </button>

                  <button
                    onClick={() => onToggleStage(stage.id)}
                    style={{
                      background: stage.enabled ? color : '#1e293b',
                      color: stage.enabled ? '#080d1a' : '#64748b',
                      border: 'none',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 9,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {stage.enabled ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Stage Blocks Chips Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                {stage.blocks.map((block) => {
                  const isSelected = selectedBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      onClick={() => onSelectBlock(block)}
                      style={{
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                        border: `1px solid ${isSelected ? '#38bdf8' : block.enabled ? '#1e293b' : '#33415544'}`,
                        borderRadius: 6,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: block.enabled ? '#f8fafc' : '#64748b' }}>
                          {block.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBlock(stage.id, block.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: block.enabled ? color : '#475569',
                            fontSize: 9,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {block.enabled ? '●' : '○'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8' }}>
                        <span>Dur: {block.durationFrames}f</span>
                        <span style={{ color: color, fontWeight: 600 }}>{block.ease}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
