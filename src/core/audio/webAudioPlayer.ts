export class WebAudioPlayer {
  private ctx: AudioContext | null = null;
  private isSoundEnabled = false;
  private masterGain: GainNode | null = null;
  private audioSourceNode: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private customAudioBuffer: AudioBuffer | null = null;
  private micStream: MediaStream | null = null;

  init(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = 0.2; // comfortable default volume
          this.masterGain.connect(this.ctx.destination);

          this.analyser = this.ctx.createAnalyser();
          this.analyser.fftSize = 256;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('WebAudio not supported in this environment', e);
      return null;
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.isSoundEnabled = enabled;
    if (enabled) {
      this.init();
    }
  }

  getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  setVolume(vol: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1.0, vol)), this.ctx.currentTime);
    }
  }

  /**
   * Plays a punchy rhythmic electronic sound on downbeats and beats.
   */
  playBeatPulse(isDownbeat: boolean): void {
    if (!this.isSoundEnabled || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Kick Drum Oscillator (808 Sub)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startFreq = isDownbeat ? 140 : 100;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.15);

      gain.gain.setValueAtTime(isDownbeat ? 0.8 : 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);

      // 2. Hi-Hat noise burst on off-beats
      if (!isDownbeat) {
        const noiseOsc = this.ctx.createOscillator();
        const noiseGain = this.ctx.createGain();
        noiseOsc.type = 'triangle';
        noiseOsc.frequency.setValueAtTime(8000, now);
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noiseOsc.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noiseOsc.start(now);
        noiseOsc.stop(now + 0.06);
      }
    } catch (e) {}
  }

  /**
   * Loads and decodes custom user audio files (MP3/WAV/AAC).
   */
  async loadCustomAudioFile(file: File): Promise<boolean> {
    const ctx = this.init();
    if (!ctx) return false;

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.customAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
      return true;
    } catch (e) {
      console.error('Failed to decode audio file', e);
      return false;
    }
  }

  /**
   * Starts playback of custom decoded audio file.
   */
  playCustomAudio(): void {
    if (!this.ctx || !this.customAudioBuffer || !this.masterGain) return;
    try {
      this.stopCustomAudio();
      this.audioSourceNode = this.ctx.createBufferSource();
      this.audioSourceNode.buffer = this.customAudioBuffer;
      this.audioSourceNode.loop = true;

      this.audioSourceNode.connect(this.masterGain);
      if (this.analyser) {
        this.audioSourceNode.connect(this.analyser);
      }
      this.audioSourceNode.start(0);
    } catch (e) {}
  }

  stopCustomAudio(): void {
    if (this.audioSourceNode) {
      try {
        this.audioSourceNode.stop();
        this.audioSourceNode.disconnect();
      } catch (e) {}
      this.audioSourceNode = null;
    }
  }

  /**
   * Captures live microphone input.
   */
  async startMicrophone(): Promise<boolean> {
    const ctx = this.init();
    if (!ctx || !navigator.mediaDevices?.getUserMedia) return false;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const micSource = ctx.createMediaStreamSource(this.micStream);
      if (this.analyser) {
        micSource.connect(this.analyser);
      }
      return true;
    } catch (e) {
      console.warn('Microphone permission denied', e);
      return false;
    }
  }

  stopMicrophone(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
  }
}

export const webAudioPlayer = new WebAudioPlayer();
