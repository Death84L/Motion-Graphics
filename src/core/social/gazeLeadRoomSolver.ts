export type GazeDirection = 'left' | 'center' | 'right';

export interface GazeLeadRoomConfig {
  sourceWidth: number;
  sourceHeight: number;
  targetCropWidth: number;
  faceCentroid: { x: number; y: number };
  gazeDirection: GazeDirection;
  leadRoomRatio?: number; // Default 0.22 (22% offset in gaze direction)
}

export interface GazeLeadRoomResult {
  cropX: number;
  cropY: number;
  leadRoomPx: number;
  gazeDirection: GazeDirection;
  isHeadroomPreserved: boolean;
}

export class GazeLeadRoomSolver {
  /**
   * Calculates natural cinematic lead-room offset based on subject eye-gaze direction.
   * Prevents nose-against-edge framing by allocating breathing room in the look direction.
   */
  static solveGazeLeadRoom(config: GazeLeadRoomConfig): GazeLeadRoomResult {
    const leadRatio = config.leadRoomRatio || 0.22;
    const baseCenterX = config.faceCentroid.x - config.targetCropWidth / 2;
    let offsetPx = 0;

    if (config.gazeDirection === 'left') {
      // Subject looking left -> camera pans slightly right to give left breathing room
      offsetPx = -Math.round(config.targetCropWidth * leadRatio);
    } else if (config.gazeDirection === 'right') {
      // Subject looking right -> camera pans slightly left to give right breathing room
      offsetPx = Math.round(config.targetCropWidth * leadRatio);
    }

    const minCropX = 0;
    const maxCropX = Math.max(0, config.sourceWidth - config.targetCropWidth);
    const targetCropX = Math.max(minCropX, Math.min(maxCropX, baseCenterX + offsetPx));

    return {
      cropX: Math.round(targetCropX),
      cropY: 0,
      leadRoomPx: Math.abs(offsetPx),
      gazeDirection: config.gazeDirection,
      isHeadroomPreserved: true,
    };
  }
}
