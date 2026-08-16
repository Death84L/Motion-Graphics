import { describe, it, expect } from 'vitest';
import { PRO_STUDIO_PRESETS } from '../core/social/proStudioPresets';
import { KineticCaptionEngine } from '../core/social/kineticCaptionEngine';
import { MultiSpeakerDirector } from '../core/social/multiSpeakerDirector';

describe('Pro Studio Presets & Kinetic Caption Engine Test Suite', () => {
  it('contains 6 fully configured world-class creator presets', () => {
    expect(PRO_STUDIO_PRESETS.length).toBe(6);

    const hormozi = PRO_STUDIO_PRESETS.find((p) => p.id === 'hormozi-viral');
    expect(hormozi).toBeDefined();
    expect(hormozi?.hookStyle).toBe('viral-yellow');
    expect(hormozi?.zoomPunchIn).toBe(true);

    const mkbhd = PRO_STUDIO_PRESETS.find((p) => p.id === 'mkbhd-crisp-tech');
    expect(mkbhd).toBeDefined();
    expect(mkbhd?.deviceMockup).toBe('glass-smartphone');
  });

  it('computes word-by-word active bounce state across playhead timecodes', () => {
    const phrases = KineticCaptionEngine.getSampleKineticPhrases();
    expect(phrases.length).toBeGreaterThan(1);

    const wordAt1Sec = KineticCaptionEngine.getActiveWord(phrases, 1.2);
    expect(wordAt1Sec.activeWord?.word).toBe('GREW');
    expect(wordAt1Sec.activeWord?.highlightColor).toBe('#38bdf8');

    const wordAt5Sec = KineticCaptionEngine.getActiveWord(phrases, 5.5);
    expect(wordAt5Sec.activeWord?.word).toBe('AUTOMATION');
  });

  it('exports valid SubRip (.srt) timestamped subtitle text', () => {
    const phrases = KineticCaptionEngine.getSampleKineticPhrases();
    const srt = KineticCaptionEngine.exportToSrt(phrases);

    expect(srt).toContain('00:00:00,000 --> 00:00:03,500');
    expect(srt).toContain('HOW WE GREW TO $50,000 FAST!');
    expect(srt).toContain('THE SECRET IS AUTOMATION AND SPEED!');
  });

  it('generates Voice Activity Detection (VAD) diarization timeline with lookahead', () => {
    const events = MultiSpeakerDirector.generateVADDiarizationTimeline([
      { speakerId: 'speaker-a', startSec: 1.0, endSec: 4.0, energyDb: -12 },
      { speakerId: 'speaker-b', startSec: 4.5, endSec: 8.0, energyDb: -22 },
    ]);

    expect(events.length).toBe(2);
    expect(events[0].activeSpeakerId).toBe('speaker-a');
    expect(events[0].targetScale).toBe(108); // High energy punch
    expect(events[1].activeSpeakerId).toBe('speaker-b');
    expect(events[1].targetScale).toBe(100);
  });

  it('detects filler words and creates jump-cut removal ranges', () => {
    const fillers = MultiSpeakerDirector.detectFillerWords(15.0);
    expect(fillers.length).toBe(3);
    expect(fillers[0].word).toBe('um');
    expect(fillers[0].recommendedAction).toBe('jump-cut-splice');
  });

  it('returns style configurations for all 4 caption templates', () => {
    const hormozi = KineticCaptionEngine.getCaptionStyleConfig('hormozi-punch');
    expect(hormozi.activeWordScale).toBe(1.35);

    const mrbeast = KineticCaptionEngine.getCaptionStyleConfig('mrbeast-stroke');
    expect(mrbeast.textStroke).toBe('4px #040711');

    const ali = KineticCaptionEngine.getCaptionStyleConfig('ali-clean');
    expect(ali.pillBackground).toBeDefined();
  });
});
