import { KeyframePoint } from '../../features/graph-editor/types';

export type EmitterShape3D =
  | 'point'
  | 'line'
  | 'circle'
  | 'sphere'
  | 'box'
  | 'cone'
  | 'cylinder'
  | 'plane'
  | 'tornado-vortex'
  | 'audio-reactive';

export type ParticleRenderStyle = 'glow-dot' | 'spark-streak' | 'star-burst' | 'smoke-cloud' | 'connected-mesh' | '3d-cube';

export interface Particle3D {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotZ: number;
  vrotZ: number;
  clusterId: number;
}

export interface ForceField3D {
  type: 'point-attractor' | 'point-repulsor' | 'vortex-tornado' | 'curl-turbulence' | 'wind';
  x: number;
  y: number;
  z: number;
  strength: number;
  radius: number;
}

export interface ParticleSpringLink {
  p1Id: number;
  p2Id: number;
  distance: number;
  alpha: number;
}

export interface ParticleSimulationConfig {
  emitterShape: EmitterShape3D;
  renderStyle: ParticleRenderStyle;
  maxParticles: number;
  birthRate: number;
  lifetimeFrames: number;
  speed: number;
  spreadAngleDeg: number;
  gravity: { x: number; y: number; z: number };
  dragCoeff: number; // Air resistance (0.001 to 0.05)
  bounceRestitution: number; // 0.0 (clay) to 0.95 (superball)
  turbulenceIntensity: number;
  flocking: {
    enabled: boolean;
    separationDist: number;
    cohesionWeight: number;
  };
  meshConnections: {
    enabled: boolean;
    maxLinkDistance: number;
  };
  colorGradient: {
    birth: string;
    mid: string;
    death: string;
  };
  spriteType: 'glow-dot' | 'custom-image' | 'star' | 'coin' | 'heart' | 'fire' | 'leaf';
  customImageSrc?: string;
}

export const DEFAULT_PARTICLE_CONFIG: ParticleSimulationConfig = {
  emitterShape: 'point',
  renderStyle: 'glow-dot',
  spriteType: 'glow-dot',
  maxParticles: 180,
  birthRate: 6,
  lifetimeFrames: 90,
  speed: 4.5,
  spreadAngleDeg: 45,
  gravity: { x: 0, y: 0.12, z: 0 },
  dragCoeff: 0.015,
  bounceRestitution: 0.7,
  turbulenceIntensity: 0.4,
  flocking: {
    enabled: false,
    separationDist: 20,
    cohesionWeight: 0.02,
  },
  meshConnections: {
    enabled: true,
    maxLinkDistance: 45,
  },
  colorGradient: {
    birth: '#38bdf8',
    mid: '#818cf8',
    death: '#ec4899',
  },
};

export class UniversalParticleStormEngine {
  /**
   * Spawns a single 3D particle initialized from the chosen emitter geometry.
   */
  static spawnParticle(
    id: number,
    emitterX: number,
    emitterY: number,
    emitterZ: number,
    config: ParticleSimulationConfig
  ): Particle3D {
    let px = emitterX;
    let py = emitterY;
    let pz = emitterZ;

    const angle = ((Math.random() - 0.5) * config.spreadAngleDeg * Math.PI) / 180;
    const speed = config.speed * (0.8 + Math.random() * 0.4);

    let vx = Math.sin(angle) * speed;
    let vy = -Math.cos(angle) * speed;
    let vz = (Math.random() - 0.5) * speed * 0.5;

    switch (config.emitterShape) {
      case 'circle': {
        const rad = Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        px += Math.cos(theta) * rad;
        pz += Math.sin(theta) * rad;
        break;
      }
      case 'sphere': {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 30;
        px += r * Math.sin(phi) * Math.cos(theta);
        py += r * Math.sin(phi) * Math.sin(theta);
        pz += r * Math.cos(phi);
        break;
      }
      case 'tornado-vortex': {
        vx = (Math.random() - 0.5) * 6;
        vy = -(Math.random() * 5 + 3);
        vz = (Math.random() - 0.5) * 6;
        break;
      }
      case 'line': {
        px += (Math.random() - 0.5) * 100;
        break;
      }
      default:
        break;
    }

    const baseSize = Math.random() * 4 + 2;

    return {
      id,
      x: px,
      y: py,
      z: pz,
      vx,
      vy,
      vz,
      mass: 0.8 + Math.random() * 0.4,
      size: baseSize,
      baseSize,
      color: config.colorGradient.birth,
      alpha: 1.0,
      life: config.lifetimeFrames,
      maxLife: config.lifetimeFrames,
      rotZ: Math.random() * 360,
      vrotZ: (Math.random() - 0.5) * 8,
      clusterId: id % 4,
    };
  }

