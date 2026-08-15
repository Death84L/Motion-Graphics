import React from 'react';
import { CompositionLayer } from '../types/composition.types';
import { buildVfxStyle } from '../../vfx/engine/vfxPipeline';

interface CanvasElementRendererProps {
  layer: CompositionLayer;
  isSelected: boolean;
  onSelect: () => void;
}

export function CanvasElementRenderer({
  layer,
  isSelected,
  onSelect,
}: CanvasElementRendererProps) {
  if (!layer.visible) return null;

  const { transform, vfx, width, height, type } = layer;

  // Compute CSS transform matrix / styles
  const transformStyle: React.CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${transform.x}px)`,
    top: `calc(50% + ${transform.y}px)`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(-50%, -50%) rotate(${transform.rotation}deg) scale(${transform.scaleX}, ${transform.scaleY})`,
    opacity: transform.opacity,
    transformOrigin: `${transform.anchorX * 100}% ${transform.anchorY * 100}%`,
    cursor: layer.locked ? 'default' : 'move',
    userSelect: 'none',
    transition: 'outline 0.15s ease',
    ...buildVfxStyle({
      blur: vfx.blur,
      glow: vfx.glow,
      glowColor: vfx.glowColor,
      shadow: vfx.shadow,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      chromaticAberration: vfx.chromaticAberration,
      rgbSplit: vfx.rgbSplit,
      glitch: vfx.glitch,
      noise: vfx.noise,
      scanlines: false,
    }),
  };

  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: layer.color || '#ffffff',
              fontSize: `${layer.fontSize || 36}px`,
              fontWeight: layer.fontWeight || 800,
              fontFamily: layer.fontFamily || 'Inter, sans-serif',
              letterSpacing: `${layer.letterSpacing || 0}em`,
              textShadow: vfx.glow > 0 ? `0 0 ${vfx.glow}px ${vfx.glowColor}` : 'none',
              textAlign: 'center',
            }}
          >
            {layer.text || 'MOTION STUDIO'}
          </div>
        );

      case 'ui-card':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: layer.fillColor || 'linear-gradient(135deg, #1e293b, #0f172a)',
              borderRadius: `${layer.borderRadius || 16}px`,
              border: `1px solid ${layer.strokeColor || '#38bdf844'}`,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>{layer.name}</div>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Dynamic Animated Card Element</div>
          </div>
        );

      case 'badge':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: layer.fillColor || '#38bdf8',
              color: '#080d1a',
              borderRadius: `${layer.borderRadius || 30}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {layer.text || 'POPULAR PRESET'}
          </div>
        );

      case 'shape':
      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: layer.fillColor || 'linear-gradient(135deg, #38bdf8, #a855f7)',
              borderRadius: `${layer.borderRadius || 12}px`,
              border: layer.strokeWidth ? `${layer.strokeWidth}px solid ${layer.strokeColor}` : 'none',
            }}
          />
        );
    }
  };

  return (
    <div
      style={transformStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {renderContent()}

      {/* Selection outline & corner handles */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            border: '1.5px solid #38bdf8',
            borderRadius: Math.max(4, (layer.borderRadius || 0) + 2),
            pointerEvents: 'none',
          }}
        >
          {/* Corner anchor nodes */}
          <div style={{ position: 'absolute', top: -3, left: -3, width: 6, height: 6, background: '#38bdf8', borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: -3, right: -3, width: 6, height: 6, background: '#38bdf8', borderRadius: 1 }} />
          <div style={{ position: 'absolute', bottom: -3, left: -3, width: 6, height: 6, background: '#38bdf8', borderRadius: 1 }} />
          <div style={{ position: 'absolute', bottom: -3, right: -3, width: 6, height: 6, background: '#38bdf8', borderRadius: 1 }} />
        </div>
      )}
    </div>
  );
}
