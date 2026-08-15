import { describe, it, expect } from 'vitest';
import { CaptionParser } from '../core/speech/captionParser';
import { SpeechToMotionEngine } from '../core/speech/speechToMotionEngine';
import { TRENDY_CAPTION_PRESETS } from '../core/speech/trendyCaptionPresets';

describe('Speech Captions & 45+ Trendy Presets Test Suite', () => {
  it('parses SubRip (.srt) content accurately into timed words', () => {
    const srtSample = `1\n00:00:01,000 --> 00:00:03,500\nScale your business with viral video captions\n\n2\n00:00:03,600 --> 00:00:05,000\nUsing Motion Studio today`;
    const cues = CaptionParser.parseSrt(srtSample);

    expect(cues.length).toBe(2);
    expect(cues[0].startSec).toBe(1.0);
    expect(cues[0].endSec).toBe(3.5);
    expect(cues[0].words.length).toBeGreaterThan(4);
  });

  it('attaches semantic auto-emojis to keywords', () => {
    expect(CaptionParser.getEmojiForWord('money')).toBe('💰');
    expect(CaptionParser.getEmojiForWord('rocket')).toBe('🚀');
    expect(CaptionParser.getEmojiForWord('fire')).toBe('🔥');
    expect(CaptionParser.getEmojiForWord('brain')).toBe('🧠');
  });

  it('contains at least 45 verified trendy caption presets', () => {
    expect(TRENDY_CAPTION_PRESETS.length).toBeGreaterThanOrEqual(45);
    const hormozi = TRENDY_CAPTION_PRESETS.find((p) => p.id === 'hormozi-yellow-pop');
    expect(hormozi).toBeDefined();
    expect(hormozi?.scaleActive).toBeGreaterThan(1.1);
  });

  it('chunks words for display across 1-word and 2-3 words modes', () => {
    const words = SpeechToMotionEngine.generateTimedTranscript('One two three four five six', 6.0);
    const oneWord = SpeechToMotionEngine.chunkWordsForDisplay(words, 2, 'one-word');
    expect(oneWord.length).toBe(1);
    expect(oneWord[0].word).toBe('three');

    const threeWords = SpeechToMotionEngine.chunkWordsForDisplay(words, 1, 'two-three-words');
    expect(threeWords.length).toBe(3);
  });

  it('bakes caption emphasis pops into keyframes', () => {
    const words = SpeechToMotionEngine.generateTimedTranscript('Fast explosive rocket launch', 4.0);
    const preset = TRENDY_CAPTION_PRESETS[0];
    const keyframes = SpeechToMotionEngine.bakeSpeechToKeyframes(words, preset);

    expect(keyframes.length).toBeGreaterThan(0);
    expect(keyframes[0].type).toBe('bezier');
  });
});
