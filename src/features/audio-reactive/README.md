# 🎵 Audio-Reactive Motion Engine (`src/features/audio-reactive`)

## Overview
The **Audio-Reactive Motion Engine** connects sound directly to visual kinetics. It provides real-time **8-Band Spectral FFT analysis**, **Music Intelligence (BPM, Beat Grid, Downbeat, Transient detection)**, a **Universal Audio-to-Motion Modulation Graph**, and a **1-Click Keyframe Baker** for Adobe Premiere Pro, After Effects, DaVinci Resolve, and Web formats.

---

## 🚀 Key Capabilities & Tools

### 1. 🎚️ 8-Band Frequency Spectrum Analyzer
- Split into standard acoustic frequency bands:
  - **Sub-Bass (20–60 Hz)**: Low rumble & sub-kick impact.
  - **Bass (60–250 Hz)**: Punchy basslines & 808s.
  - **Low-Mid (250–500 Hz)**: Snare body & male fundamentals.
  - **Mid (500–2000 Hz)**: Vocal presence & lead melodies.
  - **High-Mid (2000–4000 Hz)**: Attack clarity & guitar bite.
  - **Treble (4000–8000 Hz)**: Hi-hat rhythm & crisp cymbals.
  - **High-Treble (8000–16000 Hz)**: Air & harmonic shimmer.
  - **RMS Volume**: Overall dynamic loudness.

### 2. 🧠 Music Intelligence Engine
- **Automatic BPM & Confidence**: Autocorrelation transient peak picker detecting accurate musical tempos (e.g. `128 BPM • 94% Confidence`).
- **Downbeat & Kick/Snare Transient Detectors**: Identifies musical bars, measures, and drum hits.

### 3. 🕸️ Universal Audio-to-Motion Modulation Graph
- Maps any audio feature to any visual kinetic property:
  - `Bass ➔ Scale Pulse` ($100\% \to 145\%$)
  - `Kick Transient ➔ Camera Shake` ($0 \to 24\text{px}$)
  - `Mid Frequencies ➔ Neon Glow Aura` ($0 \to 30\text{px}$)
  - `Snare ➔ Vertical Pop Y` ($0 \to -35\text{px}$)
  - `Treble ➔ Rotation Glitch` ($-15^\circ \to +15^\circ$)
- Multiplier, dead-zone threshold gates, and asymmetric Attack/Release envelope smoothing.

### 4. 🔥 1-Click Keyframe Baker & Host Automation
- Bakes continuous audio modulations into discrete, simplified Bézier keyframe curves with Ramer-Douglas-Peucker tolerance reduction.
- Direct export into the **Motion Graph Editor**, **Universal Timeline**, and **Host Bridge (Premiere UXP / AE JSX / Resolve Fusion)**.

---

## 📁 Key File Inventory
- `components/AudioReactiveStudioView.tsx`: Main studio UI with live 8-band equalizer, reactive stage viewport, modulation graph, and keyframe baker.
- `../../core/audio/audioReactiveEngine.ts`: 8-band FFT spectral analyzer and envelope followers.
- `../../core/audio/musicIntelligenceEngine.ts`: BPM detection, beat grid, and transient onset detectors.
- `../../core/audio/audioModulationGraph.ts`: Universal audio-to-motion driver matrix and presets.
- `../../core/audio/audioKeyframeBaker.ts`: Ramer-Douglas-Peucker keyframe baker and curve simplifier.
