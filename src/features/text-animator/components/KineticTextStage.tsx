import React from 'react';
import { CharacterTransformState } from '../../../core/text/kineticTypographyEngine';
import { TypewriterFrameState } from '../../../core/text/typewriterEngine';

interface KineticTextStageProps {
  characters: CharacterTransformState[];
  typewriterState?: TypewriterFrameState;
  isTypewriterMode: boolean;
  fontSize: number;
  textColor: string;
  glowColor: string;
}

export function KineticTextStage({
  characters,
  typewriterState,
  isTypewriterMode,
  fontSize = 48,
  textColor = '#f8fafc',
  glowColor = '#38bdf8',
}: KineticTextStageProps) {
  if (isTypewriterMode && typewriterState) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 180,
          fontFamily: 'monospace',
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          color: textColor,
          textShadow: `0 0 20px ${glowColor}88`,
          letterSpacing: '0.05em',
        }}
      >
        <span>{typewriterState.visibleText}</span>
        <span
          style={{
            opacity: typewriterState.cursorVisible ? 1 : 0,
            color: glowColor,
            marginLeft: 2,
            fontWeight: 300,
          }}
        >
          |
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
        flexWrap: 'wrap',
        gap: '0.02em',
        padding: 20,
      }}
    >
      {characters.map((c, i) => (
        <span
          key={`${c.char}-${i}`}
          style={{
            display: 'inline-block',
            fontSize: `${fontSize}px`,
            fontWeight: 800,
            color: textColor,
            transform: `translate(${c.translateX}px, ${c.translateY}px) scale(${c.scale}) rotate(${c.rotation}deg)`,
            opacity: c.opacity,
            filter: c.blur > 0 ? `blur(${c.blur}px)` : undefined,
            marginRight: `${c.trackingEm}em`,
            textShadow: `0 0 16px ${glowColor}66`,
            whiteSpace: c.char === ' ' ? 'pre' : 'normal',
            transition: 'transform 0.05s ease-out, filter 0.05s ease-out',
            userSelect: 'none',
          }}
        >
          {c.char === ' ' ? '\u00A0' : c.char}
        </span>
      ))}
    </div>
  );
}
