import { TextTokenItem } from './textTargetingEngine';
import { evaluateEasingProgress } from '../engine/parametricMotionSolver';

export type KineticTextStyle =
  | 'wave'
  | 'gravity-drop'
  | 'elastic-snap'
  | 'explosion-reassemble'
  | 'tracking-expansion'
  | 'glitch-scramble';

export interface CharacterTransformState {
  index: number;
  char: string;
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
  opacity: number;
  blur: number;
  trackingEm: number;
}

/**
 * Evaluates the precise 2D kinematic transformation for each character item at a given frame.
 */
export function evaluateKineticTextTransform(
  token: TextTokenItem,
  currentFrame: number,
  style: KineticTextStyle = 'elastic-snap',
  durationFrames = 22,
  intensity = 1.0
): CharacterTransformState {
  const elapsed = currentFrame - token.frameDelay;
  const progress = Math.max(0, Math.min(1, elapsed / durationFrames));

  let tx = 0;
  let ty = 0;
  let sc = 1.0;
  let rot = 0;
  let op = 1.0;
  let bl = 0;
  let tr = 0.05;

  if (elapsed < 0) {
    // Before stagger trigger
    return {
      index: token.index,
      char: token.text,
      translateX: 0,
      translateY: 40 * intensity,
      scale: 0.2,
      rotation: -10,
      opacity: 0,
      blur: 10,
      trackingEm: 0.25,
    };
  }

  switch (style) {
    case 'wave': {
      const spatialAngle = token.index * 0.45;
      const waveY = Math.sin(currentFrame * 0.2 + spatialAngle) * 14 * intensity;
      ty = waveY;
      sc = 1.0 + Math.sin(currentFrame * 0.2 + spatialAngle) * 0.08 * intensity;
      rot = Math.cos(currentFrame * 0.2 + spatialAngle) * 4 * intensity;
      op = Math.min(1, progress * 2);
      break;
    }

    case 'gravity-drop': {
      if (progress < 1) {
        const fall = evaluateEasingProgress(progress, 'bounce');
        ty = -80 * (1 - fall) * intensity;
        sc = 1.0 + (1 - fall) * 0.2;
        op = evaluateEasingProgress(progress, 'easeOut');
        bl = (1 - progress) * 8;
      }
      break;
    }

    case 'elastic-snap': {
      const ease = evaluateEasingProgress(progress, 'elastic');
      ty = (1 - ease) * 50 * intensity;
      sc = 0.4 + ease * 0.6;
      rot = (1 - ease) * -15 * intensity;
      op = Math.min(1, progress * 3);
      bl = (1 - progress) * 6;
      break;
    }

    case 'explosion-reassemble': {
      const scatterAngle = (token.index * 137.5 * Math.PI) / 180;
      const dist = (1 - progress) * 90 * intensity;
      tx = Math.cos(scatterAngle) * dist;
      ty = Math.sin(scatterAngle) * dist;
      rot = (1 - progress) * 45 * (token.index % 2 === 0 ? 1 : -1);
      sc = 0.3 + progress * 0.7;
      op = evaluateEasingProgress(progress, 'easeOut');
      bl = (1 - progress) * 12;
      break;
    }

    case 'tracking-expansion': {
      tr = 0.35 - progress * 0.3; // Expands from wide to compact
      ty = (1 - progress) * 20 * intensity;
      op = evaluateEasingProgress(progress, 'easeOut');
      bl = (1 - progress) * 10;
      break;
    }

    case 'glitch-scramble': {
      if (progress < 0.8) {
        tx = (Math.random() - 0.5) * 8 * intensity;
        ty = (Math.random() - 0.5) * 8 * intensity;
        rot = (Math.random() - 0.5) * 10;
        op = 0.6 + Math.random() * 0.4;
        bl = Math.random() * 4;
      }
      break;
    }

    default:
      break;
  }

  return {
    index: token.index,
    char: token.text,
    translateX: Math.round(tx * 10) / 10,
    translateY: Math.round(ty * 10) / 10,
    scale: Math.round(sc * 100) / 100,
    rotation: Math.round(rot * 10) / 10,
    opacity: Math.max(0, Math.min(1, Math.round(op * 100) / 100)),
    blur: Math.round(bl * 10) / 10,
    trackingEm: Math.round(tr * 100) / 100,
  };
}
