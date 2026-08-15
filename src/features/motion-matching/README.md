# 🧬 Motion Matching & Kinematic Transfer (`src/features/motion-matching`)

## Overview
Flagship motion matching studio providing automated motion character transfer, 5D DNA library similarity search, and multi-metric weighted reference curve optimization.

---

## 🚀 Key Capabilities
- **Mode A: Find Similar**: 5D Euclidean similarity search (Energy, Smoothness, Elasticity, Aggression, Rhythm) ranking preset matches with percentage scores.
- **Mode B: Match Motion**: Transfers the physical character and velocity curvature of Source A $\to$ B onto Target C $\to$ D while adapting scale and range.
- **Mode C: Match Reference Optimizer**: Compares active curve with external JSON/CSV/video reference curves and iteratively optimizes tangent weights to minimize Match Error % (e.g. $18.4\% \to 2.1\%$).
- **Multi-Metric Weighted Matrix**: Individual weight sliders for *Velocity Profile (35%)*, *Easing & Damping (25%)*, *Overshoot (15%)*, *Acceleration (15%)*, and *Rhythm (10%)*.

---

## 📁 Key File Inventory
- `components/MotionMatchingStudioView.tsx`: Full studio view with match gauges, reference selector, and optimization controls.
- `../../core/matching/advancedMotionMatcher.ts`: Multi-metric error analysis and iterative curve convergence solver.
