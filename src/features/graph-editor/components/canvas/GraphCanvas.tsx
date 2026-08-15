import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  GraphViewport,
  KeyframePoint,
  GraphTool,
  GraphMode,
  CurveLayer,
  GraphGridConfig,
  EasingType,
  WorkArea,
} from '../../types';
import { CanvasGrid } from './CanvasGrid';
import { CanvasCurves } from './CanvasCurves';
import { CanvasHandles } from './CanvasHandles';
import { CanvasKeyframeNodes } from './CanvasKeyframeNodes';
import { CanvasPlayhead } from './CanvasPlayhead';
import { CanvasMarquee } from './CanvasMarquee';
import { CanvasMinimap } from './CanvasMinimap';
import { CanvasTransformBox } from './CanvasTransformBox';
import { CanvasFloatingToolbar } from './CanvasFloatingToolbar';
import { CanvasDrawingOverlay } from './CanvasDrawingOverlay';
import { CanvasTelemetryHUD } from './CanvasTelemetryHUD';
import { CanvasExtremaMarkers } from './CanvasExtremaMarkers';
import { CanvasIntersections } from './CanvasIntersections';
import { CanvasTimeRuler } from './CanvasTimeRuler';
import { CanvasValueRuler } from './CanvasValueRuler';
import { CanvasAnalysisOverlay } from './CanvasAnalysisOverlay';
import { CanvasHeatmapCurve, HeatmapMetric } from './CanvasHeatmapCurve';
import { CanvasDiffView } from './CanvasDiffView';
import { CanvasBookmarksBar } from './CanvasBookmarksBar';
import { CanvasContinuityVisualizer } from './CanvasContinuityVisualizer';

import { computeGraphModeBounds } from '../../../../core/derivatives/derivativeEvaluation';
import { filterKeyframesInMarquee, filterKeyframesInLasso } from '../../../../core/selection/spatialIndex';
import { calculateAngleAndLength, calculateDelta, computeAutoTangents } from '../../../../core/math/tangentMath';
import { applyMagneticSnapping, SnappingConfig, DEFAULT_SNAPPING_CONFIG } from '../../../../core/math/smartSnapping';
import { fitStrokeToBezierKeyframes } from '../../../../core/math/bezierFitting';
import { evaluateGraphAtTime } from '../../utils/curveEvaluation';
import { CanvasAudioWaveform } from './CanvasAudioWaveform';
import { AudioWaveformConfig, DEFAULT_AUDIO_CONFIG } from '../../../../core/audio/waveformGenerator';
import { TimeDisplayFormat, ValueUnitType } from '../../../../core/timecode/timecodeFormatter';
import { GraphBookmark, GraphRegion, DEFAULT_BOOKMARKS, DEFAULT_REGIONS } from '../../../../core/bookmarks/bookmarkManager';
import { BeatMarker } from '../../../../core/bookmarks/beatDetector';

interface GraphCanvasProps {
  viewport: GraphViewport;
  curveLayers: CurveLayer[];
  activeLayerId: string;
  selectedKeyframeIds: number[];
  currentTime: number;
  activeTool: GraphTool;
  graphMode: GraphMode;
  gridConfig: GraphGridConfig;
  snappingConfig?: SnappingConfig;
  workArea?: WorkArea;
  fps?: number;
  timeFormat?: TimeDisplayFormat;
  valueUnit?: ValueUnitType;
  isPlaying: boolean;
  analysisEnabled?: boolean;
  heatmapMetric?: HeatmapMetric;
  heatmapEnabled?: boolean;
  diffViewEnabled?: boolean;
  bookmarks?: GraphBookmark[];
  regions?: GraphRegion[];
  beats?: BeatMarker[];
  showAudioWaveform?: boolean;
  audioConfig?: AudioWaveformConfig;
  onKeyframesChange: (keyframes: KeyframePoint[]) => void;
  onSelectKeyframes: (ids: number[]) => void;
  onCurrentTimeChange: (time: number) => void;
  onViewportChange: (viewport: GraphViewport) => void;
  onWorkAreaChange?: (workArea: WorkArea) => void;
  onApplySegmentEase?: (segmentStartIndex: number, easeType: EasingType) => void;
}

