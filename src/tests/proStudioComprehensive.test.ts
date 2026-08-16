import { describe, it, expect } from 'vitest';
import { PRO_STUDIO_PRESETS } from '../core/social/proStudioPresets';
import { KineticCaptionEngine } from '../core/social/kineticCaptionEngine';

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
});
