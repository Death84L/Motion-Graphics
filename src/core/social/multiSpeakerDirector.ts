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
}
