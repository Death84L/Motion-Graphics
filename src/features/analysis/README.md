# 🩺 Motion Analysis & Diagnostics (`src/features/analysis`)

## Overview
Automated motion quality diagnostics and 3-tier actionable auto-fix system that scans keyframe curves for harsh velocity discontinuities, tangent kinks, and high-jerk hotspots.

---

## 🚀 Key Capabilities
- **Overall Motion Quality Score**: 0 to 100 rating based on kinematic smoothness, jerk minimization, and overshoot balance.
- **Frame-Accurate Discontinuity Pinpointing**: Identifies the exact second/frame intervals where motion is unnatural or jarring.
- **3-Tier Actionable Auto-Fix**:
  - *Conservative*: Smooths tangents slightly while strictly preserving keyframe timing and duration.
  - *Balanced*: Aligns velocity continuity with harmonic curve adjustments (-34% average jerk).
  - *Aggressive*: Full spline relaxation and spring damping for maximum liquid smoothness (-58% jerk).
- **Motion DNA Fingerprint**: Generates a 6-axis radar metrics breakdown (Energy, Smoothness, Elasticity, Overshoot, Aggression, Rhythm).

---

## 📁 Key File Inventory
- `components/ActionableDiagnosticsPanel.tsx`: UI panel with frame hotspot alerts and 1-click auto-fix buttons.
- `../../core/math/actionableDiagnosticsEngine.ts`: Numerical evaluation and spline auto-fix solvers.
