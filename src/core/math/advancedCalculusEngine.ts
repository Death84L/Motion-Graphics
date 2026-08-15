import { KeyframePoint } from '../../features/graph-editor/types';

export interface TcbSplinePoint {
  time: number;
  value: number;
  tension: number; // -1 to +1 (0 = standard Catmull-Rom)
  continuity: number; // -1 to +1 (0 = smooth C1)
  bias: number; // -1 to +1 (0 = balanced)
}

export interface CurvatureAnalysis {
  time: number;
  value: number;
  velocity: number;
  acceleration: number;
  curvatureKappa: number;
  isInflectionPoint: boolean;
}

export class AdvancedCalculusEngine {
  /**
   * Runge-Kutta 4th Order (RK4) Numerical ODE Integrator
   * Solves dy/dt = f(t, y) with high stability and precision.
   */
  static rk4Integrate(
    f: (t: number, y: number) => number,
    y0: number,
    tStart: number,
    tEnd: number,
    steps = 100
  ): { times: number[]; values: number[] } {
    const dt = (tEnd - tStart) / steps;
    const times: number[] = [tStart];
    const values: number[] = [y0];

    let currentT = tStart;
    let currentY = y0;

    for (let i = 0; i < steps; i++) {
      const k1 = f(currentT, currentY);
      const k2 = f(currentT + 0.5 * dt, currentY + 0.5 * dt * k1);
      const k3 = f(currentT + 0.5 * dt, currentY + 0.5 * dt * k2);
      const k4 = f(currentT + dt, currentY + dt * k3);

      currentY += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      currentT += dt;

      times.push(Math.round(currentT * 1000) / 1000);
      values.push(Math.round(currentY * 1000) / 1000);
    }

    return { times, values };
  }

