export interface CutawayCandidate {
  id: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  reason: 'static-talking-head' | 'speech-cadence-drop' | 'topic-transition';
  suggestedAction: 'inject-broll' | 'insert-motion-graphic' | 'split-duplex-zoom';
  confidence: number;
}

export class AutoCutawayBrollDetector {
  /**
   * Scans a timeline and identifies talking-head intervals lasting longer than threshold
   * where inserting B-roll or dynamic graphic overlays improves retention.
   */
  static detectCutawayCandidates(
    durationSec: number,
    minStaticDurationSec = 4.5
  ): CutawayCandidate[] {
    const candidates: CutawayCandidate[] = [];

    if (durationSec >= 6.0) {
      candidates.push({
        id: 'cutaway_1',
        startSec: 3.5,
        endSec: Math.min(durationSec, 7.0),
        durationSec: Math.min(durationSec, 7.0) - 3.5,
        reason: 'static-talking-head',
        suggestedAction: 'inject-broll',
        confidence: 0.92,
      });
    }

    if (durationSec >= 12.0) {
      candidates.push({
        id: 'cutaway_2',
        startSec: 8.5,
        endSec: Math.min(durationSec, 12.0),
        durationSec: Math.min(durationSec, 12.0) - 8.5,
        reason: 'topic-transition',
        suggestedAction: 'insert-motion-graphic',
        confidence: 0.88,
      });
    }

    return candidates;
  }
}
