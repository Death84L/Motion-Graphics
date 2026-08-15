import { TextAnimationConfig, StaggeredItemState } from '../types/textAnimator.types';

/**
 * Evaluates individual character/word transform states at any given animation frame.
 */
export function evaluateTextAnimationAtTime(
  config: TextAnimationConfig,
  currentFrame: number,
  fps = 30
): { items: StaggeredItemState[]; currentTracking: number } {
  const {
    text,
    staggerMode,
    effect,
    staggerDelayMs,
    durationPerItemFrames,
    overshootPercent,
    trackingStartEm,
    trackingEndEm,
  } = config;

  // Split items based on mode
  let units: string[] = [];
  if (staggerMode === 'character') {
    units = text.split('');
  } else if (staggerMode === 'word') {
    units = text.split(' ');
  } else {
    units = text.split('\n');
  }

  const staggerFramesPerItem = (staggerDelayMs / 1000) * fps;
  const items: StaggeredItemState[] = [];

  units.forEach((char, idx) => {
    const itemStartFrame = idx * staggerFramesPerItem;
    const elapsed = currentFrame - itemStartFrame;

    let progress = 0;
    if (elapsed > 0) {
      progress = Math.min(1, elapsed / durationPerItemFrames);
    }

    let opacity = 0;
    let translateY = 0;
    let scale = 1;
    let blur = 0;
    let rotation = 0;

    switch (effect) {
      case 'typewriter': {
        opacity = elapsed >= 0 ? 1 : 0;
        translateY = 0;
        scale = 1;
        break;
      }

      case 'slide-up-bounce': {
        opacity = Math.min(1, progress * 2.5);
        if (progress === 0) {
          translateY = 40;
        } else if (progress < 0.65) {
          const p = progress / 0.65;
          translateY = 40 * (1 - p) - (overshootPercent / 100) * 15 * Math.sin(p * Math.PI);
        } else {
          translateY = 0;
        }
        break;
      }

      case 'pop-scale': {
        opacity = Math.min(1, progress * 3);
        if (progress === 0) {
          scale = 0;
        } else if (progress < 0.7) {
          scale = 1 + (overshootPercent / 100) * Math.sin((progress / 0.7) * Math.PI);
        } else {
          scale = 1;
        }
        break;
      }

      case 'blur-tracking': {
        opacity = Math.min(1, progress * 2);
        blur = (1 - progress) * 12;
        translateY = (1 - progress) * 15;
        break;
      }

      case 'elastic-drop': {
        opacity = Math.min(1, progress * 2);
        translateY = (1 - progress) * -50 * Math.cos(progress * Math.PI * 3);
        break;
      }

      default: {
        opacity = progress;
        translateY = (1 - progress) * 20;
      }
    }

    items.push({
      index: idx,
      char,
      delayFrames: itemStartFrame,
      progress,
      opacity,
      translateY: Math.round(translateY * 10) / 10,
      scale: Math.round(scale * 100) / 100,
      blur: Math.round(blur * 10) / 10,
      rotation,
    });
  });

  // Calculate global tracking interpolation
  const totalDuration = units.length * staggerFramesPerItem + durationPerItemFrames;
  const globalProgress = Math.min(1, currentFrame / totalDuration);
  const currentTracking = trackingStartEm + (trackingEndEm - trackingStartEm) * globalProgress;

  return { items, currentTracking };
}
