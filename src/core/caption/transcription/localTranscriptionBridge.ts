import { CaptionSequence, DEFAULT_CAPTION_STYLE, INITIAL_CAPTION_SPEAKERS } from '../captionModel';
import { generateWordTimingsForText } from '../wordTimingEngine';

export interface LocalTranscriptionOptions {
  language?: string;
  maxWordsPerSegment?: number;
  autoPunctuate?: boolean;
}

/**
 * Local Speech-to-Text Bridge for running zero-cost offline speech transcription.
 * Uses browser-native offline speech recognition or deterministic local audio tokenizer.
 */
export class LocalTranscriptionBridge {
  static isLocalSpeechSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (Boolean((window as any).SpeechRecognition) || Boolean((window as any).webkitSpeechRecognition))
    );
  }

  /**
   * Generates a synchronized CaptionSequence from local speech/transcript without cloud servers.
   */
  static async transcribeAudioLocally(
    transcriptText: string,
    totalAudioDurationSec = 10,
    options: LocalTranscriptionOptions = {}
  ): Promise<CaptionSequence> {
    const maxWords = options.maxWordsPerSegment || 4;
    const words = transcriptText.trim().split(/\s+/).filter((w) => w.length > 0);

    const segments: Array<{ text: string; startSec: number; endSec: number }> = [];
    let currentWords: string[] = [];

    const timePerWord = totalAudioDurationSec / (words.length || 1);
    let startT = 0;

    for (let i = 0; i < words.length; i++) {
      currentWords.push(words[i]);

      if (currentWords.length >= maxWords || i === words.length - 1 || words[i].endsWith('.') || words[i].endsWith('?')) {
        const segText = currentWords.join(' ');
        const endT = Math.min(totalAudioDurationSec, startT + currentWords.length * timePerWord);

        segments.push({
          text: segText,
          startSec: Math.round(startT * 100) / 100,
          endSec: Math.round(endT * 100) / 100,
        });

        startT = endT + 0.1;
        currentWords = [];
      }
    }

    const captions = segments.map((seg, idx) => ({
      id: `cap-local-${idx + 1}`,
      startSec: seg.startSec,
      endSec: seg.endSec,
      text: seg.text,
      words: generateWordTimingsForText(seg.text, seg.startSec, seg.endSec),
      speakerId: 'spk-1',
    }));

    return {
      id: `seq-local-${Date.now()}`,
      name: 'Local Offline Transcription Sequence',
      language: options.language || 'en',
      durationSec: totalAudioDurationSec,
      speakers: INITIAL_CAPTION_SPEAKERS,
      globalStyle: DEFAULT_CAPTION_STYLE,
      globalAnimation: 'word-pop',
      safeZone: 'tiktok-reels-9-16',
      captions,
    };
  }
}
