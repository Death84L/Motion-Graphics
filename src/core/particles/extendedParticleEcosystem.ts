import { KeyframePoint } from '../../features/graph-editor/types';

export type AdvancedEmitterType =
  | 'spiral-dna-helix'
  | 'audio-spectrum-ring'
  | 'fibonacci-sphere'
  | 'matrix-grid-voxel'
  | 'bezier-path-curve'
  | 'tornado-funnel'
  | 'shockwave-burst'
  | 'predator-prey-swarm';

export interface BoidAgent3D {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  maxSpeed: number;
  maxForce: number;
  neighborRadius: number;
  separationRadius: number;
  target?: { x: number; y: number; z: number };
  isPredator?: boolean;
}

export interface MagneticDipoleField {
  north: { x: number; y: number; z: number };
  south: { x: number; y: number; z: number };
  intensity: number;
}

export interface InterSystemModulationOutput {
  cameraShakeTrauma: number; // 0.0 to 1.0 (driven by particle collisions)
  motionBlurAmountPx: number; // driven by average velocity
  audioEmissionMultiplier: number; // driven by audio FFT transients
  activeClusterCentroid: { x: number; y: number; z: number };
}

export class ExtendedParticleEcosystem {
  /**
   * Generates Spiral DNA Double-Helix 3D Particle Coordinates.
   */
  static generateDnaHelixPositions(
    count = 60,
    radius = 40,
    height = 240,
    turns = 3
  ): { strandA: { x: number; y: number; z: number }[]; strandB: { x: number; y: number; z: number }[] } {
    const strandA: { x: number; y: number; z: number }[] = [];
    const strandB: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 2 * turns;
      const y = t * height - height / 2;

      strandA.push({
        x: Math.round(Math.cos(angle) * radius * 10) / 10,
        y: Math.round(y * 10) / 10,
        z: Math.round(Math.sin(angle) * radius * 10) / 10,
      });

      strandB.push({
        x: Math.round(Math.cos(angle + Math.PI) * radius * 10) / 10,
        y: Math.round(y * 10) / 10,
        z: Math.round(Math.sin(angle + Math.PI) * radius * 10) / 10,
      });
    }

