import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface MotionDnaFingerprint {
  durationSeconds: number;
  energy: number; // 0 to 100
  smoothness: number; // 0 to 100
  overshoot: number; // 0 to 100
  elasticity: number; // 0 to 100
  aggression: number; // 0 to 100
  rhythm: number; // 0 to 100
  overallQuality: number; // 0 to 100
}

/**
 * Computes a deterministic "Motion DNA Fingerprint" analyzing energy, elasticity, smoothness, and rhythm.
 */
export function extractMotionDna(
  keyframes: KeyframePoint[],
  fps = 30
): MotionDnaFingerprint {
  if (!keyframes || keyframes.length < 2) {
    return {
      durationSeconds: 1.0,
      energy: 50,
      smoothness: 95,
      overshoot: 0,
      elasticity: 20,
      aggression: 30,
      rhythm: 50,
      overallQuality: 90,
    };
  }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const totalFrames = sorted[sorted.length - 1].time - sorted[0].time || 30;
  const durationSec = Math.round((totalFrames / fps) * 100) / 100;

  const samples = 50;
  let maxVel = 0;
  let maxAcc = 0;
  let maxJerk = 0;
  let sumSpeed = 0;
  let directionChanges = 0;
  let prevVel = 0;

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const deriv = evaluateDerivativeAtTime(sorted, t);

    if (deriv.speed > maxVel) maxVel = deriv.speed;
    if (Math.abs(deriv.acceleration) > maxAcc) maxAcc = Math.abs(deriv.acceleration);
    if (Math.abs(deriv.jerk) > maxJerk) maxJerk = Math.abs(deriv.jerk);

    sumSpeed += deriv.speed;

    if (i > 0 && Math.sign(deriv.velocity) !== Math.sign(prevVel) && Math.abs(deriv.velocity) > 0.1) {
      directionChanges++;
    }
    prevVel = deriv.velocity;
  }

  const avgSpeed = sumSpeed / (samples + 1);

  // Overshoot calculation
  const maxVal = Math.max(...sorted.map((k) => k.value));
  const endVal = sorted[sorted.length - 1].value;
  const overshootIndex = endVal > 0 ? Math.min(100, Math.max(0, Math.round(((maxVal - endVal) / (endVal || 1)) * 100))) : 0;

  // Normalized DNA traits
  const energy = Math.min(100, Math.round((avgSpeed / 150) * 100));
  const smoothness = Math.max(40, Math.min(99, Math.round(100 - (maxJerk / 250) * 15)));
  const aggression = Math.min(100, Math.round((maxAcc / 400) * 100));
  const elasticity = Math.min(100, Math.round(directionChanges * 25 + overshootIndex * 0.5));
  const rhythm = Math.max(30, Math.min(95, Math.round(100 - Math.abs(durationSec * fps - 30) * 0.8)));

  const overallQuality = Math.round(smoothness * 0.4 + (100 - aggression * 0.2) * 0.3 + (rhythm) * 0.3);

  return {
    durationSeconds: durationSec,
    energy,
    smoothness,
    overshoot: overshootIndex,
    elasticity,
    aggression,
    rhythm,
    overallQuality: Math.min(98, Math.max(65, overallQuality)),
  };
}

/**
 * Calculates similarity distance between two Motion DNA fingerprints (0 to 100%).
 */
export function compareMotionDna(a: MotionDnaFingerprint, b: MotionDnaFingerprint): number {
  const dEnergy = Math.abs(a.energy - b.energy);
  const dSmooth = Math.abs(a.smoothness - b.smoothness);
  const dOver = Math.abs(a.overshoot - b.overshoot);
  const dElast = Math.abs(a.elasticity - b.elasticity);
  const dAggr = Math.abs(a.aggression - b.aggression);

  const avgDiff = (dEnergy + dSmooth + dOver + dElast + dAggr) / 5;
  return Math.max(0, Math.min(100, Math.round(100 - avgDiff)));
}
