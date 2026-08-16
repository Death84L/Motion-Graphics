export type CutType = 'hard-speaker-cut' | 'broll-insert' | 'topic-chapter-change' | 'reaction-punch';

export type AutoTransitionType = 'whip-pan' | 'zoom-blur-push' | 'glitch-displace' | 'match-cut-pan' | 'cross-dissolve';

export interface TransitionDescriptor {
  cutTimeSec: number;
  cutType: CutType;
  recommendedTransition: AutoTransitionType;
  durationSec: number;
  soundEffect: 'whoosh-air' | 'sub-impact' | 'click-tick' | 'glitch-buzz' | 'none';
}

export class AutoTransitionSoundEngine {
  /**
   * Automatically selects the optimal cinematic transition and SFX based on cut context.
   */
  static selectTransitionForCut(cutType: CutType, cutTimeSec: number): TransitionDescriptor {
    switch (cutType) {
      case 'hard-speaker-cut':
        return {
          cutTimeSec,
          cutType,
          recommendedTransition: 'whip-pan',
          durationSec: 0.25,
          soundEffect: 'whoosh-air',
        };
      case 'broll-insert':
        return {
          cutTimeSec,
          cutType,
          recommendedTransition: 'zoom-blur-push',
          durationSec: 0.3,
          soundEffect: 'whoosh-air',
        };
      case 'topic-chapter-change':
        return {
          cutTimeSec,
          cutType,
          recommendedTransition: 'glitch-displace',
          durationSec: 0.35,
          soundEffect: 'glitch-buzz',
        };
      case 'reaction-punch':
      default:
        return {
          cutTimeSec,
          cutType,
          recommendedTransition: 'match-cut-pan',
          durationSec: 0.2,
          soundEffect: 'sub-impact',
        };
    }
  }

  /**
   * Snaps a timestamp to the nearest musical beat grid (e.g. 128 BPM or 120 BPM 1/4 note).
   */
  static snapTimestampToBeat(timeSec: number, bpm = 128, subdivision: '1/4' | '1/8' = '1/4'): number {
    const beatIntervalSec = 60 / bpm;
    const gridStepSec = subdivision === '1/8' ? beatIntervalSec / 2 : beatIntervalSec;
    const snappedTime = Math.round(timeSec / gridStepSec) * gridStepSec;
    return Math.round(snappedTime * 1000) / 1000;
  }

  /**
   * 100% Free, Local-First Web Audio API Foley Synthesizer.
   * Generates real-time whoosh/impact sounds without any external audio asset files.
   */
  static playProceduralFoleySfx(soundType: 'whoosh-air' | 'sub-impact' | 'click-tick' | 'glitch-buzz'): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();

      if (soundType === 'whoosh-air') {
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.12);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
        filter.Q.value = 3.0;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        noise.stop(ctx.currentTime + 0.25);
      } else if (soundType === 'sub-impact') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (soundType === 'click-tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }
    } catch {
      // AudioContext muted/unsupported in background test environments
    }
  }
}
