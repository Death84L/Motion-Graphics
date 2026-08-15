# 🎞️ Motion Studio — Universal Timeline Editor (`src/features/universal-timeline`)

## Overview
The **Universal Timeline Editor** is the central motion-design, multi-track sequencing, and NLE timeline workspace of Motion Studio. It operates as the canonical source-of-truth across Adobe Premiere Pro, After Effects, DaVinci Resolve, and Web platforms.

---

## 🚀 Key Capabilities & Tools

### 1. 🧱 Multi-Track Foundation & Canonical Data Model
- Unlimited tracks: *Video, Audio, Text, Shape, Camera, Light, Null/Controller, Adjustment, and Pre-Compositions*.
- Global SMPTE time ruler with frame ticks, second/millisecond displays, and timecode origin (`00:00:00:00`).
- Draggable In/Out Work Area bounds and infinite timeline mode.

### 2. ✂️ Professional NLE & Motion Editing Modes
- **Selection Tool (`V`)**: Move and reorder tracks, blocks, and keyframes.
- **Razor / Split Tool (`C`)**: Split layers and property channels at playhead with 1 click.
- **Ripple Edit (`B`)**: Extending/trimming layer duration automatically shifts all downstream layers forward/backward while maintaining relative gaps.
- **Slip Edit (`Y`)**: Shift internal keyframe offsets without changing outer track boundary in/out points.
- **Slide Edit (`U`)**: Slide track position along the timeline while adjusting neighboring clip boundaries.
- **Time Stretch (`R`)**: Scale keyframe timing and speed multipliers ($0.5\times \to 2.0\times$).

### 3. 🧬 Hierarchical Parenting & Multi-Controller System
- **Concatenated Transform Matrices**: Children automatically inherit parent Position, Scale, Rotation, and Opacity.
- **Null Rig Controllers**: Drive multiple child properties through master Sliders, Angles, Toggles, and Color controllers.
- **Constraint Solvers**: Position, Look-At, Path, and Distance constraints.

### 4. 🎵 Audio-Aware Timeline & Beat Synchronization
- **Real-Time Amplitude Waveforms**: Multi-channel audio waveform rendering.
- **120 BPM Transient Beat Detector**: Generates downbeat and cue flags.
- **1-Click Beat Sync**: Snaps selected keyframes directly to the nearest musical beat marker.

### 5. 🧲 Central Snapping Engine
- Intelligent magnetic snapping to *Frames, Keyframes, Markers, Playhead, Work Area In/Out, and Adjacent Clip Edges*.

### 6. 🔄 Seamless Timeline ↔ Graph Editor ↔ Host Sync
- Clicking any property lane or keyframe diamond in the timeline instantly focuses it in the **Motion Graph Editor**, **Velocity Lab**, or dispatches to **Premiere Pro / After Effects / Resolve**.

---

## 📁 Key File Inventory
- `components/UniversalTimelineStudioView.tsx`: Main multi-pane studio view with ruler, track headers, audio waveform, and canvas stage.
- `../../core/timeline/universalTimelineSchema.ts`: Canonical Universal Composition data schema.
- `../../core/timeline/timelineEngine.ts`: Central timeline engine with NLE operations and hierarchical parent evaluators.
- `../../core/timeline/audioTimelineEngine.ts`: Audio waveform generator and BPM beat grid syncer.
