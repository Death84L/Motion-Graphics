import {
  PhysicsBody,
  PhysicsSpringConstraint,
  PhysicsWorldConfig,
  MATERIAL_PRESETS,
  CollisionEvent,
  PhysicsTelemetry,
  PhysicsPreset,
} from './universalPhysicsSchema';

export class UniversalPhysicsEngine {
  /**
   * Advances the multi-body physics simulation world by time step dt (in seconds).
   */
  static stepSimulation(
    bodies: PhysicsBody[],
    constraints: PhysicsSpringConstraint[],
    world: PhysicsWorldConfig,
    dt = 1 / 60
  ): { bodies: PhysicsBody[]; collisionEvents: CollisionEvent[]; telemetry: PhysicsTelemetry } {
    const substepCount = Math.max(1, Math.min(8, world.substeps));
    const subDt = (dt * world.timeScale) / substepCount;
    const collisionEvents: CollisionEvent[] = [];

    // Clone bodies for immutable functional updates
    const currentBodies = bodies.map((b) => ({ ...b }));

    for (let step = 0; step < substepCount; step++) {
      // 1. Apply External Forces (Gravity, Wind, Turbulence, Point Attractor)
      currentBodies.forEach((body) => {
        if (body.isPinned) return;
        const mat = MATERIAL_PRESETS[body.material];

        // Gravity
        body.vx += world.gravityX * subDt;
        body.vy += world.gravityY * subDt;

        // Wind & Turbulence
        if (world.windForceX !== 0) {
          const windTurb = (Math.sin(body.y * 0.05 + step) * 0.5 + 0.5) * world.windTurbulence;
          body.vx += (world.windForceX + windTurb * 100) * (mat.dragCoefficient / body.mass) * subDt;
        }

        // Point Attractor / Repulsor
        if (world.pointAttractorStrength !== 0) {
          const dx = world.attractorX - body.x;
          const dy = world.attractorY - body.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          const force = (world.pointAttractorStrength * 50000) / distSq;
          body.vx += (dx / dist) * force * subDt;
          body.vy += (dy / dist) * force * subDt;
        }

        // Air Drag
        body.vx *= Math.max(0, 1.0 - mat.dragCoefficient * subDt * 2);
        body.vy *= Math.max(0, 1.0 - mat.dragCoefficient * subDt * 2);

        // Position Integration
        body.x += body.vx * subDt;
        body.y += body.vy * subDt;
      });

      // 2. Solve Distance & Spring Constraints
      constraints.forEach((c) => {
        const bodyA = currentBodies.find((b) => b.id === c.bodyAId);
        const bodyB = currentBodies.find((b) => b.id === c.bodyBId);
        if (!bodyA || !bodyB) return;

        const dx = bodyB.x - bodyA.x;
        const dy = bodyB.y - bodyA.y;
        const currentDist = Math.sqrt(dx * dx + dy * dy) || 1;
        const delta = currentDist - c.restLength;
        const springForce = delta * c.stiffness;

        const nx = dx / currentDist;
        const ny = dy / currentDist;

        if (!bodyA.isPinned) {
          bodyA.x += nx * delta * 0.5;
          bodyA.y += ny * delta * 0.5;
          bodyA.vx += nx * springForce * subDt * 0.5;
          bodyA.vy += ny * springForce * subDt * 0.5;
        }
        if (!bodyB.isPinned) {
          bodyB.x -= nx * delta * 0.5;
          bodyB.y -= ny * delta * 0.5;
          bodyB.vx -= nx * springForce * subDt * 0.5;
          bodyB.vy -= ny * springForce * subDt * 0.5;
        }
      });

      // 3. Solve Inter-Body Collisions (Circle vs Circle)
      for (let i = 0; i < currentBodies.length; i++) {
        for (let j = i + 1; j < currentBodies.length; j++) {
          const bA = currentBodies[i];
          const bB = currentBodies[j];
          const dx = bB.x - bA.x;
          const dy = bB.y - bA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = bA.radius + bB.radius;

          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate bodies
            if (!bA.isPinned && !bB.isPinned) {
              bA.x -= nx * overlap * 0.5;
              bA.y -= ny * overlap * 0.5;
              bB.x += nx * overlap * 0.5;
              bB.y += ny * overlap * 0.5;
            } else if (!bA.isPinned) {
              bA.x -= nx * overlap;
              bA.y -= ny * overlap;
            } else if (!bB.isPinned) {
              bB.x += nx * overlap;
              bB.y += ny * overlap;
            }

            // Restitution bounce impulse
            const matA = MATERIAL_PRESETS[bA.material];
            const matB = MATERIAL_PRESETS[bB.material];
            const restitution = (matA.restitution + matB.restitution) * 0.5;

            const kx = bA.vx - bB.vx;
            const ky = bA.vy - bB.vy;
            const p = 2 * (nx * kx + ny * ky) / (bA.mass + bB.mass);

            if (!bA.isPinned) {
              bA.vx -= p * bB.mass * nx * (1 + restitution);
              bA.vy -= p * bB.mass * ny * (1 + restitution);
            }
            if (!bB.isPinned) {
              bB.vx += p * bA.mass * nx * (1 + restitution);
              bB.vy += p * bA.mass * ny * (1 + restitution);
            }

            collisionEvents.push({
              timestampMs: Date.now(),
              bodyAId: bA.id,
              bodyBId: bB.id,
              impactVelocity: Math.sqrt(kx * kx + ky * ky),
              pointX: (bA.x + bB.x) / 2,
              pointY: (bA.y + bB.y) / 2,
            });
          }
        }
      }

      // 4. Solve Boundary & Floor Collisions
      currentBodies.forEach((body) => {
        if (body.isPinned) return;
        const mat = MATERIAL_PRESETS[body.material];

        // Floor Collision
        if (body.y + body.radius >= world.boundsHeight) {
          body.y = world.boundsHeight - body.radius;
          body.vy = -body.vy * mat.restitution;
          body.vx *= (1.0 - mat.friction);
          if (Math.abs(body.vy) < 15) body.vy = 0; // Resting threshold
        }
        // Top Ceiling Collision
        if (body.y - body.radius <= 0) {
          body.y = body.radius;
          body.vy = -body.vy * mat.restitution;
        }
        // Left Wall Collision
        if (body.x - body.radius <= 0) {
          body.x = body.radius;
          body.vx = -body.vx * mat.restitution;
        }
        // Right Wall Collision
        if (body.x + body.radius >= world.boundsWidth) {
          body.x = world.boundsWidth - body.radius;
          body.vx = -body.vx * mat.restitution;
        }
      });
    }

