import { KeyframePoint } from '../../features/graph-editor/types';

export type SocialTargetFormat = '9:16-reels' | '1:1-square' | '4:5-portrait' | '16:9-landscape';

export interface ReframeBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ViralReframeEngine {
  /**
   * Computes 9:16 Crop Box centered on subject X position.
   */
  static computeReframeBox(
    sourceWidth: number,
    sourceHeight: number,
    subjectCenterX: number,
    format: SocialTargetFormat = '9:16-reels'
  ): ReframeBoundingBox {
    let targetW = sourceWidth;
    let targetH = sourceHeight;

    if (format === '9:16-reels') {
      targetW = Math.round((sourceHeight * 9) / 16);
      targetH = sourceHeight;
    } else if (format === '1:1-square') {
      targetW = sourceHeight;
      targetH = sourceHeight;
    }

    const minX = 0;
    const maxX = sourceWidth - targetW;
    const cropX = Math.max(minX, Math.min(maxX, subjectCenterX - targetW / 2));

    return {
      x: Math.round(cropX),
      y: 0,
      width: targetW,
      height: targetH,
    };
  }

  /**
   * Bakes Reframe Pan Keyframes into Host Keyframes.
   */
  static bakeReframeToKeyframes(box: ReframeBoundingBox): KeyframePoint[] {
    return [
      { id: 1, time: 0, value: box.x, type: 'bezier' },
      { id: 2, time: 100, value: box.x + 15, type: 'bezier' },
    ];
  }
}
