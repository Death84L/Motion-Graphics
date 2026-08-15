# ⚡ Velocity Engine (`src/features/velocity`)

## Overview
Provides core velocity evaluation algorithms, velocity mapping adapters, and tangent handle velocity calculations across host applications (Premiere Pro, After Effects, DaVinci Resolve).

---

## 🚀 Key Capabilities
- Calculates instantaneous velocity vectors: $v(t) = \frac{\Delta \text{value}}{\Delta \text{time}}$.
- Translates Bézier handle lengths and angles into Premiere Pro speed curve percentages.
- Normalizes velocity values across varied canvas aspect ratios and framerates.
