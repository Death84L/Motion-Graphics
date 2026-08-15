import { BrollClip, KenBurnsConfig, StoryboardScene } from './brollSchema';
import { KeyframePoint } from '../../features/graph-editor/types';

export class BrollEngine {
  /**
   * Calculates Ken Burns Transform (Scale, Pan X, Pan Y) at normalized progress t (0.0 to 1.0).
   */
  static evaluateKenBurns(
    config: KenBurnsConfig,
    progress: number
  ): { scale: number; panX: number; panY: number } {
    const t = Math.max(0, Math.min(1, progress));
    // Smoothstep easing
    const smoothT = config.easing === 'smooth' ? t * t * (3 - 2 * t) : t;

    let scale = config.zoomStart + (config.zoomEnd - config.zoomStart) * smoothT;
    let panX = 0;
    let panY = 0;

    switch (config.direction) {
      case 'zoom-in':
        scale = config.zoomStart + (config.zoomEnd - config.zoomStart) * smoothT;
        break;
      case 'zoom-out':
        scale = config.zoomStart - (config.zoomStart - config.zoomEnd) * smoothT;
        break;
      case 'pan-left':
        panX = -smoothT * 40;
        break;
      case 'pan-right':
        panX = smoothT * 40;
        break;
      case 'diagonal-up-left':
        panX = -smoothT * 30;
        panY = -smoothT * 20;
        break;
      case 'diagonal-down-right':
        panX = smoothT * 30;
        panY = smoothT * 20;
        break;
      case 'static':
      default:
        scale = 1.0;
        break;
    }

    return {
      scale: Math.round(scale * 1000) / 1000,
      panX: Math.round(panX * 10) / 10,
      panY: Math.round(panY * 10) / 10,
    };
  }

  /**
   * Automatic B-Roll Music Beat Sync Sequencer
   * Takes a pool of B-Roll clips and sequences them automatically to a music BPM beat grid.
   */
  static autoSequenceToBeat(
    clips: BrollClip[],
    bpm = 128,
    beatsPerCut = 4,
    totalDurationSec = 15.0
  ): StoryboardScene {
    const beatIntervalSec = 60 / bpm; // e.g. 0.46875s per beat
    const cutDurationSec = beatIntervalSec * beatsPerCut; // e.g. 1.875s per cut

    const sequencedClips: BrollClip[] = [];
    let currentTime = 0;
    let clipIndex = 0;

    while (currentTime < totalDurationSec && clips.length > 0) {
      const sourceClip = clips[clipIndex % clips.length];
      const remainingTime = totalDurationSec - currentTime;
      const actualCutDuration = Math.min(cutDurationSec, remainingTime);

      sequencedClips.push({
        ...sourceClip,
        id: `seq-${clipIndex + 1}-${sourceClip.id}`,
        inPointSec: 0,
        outPointSec: actualCutDuration,
        durationSec: actualCutDuration,
      });

      currentTime += actualCutDuration;
      clipIndex++;
    }

    return {
      id: `scene-auto-${Date.now()}`,
      title: `Auto-Sequenced Montage (${bpm} BPM)`,
      clips: sequencedClips,
      musicBpm: bpm,
      totalDurationSec: Math.round(currentTime * 10) / 10,
    };
  }

  /**
   * Bakes B-Roll Ken Burns Motion into Standard Bézier Keyframes for Host Interchange.
   */
  static bakeKenBurnsToKeyframes(
    clip: BrollClip,
    property: 'scale' | 'panX' | 'panY' = 'scale',
    fps = 60
  ): KeyframePoint[] {
    const duration = clip.outPointSec - clip.inPointSec || 2.0;
    const totalFrames = Math.round(duration * fps);
    const keyframes: KeyframePoint[] = [];

    const samples = 8;
    for (let i = 0; i <= samples; i++) {
      const progress = i / samples;
      const transform = this.evaluateKenBurns(clip.kenBurns, progress);
      const val = property === 'scale' ? transform.scale * 100 : property === 'panX' ? transform.panX : transform.panY;

      keyframes.push({
        id: 9700 + i,
        time: Math.round((progress * 100) * 10) / 10,
        value: Math.round(val * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.25, y: val },
        handleOut: { x: 0.25, y: val },
      });
    }

    return keyframes;
  }
}
