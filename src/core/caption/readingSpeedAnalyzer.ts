import { CaptionSegment } from './captionModel';

export interface ReadingSpeedMetric {
  segmentId: string;
  wpm: number;
  charsPerSecond: number;
  durationSec: number;
  wordCount: number;
  status: 'comfortable' | 'too-fast' | 'too-slow';
  warningMessage?: string;
}

export interface CaptionSequenceHealth {
  overallScore: number; // 0 to 100
  averageWpm: number;
  totalCaptions: number;
  fastCaptionsCount: number;
  overlapsCount: number;
  issues: string[];
}

/**
 * Evaluates the reading speed for an individual caption segment.
 */
export function analyzeSegmentReadingSpeed(segment: CaptionSegment): ReadingSpeedMetric {
  const duration = Math.max(0.1, segment.endSec - segment.startSec);
  const wordCount = segment.words.length || segment.text.trim().split(/\s+/).length || 1;
  const charCount = segment.text.length;

  const wpm = Math.round((wordCount / duration) * 60);
  const cps = Math.round((charCount / duration) * 10) / 10;

  let status: ReadingSpeedMetric['status'] = 'comfortable';
  let warningMessage: string | undefined = undefined;

  if (wpm > 210) {
    status = 'too-fast';
    warningMessage = `Reading speed is very fast (${wpm} WPM). Viewers may struggle to read.`;
  } else if (wpm < 85) {
    status = 'too-slow';
    warningMessage = `Reading speed is slow (${wpm} WPM). Caption hangs on screen too long.`;
  }

  return {
    segmentId: segment.id,
    wpm,
    charsPerSecond: cps,
    durationSec: Math.round(duration * 100) / 100,
    wordCount,
    status,
    warningMessage,
  };
}

/**
 * Analyzes the entire caption sequence health, detecting timing overlaps and reading speed anomalies.
 */
export function analyzeCaptionSequenceHealth(captions: CaptionSegment[]): CaptionSequenceHealth {
  if (captions.length === 0) {
    return {
      overallScore: 100,
      averageWpm: 150,
      totalCaptions: 0,
      fastCaptionsCount: 0,
      overlapsCount: 0,
      issues: [],
    };
  }

  let sumWpm = 0;
  let fastCount = 0;
  let overlapsCount = 0;
  const issues: string[] = [];

  for (let i = 0; i < captions.length; i++) {
    const metric = analyzeSegmentReadingSpeed(captions[i]);
    sumWpm += metric.wpm;

    if (metric.status === 'too-fast') {
      fastCount++;
      issues.push(`Caption #${i + 1}: ${metric.warningMessage}`);
    }

    // Check overlap with next caption
    if (i < captions.length - 1) {
      if (captions[i].endSec > captions[i + 1].startSec) {
        overlapsCount++;
        issues.push(`Caption #${i + 1} overlaps with Caption #${i + 2} by ${(captions[i].endSec - captions[i + 1].startSec).toFixed(2)}s`);
      }
    }
  }

  const avgWpm = Math.round(sumWpm / captions.length);
  let score = 100 - (fastCount * 8 + overlapsCount * 12);
  score = Math.max(50, Math.min(100, score));

  return {
    overallScore: score,
    averageWpm: avgWpm,
    totalCaptions: captions.length,
    fastCaptionsCount: fastCount,
    overlapsCount,
    issues,
  };
}
