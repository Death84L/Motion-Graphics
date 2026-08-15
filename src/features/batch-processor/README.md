# 🧩 Motion Batch Processor (`src/features/batch-processor`)

## Overview
High-productivity multi-layer batch processing studio designed to select and transform tens, hundreds, or thousands of animation tracks simultaneously with non-destructive before/after previews.

---

## 🚀 Key Capabilities
- **Multi-Layer Selection & Filtering**: Select layers by type (*Text, Shape, Image, Caption, Video*) and property (*Position, Scale, Rotation, Opacity*).
- **Batch Timing Operations**: Duration scale multiplier ($0.2\times \to 3.0\times$), delay offsets, automatic stagger steps, and reverse timing.
- **Batch Curve & Tangent Modifiers**: Injects harmonic spring overshoot, smooths tangents for jerk reduction, and scales motion intensity.
- **Live Comparison Matrix**: Visual before vs after duration and velocity sparklines for every layer before applying changes.
- **Non-Destructive Dry-Run**: Safe evaluation with 1-click apply and full undo/redo history support.

---

## 📁 Key File Inventory
- `components/MotionBatchProcessorView.tsx`: Multi-column UI with layer filters, comparison matrix, and batch sliders.
- `../../core/batch/motionBatchProcessor.ts`: Core batch calculation and diffing engine.
