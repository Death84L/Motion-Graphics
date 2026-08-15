# 🧪 Universal Physics World & Simulation System (`src/features/physics-sandbox`)

## Overview
The **Universal Physics World & Simulation System** brings real-time 2D/2.5D physical mechanics, multi-body collision dynamics, spring-mass lattices, Verlet rope chains, and aerodynamic forces directly into Motion Studio.

$$\text{Physics Simulation} \longleftrightarrow \text{Keyframe Generation} \longleftrightarrow \text{Premiere / AE / Resolve}$$

---

## 🚀 Key Capabilities & Tools

### 1. 🌍 Physics World & Integration Engine
- **Symplectic Euler / Verlet Integrator**: Deterministic 60fps multi-body physics solver with configurable substeps ($1\text{ to }8$) and time scale ($0.1\times\text{ to }2.0\times$).
- **Active Forces**:
  - Directional Gravity ($g_x, g_y$).
  - Wind Force & Aerodynamic Turbulence.
  - Point Attractors & Repulsors ($F = \frac{G \cdot m_1 m_2}{r^2}$).
  - Viscous Fluid & Air Drag ($F_d = -c_d \cdot v$).
  - Mouse Cursor Impulse Throwing.

---

### 2. 🧱 Material Physics & Presets
- **Rubber**: High coefficient of restitution ($e=0.85$), high surface friction ($\mu=0.7$).
- **Solid Metal**: Heavy mass density ($7.8\text{ kg/m}^2$), low restitution ($e=0.15$).
- **Soft Jelly / Blob**: Compliant internal lattice springs ($k=240, \zeta=0.7$) with squishy volume preservation.
- **Smooth Ice**: Ultra-low friction ($\mu=0.02$).
- **Cloth / Fabric**: High compliance ($\zeta=0.9$) and aerodynamic drag.

---

### 3. 💥 Multi-Body Collisions & Constraints
- **Collision Types**: Circle-Circle, Circle-Box, Ground & Boundary Wall bounces.
- **Constraints**: Distance constraints, Spring-Damped links, Verlet Rope Chains, and Double Pendulums.

---

### 4. 🔥 1-Click Keyframe Baker & Telemetry
- **Keyframe Baker**: Bakes continuous physics trajectories into discrete, optimized Bézier keyframes while strictly preserving all floor impact extrema and rebound peaks.
- **Live Telemetry**: Real-time readouts for Kinetic Energy ($E_k$), Potential Energy ($E_p$), Peak Velocity ($v_{\max}$), and Total Momentum ($P$).

---

## 📁 Key File Inventory
- `components/PhysicsSandboxView.tsx`: Main 60fps HTML5 Canvas physics studio with mouse throwing, material selectors, energy telemetry, and keyframe baker.
- `../../core/physics/universalPhysicsSchema.ts`: Material presets, physics bodies, spring constraints, and telemetry interfaces.
- `../../core/physics/universalPhysicsEngine.ts`: Multi-body Symplectic Euler solver, collision resolution, and forces.
- `../../core/physics/physicsKeyframeBaker.ts`: Trajectory keyframe baker with extrema detection.
