export type MotionStyleClassification =
  | 'cinematic'
  | 'smooth'
  | 'snappy'
  | 'elastic'
  | 'playful'
  | 'mechanical'
  | 'organic'
  | 'minimal';

export interface TemporalDna {
  durationMs: number;
  activeDurationMs: number;
  inPoint: number;
  outPoint: number;
  rhythmFrequencyHz: number;
  repetitionCount: number;
}

export interface KinematicsDna {
  avgVelocity: number;
  peakVelocity: number;
  peakAcceleration: number;
  maxJerk: number;
  jerkSmoothnessScore: number; // 0 to 100
  velocitySymmetryRatio: number; // 0.0 to 1.0
}

export interface PhysicsDna {
  springStiffness: number;
  dampingRatio: number; // 0.0 to 1.0
  overshootPercent: number; // e.g. 7.4%
  bounceCount: number;
  settleTimeMs: number;
}

export interface QualityDna {
  smoothnessScore: number; // 0 to 100
  elasticityScore: number; // 0 to 100
  energyScore: number; // 0 to 100
  complexityScore: number; // 0 to 100
  rhythmScore: number; // 0 to 100
  overallScore: number; // 0 to 100 (composite)
}

export interface StyleDna {
  primaryStyle: MotionStyleClassification;
  styleProbabilities: Record<MotionStyleClassification, number>; // 0.0 to 1.0
  tags: string[]; // e.g. ["#smooth", "#snappy", "#cinematic", "#elastic"]
}

export interface MotionDnaSignature {
  id: string;
  name: string;
  temporal: TemporalDna;
  kinematics: KinematicsDna;
  physics: PhysicsDna;
  quality: QualityDna;
  style: StyleDna;
  featureVector: number[]; // 10D normalized vector for vector search
}

export interface MotionDnaSimilarityResult {
  overallSimilarityPercent: number;
  timingSimilarity: number;
  velocitySimilarity: number;
  smoothnessSimilarity: number;
  elasticitySimilarity: number;
  energySimilarity: number;
  rhythmSimilarity: number;
}

export interface MotionDnaDiff {
  durationDeltaMs: number;
  velocityChangePercent: number;
  accelerationChangePercent: number;
  smoothnessChangePercent: number;
  elasticityChangePercent: number;
  overshootChangePercent: number;
  energyChangePercent: number;
  qualityScoreDelta: number;
}

export interface MotionDnaPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  dna: MotionDnaSignature;
}

export const SAMPLE_DNA_PRESETS: MotionDnaPreset[] = [
  {
    id: 'dna-apple-smooth',
    name: 'Apple-Style Smooth Ease',
    category: 'ui',
    description: 'Ultra-refined cubic ease with 95% smoothness, zero jerk spikes, and perfect settle damping.',
    dna: {
      id: 'dna-apple-smooth',
      name: 'Apple-Style Smooth Ease',
      temporal: { durationMs: 650, activeDurationMs: 650, inPoint: 0, outPoint: 100, rhythmFrequencyHz: 1.5, repetitionCount: 1 },
      kinematics: { avgVelocity: 420, peakVelocity: 820, peakAcceleration: 1840, maxJerk: 4200, jerkSmoothnessScore: 96, velocitySymmetryRatio: 0.88 },
      physics: { springStiffness: 140, dampingRatio: 0.92, overshootPercent: 2.1, bounceCount: 0, settleTimeMs: 580 },
      quality: { smoothnessScore: 96, elasticityScore: 18, energyScore: 52, complexityScore: 22, rhythmScore: 78, overallScore: 95 },
      style: {
        primaryStyle: 'smooth',
        styleProbabilities: { smooth: 0.95, cinematic: 0.82, minimal: 0.88, snappy: 0.45, elastic: 0.15, playful: 0.2, mechanical: 0.1, organic: 0.75 },
        tags: ['#smooth', '#minimal', '#apple-style', '#high-fidelity'],
      },
      featureVector: [0.65, 0.42, 0.96, 0.18, 0.52, 0.22, 0.78, 0.92, 0.02, 0.95],
    },
  },
  {
    id: 'dna-elastic-pop',
    name: 'Elastic Harmonic Pop',
    category: 'motion',
    description: 'High-energy spring overshoot with 18% bounce rebound and snappy physical settle.',
    dna: {
      id: 'dna-elastic-pop',
      name: 'Elastic Harmonic Pop',
      temporal: { durationMs: 820, activeDurationMs: 820, inPoint: 0, outPoint: 100, rhythmFrequencyHz: 2.2, repetitionCount: 1 },
      kinematics: { avgVelocity: 680, peakVelocity: 1420, peakAcceleration: 3800, maxJerk: 9400, jerkSmoothnessScore: 84, velocitySymmetryRatio: 0.65 },
      physics: { springStiffness: 220, dampingRatio: 0.64, overshootPercent: 18.4, bounceCount: 2, settleTimeMs: 760 },
      quality: { smoothnessScore: 84, elasticityScore: 88, energyScore: 82, complexityScore: 48, rhythmScore: 86, overallScore: 92 },
      style: {
        primaryStyle: 'elastic',
        styleProbabilities: { elastic: 0.94, playful: 0.86, snappy: 0.78, organic: 0.72, cinematic: 0.35, smooth: 0.82, minimal: 0.3, mechanical: 0.25 },
        tags: ['#elastic', '#spring', '#playful', '#overshoot'],
      },
      featureVector: [0.82, 0.68, 0.84, 0.88, 0.82, 0.48, 0.86, 0.64, 0.18, 0.92],
    },
  },
  {
    id: 'dna-cinematic-heavy',
    name: 'Cinematic Heavy Mass',
    category: 'cinematic',
    description: 'High mass inertia with prolonged smooth acceleration and dramatic momentum.',
    dna: {
      id: 'dna-cinematic-heavy',
      name: 'Cinematic Heavy Mass',
      temporal: { durationMs: 1200, activeDurationMs: 1200, inPoint: 0, outPoint: 100, rhythmFrequencyHz: 0.8, repetitionCount: 1 },
      kinematics: { avgVelocity: 310, peakVelocity: 580, peakAcceleration: 1100, maxJerk: 2800, jerkSmoothnessScore: 98, velocitySymmetryRatio: 0.92 },
      physics: { springStiffness: 90, dampingRatio: 0.98, overshootPercent: 0, bounceCount: 0, settleTimeMs: 1150 },
      quality: { smoothnessScore: 98, elasticityScore: 5, energyScore: 68, complexityScore: 18, rhythmScore: 65, overallScore: 94 },
      style: {
        primaryStyle: 'cinematic',
        styleProbabilities: { cinematic: 0.98, smooth: 0.94, organic: 0.85, minimal: 0.7, snappy: 0.2, elastic: 0.05, playful: 0.1, mechanical: 0.15 },
        tags: ['#cinematic', '#heavy', '#momentum', '#drama'],
      },
      featureVector: [1.2, 0.31, 0.98, 0.05, 0.68, 0.18, 0.65, 0.98, 0.0, 0.94],
    },
  },
];
