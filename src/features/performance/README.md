# ⚡ Real-Time Performance Profiler (`src/features/performance`)

## Overview
Real-time telemetry HUD tracking frame budgets, rendering latency, graph evaluation times, and identifying performance bottlenecks.

---

## 🚀 Key Capabilities
- **Frame Budget HUD**: Tracks live FPS (60/120 FPS target) and frame evaluation time (target $16.6\text{ms}$).
- **Subsystem Breakdown**: Isolates execution duration across *Graph Evaluation, Physics Integration, Canvas Rendering, and Timeline Sync*.
- **Automated Bottleneck Diagnostics**: Flags high shader complexity, heavy motion blur, or excessive keyframe density with actionable fix suggestions.
