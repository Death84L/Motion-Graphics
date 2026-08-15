# 🧬 Motion DNA — Universal Motion Intelligence System (`src/features/dna-analyzer`)

## Overview
**Motion DNA** is the universal intelligence representation of Motion Studio. Every animation, keyframe curve, transition, camera shake, and physics spring is encoded into a **machine-readable DNA Signature**.

This allows seamless interoperability across:
`Timeline ➔ Motion DNA ➔ Analysis ➔ Matching ➔ Editing ➔ Generation ➔ Transfer ➔ Presets ➔ Export`

---

## 🚀 Key Capabilities & Tools

### 1. 🧬 Machine-Readable DNA Signatures
- **Temporal DNA**: Exact duration ($ms$), active ratio, rhythm frequency ($Hz$), and interval distribution.
- **Kinematics DNA**: Peak velocity, peak acceleration, and max jerk with a **Jerk Smoothness Score** ($0\text{–}100$).
- **Physics DNA**: Estimated spring stiffness ($k$), damping ratio ($\zeta$), overshoot percentage ($\%$) and settle time ($ms$).
- **Quality DNA**: Comprehensive scoring for Smoothness ($96\%$), Elasticity ($88\%$), Energy ($82\%$), and Composite Score ($94/100$).
- **Style DNA**: Automated classification (`#smooth`, `#cinematic`, `#snappy`, `#elastic`, `#minimal`).

### 2. 🔍 Vector Similarity & Search
- Multi-vector Euclidean distance comparison measuring similarity across *Timing, Velocity, Smoothness, Elasticity, Energy, and Rhythm*.

### 3. 🔄 Motion DNA Transfer & Continuous Morphing
- **DNA Morphing Slider**: Continuous blending between Motion A (e.g. *Apple Smooth Ease*) and Motion B (e.g. *Elastic Pop*) from $0\% \to 100\%$.
- **DNA Transfer Engine**: Transfers kinetic characteristics from a reference source onto any target animation with configurable strength.

### 4. 🔬 Git-Like Motion Diff Matrix
- Structured semantic diff between animations:
  - `Duration: +120ms`
  - `Velocity: -18%`
  - `Smoothness: +9%`
  - `Overshoot: +12%`

### 5. ✨ 1-Click Auto-Optimization
- 1-Click curve synthesizer that eliminates high-frequency jerk spikes and optimizes keyframes to a **95+ Quality Score**.

---

## 📁 Key File Inventory
- `components/MotionDnaStudioView.tsx`: Main studio UI with 6D radar breakdown, continuous morphing slider, live stage viewport, and motion diff.
- `../../core/dna/motionDnaSchema.ts`: Universal DNA signature schemas, presets, and diff interfaces.
- `../../core/dna/motionDnaEngine.ts`: Deterministic mathematical extraction, vector comparison, Git-diff, blending, and auto-optimization.
