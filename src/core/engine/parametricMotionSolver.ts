import {
  AnimatableProperty,
  ParametricBlockConfig,
  AnimationStageSequence,
  ObjectAnimationModel,
} from './universalAnimationModel';

/**
 * Pure Mathematical Easing Evaluator
 */
export function evaluateEasingProgress(progress: number, easeType = 'easeInOut'): number {
  const t = Math.max(0, Math.min(1, progress));

  switch (easeType) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'cubic':
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    case 'back': {
      const s = 1.70158;
      return t * t * ((s + 1) * t - s);
    }
    case 'spring': {
      return 1 - Math.exp(-6 * t) * Math.cos(8 * t);
    }
    case 'elastic': {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return -Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1.1) * 2 * Math.PI) / 0.4);
    }
    case 'bounce': {
      let n = t;
      if (n < 1 / 2.75) return 7.5625 * n * n;
      if (n < 2 / 2.75) return 7.5625 * (n -= 1.5 / 2.75) * n + 0.75;
      if (n < 2.5 / 2.75) return 7.5625 * (n -= 2.25 / 2.75) * n + 0.9375;
      return 7.5625 * (n -= 2.625 / 2.75) * n + 0.984375;
    }
    case 'easeInOut':
    default:
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

/**
 * Evaluates an individual parametric block contribution at a given frame.
 */
export function evaluateBlockAtFrame(
  block: ParametricBlockConfig,
  currentFrame: number,
  property: AnimatableProperty
): number {
  if (!block.enabled || block.muted) return 0;
  if (!block.targetProperties.includes(property)) return 0;

  const start = block.startFrame + (block.delayFrames || 0);
  const dur = Math.max(1, block.durationFrames);
  const elapsed = currentFrame - start;

  if (elapsed < 0 && block.stage === 'entrance') return 0;

  let localTime = elapsed;
  if (block.loopCount === 0 || (block.loopCount > 1 && elapsed > 0)) {
    localTime = elapsed % dur;
  }

  if (block.pingPong) {
    const cycle = Math.floor(elapsed / dur);
    if (cycle % 2 === 1) {
      localTime = dur - localTime;
    }
  }

  let progress = Math.max(0, Math.min(1, localTime / dur));
  if (block.reverse) {
    progress = 1 - progress;
  }

  const eased = evaluateEasingProgress(progress, block.ease);
  const intensity = block.intensity ?? 1.0;
  const deltaV = (block.targetValue - block.startValue) * intensity;

  // Compute block type physics / procedural formulas
  switch (block.presetId) {
    case 'harmonic-spring': {
      const stiffness = block.params.stiffness || 140;
      const damping = block.params.damping || 12;
      const mass = block.params.mass || 1.0;
      const omega = Math.sqrt(stiffness / mass);
      const decay = Math.exp((-damping * progress * 5) / mass);
      const osc = Math.cos(omega * progress * 4);
      return block.startValue + deltaV * (1 - decay * osc);
    }

    case 'slide-overshoot':
    case 'scale-pop': {
      const overshootPct = (block.params.overshootPercent || 15) / 100;
      const decay = block.params.reboundDecay || 0.75;
      if (progress < 0.65) {
        const p = progress / 0.65;
        const curve = evaluateEasingProgress(p, 'easeOut');
        return block.startValue + deltaV * (curve + overshootPct * Math.sin(p * Math.PI));
      } else {
        const p = (progress - 0.65) / 0.35;
        const rebound = overshootPct * Math.exp(-p * 3 * decay) * Math.cos(p * Math.PI * 2);
        return block.startValue + deltaV * (1 + rebound);
      }
    }

    case 'gravity-bounce': {
      const bounceCount = 4;
      const bounceHeight = Math.abs(Math.sin(progress * Math.PI * bounceCount)) * Math.exp(-progress * 3);
      return block.startValue + deltaV * (eased - bounceHeight * 0.3);
    }

    case 'natural-wiggle': {
      const freq = block.params.frequency || 2.5;
      const amp = (block.params.amplitude || 10) * intensity;
      const noise = Math.sin(currentFrame * 0.15 * freq) * 0.7 + Math.sin(currentFrame * 0.32 * freq + 1.1) * 0.3;
      return noise * amp;
    }

    case 'perlin-noise': {
      const amp = (block.params.amplitude || 8) * intensity;
      const pseudo = Math.sin(currentFrame * 8.7 + Math.cos(currentFrame * 3.2) * 4) * amp;
      return pseudo;
    }

    case 'sine-wave': {
      const freq = block.params.frequency || 3.0;
      const amp = (block.params.amplitude || 12) * intensity;
      return Math.sin((progress * Math.PI * 2 * freq)) * amp;
    }

    case 'quantize-steps': {
      const steps = block.params.stepsCount || 8;
      const stepped = Math.round(eased * steps) / steps;
      return block.startValue + deltaV * stepped;
    }

    case 'move-linear':
    case 'fade-in':
    case 'fade-out':
    case 'scale-uniform':
    case 'rotate-spin':
    default:
      return block.startValue + deltaV * eased;
  }
}

/**
 * Universal Evaluator: Evaluates an entire Object Animation Model combining all stages, blocks, and blend modes.
 */
export function evaluateObjectPropertyAtFrame(
  model: ObjectAnimationModel,
  property: AnimatableProperty,
  currentFrame: number,
  defaultValue = 0
): number {
  if (!model.enabled) return defaultValue;

  let currentVal = defaultValue;
  let hasActiveAssignment = false;

  for (const stage of model.stages) {
    if (!stage.enabled) continue;

    for (const block of stage.blocks) {
      if (!block.enabled || !block.targetProperties.includes(property)) continue;

      const blockContribution = evaluateBlockAtFrame(block, currentFrame, property);

      if (!hasActiveAssignment || block.blendMode === 'replace') {
        currentVal = blockContribution;
        hasActiveAssignment = true;
      } else if (block.blendMode === 'additive') {
        currentVal += blockContribution;
      } else if (block.blendMode === 'multiply') {
        currentVal = (currentVal * blockContribution) / 100;
      } else if (block.blendMode === 'overlay') {
        currentVal = currentVal < 50 ? (2 * currentVal * blockContribution) / 100 : 100 - (2 * (100 - currentVal) * (100 - blockContribution)) / 100;
      }
    }
  }

  return Math.round(currentVal * 100) / 100;
}
