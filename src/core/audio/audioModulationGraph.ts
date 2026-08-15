import { AudioFrequencyBandId, SpectralAnalysisFrame } from './audioReactiveEngine';

export type TargetMotionPropertyId =
  | 'scale'
  | 'position-x'
  | 'position-y'
  | 'rotation'
  | 'opacity'
  | 'glow-intensity'
  | 'blur-radius'
  | 'camera-shake'
  | 'particle-emission'
  | 'letter-spacing';

export interface AudioModulationBinding {
  id: string;
  name: string;
  sourceBand: AudioFrequencyBandId | 'beat-pulse' | 'kick-transient' | 'snare-transient';
  targetProperty: TargetMotionPropertyId;
  multiplier: number;
  threshold: number; // 0.0 to 1.0 (dead zone)
  minOutput: number;
  maxOutput: number;
  smoothingAttack: number; // 0.1 to 1.0
  smoothingRelease: number; // 0.05 to 0.5
  invert: boolean;
  enabled: boolean;
}

export interface AudioMotionPreset {
  id: string;
  name: string;
  category: 'edm' | 'trap' | 'lofi' | 'techno' | 'visualizer';
  description: string;
  bindings: AudioModulationBinding[];
}

export const SAMPLE_AUDIO_MOTION_PRESETS: AudioMotionPreset[] = [
  {
    id: 'preset-edm-drop',
    name: 'EDM Bass Drop & Flash',
    category: 'edm',
    description: 'Heavy bass scales element with explosive kick camera shake and neon glow pulses.',
    bindings: [
      {
        id: 'b-bass-scale',
        name: 'Bass -> Scale',
        sourceBand: 'bass',
        targetProperty: 'scale',
        multiplier: 1.4,
        threshold: 0.15,
        minOutput: 100,
        maxOutput: 145,
        smoothingAttack: 0.85,
        smoothingRelease: 0.15,
        invert: false,
        enabled: true,
      },
      {
        id: 'b-kick-shake',
        name: 'Kick -> Camera Shake',
        sourceBand: 'kick-transient',
        targetProperty: 'camera-shake',
        multiplier: 1.8,
        threshold: 0.3,
        minOutput: 0,
        maxOutput: 24,
        smoothingAttack: 0.95,
        smoothingRelease: 0.1,
        invert: false,
        enabled: true,
      },
      {
        id: 'b-mid-glow',
        name: 'Mid -> Glow Intensity',
        sourceBand: 'mid',
        targetProperty: 'glow-intensity',
        multiplier: 2.0,
        threshold: 0.1,
        minOutput: 0,
        maxOutput: 30,
        smoothingAttack: 0.7,
        smoothingRelease: 0.2,
        invert: false,
        enabled: true,
      },
    ],
  },
  {
    id: 'preset-trap-shake',
    name: 'Trap Hi-Hat & Snare Glitch',
    category: 'trap',
    description: 'Hi-hat fast rotations with snappy snare vertical pops and sub-bass rumble.',
    bindings: [
      {
        id: 'b-treble-rot',
        name: 'Treble -> Rotation',
        sourceBand: 'treble',
        targetProperty: 'rotation',
        multiplier: 1.2,
        threshold: 0.2,
        minOutput: -15,
        maxOutput: 15,
        smoothingAttack: 0.9,
        smoothingRelease: 0.2,
        invert: false,
        enabled: true,
      },
      {
        id: 'b-snare-pos-y',
        name: 'Snare -> Position Y',
        sourceBand: 'snare-transient',
        targetProperty: 'position-y',
        multiplier: 1.5,
        threshold: 0.25,
        minOutput: 0,
        maxOutput: -35,
        smoothingAttack: 0.9,
        smoothingRelease: 0.12,
        invert: false,
        enabled: true,
      },
    ],
  },
  {
    id: 'preset-lofi-drift',
    name: 'Lo-Fi Smooth Drift & Opacity',
    category: 'lofi',
    description: 'Organic gentle breathing scale and subtle letter spacing reactive to RMS loudness.',
    bindings: [
      {
        id: 'b-rms-scale',
        name: 'RMS -> Scale',
        sourceBand: 'rms-volume',
        targetProperty: 'scale',
        multiplier: 1.1,
        threshold: 0.05,
        minOutput: 95,
        maxOutput: 110,
        smoothingAttack: 0.4,
        smoothingRelease: 0.3,
        invert: false,
        enabled: true,
      },
      {
        id: 'b-lowmid-track',
        name: 'Low-Mid -> Letter Spacing',
        sourceBand: 'low-mid',
        targetProperty: 'letter-spacing',
        multiplier: 1.0,
        threshold: 0.1,
        minOutput: 0,
        maxOutput: 6,
        smoothingAttack: 0.5,
        smoothingRelease: 0.25,
        invert: false,
        enabled: true,
      },
    ],
  },
];

export class AudioModulationGraphEngine {
  /**
   * Evaluates all active audio modulation bindings against a single spectral analysis frame.
   */
  static evaluateModulation(
    frame: SpectralAnalysisFrame,
    bindings: AudioModulationBinding[]
  ): Record<TargetMotionPropertyId, number> {
    const outputs: Record<string, number> = {
      'scale': 100,
      'position-x': 0,
      'position-y': 0,
      'rotation': 0,
      'opacity': 1.0,
      'glow-intensity': 0,
      'blur-radius': 0,
      'camera-shake': 0,
      'particle-emission': 0,
      'letter-spacing': 0,
    };

    bindings.forEach((b) => {
      if (!b.enabled) return;

      let rawInput = 0;
      if (b.sourceBand === 'beat-pulse') {
        rawInput = frame.isBeat ? 1.0 : 0;
      } else if (b.sourceBand === 'kick-transient') {
        rawInput = frame.bands['sub-bass'] > 0.8 ? frame.bands['sub-bass'] : 0;
      } else if (b.sourceBand === 'snare-transient') {
        rawInput = frame.bands['mid'] > 0.6 && frame.isOnset ? frame.bands['mid'] : 0;
      } else {
        rawInput = frame.bands[b.sourceBand] || 0;
      }

      // Threshold Gate
      if (rawInput < b.threshold) {
        rawInput = 0;
      } else {
        rawInput = (rawInput - b.threshold) / (1 - b.threshold || 1);
      }

      if (b.invert) rawInput = 1.0 - rawInput;

      // Range Remapping & Multiplier
      const scaledVal = b.minOutput + rawInput * (b.maxOutput - b.minOutput) * b.multiplier;
      outputs[b.targetProperty] = Math.round(scaledVal * 10) / 10;
    });

    return outputs as Record<TargetMotionPropertyId, number>;
  }
}