    // 5. Calculate Telemetry
    let totalKineticEnergy = 0;
    let totalPotentialEnergy = 0;
    let totalMomentum = 0;
    let peakVelocity = 0;

    currentBodies.forEach((b) => {
      const vSq = b.vx * b.vx + b.vy * b.vy;
      const v = Math.sqrt(vSq);
      totalKineticEnergy += 0.5 * b.mass * vSq;
      totalPotentialEnergy += b.mass * (world.gravityY / 100) * (world.boundsHeight - b.y);
      totalMomentum += b.mass * v;
      if (v > peakVelocity) peakVelocity = v;
    });

    return {
      bodies: currentBodies,
      collisionEvents,
      telemetry: {
        kineticEnergy: Math.round(totalKineticEnergy),
        potentialEnergy: Math.round(totalPotentialEnergy),
        totalMomentum: Math.round(totalMomentum),
        peakVelocity: Math.round(peakVelocity),
        activeCollisionCount: collisionEvents.length,
      },
    };
  }
}

export const SAMPLE_PHYSICS_PRESETS: PhysicsPreset[] = [
  {
    id: 'preset-bouncy-balls',
    name: 'Bouncy Rubber Balls Drop',
    category: 'rigid-body',
    description: '3 multi-size rubber spheres colliding under earth gravity with realistic restitution.',
    world: {
      gravityX: 0,
      gravityY: 980,
      timeScale: 1.0,
      substeps: 4,
      windForceX: 0,
      windTurbulence: 0,
      pointAttractorStrength: 0,
      attractorX: 250,
      attractorY: 200,
      boundsWidth: 500,
      boundsHeight: 380,
    },
    bodies: [
      { id: 'b1', name: 'Rubber Sphere A', shape: 'circle', x: 180, y: 60, vx: 50, vy: 0, mass: 1.5, radius: 24, width: 48, height: 48, rotationDeg: 0, angularVelocity: 0, material: 'rubber', isPinned: false, color: '#ec4899' },
      { id: 'b2', name: 'Rubber Sphere B', shape: 'circle', x: 260, y: 30, vx: -40, vy: 0, mass: 2.2, radius: 32, width: 64, height: 64, rotationDeg: 0, angularVelocity: 0, material: 'rubber', isPinned: false, color: '#38bdf8' },
      { id: 'b3', name: 'Rubber Sphere C', shape: 'circle', x: 340, y: 80, vx: 20, vy: 0, mass: 1.0, radius: 18, width: 36, height: 36, rotationDeg: 0, angularVelocity: 0, material: 'rubber', isPinned: false, color: '#f59e0b' },
    ],
    constraints: [],
  },
  {
    id: 'preset-jelly-cube',
    name: 'Soft Jelly Blob Mesh',
    category: 'soft-body',
    description: '4-node compliant soft-body lattice demonstrating volume preservation and squishy deformation.',
    world: {
      gravityX: 0,
      gravityY: 980,
      timeScale: 1.0,
      substeps: 6,
      windForceX: 0,
      windTurbulence: 0,
      pointAttractorStrength: 0,
      attractorX: 250,
      attractorY: 200,
      boundsWidth: 500,
      boundsHeight: 380,
    },
    bodies: [
      { id: 'j1', name: 'Jelly Top-Left', shape: 'circle', x: 220, y: 50, vx: 0, vy: 0, mass: 1.0, radius: 14, width: 28, height: 28, rotationDeg: 0, angularVelocity: 0, material: 'jelly', isPinned: false, color: '#10b981' },
      { id: 'j2', name: 'Jelly Top-Right', shape: 'circle', x: 280, y: 50, vx: 0, vy: 0, mass: 1.0, radius: 14, width: 28, height: 28, rotationDeg: 0, angularVelocity: 0, material: 'jelly', isPinned: false, color: '#10b981' },
      { id: 'j3', name: 'Jelly Bottom-Left', shape: 'circle', x: 220, y: 110, vx: 0, vy: 0, mass: 1.0, radius: 14, width: 28, height: 28, rotationDeg: 0, angularVelocity: 0, material: 'jelly', isPinned: false, color: '#10b981' },
      { id: 'j4', name: 'Jelly Bottom-Right', shape: 'circle', x: 280, y: 110, vx: 0, vy: 0, mass: 1.0, radius: 14, width: 28, height: 28, rotationDeg: 0, angularVelocity: 0, material: 'jelly', isPinned: false, color: '#10b981' },
    ],
    constraints: [
      { id: 'c1', bodyAId: 'j1', bodyBId: 'j2', restLength: 60, stiffness: 240, damping: 0.7 },
      { id: 'c2', bodyAId: 'j2', bodyBId: 'j4', restLength: 60, stiffness: 240, damping: 0.7 },
      { id: 'c3', bodyAId: 'j4', bodyBId: 'j3', restLength: 60, stiffness: 240, damping: 0.7 },
      { id: 'c4', bodyAId: 'j3', bodyBId: 'j1', restLength: 60, stiffness: 240, damping: 0.7 },
      { id: 'c5', bodyAId: 'j1', bodyBId: 'j4', restLength: 85, stiffness: 200, damping: 0.8 }, // Cross diagonal
      { id: 'c6', bodyAId: 'j2', bodyBId: 'j3', restLength: 85, stiffness: 200, damping: 0.8 }, // Cross diagonal
    ],
  },
  {
    id: 'preset-verlet-rope',
    name: 'Verlet Rope & Wind Sway',
    category: 'rope',
    description: 'Pinned rope chain interacting with real-time wind and aerodynamic turbulence.',
    world: {
      gravityX: 0,
      gravityY: 750,
      timeScale: 1.0,
      substeps: 6,
      windForceX: 180,
      windTurbulence: 0.8,
      pointAttractorStrength: 0,
      attractorX: 250,
      attractorY: 200,
      boundsWidth: 500,
      boundsHeight: 380,
    },
    bodies: [
      { id: 'r0', name: 'Anchor Pin', shape: 'circle', x: 250, y: 40, vx: 0, vy: 0, mass: 1.0, radius: 10, width: 20, height: 20, rotationDeg: 0, angularVelocity: 0, material: 'metal', isPinned: true, color: '#f8fafc' },
      { id: 'r1', name: 'Segment 1', shape: 'circle', x: 250, y: 80, vx: 0, vy: 0, mass: 0.5, radius: 10, width: 20, height: 20, rotationDeg: 0, angularVelocity: 0, material: 'fabric', isPinned: false, color: '#38bdf8' },
      { id: 'r2', name: 'Segment 2', shape: 'circle', x: 250, y: 120, vx: 0, vy: 0, mass: 0.5, radius: 10, width: 20, height: 20, rotationDeg: 0, angularVelocity: 0, material: 'fabric', isPinned: false, color: '#38bdf8' },
      { id: 'r3', name: 'Segment 3', shape: 'circle', x: 250, y: 160, vx: 0, vy: 0, mass: 0.5, radius: 10, width: 20, height: 20, rotationDeg: 0, angularVelocity: 0, material: 'fabric', isPinned: false, color: '#38bdf8' },
      { id: 'r4', name: 'Rope Weight', shape: 'circle', x: 250, y: 200, vx: 0, vy: 0, mass: 2.0, radius: 16, width: 32, height: 32, rotationDeg: 0, angularVelocity: 0, material: 'metal', isPinned: false, color: '#ec4899' },
    ],
    constraints: [
      { id: 'rc1', bodyAId: 'r0', bodyBId: 'r1', restLength: 40, stiffness: 450, damping: 0.5 },
      { id: 'rc2', bodyAId: 'r1', bodyBId: 'r2', restLength: 40, stiffness: 450, damping: 0.5 },
      { id: 'rc3', bodyAId: 'r2', bodyBId: 'r3', restLength: 40, stiffness: 450, damping: 0.5 },
      { id: 'rc4', bodyAId: 'r3', bodyBId: 'r4', restLength: 40, stiffness: 450, damping: 0.5 },
    ],
  },
];
