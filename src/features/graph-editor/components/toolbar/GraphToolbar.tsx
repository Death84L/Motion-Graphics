import React from 'react';
import { GraphTool, GraphViewport, GraphMode } from '../../types';
import { GraphModeSwitcher } from './GraphModeSwitcher';
import { SnappingControls } from './SnappingControls';
import { SnappingConfig, DEFAULT_SNAPPING_CONFIG } from '../../../../core/math/smartSnapping';
import { TimeDisplayFormat, ValueUnitType } from '../../../../core/timecode/timecodeFormatter';
import { HeatmapMetric } from '../canvas/CanvasHeatmapCurve';

interface GraphToolbarProps {
  activeTool: GraphTool;
  graphMode: GraphMode;
  isPlaying: boolean;
  viewport: GraphViewport;
  fps: number;
  hasSelection: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  snappingConfig?: SnappingConfig;
  timeFormat?: TimeDisplayFormat;
  valueUnit?: ValueUnitType;
  analysisEnabled?: boolean;
  heatmapEnabled?: boolean;
  heatmapMetric?: HeatmapMetric;
  audioEnabled?: boolean;
  ghostEnabled?: boolean;
  onToolChange: (tool: GraphTool) => void;
  onModeChange: (mode: GraphMode) => void;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onResetTime: () => void;
  onAddKeyframe: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitAll: () => void;
  onFitSelection: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onFpsChange: (fps: number) => void;
  onSnappingConfigChange?: (config: SnappingConfig) => void;
  onTimeFormatChange?: (format: TimeDisplayFormat) => void;
  onValueUnitChange?: (unit: ValueUnitType) => void;
  onToggleAnalysis?: () => void;
  onToggleHeatmap?: () => void;
  onHeatmapMetricChange?: (metric: HeatmapMetric) => void;
  onToggleAudio?: () => void;
  onToggleGhost?: () => void;
}