export function GraphCanvas({
  viewport,
  curveLayers,
  activeLayerId,
  selectedKeyframeIds,
  currentTime,
  activeTool,
  graphMode,
  gridConfig,
  snappingConfig = DEFAULT_SNAPPING_CONFIG,
  workArea = { inFrame: 0, outFrame: 100, enabled: true },
  fps = 30,
  timeFormat = 'frames',
  valueUnit = '%',
  isPlaying,
  analysisEnabled = false,
  heatmapMetric = 'speed',
  heatmapEnabled = false,
  diffViewEnabled = false,
  bookmarks = DEFAULT_BOOKMARKS,
  regions = DEFAULT_REGIONS,
  beats,
  showAudioWaveform = true,
  audioConfig = DEFAULT_AUDIO_CONFIG,
  onKeyframesChange,
  onSelectKeyframes,
  onCurrentTimeChange,
  onViewportChange,
  onWorkAreaChange,
  onApplySegmentEase,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 900, height: 480 });

  // Hover Telemetry State
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Freehand Draw Tool State
  const [drawStroke, setDrawStroke] = useState<{ x: number; y: number; time: number; value: number }[]>([]);

  // Dragging & Marquee State
  const [draggingTarget, setDraggingTarget] = useState<{
    type: 'keyframe' | 'handleIn' | 'handleOut' | 'playhead' | 'pan';
    id?: number;
    startX: number;
    startY: number;
    initialKeyframes?: KeyframePoint[];
    initialViewport?: GraphViewport;
  } | null>(null);

  const [marquee, setMarquee] = useState<{
    type: 'box' | 'lasso';
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    points?: { x: number; y: number }[];
  } | null>(null);

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 100 && height > 100) {
          setSvgSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const paddingLeft = 46;
  const paddingRight = 30;
  const paddingTop = 38;
  const paddingBottom = 40;

  const innerWidth = Math.max(svgSize.width - paddingLeft - paddingRight, 100);
  const innerHeight = Math.max(svgSize.height - paddingTop - paddingBottom, 100);

  const activeLayer = curveLayers.find((l) => l.id === activeLayerId) || curveLayers[0];
  const keyframes = activeLayer?.keyframes || [];
  const selectedKeyframes = keyframes.filter((k) => selectedKeyframeIds.includes(k.id));

  // Compute bounds for current graph mode
  const modeBounds = computeGraphModeBounds(keyframes, graphMode);

  // Coordinate transformations
  const toSvgPoint = useCallback(
    (point: { time: number; value: number }) => {
      const x = paddingLeft + (point.time / 100) * innerWidth * viewport.scaleX + viewport.x;
      const normVal = (point.value - modeBounds.min) / (modeBounds.max - modeBounds.min || 1);
      const y = paddingTop + innerHeight - normVal * innerHeight * viewport.scaleY + viewport.y;
      return { x, y };
    },
    [paddingLeft, paddingTop, innerWidth, innerHeight, viewport, modeBounds]
  );

  const fromSvgPoint = useCallback(
    (svgX: number, svgY: number) => {
      const time = ((svgX - paddingLeft - viewport.x) / (innerWidth * viewport.scaleX)) * 100;
      const normVal = 1 - (svgY - paddingTop - viewport.y) / (innerHeight * viewport.scaleY);
      const value = modeBounds.min + normVal * (modeBounds.max - modeBounds.min);

      const snapped = applyMagneticSnapping(time, value, snappingConfig, {
        keyframes,
        playheadTime: currentTime,
      });

      return { time: snapped.time, value: snapped.value };
    },
    [paddingLeft, paddingTop, innerWidth, innerHeight, viewport, modeBounds, snappingConfig, keyframes, currentTime]
  );

  // Playhead X position
  const playheadX = paddingLeft + (currentTime / 100) * innerWidth * viewport.scaleX + viewport.x;

  // Zoom around cursor position
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.shiftKey) {
      onViewportChange({ ...viewport, x: viewport.x - e.deltaY });
      return;
    }

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newScaleX = Math.max(0.3, Math.min(4.5, viewport.scaleX * zoomFactor));
    const newScaleY = Math.max(0.3, Math.min(4.5, viewport.scaleY * zoomFactor));

    const newX = mouseX - (mouseX - viewport.x) * (newScaleX / viewport.scaleX);
    const newY = mouseY - (mouseY - viewport.y) * (newScaleY / viewport.scaleY);

    onViewportChange({ x: newX, y: newY, scaleX: newScaleX, scaleY: newScaleY });
  };

  // Double-Click Directly on Curve to Insert Keyframe (Feature 10)
  const handleDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const coords = fromSvgPoint(clickX, clickY);
    const exactCurveValue = evaluateGraphAtTime(keyframes, coords.time);

    const newId = Date.now();
    const tempKf: KeyframePoint = {
      id: newId,
      time: coords.time,
      value: Math.round(exactCurveValue * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    };

    // Auto-generate smooth tangents matching curve slope
    const sorted = [...keyframes, tempKf].sort((a, b) => a.time - b.time);
    const idx = sorted.findIndex((k) => k.id === newId);
    const prev = idx > 0 ? sorted[idx - 1] : null;
    const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, tempKf, next, 0.33);

    const newKeyframe: KeyframePoint = {
      ...tempKf,
      handleIn,
      handleOut,
      symmetrical: true,
    };

    sorted[idx] = newKeyframe;
    onKeyframesChange(sorted);
    onSelectKeyframes([newId]);
  };

  // Pointer Down Handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Draw Tool (Feature 5: Freehand Drawing)
    if (activeTool === 'draw') {
      const coords = fromSvgPoint(clickX, clickY);
      setDrawStroke([{ x: clickX, y: clickY, time: coords.time, value: coords.value }]);
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      return;
    }

    // Playhead click / drag
    if (Math.abs(clickX - playheadX) < 14) {
      setDraggingTarget({ type: 'playhead', startX: clickX, startY: clickY });
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      return;
    }

    // Pan canvas
    if (activeTool === 'pan' || e.button === 1 || e.altKey) {
      setDraggingTarget({
        type: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        initialViewport: { ...viewport },
      });
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      return;
    }

    // Keyframe Tool
    if (activeTool === 'keyframe') {
      const coords = fromSvgPoint(clickX, clickY);
      const newId = Date.now();
      const newPoint: KeyframePoint = {
        id: newId,
        time: coords.time,
        value: coords.value,
        type: 'bezier',
        ease: 'easeInOut',
      };
      const nextKeyframes = [...keyframes, newPoint].sort((a, b) => a.time - b.time);
      onKeyframesChange(nextKeyframes);
      onSelectKeyframes([newId]);
      return;
    }

    // Marquee Selection (Box or Lasso)
    if (activeTool === 'select' || activeTool === 'lasso') {
      setMarquee({
        type: activeTool === 'lasso' ? 'lasso' : 'box',
        startX: clickX,
        startY: clickY,
        currentX: clickX,
        currentY: clickY,
        points: [{ x: clickX, y: clickY }],
      });
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      if (!e.shiftKey) {
        onSelectKeyframes([]);
      }
    }
  };

  const handleKeyframePointerDown = (e: React.PointerEvent, point: KeyframePoint) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);

    let newSelected: number[];
    if (e.shiftKey) {
      newSelected = selectedKeyframeIds.includes(point.id)
        ? selectedKeyframeIds.filter((id) => id !== point.id)
        : [...selectedKeyframeIds, point.id];
    } else {
      newSelected = selectedKeyframeIds.includes(point.id) ? selectedKeyframeIds : [point.id];
    }

    onSelectKeyframes(newSelected);
    setDraggingTarget({
      type: 'keyframe',
      id: point.id,
      startX: e.clientX,
      startY: e.clientY,
      initialKeyframes: JSON.parse(JSON.stringify(keyframes)),
    });
  };

  const handleHandlePointerDown = (e: React.PointerEvent, pointId: number, type: 'handleIn' | 'handleOut') => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingTarget({
      type,
      id: pointId,
      startX: e.clientX,
      startY: e.clientY,
      initialKeyframes: JSON.parse(JSON.stringify(keyframes)),
    });
  };

  // Pointer Move Handlers
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Track hover telemetry
    const coords = fromSvgPoint(mouseX, mouseY);
    setHoveredTime(coords.time);
    setHoverPos({ x: mouseX, y: mouseY });

    // Draw Tool tracking
    if (activeTool === 'draw' && drawStroke.length > 0) {
      setDrawStroke((prev) => [...prev, { x: mouseX, y: mouseY, time: coords.time, value: coords.value }]);
      return;
    }

    // Marquee Box or Lasso
    if (marquee) {
      const updatedPoints = marquee.points ? [...marquee.points, { x: mouseX, y: mouseY }] : [{ x: mouseX, y: mouseY }];
      setMarquee({ ...marquee, currentX: mouseX, currentY: mouseY, points: updatedPoints });

      let selected: number[] = [];
      if (marquee.type === 'box') {
        selected = filterKeyframesInMarquee(keyframes, marquee.startX, marquee.startY, mouseX, mouseY, toSvgPoint);
      } else {
        selected = filterKeyframesInLasso(keyframes, updatedPoints, toSvgPoint);
      }
      onSelectKeyframes(selected);
      return;
    }

    if (!draggingTarget) return;

    // Playhead drag
    if (draggingTarget.type === 'playhead') {
      const newTime = Math.max(0, Math.min(100, ((mouseX - paddingLeft - viewport.x) / (innerWidth * viewport.scaleX)) * 100));
      onCurrentTimeChange(Math.round(newTime * 10) / 10);
      return;
    }

    // Pan canvas
    if (draggingTarget.type === 'pan' && draggingTarget.initialViewport) {
      const dx = e.clientX - draggingTarget.startX;
      const dy = e.clientY - draggingTarget.startY;
      onViewportChange({
        ...viewport,
        x: draggingTarget.initialViewport.x + dx,
        y: draggingTarget.initialViewport.y + dy,
      });
      return;
    }

    // Keyframe multi-drag with snapping
    if (draggingTarget.type === 'keyframe' && draggingTarget.initialKeyframes) {
      const dxScreen = e.clientX - draggingTarget.startX;
      const dyScreen = e.clientY - draggingTarget.startY;

      const dt = (dxScreen / (innerWidth * viewport.scaleX)) * 100;
      const dv = -(dyScreen / (innerHeight * viewport.scaleY)) * (modeBounds.max - modeBounds.min);

      const updated = draggingTarget.initialKeyframes.map((k) => {
        if (!selectedKeyframeIds.includes(k.id)) return k;
        const rawT = k.time + dt;
        const rawV = k.value + dv;

        const snapped = applyMagneticSnapping(rawT, rawV, snappingConfig, {
          keyframes: draggingTarget.initialKeyframes || keyframes,
          currentKeyframeId: k.id,
          playheadTime: currentTime,
        });

        return { ...k, time: snapped.time, value: snapped.value };
      });

      onKeyframesChange(updated);
      return;
    }

    // Tangent Handle drag with angle snapping
    if ((draggingTarget.type === 'handleIn' || draggingTarget.type === 'handleOut') && draggingTarget.initialKeyframes) {
      const kf = draggingTarget.initialKeyframes.find((k) => k.id === draggingTarget.id);
      if (!kf) return;

      const nodeSvg = toSvgPoint(kf);
      const dxScreen = mouseX - nodeSvg.x;
      const dyScreen = mouseY - nodeSvg.y;

      const dxTime = (dxScreen / (innerWidth * viewport.scaleX)) * 100;
      const dyVal = -(dyScreen / (innerHeight * viewport.scaleY)) * (modeBounds.max - modeBounds.min);

      let { angle, length } = calculateAngleAndLength(dxTime, dyVal);

      // Shift key = 15 degree angle snap
      if (e.shiftKey) {
        angle = Math.round(angle / 15) * 15;
      }

      const delta = calculateDelta(angle, length);
      const isHandleIn = draggingTarget.type === 'handleIn';

      const updatedKeyframes = keyframes.map((k) => {
        if (k.id !== draggingTarget.id) return k;

        let handleIn = k.handleIn;
        let handleOut = k.handleOut;

        if (isHandleIn) {
          handleIn = { ...delta, angle, length };
          if (k.symmetrical) {
            const oppDelta = calculateDelta((angle + 180) % 360, length);
            handleOut = { ...oppDelta, angle: (angle + 180) % 360, length };
          }
        } else {
          handleOut = { ...delta, angle, length };
          if (k.symmetrical) {
            const oppDelta = calculateDelta((angle + 180) % 360, length);
            handleIn = { ...oppDelta, angle: (angle + 180) % 360, length };
          }
        }

        return { ...k, handleIn, handleOut };
      });

      onKeyframesChange(updatedKeyframes);
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (activeTool === 'draw' && drawStroke.length > 2) {
      const generated = fitStrokeToBezierKeyframes(drawStroke, 2.0);
      if (generated.length >= 2) {
        onKeyframesChange(generated);
        onSelectKeyframes(generated.map((k) => k.id));
      }
      setDrawStroke([]);
    }

    setDraggingTarget(null);
    setMarquee(null);
  };

  // Preset Drag & Drop listener
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const presetId = e.dataTransfer.getData('application/motion-studio-preset') as EasingType;
    const customPresetJson = e.dataTransfer.getData('application/motion-studio-custom-preset');

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const dropCoords = fromSvgPoint(mouseX, e.clientY - rect.top);

    if (customPresetJson) {
      try {
        const customPoints: KeyframePoint[] = JSON.parse(customPresetJson);
        onKeyframesChange(customPoints);
        return;
      } catch (err) {}
    }

    if (presetId && onApplySegmentEase) {
      const sorted = [...keyframes].sort((a, b) => a.time - b.time);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (dropCoords.time >= sorted[i].time && dropCoords.time <= sorted[i + 1].time) {
          onApplySegmentEase(i, presetId);
          break;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#090e1a',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid #1e293b',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
      }}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <svg
        width={svgSize.width}
        height={svgSize.height}
        style={{
          display: 'block',
          cursor:
            activeTool === 'pan'
              ? 'grab'
              : activeTool === 'keyframe'
              ? 'crosshair'
              : activeTool === 'draw'
              ? 'crosshair'
              : 'default',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onPointerLeave={() => setHoveredTime(null)}
      >
        {/* Defs / Gradients */}
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Canvas Grid */}
        <CanvasGrid
          svgWidth={svgSize.width}
          svgHeight={svgSize.height}
          paddingLeft={paddingLeft}
          paddingRight={paddingRight}
          paddingTop={paddingTop}
          paddingBottom={paddingBottom}
          innerWidth={innerWidth}
          innerHeight={innerHeight}
          viewport={viewport}
          gridConfig={gridConfig}
          graphMode={graphMode}
          modeBounds={modeBounds}
          toSvgPoint={toSvgPoint}
        />

        {/* Audio Waveform Grid Underlay (Feature 3) */}
        <CanvasAudioWaveform
          viewport={viewport}
          width={innerWidth}
          height={innerHeight}
          config={audioConfig}
          enabled={showAudioWaveform}
        />

        {/* Dynamic Value Axis Ruler (Left) */}
        <CanvasValueRuler viewport={viewport} height={svgSize.height} unit={valueUnit} />

        {/* Git-Style Curve Diff View (Feature 35) */}
        <CanvasDiffView
          originalKeyframes={activeLayer?.ghostKeyframes}
          currentKeyframes={keyframes}
          enabled={diffViewEnabled}
          toSvgPoint={toSvgPoint}
        />

        {/* Multi-Curve Intersection Points (Feature 8) */}
        <CanvasIntersections
          curveLayers={curveLayers}
          viewport={viewport}
          width={innerWidth}
          height={innerHeight}
        />

        {/* Curves & Baseline References */}
        <CanvasCurves
          curveLayers={curveLayers}
          activeLayerId={activeLayerId}
          graphMode={graphMode}
          toSvgPoint={toSvgPoint}
        />

        {/* Heatmap Mode Overlay (Feature 20) */}
        <CanvasHeatmapCurve
          keyframes={keyframes}
          metric={heatmapMetric}
          enabled={heatmapEnabled}
          toSvgPoint={toSvgPoint}
        />

        {/* Full Curve Diagnostics & Analysis Overlay (Feature 18) */}
        <CanvasAnalysisOverlay
          keyframes={keyframes}
          viewport={viewport}
          width={innerWidth}
          height={innerHeight}
          enabled={analysisEnabled}
        />

        {/* Continuity Order Break Visualizer (Feature 86) */}
        <CanvasContinuityVisualizer
          keyframes={keyframes}
          viewport={viewport}
          width={innerWidth}
          height={innerHeight}
          enabled={analysisEnabled}
        />

        {/* Extrema / Inflection Point Markers (Feature 7) */}
        <CanvasExtremaMarkers
          keyframes={keyframes}
          viewport={viewport}
          width={innerWidth}
          height={innerHeight}
          onSelectTime={onCurrentTimeChange}
        />

        {/* Tangent Handles */}
        <CanvasHandles
          keyframes={keyframes}
          selectedKeyframeIds={selectedKeyframeIds}
          viewport={viewport}
          innerWidth={innerWidth}
          innerHeight={innerHeight}
          toSvgPoint={toSvgPoint}
          onHandlePointerDown={handleHandlePointerDown}
        />

        {/* Keyframe Nodes & Glyphs */}
        <CanvasKeyframeNodes
          keyframes={keyframes}
          selectedKeyframeIds={selectedKeyframeIds}
          toSvgPoint={toSvgPoint}
          onKeyframePointerDown={handleKeyframePointerDown}
        />

        {/* Multi-Select Bounding Box (Feature 1) */}
        <CanvasTransformBox
          selectedKeyframes={selectedKeyframes}
          viewport={viewport}
          width={innerWidth}
          height={innerHeight}
          onTransformSelection={onKeyframesChange}
        />

        {/* Floating Quick Interpolation Toolbar (Feature 2) */}
        <CanvasFloatingToolbar
          selectedKeyframes={selectedKeyframes}
          allKeyframes={keyframes}
          viewport={viewport}
          width={svgSize.width}
          height={svgSize.height}
          onUpdateKeyframes={onKeyframesChange}
        />

        {/* Playhead */}
        <CanvasPlayhead
          playheadX={playheadX}
          paddingTop={paddingTop}
          innerHeight={innerHeight}
          scaleY={viewport.scaleY}
          currentTime={currentTime}
        />

        {/* Freehand Stroke Drawing (Feature 5) */}
        <CanvasDrawingOverlay drawingPoints={drawStroke} />

        {/* Selection Marquee Overlay */}
        <CanvasMarquee marquee={marquee} />

        {/* Bookmarks & Timeline Regions Overlay (Feature 40, 41, 32) */}
        <CanvasBookmarksBar
          viewport={viewport}
          width={svgSize.width}
          bookmarks={bookmarks}
          regions={regions}
          beats={beats}
          onSelectTime={onCurrentTimeChange}
        />

        {/* Advanced Time Ruler with SMPTE & Work Area (Feature 4, 13) */}
        <CanvasTimeRuler
          viewport={viewport}
          width={svgSize.width}
          height={svgSize.height}
          currentTime={currentTime}
          fps={fps}
          timeFormat={timeFormat}
          workArea={workArea}
          onCurrentTimeChange={onCurrentTimeChange}
          onWorkAreaChange={onWorkAreaChange || (() => {})}
        />

        {/* Curve Hover Telemetry HUD (Feature 6) */}
        <CanvasTelemetryHUD
          hoverTime={hoveredTime}
          hoverX={hoverPos.x}
          hoverY={hoverPos.y}
          keyframes={keyframes}
          width={svgSize.width}
          height={svgSize.height}
        />
      </svg>

      {/* Minimap Overview Lens */}
      <CanvasMinimap
        keyframes={keyframes}
        viewport={viewport}
        onNavigate={(newX) => onViewportChange({ ...viewport, x: newX })}
      />
    </div>
  );
}
