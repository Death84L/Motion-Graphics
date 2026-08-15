import { KeyframePoint } from '../../graph-editor/types';
import { AnimationBuilderRecipe, AnimationBlockConfig } from '../types/builder.types';
import { TimelineTrackChannel } from '../../timeline/types/timeline.types';

export interface CompiledAnimationResult {
  channels: TimelineTrackChannel[];
  totalFrames: number;
}

/**
 * Compiles modular animation blocks into synchronized keyframe tracks across Position, Scale, Rotation, Opacity, and Blur.
 */
export function compileAnimationRecipe(recipe: AnimationBuilderRecipe): CompiledAnimationResult {
  const activeBlocks = recipe.blocks.filter((b) => b.enabled);
  const maxEndFrame = Math.max(100, ...activeBlocks.map((b) => b.startFrame + b.durationFrames));

  // Initialize channels
  const posYKeys: KeyframePoint[] = [];
  const scaleKeys: KeyframePoint[] = [];
  const rotKeys: KeyframePoint[] = [];
  const opacityKeys: KeyframePoint[] = [];
  const blurKeys: KeyframePoint[] = [];

  // Default baseline at frame 0
  posYKeys.push({ id: 101, time: 0, value: 0, type: 'bezier', ease: 'easeInOut' });
  scaleKeys.push({ id: 201, time: 0, value: 100, type: 'bezier', ease: 'easeInOut' });
  rotKeys.push({ id: 301, time: 0, value: 0, type: 'bezier', ease: 'easeInOut' });
  opacityKeys.push({ id: 401, time: 0, value: 100, type: 'bezier', ease: 'easeInOut' });
  blurKeys.push({ id: 501, time: 0, value: 0, type: 'bezier', ease: 'easeInOut' });

  for (const block of activeBlocks) {
    const t0 = block.startFrame;
    const dur = block.durationFrames;
    const tEnd = t0 + dur;
    const intensity = block.intensity || 1.0;

    // --- 1. ENTRANCE PHASE ---
    if (block.phase === 'entrance') {
      switch (block.preset) {
        case 'slide-up-overshoot': {
          posYKeys.push(
            { id: 110, time: t0, value: 120 * intensity, type: 'bezier' },
            { id: 111, time: t0 + dur * 0.6, value: -16 * intensity, type: 'bezier' },
            { id: 112, time: tEnd, value: 0, type: 'bezier', ease: 'easeInOut' }
          );
          opacityKeys.push(
            { id: 410, time: t0, value: 0, type: 'bezier' },
            { id: 411, time: t0 + dur * 0.4, value: 100, type: 'bezier' }
          );
          scaleKeys.push(
            { id: 210, time: t0, value: 85, type: 'bezier' },
            { id: 211, time: t0 + dur * 0.65, value: 106 * intensity, type: 'bezier' },
            { id: 212, time: tEnd, value: 100, type: 'bezier' }
          );
          break;
        }

        case 'scale-pop': {
          scaleKeys.push(
            { id: 220, time: t0, value: 0, type: 'bezier' },
            { id: 221, time: t0 + dur * 0.55, value: 115 * intensity, type: 'bezier' },
            { id: 222, time: t0 + dur * 0.8, value: 96, type: 'bezier' },
            { id: 223, time: tEnd, value: 100, type: 'bezier' }
          );
          opacityKeys.push(
            { id: 420, time: t0, value: 0, type: 'bezier' },
            { id: 421, time: t0 + dur * 0.3, value: 100, type: 'bezier' }
          );
          break;
        }

        case 'drop-bounce': {
          posYKeys.push(
            { id: 130, time: t0, value: -180 * intensity, type: 'bezier' },
            { id: 131, time: t0 + dur * 0.5, value: 0, type: 'bezier' },
            { id: 132, time: t0 + dur * 0.7, value: -25 * intensity, type: 'bezier' },
            { id: 133, time: tEnd, value: 0, type: 'bezier' }
          );
          break;
        }

        case 'blur-fade-in': {
          blurKeys.push(
            { id: 530, time: t0, value: 24 * intensity, type: 'bezier' },
            { id: 531, time: tEnd, value: 0, type: 'bezier', ease: 'easeOut' }
          );
          opacityKeys.push(
            { id: 430, time: t0, value: 0, type: 'bezier' },
            { id: 431, time: tEnd, value: 100, type: 'bezier', ease: 'easeOut' }
          );
          break;
        }
      }
    }

    // --- 2. EMPHASIS / IDLE PHASE ---
    if (block.phase === 'emphasis') {
      switch (block.preset) {
        case 'pulse-heartbeat': {
          const mid = t0 + dur * 0.5;
          scaleKeys.push(
            { id: 240, time: t0, value: 100, type: 'bezier' },
            { id: 241, time: mid, value: 100 + 12 * intensity, type: 'bezier' },
            { id: 242, time: tEnd, value: 100, type: 'bezier' }
          );
          break;
        }

        case 'float-hover': {
          const quarter = t0 + dur * 0.25;
          const half = t0 + dur * 0.5;
          const threeQ = t0 + dur * 0.75;
          posYKeys.push(
            { id: 150, time: t0, value: 0, type: 'bezier' },
            { id: 151, time: quarter, value: -14 * intensity, type: 'bezier' },
            { id: 152, time: half, value: 0, type: 'bezier' },
            { id: 153, time: threeQ, value: 10 * intensity, type: 'bezier' },
            { id: 154, time: tEnd, value: 0, type: 'bezier' }
          );
          rotKeys.push(
            { id: 350, time: t0, value: 0, type: 'bezier' },
            { id: 351, time: half, value: 3.5 * intensity, type: 'bezier' },
            { id: 352, time: tEnd, value: 0, type: 'bezier' }
          );
          break;
        }

        case 'shake-jitter': {
          const steps = 6;
          for (let s = 1; s <= steps; s++) {
            const t = t0 + (s / steps) * dur;
            const dir = s % 2 === 0 ? 1 : -1;
            rotKeys.push({ id: 360 + s, time: t, value: dir * 5 * intensity, type: 'bezier' });
          }
          rotKeys.push({ id: 370, time: tEnd, value: 0, type: 'bezier' });
          break;
        }
      }
    }

    // --- 3. EXIT PHASE ---
    if (block.phase === 'exit') {
      switch (block.preset) {
        case 'scale-collapse': {
          scaleKeys.push(
            { id: 280, time: t0, value: 100, type: 'bezier' },
            { id: 281, time: t0 + dur * 0.3, value: 108, type: 'bezier' },
            { id: 282, time: tEnd, value: 0, type: 'bezier', ease: 'easeIn' }
          );
          opacityKeys.push(
            { id: 480, time: t0, value: 100, type: 'bezier' },
            { id: 481, time: tEnd, value: 0, type: 'bezier', ease: 'easeIn' }
          );
          break;
        }

        case 'slide-down-fade': {
          posYKeys.push(
            { id: 190, time: t0, value: 0, type: 'bezier' },
            { id: 191, time: tEnd, value: 140 * intensity, type: 'bezier', ease: 'easeIn' }
          );
          opacityKeys.push(
            { id: 490, time: t0, value: 100, type: 'bezier' },
            { id: 491, time: tEnd, value: 0, type: 'bezier', ease: 'easeIn' }
          );
          break;
        }

        case 'blur-dissolve': {
          blurKeys.push(
            { id: 590, time: t0, value: 0, type: 'bezier' },
            { id: 591, time: tEnd, value: 30 * intensity, type: 'bezier' }
          );
          opacityKeys.push(
            { id: 495, time: t0, value: 100, type: 'bezier' },
            { id: 496, time: tEnd, value: 0, type: 'bezier' }
          );
          break;
        }
      }
    }
  }

  // Sort chronologically and assemble channels
  const sortKeys = (keys: KeyframePoint[]) => [...keys].sort((a, b) => a.time - b.time);

  return {
    totalFrames: maxEndFrame,
    channels: [
      { id: 'ch-pos-y', property: 'position-y', name: 'Position Y', color: '#38bdf8', visible: true, keyframes: sortKeys(posYKeys), currentValue: 0 },
      { id: 'ch-scale', property: 'scale', name: 'Scale', color: '#10b981', visible: true, keyframes: sortKeys(scaleKeys), currentValue: 100 },
      { id: 'ch-rot', property: 'rotation', name: 'Rotation', color: '#a855f7', visible: true, keyframes: sortKeys(rotKeys), currentValue: 0 },
      { id: 'ch-opac', property: 'opacity', name: 'Opacity', color: '#f59e0b', visible: true, keyframes: sortKeys(opacityKeys), currentValue: 100 },
      { id: 'ch-blur', property: 'blur', name: 'VFX Blur', color: '#ec4899', visible: true, keyframes: sortKeys(blurKeys), currentValue: 0 },
    ],
  };
}
