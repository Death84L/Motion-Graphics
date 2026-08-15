import { KeyframePoint } from '../../features/graph-editor/types';

export interface AdsrConfig {
  attackTime: number; // e.g. 15f
  decayTime: number; // e.g. 20f
  sustainLevel: number; // e.g. 70%
  sustainTime: number; // e.g. 35f
  releaseTime: number; // e.g. 30f
  peakLevel: number; // e.g. 100%
}

export const DEFAULT_ADSR: AdsrConfig = {
  attackTime: 15,
  decayTime: 20,
  sustainLevel: 70,
  sustainTime: 35,
  releaseTime: 30,
  peakLevel: 100,
};

/**
 * Builds an Attack-Decay-Sustain-Release (ADSR) motion timing envelope.
 */
export function generateAdsrEnvelope(adsr: AdsrConfig = DEFAULT_ADSR): KeyframePoint[] {
  const t0 = 0;
  const t1 = adsr.attackTime;
  const t2 = t1 + adsr.decayTime;
  const t3 = t2 + adsr.sustainTime;
  const t4 = t3 + adsr.releaseTime;

  // Scale total duration to 100%
  const total = t4 || 100;
  const norm = (t: number) => Math.min(100, Math.round((t / total) * 100 * 10) / 10);

  return [
    { id: 22001, time: norm(t0), value: 0, type: 'bezier', ease: 'easeIn' },
    { id: 22002, time: norm(t1), value: adsr.peakLevel, type: 'bezier', ease: 'easeInOut' },
    { id: 22003, time: norm(t2), value: adsr.sustainLevel, type: 'bezier', ease: 'easeInOut' },
    { id: 22004, time: norm(t3), value: adsr.sustainLevel, type: 'bezier', ease: 'easeOut' },
    { id: 22005, time: norm(t4), value: 0, type: 'bezier', ease: 'easeOut' },
  ];
}
