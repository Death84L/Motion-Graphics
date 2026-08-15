# 🏛️ Living Parametric Presets (`src/features/parametric-presets`)

## Overview
Replaces static, rigid JSON preset files with living parametric systems exposing physical sliders, real-time continuous morphing, dynamic intensity variants, and instant animation extraction.

---

## 🚀 Key Capabilities
- **Living Physical Sliders**: Real-time adjustment of *Duration, Intensity, Elasticity, Overshoot %, Damping, Stiffness, and Stagger*.
- **Continuous Preset Morphing**: Smoothly blend between Preset A (e.g. *Elastic Pop*) and Preset B (e.g. *Cinematic Drift*) across a continuous $0\% \to 100\%$ slider.
- **Dynamic Preset Variants**: Automatically generate **Soft**, **Medium**, **Strong**, and **Extreme** intensity variations for any preset.
- **Extract Preset from Animation**: One-click analysis of any active Bézier curve to extract and save a reusable Parametric Preset.

---

## 📁 Key File Inventory
- `components/ParametricPresetStudioView.tsx`: Living preset UI with morphing stage and variant chips.
- `../../core/presets/parametricPresetSystem.ts`: Parametric preset evaluation and morphing math engine.