    return { strandA, strandB };
  }

  /**
   * Generates Fibonacci Spherical Lattice Distribution for uniform 3D sphere emitters.
   */
  static generateFibonacciSpherePoints(count = 100, radius = 60): { x: number; y: number; z: number }[] {
    const points: { x: number; y: number; z: number }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // Radius at y
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x: Math.round(x * radius * 10) / 10,
        y: Math.round(y * radius * 10) / 10,
        z: Math.round(z * radius * 10) / 10,
      });
    }

    return points;
  }

  /**
   * Solves Craig Reynolds 3D Boids Swarm Intelligence (Separation, Alignment, Cohesion, Target Seek).
   */
  static stepBoidsFlock(
    boids: BoidAgent3D[],
    target = { x: 240, y: 160, z: 0 },
    weights = { separation: 1.5, alignment: 1.0, cohesion: 1.0, seek: 1.2 }
  ): BoidAgent3D[] {
    return boids.map((boid, idx) => {
      let sepX = 0, sepY = 0, sepZ = 0, sepCount = 0;
      let aliX = 0, aliY = 0, aliZ = 0, aliCount = 0;
      let cohX = 0, cohY = 0, cohZ = 0, cohCount = 0;

      for (let j = 0; j < boids.length; j++) {
        if (idx !== j) {
          const other = boids[j];
          const dx = boid.x - other.x;
          const dy = boid.y - other.y;
          const dz = boid.z - other.z;
          const dist = Math.hypot(dx, dy, dz);

          if (dist < boid.separationRadius && dist > 0.01) {
            sepX += dx / dist;
            sepY += dy / dist;
            sepZ += dz / dist;
            sepCount++;
          }

          if (dist < boid.neighborRadius) {
            aliX += other.vx;
            aliY += other.vy;
            aliZ += other.vz;
            aliCount++;

            cohX += other.x;
            cohY += other.y;
            cohZ += other.z;
            cohCount++;
          }
        }
      }

      // Calculate steer forces
      let ax = 0, ay = 0, az = 0;

      if (sepCount > 0) {
        ax += (sepX / sepCount) * weights.separation;
        ay += (sepY / sepCount) * weights.separation;
        az += (sepZ / sepCount) * weights.separation;
      }

      if (aliCount > 0) {
        ax += ((aliX / aliCount) - boid.vx) * weights.alignment * 0.1;
        ay += ((aliY / aliCount) - boid.vy) * weights.alignment * 0.1;
        az += ((aliZ / aliCount) - boid.vz) * weights.alignment * 0.1;
      }

      if (cohCount > 0) {
        const targetCohX = (cohX / cohCount) - boid.x;
        const targetCohY = (cohY / cohCount) - boid.y;
        const targetCohZ = (cohZ / cohCount) - boid.z;
        ax += targetCohX * weights.cohesion * 0.01;
        ay += targetCohY * weights.cohesion * 0.01;
        az += targetCohZ * weights.cohesion * 0.01;
      }

      // Target Seeking
      const toTargetX = target.x - boid.x;
      const toTargetY = target.y - boid.y;
      const toTargetZ = target.z - boid.z;
      const distTarget = Math.hypot(toTargetX, toTargetY, toTargetZ);
      if (distTarget > 5) {
        ax += (toTargetX / distTarget) * weights.seek * 0.2;
        ay += (toTargetY / distTarget) * weights.seek * 0.2;
        az += (toTargetZ / distTarget) * weights.seek * 0.2;
      }

      // Integrate velocity
      let nvx = boid.vx + ax;
      let nvy = boid.vy + ay;
      let nvz = boid.vz + az;

      const speed = Math.hypot(nvx, nvy, nvz);
      if (speed > boid.maxSpeed) {
        nvx = (nvx / speed) * boid.maxSpeed;
        nvy = (nvy / speed) * boid.maxSpeed;
        nvz = (nvz / speed) * boid.maxSpeed;
      }

      return {
        ...boid,
        x: Math.round((boid.x + nvx) * 10) / 10,
        y: Math.round((boid.y + nvy) * 10) / 10,
        z: Math.round((boid.z + nvz) * 10) / 10,
        vx: Math.round(nvx * 100) / 100,
        vy: Math.round(nvy * 100) / 100,
        vz: Math.round(nvz * 100) / 100,
      };
    });
  }

  /**
   * Evaluates Magnetic Dipole Vector Field (North/South poles attracting/repelling charges).
   */
  static evaluateMagneticDipoleField(
    point: { x: number; y: number; z: number },
    dipole: MagneticDipoleField
  ): { fx: number; fy: number; fz: number } {
    // North pole repels (+), South pole attracts (-)
    const dnx = point.x - dipole.north.x;
    const dny = point.y - dipole.north.y;
    const dnz = point.z - dipole.north.z;
    const distN = Math.max(5, Math.hypot(dnx, dny, dnz));

    const dsx = point.x - dipole.south.x;
    const dsy = point.y - dipole.south.y;
    const dsz = point.z - dipole.south.z;
    const distS = Math.max(5, Math.hypot(dsx, dsy, dsz));

    const forceNorth = dipole.intensity / (distN * distN);
    const forceSouth = dipole.intensity / (distS * distS);

    const fx = (dnx / distN) * forceNorth - (dsx / distS) * forceSouth;
    const fy = (dny / distN) * forceNorth - (dsy / distS) * forceSouth;
    const fz = (dnz / distN) * forceNorth - (dsz / distS) * forceSouth;

    return {
      fx: Math.round(fx * 100) / 100,
      fy: Math.round(fy * 100) / 100,
      fz: Math.round(fz * 100) / 100,
    };
  }

  /**
   * Computes Inter-System Modulations (Particle data driving camera shake, blur, and audio bursts).
   */
  static computeInterSystemModulations(
    particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[],
    collisionEventCount: number,
    audioTransientPeak = 0.8
  ): InterSystemModulationOutput {
    const count = particles.length || 1;
    let sumX = 0, sumY = 0, sumZ = 0;
    let sumSpeed = 0;

    for (const p of particles) {
      sumX += p.x;
      sumY += p.y;
      sumZ += p.z;
      sumSpeed += Math.hypot(p.vx, p.vy, p.vz);
    }

    const avgSpeed = sumSpeed / count;
    const trauma = Math.min(1.0, collisionEventCount * 0.15 + (avgSpeed > 8 ? 0.3 : 0));
    const blur = Math.min(32, Math.round(avgSpeed * 1.5));

    return {
      cameraShakeTrauma: Math.round(trauma * 100) / 100,
      motionBlurAmountPx: blur,
      audioEmissionMultiplier: Math.round((1.0 + audioTransientPeak * 2.5) * 100) / 100,
      activeClusterCentroid: {
        x: Math.round(sumX / count),
        y: Math.round(sumY / count),
        z: Math.round(sumZ / count),
      },
    };
  }

  /**
   * Bakes DNA Swarm or Boids Cluster Trajectory into Standard Bézier Keyframes.
   */
  static bakeSwarmClusterToKeyframes(
    centroidTrajectory: { time: number; x: number; y: number }[]
  ): KeyframePoint[] {
    return centroidTrajectory.map((pt, idx) => ({
      id: 9930 + idx,
      time: Math.round(pt.time * 10) / 10,
      value: Math.round(pt.y),
      type: 'bezier',
      handleIn: { x: 0.2, y: pt.y },
      handleOut: { x: 0.2, y: pt.y },
    }));
  }
}