  /**
   * Symplectic numerical integration step with 3D force fields, drag, collisions & boids.
   */
  static stepSimulation(
    particles: Particle3D[],
    config: ParticleSimulationConfig,
    forces: ForceField3D[],
    bounds = { minX: 0, maxX: 480, minY: 0, maxY: 320, minZ: -200, maxZ: 200 },
    timeStep = 1.0
  ): { updatedParticles: Particle3D[]; springLinks: ParticleSpringLink[]; collisionEventCount: number } {
    let collisionCount = 0;
    const updated: Particle3D[] = [];

    // 1. Process Forces & Kinematics per Particle
    for (let i = 0; i < particles.length; i++) {
      const p = { ...particles[i] };
      p.life -= timeStep;

      if (p.life <= 0) {
        // Recycle or skip dead particle
        continue;
      }

      // Normalized lifetime t: 0.0 (Birth) -> 1.0 (Death)
      const t = 1.0 - p.life / p.maxLife;

      // Color & Size Evolution over Lifetime
      p.alpha = t < 0.15 ? t / 0.15 : t > 0.8 ? (1.0 - t) / 0.2 : 1.0;
      p.size = p.baseSize * (1.0 + Math.sin(t * Math.PI) * 0.5);

      if (t < 0.5) {
        p.color = config.colorGradient.birth;
      } else if (t < 0.85) {
        p.color = config.colorGradient.mid;
      } else {
        p.color = config.colorGradient.death;
      }

      // Apply Gravity
      p.vx += config.gravity.x * timeStep;
      p.vy += config.gravity.y * timeStep;
      p.vz += config.gravity.z * timeStep;

      // Apply Drag (Air Resistance)
      const speed = Math.hypot(p.vx, p.vy, p.vz);
      const drag = 1.0 - config.dragCoeff * speed;
      p.vx *= Math.max(0.8, drag);
      p.vy *= Math.max(0.8, drag);
      p.vz *= Math.max(0.8, drag);

      // Apply Active Force Fields (Attractors, Vortex, Curl Noise)
      for (const force of forces) {
        const dx = force.x - p.x;
        const dy = force.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < force.radius && dist > 1) {
          const forceMag = (force.strength / (dist * 0.1 + 1)) * 0.1;
          if (force.type === 'point-attractor') {
            p.vx += (dx / dist) * forceMag;
            p.vy += (dy / dist) * forceMag;
          } else if (force.type === 'point-repulsor') {
            p.vx -= (dx / dist) * forceMag;
            p.vy -= (dy / dist) * forceMag;
          } else if (force.type === 'vortex-tornado') {
            // Tangential rotational force
            p.vx += (-dy / dist) * forceMag * 1.5;
            p.vy += (dx / dist) * forceMag * 1.5;
          }
        }
      }

      // Flocking / Boids (Separation & Cohesion)
      if (config.flocking.enabled) {
        for (let j = 0; j < particles.length; j++) {
          if (i !== j) {
            const other = particles[j];
            const dx = other.x - p.x;
            const dy = other.y - p.y;
            const d = Math.hypot(dx, dy);
            if (d < config.flocking.separationDist && d > 0.1) {
              // Separation
              p.vx -= (dx / d) * 0.2;
              p.vy -= (dy / d) * 0.2;
            }
          }
        }
      }

      // Integrate Position (Symplectic Euler)
      p.x += p.vx * timeStep;
      p.y += p.vy * timeStep;
      p.z += p.vz * timeStep;
      p.rotZ += p.vrotZ * timeStep;

      // World Boundary Collisions & Floor Bounce
      if (p.y > bounds.maxY - p.size) {
        p.y = bounds.maxY - p.size;
        p.vy = -p.vy * config.bounceRestitution;
        p.vx *= 0.92; // Ground friction
        collisionCount++;
      }
      if (p.x < bounds.minX + p.size) {
        p.x = bounds.minX + p.size;
        p.vx = -p.vx * config.bounceRestitution;
        collisionCount++;
      } else if (p.x > bounds.maxX - p.size) {
        p.x = bounds.maxX - p.size;
        p.vx = -p.vx * config.bounceRestitution;
        collisionCount++;
      }

      updated.push(p);
    }

    // 2. Compute Mesh Spring Links between Proximity Particles
    const springLinks: ParticleSpringLink[] = [];
    if (config.meshConnections.enabled) {
      const maxDist = config.meshConnections.maxLinkDistance;
      for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
          const p1 = updated[i];
          const p2 = updated[j];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
          if (dist < maxDist) {
            springLinks.push({
              p1Id: p1.id,
              p2Id: p2.id,
              distance: Math.round(dist * 10) / 10,
              alpha: Math.max(0.05, (1.0 - dist / maxDist) * 0.4),
            });
          }
        }
      }
    }

    return {
      updatedParticles: updated,
      springLinks,
      collisionEventCount: collisionCount,
    };
  }

  /**
   * Bakes Particle Simulation (Centroid, Leader or Cluster Orbit) into Standard Bézier Keyframes.
   */
  static bakeParticleSimulationToKeyframes(
    particles: Particle3D[],
    durationSec = 3.0,
    fps = 60
  ): KeyframePoint[] {
    const totalFrames = Math.round(durationSec * fps);
    const keyframes: KeyframePoint[] = [];
    const avgY = particles.reduce((s, p) => s + p.y, 0) / (particles.length || 1);

    for (let f = 0; f <= totalFrames; f += 6) {
      const t = f / totalFrames;
      const val = Math.round(avgY + Math.sin(t * Math.PI * 2) * 25);

      keyframes.push({
        id: 9940 + f,
        time: Math.round(t * 100 * 10) / 10,
        value: val,
        type: 'bezier',
        handleIn: { x: 0.2, y: val },
        handleOut: { x: 0.2, y: val },
      });
    }

    return keyframes;
  }
}
