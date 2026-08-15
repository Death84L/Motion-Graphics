export type ParticleKind = 'confetti' | 'sparks' | 'dust' | 'stars' | 'bubbles';

export interface ParticleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export interface ParticleEmitterConfig {
  kind: ParticleKind;
  particleCount: number;
  gravity: number;
  spreadAngleDeg: number;
  initialSpeed: number;
  colors: string[];
}

export const DEFAULT_PARTICLE_CONFIG: ParticleEmitterConfig = {
  kind: 'sparks',
  particleCount: 28,
  gravity: 0.25,
  spreadAngleDeg: 120,
  initialSpeed: 6.0,
  colors: ['#38bdf8', '#ec4899', '#f59e0b', '#10b981'],
};

/**
 * Deterministically simulates particle kinematics at a given frame.
 */
export function simulateParticlesAtFrame(
  config: ParticleEmitterConfig = DEFAULT_PARTICLE_CONFIG,
  frame = 0,
  originX = 0,
  originY = 0
): ParticleParticle[] {
  const particles: ParticleParticle[] = [];

  for (let i = 0; i < config.particleCount; i++) {
    const seedAngle = ((i / config.particleCount) * config.spreadAngleDeg - config.spreadAngleDeg / 2) * (Math.PI / 180);
    const speed = config.initialSpeed * (0.6 + ((i * 7) % 10) * 0.08);

    const vx = Math.sin(seedAngle) * speed;
    const vy = -Math.cos(seedAngle) * speed;

    const t = frame % 50;
    const x = originX + vx * t;
    const y = originY + vy * t + 0.5 * config.gravity * t * t;
    const opacity = Math.max(0, 1 - t / 45);
    const size = 3 + ((i * 3) % 4);
    const color = config.colors[i % config.colors.length];

    particles.push({
      id: i,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      vx,
      vy,
      size,
      color,
      opacity,
      rotation: t * 12,
      rotationSpeed: 12,
    });
  }

  return particles;
}
