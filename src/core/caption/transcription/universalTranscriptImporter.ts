import { CaptionSequence, CaptionSegment, CaptionWord, DEFAULT_CAPTION_STYLE, INITIAL_CAPTION_SPEAKERS } from '../captionModel';
import { generateWordTimingsForText } from '../wordTimingEngine';

export type SupportedTranscriptFormat = 'srt' | 'vtt' | 'ass' | 'txt' | 'json';

export interface ParseTranscriptResult {
  success: boolean;
  sequence?: CaptionSequence;
  formatDetected: SupportedTranscriptFormat;
  segmentCount: number;
  totalDurationSec: number;
  errorMessage?: string;
}

function parseTimestampToSeconds(ts: string): number {
  const clean = ts.trim().replace(',', '.');
  const parts = clean.split(':');
  if (parts.length === 3) {
    const hrs = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return hrs * 3600 + mins * 60 + secs;
  } else if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return mins * 60 + secs;
  }
  return parseFloat(clean) || 0;
}

/**
 * Universal Multi-Format Transcript Importer (SRT, WebVTT, ASS, TXT, JSON).
 * Parses raw text into the structured CaptionSequence without any external API.
 */
export function importUniversalTranscript(rawContent: string): ParseTranscriptResult {
  if (!rawContent || rawContent.trim().length === 0) {
    return { success: false, formatDetected: 'txt', segmentCount: 0, totalDurationSec: 0, errorMessage: 'Empty transcript content provided.' };
  }

  const trimmed = rawContent.trim();

  // 1. JSON Sniffing
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.captions && Array.isArray(parsed.captions)) {
        return {
          success: true,
          sequence: parsed as CaptionSequence,
          formatDetected: 'json',
          segmentCount: parsed.captions.length,
          totalDurationSec: parsed.durationSec || 10,
        };
      }
    } catch (e) {
      // Continue to textual parsers
    }
  }

  // 2. WebVTT or SRT Parser
  const isVtt = trimmed.startsWith('WEBVTT');
  const timeRegex = /(\d{1,2}:)?\d{2}:\d{2}[,.]\d{2,3}\s*-->\s*(\d{1,2}:)?\d{2}:\d{2}[,.]\d{2,3}/;

  if (isVtt || timeRegex.test(trimmed)) {
    const blocks = trimmed.split(/\n\s*\n/);
    const captions: CaptionSegment[] = [];

    blocks.forEach((block, idx) => {
      const lines = block.trim().split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      let timeLineIdx = -1;

      for (let i = 0; i < lines.length; i++) {
        if (timeRegex.test(lines[i])) {
          timeLineIdx = i;
          break;
        }
      }

      if (timeLineIdx !== -1) {
        const timeLine = lines[timeLineIdx];
        const match = timeLine.match(/((?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{2,3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{2,3})/);
        if (match) {
          const startSec = parseTimestampToSeconds(match[1]);
          const endSec = parseTimestampToSeconds(match[2]);
          const textLines = lines.slice(timeLineIdx + 1).join(' ');

          if (textLines.length > 0) {
            const words = generateWordTimingsForText(textLines, startSec, endSec);
            captions.push({
              id: `cap-import-${idx + 1}`,
              startSec,
              endSec,
              text: textLines,
              words,
              speakerId: 'spk-1',
            });
          }
        }
      }
    });

    if (captions.length > 0) {
      const maxEnd = Math.max(...captions.map((c) => c.endSec));
      return {
        success: true,
        formatDetected: isVtt ? 'vtt' : 'srt',
        segmentCount: captions.length,
        totalDurationSec: maxEnd,
        sequence: {
          id: `seq-${Date.now()}`,
          name: isVtt ? 'Imported WebVTT Sequence' : 'Imported SRT Sequence',
          language: 'en',
          durationSec: maxEnd + 1,
          speakers: INITIAL_CAPTION_SPEAKERS,
          globalStyle: DEFAULT_CAPTION_STYLE,
          globalAnimation: 'word-pop',
          safeZone: 'tiktok-reels-9-16',
          captions,
        },
      };
    }
  }

  // 3. Plain Text (TXT) Chunking
  const lines = trimmed.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const captions: CaptionSegment[] = [];
  let currentStart = 0.0;

  lines.forEach((line, idx) => {
    const wordCount = line.split(/\s+/).length;
    const duration = Math.max(1.5, wordCount * 0.38);
    const endSec = currentStart + duration;
    const words = generateWordTimingsForText(line, currentStart, endSec);

    captions.push({
      id: `cap-txt-${idx + 1}`,
      startSec: Math.round(currentStart * 100) / 100,
      endSec: Math.round(endSec * 100) / 100,
      text: line,
      words,
      speakerId: 'spk-1',
    });

    currentStart = endSec + 0.2;
  });

  return {
    success: true,
    formatDetected: 'txt',
    segmentCount: captions.length,
    totalDurationSec: currentStart,
    sequence: {
      id: `seq-txt-${Date.now()}`,
      name: 'Imported Plain Text Transcript',
      language: 'en',
      durationSec: currentStart + 1,
      speakers: INITIAL_CAPTION_SPEAKERS,
      globalStyle: DEFAULT_CAPTION_STYLE,
      globalAnimation: 'word-pop',
      safeZone: 'tiktok-reels-9-16',
      captions,
    },
  };
}
