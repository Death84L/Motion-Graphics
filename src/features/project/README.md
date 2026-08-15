# 💾 Project Engine & Crash Recovery (`src/features/project`)

## Overview
Manages the `.motionstudio` structured bundle project format, backward-compatible migrations, session watchdog, and atomic crash recovery journaling.

---

## 🚀 Key Capabilities
- **Structured `.motionstudio` Project Container**: Encapsulates metadata, curve layers, timeline tracks, motion recipes, captions, design tokens, and Git branches.
- **Backward-Compatible Schema Migration**: Migrates older project files (e.g. v1.0.0 $\to$ v1.2.0) seamlessly without data loss.
- **Session Crash Watchdog**: Detects abnormal browser/host exits and offers 1-click project restoration from checksummed local storage snapshots.
- **5-Second Atomic Recovery Journal**: Saves automatic snapshots every 5 seconds.
