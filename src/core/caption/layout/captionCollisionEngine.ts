export interface BoundingBox2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionAvoidanceResult {
  adjustedY: number;
  adjustedX: number;
  hasCollision: boolean;
  shiftedDirection?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Calculates whether a caption bounding box overlaps with a face/object and resolves the non-colliding position.
 */
export function resolveCaptionCollision(
  captionBox: BoundingBox2D,
  obstacleBoxes: BoundingBox2D[],
  screenHeight = 1080,
  minPaddingPx = 20
): CollisionAvoidanceResult {
  let adjustedY = captionBox.y;
  let adjustedX = captionBox.x;
  let hasCollision = false;
  let shiftedDirection: 'up' | 'down' | 'left' | 'right' | undefined = undefined;

  for (const obs of obstacleBoxes) {
    const isOverlapping =
      captionBox.x < obs.x + obs.width &&
      captionBox.x + captionBox.width > obs.x &&
      adjustedY < obs.y + obs.height &&
      adjustedY + captionBox.height > obs.y;

    if (isOverlapping) {
      hasCollision = true;

      // Prefer shifting above the obstacle if space permits, otherwise below
      if (obs.y - captionBox.height - minPaddingPx > 40) {
        adjustedY = obs.y - captionBox.height - minPaddingPx;
        shiftedDirection = 'up';
      } else {
        adjustedY = Math.min(screenHeight - captionBox.height - minPaddingPx, obs.y + obs.height + minPaddingPx);
        shiftedDirection = 'down';
      }
    }
  }

  return {
    adjustedX: Math.round(adjustedX),
    adjustedY: Math.round(adjustedY),
    hasCollision,
    shiftedDirection,
  };
}
