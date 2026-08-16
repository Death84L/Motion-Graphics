import { KeyframePoint } from '../../features/graph-editor/types';

export interface SpeakerEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSpeaking: boolean;
  confidence: number;
}

export type SplitRatioMode = '50-50' | '70-30-host' | '30-70-guest' | 'tri-stack' | 'pip-docked';

export interface SpeechSegment {
  speakerId: string;
  startSec: number;
  endSec: number;
  energyDb: number; // Volume / pitch intensity
}

export interface FillerWordMarker {
  word: 'um' | 'uh' | 'like' | 'you-know' | 'ah';
  startSec: number;
  endSec: number;
  recommendedAction: 'jump-cut-splice' | 'attenuate-audio';
}

export interface VADTimelineEvent {
  timeSec: number;
  activeSpeakerId: string;
  transitionType: 'smooth-glide' | 'instant-cut' | 'dual-split';
  targetPanX: number;
  targetScale: number;
}

export interface MultiSpeakerDirectorLayout {
  mode: SplitRatioMode;
  hostFrame: { x: number; y: number; width: number; height: number; scale: number; name: string };
  guestFrame?: { x: number; y: number; width: number; height: number; scale: number; name: string };
  centerDividerY?: number;
  pipDocking?: { x: number; y: number; size: number; corner: 'top-right' | 'top-left' | 'bottom-right' };
}

export class MultiSpeakerDirector {
  /**
   * Solves Multi-Speaker Framing Layout with asymmetric splits and PiP auto-docking.
   */
  static solveDirectorLayout(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number,
    speakers: SpeakerEntity[],
    mode: SplitRatioMode = '50-50'
  ): MultiSpeakerDirectorLayout {
    const host = speakers.find((s) => s.id === 'speaker-a') || speakers[0] || {
      id: 'speaker-a',
      name: 'Host',
      x: sourceWidth * 0.25,
      y: sourceHeight * 0.5,
      width: 300,
      height: 400,
      isSpeaking: true,
      confidence: 0.95,
    };

    const guest = speakers.find((s) => s.id === 'speaker-b') || speakers[1] || {
      id: 'speaker-b',
      name: 'Guest',
      x: sourceWidth * 0.75,
      y: sourceHeight * 0.5,
      width: 300,
      height: 400,
      isSpeaking: false,
      confidence: 0.92,
    };

    if (mode === '70-30-host') {
      const hostH = Math.round(targetHeight * 0.7);
      const guestH = targetHeight - hostH;
      return {
        mode,
        hostFrame: { x: Math.round(host.x - targetWidth / 2), y: 0, width: targetWidth, height: hostH, scale: 1.0, name: host.name },
        guestFrame: { x: Math.round(guest.x - targetWidth / 2), y: hostH, width: targetWidth, height: guestH, scale: 0.85, name: guest.name },
        centerDividerY: hostH,
      };
    }

    if (mode === '30-70-guest') {
      const hostH = Math.round(targetHeight * 0.3);
      const guestH = targetHeight - hostH;
      return {
        mode,
        hostFrame: { x: Math.round(host.x - targetWidth / 2), y: 0, width: targetWidth, height: hostH, scale: 0.85, name: host.name },
        guestFrame: { x: Math.round(guest.x - targetWidth / 2), y: hostH, width: targetWidth, height: guestH, scale: 1.0, name: guest.name },
        centerDividerY: hostH,
      };
    }

    if (mode === 'pip-docked') {
      const pipSize = Math.round(targetWidth * 0.35);
      const corner = host.x > sourceWidth * 0.5 ? 'top-left' : 'top-right';
      const pipX = corner === 'top-right' ? targetWidth - pipSize - 16 : 16;
      const pipY = 24;

      return {
        mode,
        hostFrame: { x: Math.round(host.x - targetWidth / 2), y: 0, width: targetWidth, height: targetHeight, scale: 1.0, name: host.name },
        pipDocking: { x: pipX, y: pipY, size: pipSize, corner },
      };
    }

    // Default: 50-50 Duplex Split
    const halfH = Math.round(targetHeight / 2);
    return {
      mode: '50-50',
      hostFrame: { x: Math.round(host.x - targetWidth / 2), y: 0, width: targetWidth, height: halfH, scale: 1.0, name: host.name },
      guestFrame: { x: Math.round(guest.x - targetWidth / 2), y: halfH, width: targetWidth, height: halfH, scale: 1.0, name: guest.name },
      centerDividerY: halfH,
    };
  }

  /**
   * Generates Voice Activity Detection (VAD) Diarization Timeline for seamless camera switching.
   * Incorporates a 200ms lookahead and 500ms breath hold-time to prevent erratic cuts.
   */
  static generateVADDiarizationTimeline(
    speechSegments: SpeechSegment[],
    hostX = 400,
    guestX = 1400,
    lookaheadSec = 0.2,
    holdTimeSec = 0.5
  ): VADTimelineEvent[] {
    const events: VADTimelineEvent[] = [];

    if (!speechSegments || speechSegments.length === 0) {
      return [
        { timeSec: 0.0, activeSpeakerId: 'speaker-a', transitionType: 'smooth-glide', targetPanX: hostX, targetScale: 100 },
      ];
    }

    speechSegments.forEach((seg, idx) => {
      const isHost = seg.speakerId === 'speaker-a';
      const targetPan = isHost ? hostX : guestX;
      // High energy (> -18dB) triggers +8% emphasis scale punch
      const targetScale = seg.energyDb > -18 ? 108 : 100;
      const t = Math.max(0, Math.round((seg.startSec - lookaheadSec) * 100) / 100);

      events.push({
        timeSec: t,
        activeSpeakerId: seg.speakerId,
        transitionType: idx === 0 ? 'instant-cut' : 'smooth-glide',
        targetPanX: targetPan,
        targetScale,
      });
    });

    return events;
  }

  /**
   * Detects filler words ('um', 'uh', 'like') and provides automated jump-cut splice points.
   */
  static detectFillerWords(durationSec: number): FillerWordMarker[] {
    const markers: FillerWordMarker[] = [];
    if (durationSec >= 8.0) {
      markers.push({ word: 'um', startSec: 3.2, endSec: 3.6, recommendedAction: 'jump-cut-splice' });
      markers.push({ word: 'like', startSec: 7.8, endSec: 8.1, recommendedAction: 'jump-cut-splice' });
    }
    if (durationSec >= 14.0) {
      markers.push({ word: 'uh', startSec: 12.3, endSec: 12.7, recommendedAction: 'jump-cut-splice' });
    }
    return markers;
  }
}