  /**
   * Catmull-Rom to Cubic Bézier Analytic Matrix Conversion
   * Converts 4 control points P0, P1, P2, P3 into standard Bézier handle offsets.
   */
  static catmullRomToBezier(
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number }
  ): {
    start: { x: number; y: number };
    control1: { x: number; y: number };
    control2: { x: number; y: number };
    end: { x: number; y: number };
  } {
    return {
      start: p1,
      control1: {
        x: p1.x + (p2.x - p0.x) / 6,
        y: p1.y + (p2.y - p0.y) / 6,
      },
      control2: {
        x: p2.x - (p3.x - p1.x) / 6,
        y: p2.y - (p3.y - p1.y) / 6,
      },
      end: p2,
    };
  }

  /**
   * Kochanek-Bartels (TCB) Spline In/Out Tangents Evaluator
   * Computes exact incoming and outgoing tangent vectors with Tension, Continuity, and Bias.
   */
  static evaluateTcbTangents(
    pPrev: { time: number; value: number },
    pCurr: TcbSplinePoint,
    pNext: { time: number; value: number }
  ): { tangentIn: number; tangentOut: number } {
    const { tension: T, continuity: C, bias: B } = pCurr;
    const dtIn = pCurr.time - pPrev.time || 1;
    const dtOut = pNext.time - pCurr.time || 1;

    const dIn = (pCurr.value - pPrev.value) / dtIn;
    const dOut = (pNext.value - pCurr.value) / dtOut;

    const tangentIn = ((1 - T) * (1 - C) * (1 + B) * dIn + (1 - T) * (1 + C) * (1 - B) * dOut) / 2;
    const tangentOut = ((1 - T) * (1 + C) * (1 + B) * dIn + (1 - T) * (1 - C) * (1 - B) * dOut) / 2;

    return { tangentIn, tangentOut };
  }

  /**
   * Continuous Curvature Profile ($\kappa(t)$) Analysis
   * Calculates curvature $\kappa(t) = \frac{|x' y'' - y' x''|}{(x'^2 + y'^2)^{3/2}}$
   */
  static analyzeCurvature(
    keyframes: KeyframePoint[],
    samples = 50
  ): CurvatureAnalysis[] {
    if (keyframes.length < 2) return [];
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    const tMin = sorted[0].time;
    const tMax = sorted[sorted.length - 1].time;
    const dt = (tMax - tMin) / samples || 0.01;

    const results: CurvatureAnalysis[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = tMin + i * dt;
      // Interpolate value using piecewise linear / cubic approximation
      const idx = sorted.findIndex((k) => k.time >= t);
      const k1 = sorted[Math.max(0, idx - 1)];
      const k2 = sorted[Math.min(sorted.length - 1, idx)];
      const prog = (t - k1.time) / (k2.time - k1.time || 1);

      const val = k1.value + (k2.value - k1.value) * (prog * prog * (3 - 2 * prog)); // Smoothstep
      const vel = (k2.value - k1.value) * (6 * prog * (1 - prog)) / (k2.time - k1.time || 1);
      const accel = (k2.value - k1.value) * (6 - 12 * prog) / Math.pow(k2.time - k1.time || 1, 2);

      const num = Math.abs(accel);
      const denom = Math.pow(1 + vel * vel, 1.5) || 1;
      const kappa = num / denom;

      results.push({
        time: Math.round(t * 100) / 100,
        value: Math.round(val * 10) / 10,
        velocity: Math.round(vel * 10) / 10,
        acceleration: Math.round(accel * 10) / 10,
        curvatureKappa: Math.round(kappa * 1000) / 1000,
        isInflectionPoint: Math.abs(accel) < 0.05,
      });
    }

    return results;
  }

  /**
   * Poisson Disc Blue-Noise 2D Sampling (Bridson's Algorithm)
   * Generates organic, uniformly distributed points without clustering.
   */
  static generatePoissonDiscPoints(
    width: number,
    height: number,
    minRadius = 30,
    maxSamples = 30
  ): Array<{ x: number; y: number }> {
    const cellSize = minRadius / Math.SQRT2;
    const gridW = Math.ceil(width / cellSize);
    const gridH = Math.ceil(height / cellSize);
    const grid: Array<number | null> = new Array(gridW * gridH).fill(null);

    const points: Array<{ x: number; y: number }> = [];
    const spawnPoints: number[] = [];

    // Initial point
    const firstPt = { x: width / 2, y: height / 2 };
    points.push(firstPt);
    spawnPoints.push(0);
    grid[Math.floor(firstPt.y / cellSize) * gridW + Math.floor(firstPt.x / cellSize)] = 0;

    while (spawnPoints.length > 0 && points.length < 150) {
      const spawnIdx = Math.floor(Math.random() * spawnPoints.length);
      const ptIdx = spawnPoints[spawnIdx];
      const pt = points[ptIdx];
      let accepted = false;

      for (let attempt = 0; attempt < maxSamples; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * minRadius;
        const candidate = {
          x: pt.x + Math.cos(angle) * radius,
          y: pt.y + Math.sin(angle) * radius,
        };

        if (candidate.x >= 0 && candidate.x < width && candidate.y >= 0 && candidate.y < height) {
          const cX = Math.floor(candidate.x / cellSize);
          const cY = Math.floor(candidate.y / cellSize);
          let isTooClose = false;

          for (let dy = -2; dy <= 2 && !isTooClose; dy++) {
            for (let dx = -2; dx <= 2 && !isTooClose; dx++) {
              const gX = cX + dx;
              const gY = cY + dy;
              if (gX >= 0 && gX < gridW && gY >= 0 && gY < gridH) {
                const neighborIdx = grid[gY * gridW + gX];
                if (neighborIdx !== null) {
                  const neighbor = points[neighborIdx];
                  const distSq = Math.pow(candidate.x - neighbor.x, 2) + Math.pow(candidate.y - neighbor.y, 2);
                  if (distSq < minRadius * minRadius) {
                    isTooClose = true;
                  }
                }
              }
            }
          }

          if (!isTooClose) {
            points.push(candidate);
            spawnPoints.push(points.length - 1);
            grid[cY * gridW + cX] = points.length - 1;
            accepted = true;
            break;
          }
        }
      }

      if (!accepted) {
        spawnPoints.splice(spawnIdx, 1);
      }
    }

    return points;
  }

  /**
   * Bilateral Curve Filter
   * Smooths noise and high-frequency jitter while strictly preserving sharp transition edges.
   */
  static bilateralFilterCurve(
    values: number[],
    spatialSigma = 2.0,
    rangeSigma = 15.0
  ): number[] {
    const output: number[] = [];
    const n = values.length;
    const windowRadius = Math.ceil(spatialSigma * 2);

    for (let i = 0; i < n; i++) {
      let weightSum = 0;
      let filteredVal = 0;

      for (let j = Math.max(0, i - windowRadius); j <= Math.min(n - 1, i + windowRadius); j++) {
        const spatialDist = i - j;
        const rangeDist = values[i] - values[j];

        const wSpatial = Math.exp(-(spatialDist * spatialDist) / (2 * spatialSigma * spatialSigma));
        const wRange = Math.exp(-(rangeDist * rangeDist) / (2 * rangeSigma * rangeSigma));
        const weight = wSpatial * wRange;

        weightSum += weight;
        filteredVal += values[j] * weight;
      }

      output.push(weightSum > 0 ? Math.round((filteredVal / weightSum) * 10) / 10 : values[i]);
    }

    return output;
  }
}
