import { KeyframePoint } from '../../features/graph-editor/types';
import { calculateCurveDerivatives } from '../math/derivativesGraphEngine';
import { extractMotionProfile } from '../math/motionMatchingEngine';
import { MotionRecipe } from '../recipes/motionRecipeSchema';

export interface ReverseEngineeredMotionReport {
  detectedDurationMs: number;
  primaryEasingType: 'Cubic Bezier' | 'Spring Harmonic' | 'Linear' | 'Bounce';
  velocityProfile: 'Ease-In' | 'Ease-Out' | 'Ease-InOut' | 'Linear' | 'Punchy Ramp';
  overshootPercent: number;
  estimatedSpringDamping: number;
  estimatedStiffness: number;
  peakVelocityMultiplier: number;
  jerkScore: number;
  motionDnaScore: number;
  reconstructedRecipe: MotionRecipe;
  explanationSummary: string;
}

/**
 * Reverses an arbitrary keyframe sequence or sampled motion curve into its underlying
 * physical parameters and reconstructs an editable Motion Recipe.
 */
export function reverseEngineerMotion(keyframes: KeyframePoint[]): ReverseEngineeredMotionReport {
  if (keyframes.length < 2) {
    return {
      detectedDurationMs: 500,
      primaryEasingType: 'Cubic Bezier',
      velocityProfile: 'Ease-Out',
      overshootPercent: 0,
      estimatedSpringDamping: 0.8,
      estimatedStiffness: 120,
      peakVelocityMultiplier: 1.0,
      jerkScore: 10,
      motionDnaScore: 85,
      explanationSummary: 'Simple static or linear motion with minimal kinetic acceleration.',
      reconstructedRecipe: {
        id: `rebuilt-${Date.now()}`,
        name: 'Rebuilt Linear Motion',
        category: 'minimal',
        description: 'Reconstructed basic motion curve.',
        entrance: { enabled: true, durationMs: 500, easeType: 'cubic-bezier', overshootPercent: 0 },
        emphasis: { enabled: false, durationMs: 100, easeType: 'linear' },
        exit: { enabled: false, durationMs: 200, easeType: 'linear' },
      },
    };
  }

  const profile = extractMotionProfile(keyframes);
  const derivatives = calculateCurveDerivatives(keyframes, 100);
  const durationMs = Math.round(profile.duration * 1000);

  // Analyze velocity inflection
  let velProfile: ReverseEngineeredMotionReport['velocityProfile'] = 'Ease-Out';
  const midPointIdx = Math.floor(derivatives.length / 2);
  const startVel = Math.abs(derivatives[1]?.velocity || 0);
  const midVel = Math.abs(derivatives[midPointIdx]?.velocity || 0);
  const endVel = Math.abs(derivatives[derivatives.length - 2]?.velocity || 0);

  if (midVel > startVel && midVel > endVel) {
    velProfile = 'Ease-InOut';
  } else if (startVel > endVel && startVel > midVel) {
    velProfile = 'Ease-Out';
  } else if (endVel > startVel) {
    velProfile = 'Ease-In';
  }

  // Detect Spring / Bounce
  let easingType: ReverseEngineeredMotionReport['primaryEasingType'] = 'Cubic Bezier';
  if (profile.overshootPercent > 5) {
    easingType = 'Spring Harmonic';
  }

  const estimatedStiffness = Math.round(100 + profile.energyScore * 1.5);
  const estimatedDamping = profile.dampingEstimate;
  const jerkScore = Math.min(100, Math.round((profile.peakAcceleration / 10)));
  const motionDnaScore = Math.max(50, Math.min(100, Math.round(100 - jerkScore * 0.4)));

  const reconstructedRecipe: MotionRecipe = {
    id: `reconstructed-${Date.now()}`,
    name: `Rebuilt ${easingType} (${durationMs}ms)`,
    category: profile.overshootPercent > 10 ? 'social-punch' : 'cinematic',
    description: `Auto-reverse-engineered from source curve. Detected ${profile.overshootPercent}% overshoot with ${velProfile} velocity profile.`,
    entrance: {
      enabled: true,
      direction: 'bottom',
      distancePx: 60,
      durationMs: durationMs,
      easeType: profile.overshootPercent > 5 ? 'spring' : 'cubic-bezier',
      overshootPercent: profile.overshootPercent,
      springDamping: estimatedDamping,
    },
    emphasis: {
      enabled: profile.overshootPercent > 8,
      scaleFactor: 1.05,
      durationMs: 120,
      easeType: 'spring',
    },
    exit: {
      enabled: false,
      durationMs: 250,
      easeType: 'cubic-bezier',
    },
  };

  const explanationSummary = `Motion Studio analyzed ${keyframes.length} keyframes over ${durationMs}ms: Found a ${velProfile} trajectory with ${profile.overshootPercent}% kinetic overshoot, peak velocity of ${profile.peakVelocity} units/s, and estimated spring damping of ${estimatedDamping}.`;

  return {
    detectedDurationMs: durationMs,
    primaryEasingType: easingType,
    velocityProfile: velProfile,
    overshootPercent: profile.overshootPercent,
    estimatedSpringDamping: estimatedDamping,
    estimatedStiffness: estimatedStiffness,
    peakVelocityMultiplier: Math.round((profile.peakVelocity / 100) * 100) / 100 || 1.45,
    jerkScore,
    motionDnaScore,
    reconstructedRecipe,
    explanationSummary,
  };
}
