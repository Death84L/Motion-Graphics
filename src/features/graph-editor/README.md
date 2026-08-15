# 🎬 Motion Graph Editor (`src/features/graph-editor`)

## Overview
The **Motion Graph Editor** is the flagship Bézier curve editing canvas of Motion Studio. It provides frame-accurate mathematical curve authoring, speed and value graph manipulation, and high-performance SVG rendering.

---

## 🚀 Key Capabilities & Tools
- **Interactive Bézier Curve Canvas**: Direct manipulation of keyframe points and weighted control handles.
- **Speed & Value Modes**: Toggle between Value Graphs (absolute property trajectory) and Speed Graphs (rate of change $\frac{\Delta v}{\Delta t}$).
- **Kinematic Derivatives Overlay**: Real-time evaluation of Velocity, Acceleration, and Jerk curves.
- **Snapping & Grid Alignment**: Snap to integer frames, zero-velocity tangents, keyframe values, and musical beat markers.
- **Multi-Selection & Bounding Box**: Select multiple keyframes and scale, stretch, compress, or reverse them using the transform lattice box.
- **Smart Snapping Engine**: Automatically locks tangent handles to horizontal ($0^\circ$), vertical ($90^\circ$), and standard easing tangents.

---

## 📐 Impact on Creators
- Eliminates guesswork by displaying continuous acceleration profiles.
- Provides tactile After Effects & Premiere Pro speed-graph control directly inside a lightweight panel.
- 100% free and local-first with zero lag and instant response.

---

## 📁 Key File Inventory
- `components/canvas/CanvasGrid.tsx`: Dynamic time and value coordinate grid renderer.
- `components/canvas/CanvasHeatmapCurve.tsx`: Color-coded velocity and jerk hotspot visualizer.
- `components/canvas/LatticeTransformBox.tsx`: Multi-keyframe bounding box transform gizmo.
- `state/graphStore.ts`: Graph viewport zoom/pan, active layer selection, and undo state.
- `utils/curveEvaluation.ts`: Cubic Bézier root solver for time $t \to \text{value}$.
