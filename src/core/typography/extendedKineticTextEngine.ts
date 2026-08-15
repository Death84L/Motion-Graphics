import { KeyframePoint } from '../../features/graph-editor/types';

export type ExtendedTypographyStyle =
  | 'liquid-chrome'
  | 'alex-hormozi'
  | 'mrbeast-comic'
  | 'origami-fold'
  | 'split-flap'
  | 'ascii-terminal'
  | 'cyberpunk-neon'
  | 'chalkboard';

export interface KineticTextCharacterState {
  index: number;
  char: string;
  displayChar: string;
  x: number;
  y: number;
  scale: number;
  rotationDeg: number;
  opacity: number;
  fontWeight: number;
  color: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: string;
  filter?: string;
}

export class ExtendedKineticTextEngine {
  /**
   * Evaluates character-level transforms, styling, and shaders across all 8 extended kinetic text modes.
   */
  static evaluateExtendedStyle(
    text: string,
    style: ExtendedTypographyStyle,
    timeSeconds: number,
    fontSize = 36,
    audioBassLevel = 0.5
  ): KineticTextCharacterState[] {
    const chars = Array.from(text);
    const states: KineticTextCharacterState[] = [];

    // Identify emphasized keywords for Hormozi/MrBeast styles
    const words = text.split(' ');
    const firstWordLen = words[0]?.length || 0;

    chars.forEach((char, idx) => {
      const charDelay = idx * 0.04;
      const localTime = Math.max(0, timeSeconds - charDelay);
      const phase = localTime * 8;

      let displayChar = char;
      let y = 0;
      let scale = 1.0;
      let rotationDeg = 0;
      let opacity = 1.0;
      let fontWeight = 700;
      let color = '#f8fafc';
      let backgroundColor: string | undefined = undefined;
      let strokeColor: string | undefined = undefined;
      let strokeWidth = 0;
      let shadow: string | undefined = undefined;
      let filter: string | undefined = undefined;

      switch (style) {
        case 'liquid-chrome': {
          // Molten mercury specular shine and undulating wave
          y = Math.sin(phase + idx * 0.5) * 8;
          color = '#e2e8f0';
          shadow = '0 0 12px rgba(255, 255, 255, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6)';
          filter = 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.5))';
          fontWeight = 900;
          break;
        }

        case 'alex-hormozi': {
          // Punchy high-contrast yellow/green highlight box with spring pop
          const isHighlighted = idx < firstWordLen;
          color = isHighlighted ? '#facc15' : '#ffffff'; // Vibrant Yellow
          backgroundColor = isHighlighted ? 'rgba(0, 0, 0, 0.85)' : undefined;
          fontWeight = 900;
          scale = isHighlighted ? 1.15 : 1.0;
          strokeColor = '#000000';
          strokeWidth = 2;
          shadow = '0 4px 0 #000000';
          break;
        }

        case 'mrbeast-comic': {
          // Bold tilted comic typography with thick black stroke and drop shadow
          rotationDeg = Math.sin(idx * 1.2) * 6;
          color = idx % 2 === 0 ? '#38bdf8' : '#f59e0b';
          strokeColor = '#040711';
          strokeWidth = 3;
          fontWeight = 900;
          scale = 1.08 + Math.sin(phase) * 0.05;
          shadow = '4px 4px 0 #000000';
          break;
        }

        case 'origami-fold': {
          // 3D paper folding angle rotation
          const foldAngle = Math.cos(phase) * 45;
          rotationDeg = foldAngle;
          scale = Math.max(0.6, Math.abs(Math.cos(phase)));
          opacity = Math.min(1.0, 0.5 + Math.abs(Math.cos(phase)) * 0.5);
          color = '#38bdf8';
          break;
        }

        case 'split-flap': {
          // Mechanical airport departures board cascading flip
          const flipPhase = Math.floor(localTime * 10) % 10;
          if (flipPhase < 5) {
            displayChar = String.fromCharCode(65 + ((idx * 3 + flipPhase) % 26));
            scale = 0.9;
          }
          backgroundColor = '#0b0f19';
          color = '#f8fafc';
          shadow = '0 2px 4px rgba(0,0,0,0.8)';
          fontWeight = 800;
          break;
        }

        case 'ascii-terminal': {
          // Retro green terminal monospace
          color = '#22c55e';
          shadow = '0 0 8px rgba(34, 197, 94, 0.8)';
          fontWeight = 600;
          break;
        }

        case 'cyberpunk-neon': {
          // Blinking neon tube with electrical flickering
          const flicker = Math.sin(timeSeconds * 40 + idx) > 0.85 ? 0.3 : 1.0;
          opacity = flicker;
          color = '#ec4899';
          shadow = `0 0 16px ${flicker > 0.5 ? '#ec4899' : 'transparent'}, 0 0 32px #38bdf8`;
          fontWeight = 900;
          break;
        }

        case 'chalkboard': {
          // Dusty chalkboard writing
          color = '#f1f5f9';
          opacity = 0.85 + Math.sin(idx) * 0.1;
          filter = 'blur(0.4px)';
          fontWeight = 700;
          break;
        }
      }

      // Audio Bass variable font weight boost
      if (audioBassLevel > 0.3) {
        fontWeight = Math.min(900, Math.round(fontWeight + audioBassLevel * 200));
      }

      states.push({
        index: idx,
        char,
        displayChar,
        x: idx * (fontSize * 0.62),
        y,
        scale,
        rotationDeg,
        opacity,
        fontWeight,
        color,
        backgroundColor,
        strokeColor,
        strokeWidth,
        shadow,
        filter,
      });
    });

    return states;
  }

  /**
   * Bakes Extended Kinetic Typography Trajectory into Standard Bézier Keyframes.
   */
  static bakeStyleToKeyframes(
    text: string,
    style: ExtendedTypographyStyle,
    durationSec = 2.0,
    fps = 60
  ): KeyframePoint[] {
    const totalFrames = Math.round(durationSec * fps);
    const keyframes: KeyframePoint[] = [];

    for (let f = 0; f <= totalFrames; f += 4) {
      const timeSec = f / fps;
      const states = this.evaluateExtendedStyle(text, style, timeSec);
      const avgY = states.reduce((sum, s) => sum + s.y, 0) / (states.length || 1);

      keyframes.push({
        id: 9800 + f,
        time: Math.round((f / totalFrames) * 100 * 10) / 10,
        value: Math.round(avgY * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.2, y: avgY },
        handleOut: { x: 0.2, y: avgY },
      });
    }

    return keyframes;
  }
}
