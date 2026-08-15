import React, { useState, useRef } from 'react';
import {
  CompositionLayer,
  CompositionStageConfig,
  DEFAULT_STAGE_CONFIG,
  ASPECT_RATIOS,
  AspectRatioType,
} from '../types/composition.types';
import { CanvasElementRenderer } from './CanvasElementRenderer';

interface LiveCanvasProps {
  layers: CompositionLayer[];
  selectedLayerId: string | null;
  currentTime: number;
  totalFrames?: number;
  isPlaying: boolean;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayerTransform: (layerId: string, updates: Partial<CompositionLayer['transform']>) => void;
  onTogglePlay: () => void;
  onCurrentTimeChange: (time: number) => void;
}

export function LiveCanvas({
  layers,
  selectedLayerId,
  currentTime,
  totalFrames = 100,
  isPlaying,
  onSelectLayer,
  onUpdateLayerTransform,
  onTogglePlay,
  onCurrentTimeChange,
}: LiveCanvasProps) {
  const [stageConfig, setStageConfig] = useState<CompositionStageConfig>(DEFAULT_STAGE_CONFIG);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentRatio = ASPECT_RATIOS[stageConfig.aspectRatio];

  const handlePointerDown = (e: React.PointerEvent, layer: CompositionLayer) => {
    if (layer.locked) return;
    e.stopPropagation();
    onSelectLayer(layer.id);
    setIsDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: layer.transform.x,
      startY: layer.transform.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || !selectedLayerId) return;

    const dx = e.clientX - dragStart.mouseX;
    const dy = e.clientY - dragStart.mouseY;

    onUpdateLayerTransform(selectedLayerId, {
      x: Math.round(dragStart.startX + dx),
      y: Math.round(dragStart.startY + dy),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: '#040711',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Canvas Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 14px',
          background: '#090e1a',
          borderBottom: '1px solid #1e293b',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>🎬 LIVE COMPOSITION</span>

          {/* Aspect Ratio Switcher */}
          <select
            value={stageConfig.aspectRatio}
            onChange={(e) => setStageConfig({ ...stageConfig, aspectRatio: e.target.value as AspectRatioType })}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 600,
              color: '#f8fafc',
            }}
          >
            {Object.values(ASPECT_RATIOS).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} ({r.width}×{r.height})
              </option>
            ))}
          </select>

          {/* Safe Areas & Grid Toggles */}
          <button
            onClick={() => setStageConfig({ ...stageConfig, showSafeAreas: !stageConfig.showSafeAreas })}
            style={{
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
              background: stageConfig.showSafeAreas ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
              border: `1px solid ${stageConfig.showSafeAreas ? '#38bdf8' : '#1e293b'}`,
              color: stageConfig.showSafeAreas ? '#38bdf8' : '#64748b',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            🛡 Safe Zones
          </button>

          <button
            onClick={() => setStageConfig({ ...stageConfig, showGrid: !stageConfig.showGrid })}
            style={{
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
              background: stageConfig.showGrid ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
              border: `1px solid ${stageConfig.showGrid ? '#38bdf8' : '#1e293b'}`,
              color: stageConfig.showGrid ? '#38bdf8' : '#64748b',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            ▦ Grid
          </button>
        </div>

        {/* Transport Mini Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>
            {currentTime.toFixed(0)}f / {totalFrames}f
          </span>

          <button
            onClick={onTogglePlay}
            style={{
              background: isPlaying ? '#ec4899' : '#38bdf8',
              color: '#080d1a',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Main Viewport Stage Area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 20,
          background: 'radial-gradient(circle at center, #0e1526 0%, #03060f 100%)',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onClick={() => onSelectLayer(null)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Aspect Ratio Bounding Stage Screen */}
        <div
          style={{
            position: 'relative',
            width: stageConfig.aspectRatio === '9:16' ? 320 : stageConfig.aspectRatio === '1:1' ? 420 : 640,
            aspectRatio: `${currentRatio.width} / ${currentRatio.height}`,
            maxHeight: '80vh',
            background: stageConfig.backgroundColor,
            borderRadius: 12,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px #1e293b',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Grid Background */}
          {stageConfig.showGrid && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(#1e293b18 1px, transparent 1px), linear-gradient(90deg, #1e293b18 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Action Safe (90%) & Title Safe (80%) Guides */}
          {stageConfig.showSafeAreas && (
            <>
              {/* Action Safe (90%) */}
              <div
                style={{
                  position: 'absolute',
                  inset: '5%',
                  border: '1px dashed rgba(56, 189, 248, 0.25)',
                  borderRadius: 6,
                  pointerEvents: 'none',
                }}
              />
              {/* Title Safe (80%) */}
              <div
                style={{
                  position: 'absolute',
                  inset: '10%',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  borderRadius: 4,
                  pointerEvents: 'none',
                }}
              />
            </>
          )}

          {/* Center Crosshair */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 12,
              height: 12,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <div style={{ position: 'absolute', left: 5, top: 0, width: 2, height: 12, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'absolute', left: 0, top: 5, width: 12, height: 2, background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* Render Elements & Layers */}
          {layers.map((layer) => (
            <div
              key={layer.id}
              onPointerDown={(e) => handlePointerDown(e, layer)}
            >
              <CanvasElementRenderer
                layer={layer}
                isSelected={selectedLayerId === layer.id}
                onSelect={() => onSelectLayer(layer.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
