import {
  AnimatedCharacterState,
  KineticTypographyConfig,
} from './universalTypographySchema';
import { KeyframePoint } from '../../features/graph-editor/types';

const CIPHER_GLYPHS = ['#', '$', '%', '&', '*', '@', '!', '?', '<', '>', '/', '\\', '0', '1'];

export class UniversalTypographyEngine {
  /**
   * Evaluates character-by-character kinetic animation states for a given progress/time.
   */
  static evaluateTypography(
    config: KineticTypographyConfig,
    timeSeconds: number
  ): AnimatedCharacterState[] {
    const chars = Array.from(config.text);
    const totalChars = chars.length;
    const states: AnimatedCharacterState[] = [];

    chars.forEach((char, idx) => {
      const charDelaySec = (idx * config.staggerMs) / 1000;
      const localTime = Math.max(0, timeSeconds - charDelaySec);
      const normProgress = Math.min(1.0, localTime / (config.durationMs / 1000 || 1));

      let displayChar = char;
      let y = 0;
      let scale = 1.0;
      let rotationDeg = 0;
      let opacity = 1.0;
      let blurPx = 0;

      switch (config.animationMode) {
        case 'scramble-matrix': {
          if (normProgress < 1.0) {
            // Scramble glyph
            const glyphIdx = Math.floor(Math.sin(timeSeconds * 30 + idx) * 1000) % CIPHER_GLYPHS.length;
            displayChar = CIPHER_GLYPHS[Math.abs(glyphIdx)];
            opacity = Math.max(0.3, normProgress);
            blurPx = (1.0 - normProgress) * 3;
          }
          break;
        }

        case 'kinetic-wave': {
          // Sine wave oscillation
          const phase = timeSeconds * 6 - idx * 0.45;
          y = Math.sin(phase) * 18;
          scale = 1.0 + Math.sin(phase) * 0.15;
          rotationDeg = Math.cos(phase) * 6;
          break;
        }

        case 'elastic-char-pop': {
          if (normProgress < 1.0) {
            // 2nd order spring overshoot
            const springProgress = Math.sin(normProgress * Math.PI * 1.5);
            scale = Math.max(0, 1.0 + (1.0 - normProgress) * 0.6 * Math.sin(normProgress * 15));
            y = (1.0 - normProgress) * 30;
            opacity = Math.min(1.0, normProgress * 2);
          }
          break;
        }

        case 'typewriter': {
          const revealedCount = Math.floor(timeSeconds * 12);
          opacity = idx <= revealedCount ? 1.0 : 0.0;
          if (idx === revealedCount) {
            y = -4; // Cursor bounce
          }
          break;
        }

        case 'word-stagger-rise': {
          const wordIdx = config.text.slice(0, idx).split(' ').length - 1;
          const wordDelay = wordIdx * 0.15;
          const wordTime = Math.max(0, timeSeconds - wordDelay);
          const wProg = Math.min(1.0, wordTime / 0.5);
          y = (1.0 - wProg) * 24;
          opacity = wProg;
          break;
        }
      }

      states.push({
        charIndex: idx,
        originalChar: char,
        displayChar,
        x: idx * (config.fontSize * 0.6 + config.letterSpacingPx),
        y,
        scale,
        rotationDeg,
        opacity,
        blurPx,
        color: config.fillColor,
      });
    });

    return states;
  }

  /**
   * Bakes typography animation trajectory into standard Bézier keyframes.
   */
  static bakeTypographyToKeyframes(
    config: KineticTypographyConfig,
    durationSeconds = 2.0,
    fps = 60
  ): KeyframePoint[] {
    const totalFrames = Math.round(durationSeconds * fps);
    const keyframes: KeyframePoint[] = [];

    for (let f = 0; f <= totalFrames; f += 3) {
      const timeSec = f / fps;
      const states = this.evaluateTypography(config, timeSec);
      const avgY = states.reduce((sum, s) => sum + s.y, 0) / (states.length || 1);

      keyframes.push({
        id: 9950 + f,
        time: Math.round((f / totalFrames) * 100 * 10) / 10,
        value: Math.round(avgY * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.25, y: avgY },
        handleOut: { x: 0.25, y: avgY },
      });
    }

    return keyframes;
  }
}
