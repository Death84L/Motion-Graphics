import { describe, it, expect } from 'vitest';
import { GazeLeadRoomSolver } from '../core/social/gazeLeadRoomSolver';

describe('Gaze Lead-Room Solver Test Suite', () => {
  it('allocates left breathing lead-room when subject looks left', () => {
    const res = GazeLeadRoomSolver.solveGazeLeadRoom({
      sourceWidth: 1920,
      sourceHeight: 1080,
      targetCropWidth: 608,
      faceCentroid: { x: 960, y: 540 },
      gazeDirection: 'left',
      leadRoomRatio: 0.22,
    });

    expect(res.gazeDirection).toBe('left');
    expect(res.leadRoomPx).toBe(134);
    expect(res.cropX).toBeLessThan(960 - 304);
    expect(res.isHeadroomPreserved).toBe(true);
  });

  it('allocates right breathing lead-room when subject looks right', () => {
    const res = GazeLeadRoomSolver.solveGazeLeadRoom({
      sourceWidth: 1920,
      sourceHeight: 1080,
      targetCropWidth: 608,
      faceCentroid: { x: 960, y: 540 },
      gazeDirection: 'right',
      leadRoomRatio: 0.22,
    });

    expect(res.gazeDirection).toBe('right');
    expect(res.cropX).toBeGreaterThan(960 - 304);
  });
});
