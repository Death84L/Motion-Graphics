export interface IkJoint2D {
  x: number;
  y: number;
  angleDeg: number;
}

export interface IkSolveResult2D {
  root: IkJoint2D;
  elbow: IkJoint2D;
  effector: IkJoint2D;
  isReachable: boolean;
}

export class IkRiggingEngine {
  /**
   * Analytic 2-Bone Inverse Kinematics Solver using Law of Cosines.
   * Solves joint angles for shoulder (root) and elbow to place end-effector on target (x, y).
   */
  static solve2BoneIk(
    rootPos: { x: number; y: number },
    targetPos: { x: number; y: number },
    length1: number,
    length2: number,
    flipElbow = false
  ): IkSolveResult2D {
    const dx = targetPos.x - rootPos.x;
    const dy = targetPos.y - rootPos.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    const maxReach = length1 + length2;
    const minReach = Math.abs(length1 - length2);
    const clampedDist = Math.max(minReach + 0.001, Math.min(maxReach - 0.001, dist));

    // Law of cosines for angle at root (alpha) and elbow (beta)
    const angleToTarget = Math.atan2(dy, dx);
    const cosAlpha = (length1 * length1 + clampedDist * clampedDist - length2 * length2) / (2 * length1 * clampedDist);
    const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));

    const cosBeta = (length1 * length1 + length2 * length2 - clampedDist * clampedDist) / (2 * length1 * length2);
    const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));

    const rootAngle = flipElbow ? angleToTarget + alpha : angleToTarget - alpha;
    const elbowAngle = flipElbow ? - (Math.PI - beta) : (Math.PI - beta);

    const elbowX = rootPos.x + Math.cos(rootAngle) * length1;
    const elbowY = rootPos.y + Math.sin(rootAngle) * length1;

    const effectorAngle = rootAngle + elbowAngle;
    const effectorX = elbowX + Math.cos(effectorAngle) * length2;
    const effectorY = elbowY + Math.sin(effectorAngle) * length2;

    return {
      root: { x: rootPos.x, y: rootPos.y, angleDeg: (rootAngle * 180) / Math.PI },
      elbow: { x: elbowX, y: elbowY, angleDeg: (elbowAngle * 180) / Math.PI },
      effector: { x: effectorX, y: effectorY, angleDeg: (effectorAngle * 180) / Math.PI },
      isReachable: dist <= maxReach && dist >= minReach,
    };
  }

  /**
   * Blends Forward Kinematics (FK) and Inverse Kinematics (IK) by weight (0 = pure FK, 1 = pure IK).
   */
  static blendFkIk(
    fkResult: IkSolveResult2D,
    ikResult: IkSolveResult2D,
    ikWeight: number // 0.0 to 1.0
  ): IkSolveResult2D {
    const w = Math.max(0, Math.min(1, ikWeight));
    return {
      root: {
        x: fkResult.root.x * (1 - w) + ikResult.root.x * w,
        y: fkResult.root.y * (1 - w) + ikResult.root.y * w,
        angleDeg: fkResult.root.angleDeg * (1 - w) + ikResult.root.angleDeg * w,
      },
      elbow: {
        x: fkResult.elbow.x * (1 - w) + ikResult.elbow.x * w,
        y: fkResult.elbow.y * (1 - w) + ikResult.elbow.y * w,
        angleDeg: fkResult.elbow.angleDeg * (1 - w) + ikResult.elbow.angleDeg * w,
      },
      effector: {
        x: fkResult.effector.x * (1 - w) + ikResult.effector.x * w,
        y: fkResult.effector.y * (1 - w) + ikResult.effector.y * w,
        angleDeg: fkResult.effector.angleDeg * (1 - w) + ikResult.effector.angleDeg * w,
      },
      isReachable: ikResult.isReachable,
    };
  }
}