export function GraphToolbar({
  activeTool,
  graphMode,
  isPlaying,
  viewport,
  fps,
  hasSelection,
  canUndo = false,
  canRedo = false,
  snappingConfig = DEFAULT_SNAPPING_CONFIG,
  timeFormat = 'frames',
  valueUnit = '%',
  analysisEnabled = false,
  heatmapEnabled = false,
  heatmapMetric = 'speed',
  audioEnabled = true,
  ghostEnabled = false,
  onToolChange,
  onModeChange,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onResetTime,
  onAddKeyframe,
  onDeleteSelected,
  onDuplicateSelected,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitAll,
  onFitSelection,
  onUndo,
  onRedo,
  onFpsChange,
  onSnappingConfigChange,
  onTimeFormatChange,
  onValueUnitChange,
  onToggleAnalysis,
  onToggleHeatmap,
  onHeatmapMetricChange,
  onToggleAudio,
  onToggleGhost,
}: GraphToolbarProps) {
  const tools: { id: GraphTool; label: string; icon: string; shortcut: string }[] = [
    { id: 'select', label: 'Select (V)', icon: '↖', shortcut: 'V' },
    { id: 'lasso', label: 'Lasso (Q)', icon: '◌', shortcut: 'Q' },
    { id: 'keyframe', label: 'Add Keyframe (K)', icon: '◆', shortcut: 'K' },
    { id: 'draw', label: 'Pen / Draw (D)', icon: '✏️', shortcut: 'D' },
    { id: 'pan', label: 'Hand / Pan (H)', icon: '✋', shortcut: 'H' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        background: '#0c1222',
        borderBottom: '1px solid #1e293b',
        gap: 8,
        flexWrap: 'wrap',
      }}
    >
      {/* 1. Left: Tool Switcher & Selection Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Undo / Redo */}
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              padding: '4px 8px',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: canUndo ? '#f8fafc' : '#475569',
              cursor: canUndo ? 'pointer' : 'default',
              fontSize: 12,
            }}
            title="Undo (Cmd+Z)"
          >
            ↺
          </button>
        )}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              padding: '4px 8px',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: canRedo ? '#f8fafc' : '#475569',
              cursor: canRedo ? 'pointer' : 'default',
              fontSize: 12,
            }}
            title="Redo (Cmd+Shift+Z)"
          >
            ↻
          </button>
        )}

        <div style={{ width: 1, height: 16, background: '#1e293b', margin: '0 4px' }} />

        {/* Tools */}
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onToolChange(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 9px',
                borderRadius: 6,
                background: isActive ? '#1e293b' : 'transparent',
                border: `1px solid ${isActive ? '#38bdf8' : 'transparent'}`,
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title={`${t.label} (${t.shortcut})`}
            >
              <span>{t.icon}</span>
              <span>{t.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Keyframe Duplicate */}
        {hasSelection && onDuplicateSelected && (
          <button
            onClick={onDuplicateSelected}
            style={{
              padding: '4px 8px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#38bdf8',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 4,
            }}
            title="Duplicate Keyframes (Cmd+D)"
          >
            ⧉ Dup
          </button>
        )}
      </div>

      {/* 2. Middle: Snapping, Derivative Modes, Analysis, Audio & Heatmap */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {onSnappingConfigChange && (
          <SnappingControls config={snappingConfig} onChange={onSnappingConfigChange} />
        )}

        <GraphModeSwitcher graphMode={graphMode} onModeChange={onModeChange} />

        {/* Audio Waveform Grid Toggle (Feature 3) */}
        {onToggleAudio && (
          <button
            onClick={onToggleAudio}
            style={{
              padding: '4px 8px',
              background: audioEnabled ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
              border: `1px solid ${audioEnabled ? '#38bdf8' : '#1e293b'}`,
              borderRadius: 6,
              color: audioEnabled ? '#38bdf8' : '#94a3b8',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Toggle Audio Waveform Grid Underlay"
          >
            🎵 Audio
          </button>
        )}

        {/* Ghosting / Onion Skinning Toggle (Feature 3) */}
        {onToggleGhost && (
          <button
            onClick={onToggleGhost}
            style={{
              padding: '4px 8px',
              background: ghostEnabled ? 'rgba(168, 85, 247, 0.2)' : '#11182c',
              border: `1px solid ${ghostEnabled ? '#a855f7' : '#1e293b'}`,
              borderRadius: 6,
              color: ghostEnabled ? '#a855f7' : '#94a3b8',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Toggle Ghost Curve Onion Skin"
          >
            👻 Ghost
          </button>
        )}

        {/* Analysis Diagnostics Overlay Toggle (Feature 18) */}
        {onToggleAnalysis && (
          <button
            onClick={onToggleAnalysis}
            style={{
              padding: '4px 8px',
              background: analysisEnabled ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
              border: `1px solid ${analysisEnabled ? '#38bdf8' : '#1e293b'}`,
              borderRadius: 6,
              color: analysisEnabled ? '#38bdf8' : '#94a3b8',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Toggle Curve Analysis Overlay"
          >
            🔬 Analyze
          </button>
        )}

        {/* Heatmap Toggle & Metric (Feature 20) */}
        {onToggleHeatmap && (
          <div style={{ display: 'flex', alignItems: 'center', background: '#11182c', borderRadius: 6, border: '1px solid #1e293b' }}>
            <button
              onClick={onToggleHeatmap}
              style={{
                padding: '4px 6px',
                background: heatmapEnabled ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                border: 'none',
                color: heatmapEnabled ? '#ec4899' : '#94a3b8',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Toggle Curve Heatmap"
            >
              🔥 Heatmap
            </button>

            {heatmapEnabled && onHeatmapMetricChange && (
              <select
                value={heatmapMetric}
                onChange={(e) => onHeatmapMetricChange(e.target.value as HeatmapMetric)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ec4899',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '2px 4px',
                  cursor: 'pointer',
                }}
              >
                <option value="speed">Speed</option>
                <option value="acceleration">Accel</option>
                <option value="jerk">Jerk</option>
                <option value="curvature">Curvature</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* 3. Right: Units, Formats & Transport */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Rulers Units dropdowns */}
        {onTimeFormatChange && (
          <select
            value={timeFormat}
            onChange={(e) => onTimeFormatChange(e.target.value as TimeDisplayFormat)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '3px 6px',
              fontSize: 10,
              color: '#94a3b8',
            }}
            title="Time Format (Frames / Seconds / SMPTE)"
          >
            <option value="frames">Frames</option>
            <option value="seconds">Seconds</option>
            <option value="smpte">SMPTE</option>
          </select>
        )}

        {onValueUnitChange && (
          <select
            value={valueUnit}
            onChange={(e) => onValueUnitChange(e.target.value as ValueUnitType)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '3px 6px',
              fontSize: 10,
              color: '#94a3b8',
            }}
            title="Property Scale Context (%, px, °, dB)"
          >
            <option value="%">% (Percent)</option>
            <option value="px">px (Position)</option>
            <option value="deg">° (Rotation)</option>
            <option value="dB">dB (Audio)</option>
          </select>
        )}

        <div style={{ width: 1, height: 16, background: '#1e293b', margin: '0 2px' }} />

        {/* Transport */}
        <button
          onClick={onResetTime}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#94a3b8',
            padding: '4px 6px',
            fontSize: 10,
            cursor: 'pointer',
          }}
          title="Reset to 0f"
        >
          ⏮
        </button>

        <button
          onClick={onTogglePlay}
          style={{
            background: isPlaying ? '#ec4899' : '#38bdf8',
            color: '#0b1329',
            border: 'none',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
          }}
          title="Play / Pause (Space)"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={onFitAll}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#94a3b8',
            padding: '4px 7px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Fit Graph (F)"
        >
          ⊡ Fit
        </button>
      </div>
    </div>
  );
}
