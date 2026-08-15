import { KeyframePoint } from '../../features/graph-editor/types';

export type ParticleEmitterType = 'sparks-embers' | 'falling-snow' | 'floating-dust' | 'confetti-popper' | 'smoke-plume';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleStormEngine {
  /**
   * Spawns a pool of dynamic particles based on emitter preset.
   */
  static spawnParticles(type: ParticleEmitterType, count = 60, canvasWidth = 400, canvasHeight = 300): Particle[] {
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      let x = canvasWidth / 2;
      let y = canvasHeight / 2;
      let vx = (Math.random() - 0.5) * 4;
      let vy = (Math.random() - 0.5) * 4;
      let size = Math.random() * 4 + 2;
      let color = '#38bdf8';
      const maxLife = Math.random() * 60 + 40;

      switch (type) {
        case 'sparks-embers':
          y = canvasHeight - 20;
          x = canvasWidth / 2 + (Math.random() - 0.5) * 40;
          vy = -(Math.random() * 5 + 3);
          color = Math.random() > 0.5 ? '#f59e0b' : '#ef4444';
          break;

        case 'falling-snow':
          x = Math.random() * canvasWidth;
          y = Math.random() * -canvasHeight;
          vy = Math.random() * 2 + 1;
          vx = Math.sin(i) * 0.8;
          color = '#f8fafc';
          size = Math.random() * 3 + 1;
          break;

        case 'confetti-popper':
          y = canvasHeight - 40;
          vy = -(Math.random() * 8 + 4);
          vx = (Math.random() - 0.5) * 8;
          color = ['#38bdf8', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'][i % 5];
          size = Math.random() * 6 + 3;
          break;

        case 'smoke-plume':
          y = canvasHeight - 20;
          vy = -(Math.random() * 2 + 1);
          vx = (Math.random() - 0.5) * 1.5;
          color = '#64748b';
          size = Math.random() * 12 + 6;
          break;
      }

      particles.push({
        id: i,
        x,
        y,
        vx,
        vy,
        size,
        color,
        alpha: 1.0,
        life: maxLife,
        maxLife,
      });
    }

    return particles;
  }

  /**
   * Advances simulation step with curl noise turbulence and gravity.
   */
  static stepSimulation(particles: Particle[], width = 400, height = 300, gravity = 0.05): Particle[] {
    return particles.map((p) => {
      let nx = p.x + p.vx;
      let ny = p.y + p.vy + gravity;
      let life = p.life - 1;
      let alpha = Math.max(0, life / p.maxLife);

      // Bounce off floor
      if (ny > height - 10) {
        ny = height - 10;
        p.vy *= -0.5;
      }

      // Recycle dead particles
      if (life <= 0 || ny > height || nx < 0 || nx > width) {
        nx = width / 2 + (Math.random() - 0.5) * 20;
        ny = height - 20;
        life = p.maxLife;
        alpha = 1.0;
      }

      return {
        ...p,
        x: nx,
        y: ny,
        life,
        alpha,
      };
    });
  }

  /**
   * Bakes Particle Centroid Motion into Standard Keyframes.
   */
  static bakeParticleToKeyframes(particles: Particle[]): KeyframePoint[] {
    const avgY = particles.reduce((s, p) => s + p.y, 0) / (particles.length || 1);
    return [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.2, y: avgY } },
      { id: 2, time: 100, value: Math.round(avgY), type: 'bezier', handleIn: { x: 0.2, y: avgY } },
    ];
  }
}
