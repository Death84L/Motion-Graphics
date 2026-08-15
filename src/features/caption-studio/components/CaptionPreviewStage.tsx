import React from 'react';
import {
  CaptionSegment,
  CaptionStyleConfig,
  CaptionSpeaker,
  CaptionAspectSafeZone,
} from '../../../core/caption/captionModel';
import { EvaluatedWordAnimation } from '../../../core/caption/captionAnimationEngine';

interface CaptionPreviewStageProps {
  activeSegment: CaptionSegment | null;
  evaluatedWords: EvaluatedWordAnimation[];
  speakers: CaptionSpeaker[];
  style: CaptionStyleConfig;
  safeZone: CaptionAspectSafeZone;
}

export function CaptionPreviewStage({
  activeSegment,
  evaluatedWords,
  speakers,
  style,
  safeZone,
}: CaptionPreviewStageProps) {
  const activeSpeaker = activeSegment
    ? speakers.find((s) => s.id === activeSegment.speakerId) || speakers[0]
    : null;

  // Safe area dimensions based on aspect
  const isVertical = safeZone === 'tiktok-reels-9-16';
  const isSquare = safeZone === 'instagram-1-1';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040711',
        position: 'relative',
        overflow: 'hidden',
        padding: 16,
      }}
    >
      {/* Aspect Ratio Screen Box */}
      <div
        style={{
          width: isVertical ? 270 : isSquare ? 380 : 540,
          height: isVertical ? 480 : isSquare ? 380 : 304,
          background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
          borderRadius: 14,
          border: '1px solid #1e293b',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: 24,
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          transition: 'width 0.25s ease, height 0.25s ease',
        }}
      >
        {/* Broadcast / Social Safe Zone Guide Box */}
        <div
          style={{
            position: 'absolute',
            inset: isVertical ? '40px 20px' : '24px 32px',
            border: '1px dashed rgba(56, 189, 248, 0.25)',
            borderRadius: 8,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            padding: 4,
          }}
        >
          <span style={{ fontSize: 8, color: '#38bdf8', opacity: 0.6, fontWeight: 700 }}>
            SAFE AREA [{safeZone.toUpperCase()}]
          </span>
        </div>

        {/* Render Active Animated Caption Segment */}
        {activeSegment && evaluatedWords.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              zIndex: 10,
              maxWidth: '90%',
            }}
          >
            {/* Speaker Pill Tag */}
            {activeSpeaker && (
              <div
                style={{
                  background: 'rgba(9, 14, 26, 0.85)',
                  border: `1px solid ${activeSpeaker.color}88`,
                  borderRadius: 12,
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: `0 0 10px ${activeSpeaker.color}44`,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeSpeaker.color }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: activeSpeaker.color }}>
                  {activeSpeaker.name}
                </span>
              </div>
            )}

            {/* Word Cluster with Live Karaoke & Kinetic Scale */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.28em',
                background: style.backgroundColor || 'transparent',
                padding: `${style.backgroundPaddingPx || 6}px 12px`,
                borderRadius: style.borderRadiusPx || 8,
                boxShadow: style.shadowElevationPx ? `0 10px 24px rgba(0,0,0,0.5)` : undefined,
              }}
            >
              {evaluatedWords.map((w) => {
                const isHighlight = w.isActive;
                const activeColor = w.colorOverride || style.highlightColor;

                return (
                  <span
                    key={w.wordId}
                    style={{
                      display: 'inline-block',
                      fontFamily: style.fontFamily,
                      fontSize: `${isVertical ? style.fontSizePx * 0.75 : style.fontSizePx * 0.85}px`,
                      fontWeight: style.fontWeight,
                      textTransform: style.textTransform || 'uppercase',
                      color: isHighlight ? activeColor : w.isPast ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      transform: `translateY(${w.translateY}px) scale(${w.scale})`,
                      textShadow: isHighlight
                        ? `0 0 ${w.glowIntensity}px ${activeColor}, 0 2px 4px #000`
                        : '0 2px 4px #000',
                      transition: 'transform 0.08s ease-out, color 0.1s ease',
                      padding: isHighlight && style.highlightStyle === 'pill-box' ? '0 4px' : undefined,
                      background:
                        isHighlight && style.highlightStyle === 'pill-box'
                          ? 'rgba(56, 189, 248, 0.25)'
                          : undefined,
                      borderRadius: 4,
                      userSelect: 'none',
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', zIndex: 10 }}>
            No caption active at current playhead position
          </div>
        )}
      </div>
    </div>
  );
}
