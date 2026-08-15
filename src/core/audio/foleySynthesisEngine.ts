export type FoleySoundType = 'whoosh-fast' | 'ui-pop' | 'sub-impact-808' | 'cinematic-braam' | 'laser-glitch';

export class FoleySynthesisEngine {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Procedurally synthesizes and plays a zero-cost local Foley sound effect.
   */
  static playProceduralFoley(type: FoleySoundType, volume = 0.8): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      switch (type) {
        case 'whoosh-fast': {
          // White noise burst with sweeping bandpass filter
          const bufferSize = ctx.sampleRate * 0.4;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(200, now);
          filter.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
          filter.frequency.exponentialRampToValueAtTime(100, now + 0.38);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(now);
          noise.stop(now + 0.4);
          break;
        }

        case 'ui-pop': {
          // Clean sine blip with quick pitch drop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }

        case 'sub-impact-808': {
          // Heavy 808 sub-bass sine drop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.75);
          break;
        }

        case 'cinematic-braam': {
          // Low sawtooth brass swell
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(55, now); // A1 note

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(150, now);
          filter.frequency.exponentialRampToValueAtTime(900, now + 0.4);
          filter.frequency.exponentialRampToValueAtTime(200, now + 1.2);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volume * 0.9, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.4);
          break;
        }

        case 'laser-glitch': {
          // Fast frequency FM sweep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(2400, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

          gain.gain.setValueAtTime(volume * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
      }
    } catch {
      // Graceful fallback for non-audio environments
    }
  }

  /**
   * Calculates Automatic Audio Ducking Multiplier based on voiceover dB level.
   */
  static calculateDuckingMultiplier(voiceoverLumaRms: number, duckThreshold = 0.15): number {
    if (voiceoverLumaRms > duckThreshold) {
      return Math.max(0.2, 1.0 - (voiceoverLumaRms - duckThreshold) * 2.5);
    }
    return 1.0;
  }
}
