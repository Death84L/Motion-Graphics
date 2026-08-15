export type TypographyAnimationMode =
  | 'scramble-matrix'
  | 'kinetic-wave'
  | 'elastic-char-pop'
  | 'typewriter'
  | 'word-stagger-rise';

export interface AnimatedCharacterState {
  charIndex: number;
  originalChar: string;
  displayChar: string;
  x: number;
  y: number;
  scale: number;
  rotationDeg: number;
  opacity: number;
  blurPx: number;
  color: string;
}

export interface KineticTypographyConfig {
  text: string;
  fontSize: number;
  letterSpacingPx: number;
  lineHeightPx: number;
  animationMode: TypographyAnimationMode;
  progress: number; // 0.0 to 1.0 (or continuous time)
  staggerMs: number; // e.g. 40ms per char
  durationMs: number;
  fillColor: string;
  glowColor: string;
}

export const SAMPLE_TYPOGRAPHY_PRESETS: { id: string; name: string; mode: TypographyAnimationMode; desc: string }[] = [
  { id: 't1', name: 'Matrix Scramble Glitch', mode: 'scramble-matrix', desc: 'Cyberpunk cipher scramble decoding left-to-right.' },
  { id: 't2', name: 'Kinetic Harmonic Wave', mode: 'kinetic-wave', desc: 'Smooth sinusoidal bouncing wave traveling across characters.' },
  { id: 't3', name: 'Elastic Spring Pop', mode: 'elastic-char-pop', desc: 'Punchy 2nd-order harmonic spring scale overshoot per letter.' },
  { id: 't4', name: 'Cinematic Typewriter', mode: 'typewriter', desc: 'Classic mechanical typewriter reveal with blinking cursor.' },
  { id: 't5', name: 'Word Stagger Rise', mode: 'word-stagger-rise', desc: 'Elegant staggered word entrance with vertical momentum.' },
];
