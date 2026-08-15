# 🧠 Procedural Animation Graph & Motion Programming System (`src/features/logic-graph`)

## Overview
The **Procedural Animation Graph** transforms Motion Studio into a universal visual motion programming environment where:

$$\text{Anything (Inputs)} \longrightarrow \text{Procedural Graph} \longrightarrow \text{Anything (Outputs)}$$

Every property—transforms, text kerning, colors, audio triggers, camera shake, spring physics, and particle emission—can be procedurally generated, driven, and baked into keyframes.

---

## 🚀 Key Capabilities & Tools

### 1. 🧱 Comprehensive Node Hierarchy (46+ Node Types)
- **Inputs**: Time ($s$), DeltaTime, Playhead Frame, Audio FFT (Bass, Mid, Treble, Kick, Beat), Mouse Distance, Layer/Char Index, User Parameters.
- **Math & Trigonometry**: Add, Subtract, Multiply, Divide, Modulo, Min/Max, Sine, Cosine, Tangent, ArcTan2.
- **Vector Operations**: 2D/3D Combine, Split, Distance, Length, Dot/Cross Product, Vector Lerp.
- **Interpolation & Remapping**: Smoothstep, Smootherstep, Range Remapping ($[\text{inMin}, \text{inMax}] \to [\text{outMin}, \text{outMax}]$), Easing curves.
- **Spring & Physics Dynamics**: 2nd-order harmonic spring ($f, \zeta, r$ with frequency, mass, damping, stiffness).
- **Noise & Randomness**: Deterministic 1D/2D Perlin Noise, Simplex Noise, Seeded Random Ranges.
- **Logic & Conditionals**: If/Else branch switching, Comparison gates ($>, <, ==, \ne$).
- **Outputs**: Position $X/Y/Z$, Rotation, Scale, Opacity, Glow Aura, Camera Shake, Particle Emission Rate.

---

### 2. ⚡ Procedural Graph Presets
1. **Harmonic Spring Bounce**: $Time \to Sin \to Remap \to Spring \to Scale$.
2. **Perlin Noise Camera Shake**: $Time \to PerlinNoise \to Multiplier \to CamShake$.
3. **Audio-Reactive Bass Pop**: $AudioBass \to Spring \to Multiplier \to GlowAura$.
4. **Kinetic Typography Wave**: $CharIndex \to StaggerDelay \to Spring \to CharY$.

---

### 3. 🔥 1-Click Keyframe Baker
- Evaluates procedural DAG equations continuously over time and bakes them into standard Bézier keyframes (`KeyframePoint[]`).
- 1-Click dispatch to **Adobe Premiere Pro (UXP)**, **After Effects (JSX)**, and **DaVinci Resolve (Fusion)**!

---

## 📁 Key File Inventory
- `components/MotionLogicGraphView.tsx`: Main visual programming studio view with infinite SVG wire canvas, live node blocks, parameter sliders, and keyframe baker.
- `../../core/nodes/proceduralGraphSchema.ts`: Node definitions, sockets, wires, evaluation context, and output schemas.
- `../../core/nodes/proceduralGraphEngine.ts`: DAG evaluation engine, Perlin noise math, 2nd-order harmonic spring solvers, and keyframe baker.
