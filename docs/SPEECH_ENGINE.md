# 🎙️ Motion Studio: Speech Reframing & Kinetic Caption Engine

The **Motion Studio Speech Reframing Engine** is an industrial-grade, 100% free, and local-first subsystem designed to automate multi-speaker podcast tracking, voice activity detection (VAD), intelligent speech cadence trimming, and kinetic karaoke subtitle animation without third-party cloud APIs.

---

```
                       🎙️ ADVANCED SPEECH REFRAMING PIPELINE
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ [🎙️ Voice Activity Detection] ──► [✂️ Filler Word Cleaner] ──► [🎤 Kinetic Caption Engine]   │
├──────────────────────────┬───────────────────────────┬──────────────────────────────────────┤
│ 1. VAD DIARIZATION       │ 2. PACING & FILLER CLEANER│ 3. 4 PRO CAPTION TEMPLATES           │
│                          │                           │                                      │
│ • 200ms Lookahead Buffer │ • Detects "um", "uh",     │ 🔥 Hormozi Punch (1.35x Scale Bounce)│
│   (Anticipates speech)   │   "like", and "you know"  │ ⚡ MrBeast Heavy (4px Stroke + Emoji)│
│ • 500ms Breath Hold-Time │ • 1-Click Jump-Cut Splice │ ☕ Ali Abdaal Clean (Pastel Pill)    │
│   (Zero camera jitter)   │ • Energy-Driven +8% Zoom  │ 🤖 Cyber Neon (Cyan/Magenta Glow)    │
│ • Speaker Centroid Lock  │   (on loud emphasis)      │                                      │
└──────────────────────────┴───────────────────────────┴──────────────────────────────────────┘
```

---

## 1. 🧠 Voice Activity Detection (VAD) & Diarization Mechanics

### 200ms Anticipation Lookahead
When real humans speak, camera operators anticipate speech before sound waves hit the ear. The engine analyzes incoming speech timestamps and offsets camera cuts by:
$$\text{Cut Timestamp} = \max(0, t_{\text{speech start}} - 0.20\text{s})$$
This ensures the virtual camera glides smoothly onto the speaker as their mouth opens, eliminating unnatural lag.

### 500ms Breath Hold-Time
To prevent erratic camera switching during natural conversational pauses or breath intakes:
$$\Delta t_{\text{pause}} \le 0.50\text{s} \implies \text{Retain Active Speaker Lock}$$
The camera only switches angles when secondary speaker speech exceeds the hold-time threshold.

---

## 2. 🎤 4 Pro Creator Caption Style Presets

The engine includes 4 pre-configured, battle-tested kinetic typography templates:

| Style Preset | Font Family | Active Word Animation | Key Visual Feature |
| :--- | :--- | :--- | :--- |
| **`🔥 Hormozi Punch`** | Montserrat Bold | $1.35\times$ scale + spring bounce | `#fde047` Yellow / `#10b981` Green text glow |
| **`⚡ MrBeast Heavy`** | Impact / Arial Black | $1.25\times$ scale | $4\text{px}$ black stroke + emoji triggers (`💰`, `🚀`, `🔥`) |
| **`☕ Ali Clean Pill`** | Georgia Serif | $1.12\times$ subtle elevation | Mint-green pastel background highlight pill |
| **`🤖 Cyber Neon`** | Courier Monospace | $1.30\times$ scale | Dual-glow cyan & magenta specular shadows |

---

## 3. ✂️ Filler Word & Stutter Cleaner

The speech kinematics analyzer scans speech transcripts and flags common conversational filler words:
- `"um"`, `"uh"`, `"like"`, `"you know"`, `"ah"`

### Automated Jump-Cut Splicing:
- Generates millisecond-accurate edit decision lists (EDLs).
- Splices dead-air and filler words to increase overall speech cadence to the viral sweet spot of **$160 \to 190\text{ WPM}$**.

---

## 4. 🔊 Vocal Intensity-Driven Zoom Punch-Ins

The engine calculates root-mean-square (RMS) vocal energy along the timeline:
- When volume or vocal emphasis spikes above **$-18\text{dB}$**:
$$\text{Scale Multiplier} = 1.08 \quad (+8\% \text{ Zoom Punch})$$
- Applied with a smooth sinusoidal ease-in-out curve over $0.4\text{s}$ to emphasize critical points and humor punchlines.

---

## 5. 🛡️ Safe-Zone Collision Avoidance Solver

Captions are mathematically clamped to prevent visual occlusion:
1. **Platform Insets**: Clamped above the bottom $380\text{px}$ where TikTok/Reels user names and audio tracks render.
2. **Face Clamping**: If subject's face is positioned in the lower third, captions automatically flip to the upper third ($Y = 240\text{px}$).

---

## 6. 📥 Direct Subtitle & Code Export

- **Standard SubRip (`.srt`)**: 1-click download with timestamped word ranges.
- **Adobe Premiere Pro (`.uxp.json`)**: Injects Essential Graphics text layers directly into track V4.
- **Adobe After Effects (`.jsx`)**: Creates animated Text Layers with Source Text keyframes and Scale expressions.

---

*Motion Studio Speech Engine — 100% Free, Local-First, Zero Cloud Cost.*
