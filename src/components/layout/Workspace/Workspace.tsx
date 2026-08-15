import React, { useState } from 'react';
import {
  GraphCanvas,
  GraphToolbar,
  MotionPreview,
  TimelineScrubber,
} from '../../../features/graph-editor/components';
import type { KeyframePoint, GraphViewport, GraphTool, GraphMode, CurveLayer } from '../../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../../features/graph-editor/utils/curveEvaluation';
import { DEFAULT_GRID_CONFIG, DEFAULT_VIEWPORT } from '../../../features/graph-editor/state/graphStore';

const INITIAL_KEYFRAMES: KeyframePoint[] = [
  { id: 1, time: 10, value: 20, ease: 'easeInOut' },
  { id: 2, time: 40, value: 80, ease: 'easeOut' },
  { id: 3, time: 70, value: 30, ease: 'easeInOut' },
  { id: 4, time: 90, value: 95, ease: 'easeOut' },
];

export function Workspace() {
  const [curveLayers, setCurveLayers] = useState<CurveLayer[]>([
    {
      id: 'default-layer',
      name: 'Default Curve',
      property: 'translate-x',
      color: '#38bdf8',
      visible: true,
      locked: false,
      solo: false,
      keyframes: INITIAL_KEYFRAMES,
    },
  ]);
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useState<number[]>([2]);
  const [viewport, setViewport] = useState<GraphViewport>(DEFAULT_VIEWPORT);
  const [activeTool, setActiveTool] = useState<GraphTool>('select');
  const [graphMode, setGraphMode] = useState<GraphMode>('value');
  const [currentTime, setCurrentTime] = useState<number>(40);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(30);

  const keyframes = curveLayers[0].keyframes;
  const currentValue = evaluateGraphAtTime(keyframes, currentTime);

  const handleKeyframesChange = (newKeyframes: KeyframePoint[]) => {
    setCurveLayers([{ ...curveLayers[0], keyframes: newKeyframes }]);
  };

  return (
    <main style={{ display: 'grid', gap: 12, padding: 16 }}>
      <GraphToolbar
        activeTool={activeTool}
        graphMode={graphMode}
        isPlaying={isPlaying}
        viewport={viewport}
        fps={fps}
        hasSelection={selectedKeyframeIds.length > 0}
        onToolChange={setActiveTool}
        onModeChange={setGraphMode}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onStepForward={() => setCurrentTime((t) => Math.min(100, t + 1))}
        onStepBackward={() => setCurrentTime((t) => Math.max(0, t - 1))}
        onResetTime={() => setCurrentTime(0)}
        onAddKeyframe={() => {
          const newId = Date.now();
          const newPoint: KeyframePoint = { id: newId, time: currentTime, value: currentValue, ease: 'easeInOut' };
          handleKeyframesChange([...keyframes, newPoint].sort((a, b) => a.time - b.time));
        }}
        onDeleteSelected={() => {
          handleKeyframesChange(keyframes.filter((k) => !selectedKeyframeIds.includes(k.id)));
          setSelectedKeyframeIds([]);
        }}
        onZoomIn={() => setViewport((v) => ({ ...v, scaleX: Math.min(4, v.scaleX * 1.15), scaleY: Math.min(4, v.scaleY * 1.15) }))}
        onZoomOut={() => setViewport((v) => ({ ...v, scaleX: Math.max(0.3, v.scaleX * 0.85), scaleY: Math.max(0.3, v.scaleY * 0.85) }))}
        onResetZoom={() => setViewport(DEFAULT_VIEWPORT)}
        onFitAll={() => setViewport(DEFAULT_VIEWPORT)}
        onFitSelection={() => setViewport(DEFAULT_VIEWPORT)}
        onFpsChange={setFps}
      />
      <div style={{ height: 480 }}>
        <GraphCanvas
          viewport={viewport}
          curveLayers={curveLayers}
          activeLayerId="default-layer"
          selectedKeyframeIds={selectedKeyframeIds}
          currentTime={currentTime}
          activeTool={activeTool}
          graphMode={graphMode}
          gridConfig={DEFAULT_GRID_CONFIG}
          isPlaying={isPlaying}
          onKeyframesChange={handleKeyframesChange}
          onSelectKeyframes={setSelectedKeyframeIds}
          onCurrentTimeChange={setCurrentTime}
          onViewportChange={setViewport}
        />
      </div>
      <TimelineScrubber
        currentTime={currentTime}
        keyframes={keyframes}
        selectedKeyframeIds={selectedKeyframeIds}
        onCurrentTimeChange={setCurrentTime}
        onSelectKeyframe={(id: number) => setSelectedKeyframeIds([id])}
      />
      <MotionPreview currentValue={currentValue} currentTime={currentTime} isPlaying={isPlaying} />
    </main>
  );
}
