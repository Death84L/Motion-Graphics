# 🎬 Universal B-Roll Engine & Smart Media Sequencer (`src/features/broll-engine`)

## Overview
The **Universal B-Roll Engine** transforms Motion Studio into an intelligent B-roll media browser, Ken Burns motion designer, and automated music beat-synced montage sequencer. Every B-roll clip is treated as an interactive motion object connected directly to our **Universal Timeline, Graph Editor, Audio-Reactive Engine, Motion DNA, and Host Bridges**.

$$\text{B-Roll Media} \longleftrightarrow \text{Ken Burns / Beat Sequencer} \longleftrightarrow \text{Bézier Keyframes} \longleftrightarrow \text{Premiere / Resolve / AE}$$

---

## 🚀 Key Capabilities & Tools

### 1. 📁 B-Roll Media Browser & Metadata Indexer
- **Multi-Format Support**: Videos (`.mp4`, `.mov`, `.webm`), Images (`.png`, `.jpg`), GIFs, Overlays, and Image Sequences.
- **Categorization**: *Cinematic, Technology, UI, Lifestyle, Business, Nature, Abstract, Background*.
- **Search & Filtering**: Instant search by tags, orientation (16:9 Landscape vs. 9:16 Portrait Reels/Shorts), duration, rating ($1\text{--}5$), and color labels.

---

### 2. 🎥 Ken Burns Dynamic Motion & Framing
- **Motion Directions**: *Zoom In, Zoom Out, Pan Left, Pan Right, Diagonal Up-Left, Diagonal Down-Right*.
- **Smooth Easing**: Smoothstep velocity curve interpolation ensuring continuous camera momentum without abrupt stops.
- **Speed Multipliers**: $0.25\times \to 3.0\times$ speed ramping with pitch-preserved audio playback.

---

### 3. 🎵 Automatic 128 BPM Music Beat-Sync Sequencer
- **Automatic Montage Generation**: Sequences a pool of B-roll clips synchronized to musical downbeats (e.g. 4-beat cuts = $1.875\text{s}$ per shot).
- **Transition Control**: Cross Dissolves, Whip Pans, Glitch Transitions, Light Leaks, and Zoom Pushes between montage shots.

---

### 4. 🔥 1-Click Keyframe Baker & Host Automation
- Bakes continuous Ken Burns zoom/pan trajectories and speed curves into discrete, editable Bézier keyframes for **Adobe Premiere Pro (UXP)**, **After Effects (JSX)**, and **DaVinci Resolve (Fusion)**!

---

## 📁 Key File Inventory
- `components/BrollStudioView.tsx`: Main 3-column studio UI with media library, live Ken Burns preview canvas, and storyboard montage sequence.
- `../../core/broll/brollSchema.ts`: B-Roll clip models, categories, Ken Burns presets, and storyboard schemas.
- `../../core/broll/brollEngine.ts`: Ken Burns trajectory solver, automatic BPM beat sequencer, and keyframe baker.
