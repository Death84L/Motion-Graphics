# 🧠 Motion Reverse Engineering (`src/features/reverse-engineering`)

## Overview
The "Explain & Rebuild This Motion" studio analyzes raw keyframes or video tracking data and reconstructs the underlying mathematical recipe.

---

## 🚀 Key Capabilities
- **Kinematic Feature Extraction**: Automatically detects duration, primary easing curve, peak velocity, overshoot %, spring damping, and settling time.
- **Physical Explanation**: Generates an intelligent written breakdown explaining *why* the animation behaves the way it does.
- **1-Click Graph Rebuild**: Converts the extracted physical parameters into an editable Bézier curve with optimized tangent handles.

---

## 📁 Key File Inventory
- `components/MotionReverseEngineeringView.tsx`: Reverse engineering studio UI with parameter readout cards.
- `../../core/math/motionReverseEngineering.ts`: Kinematic parameter extraction and recipe generator.
