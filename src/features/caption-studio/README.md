# 💬 Caption Studio (`src/features/caption-studio`)

## Overview
A first-class, local-first kinetic subtitle and caption motion engine for video editors, social creators, and accessibility compliance with zero cloud transcription costs.

---

## 🚀 Key Capabilities
- **Word-Level Micro Timing**: Millisecond-accurate word timestamp editor with draggable word blocks.
- **100% Free & Local Transcription Import**: Imports SRT, WebVTT, ASS, and TXT files directly without paid cloud APIs.
- **Active Karaoke Fill Sweeps**: Smooth color/gradient highlight sweep synchronized with speech pacing.
- **Kinematic Word Pops**: Elastic scale bounce ($100\% \to 118\% \to 100\%$) as each word is spoken.
- **Phrase-Aware Line Breaking**: Intelligently breaks caption lines around semantic clauses rather than awkward mid-word cuts.
- **Deterministic Semantic Emphasis**: Auto-highlights ALL CAPS, exclamation points, numbers, and delivery tags like `[SHOUT]`, `[WHISPER]`.
- **Professional Ripple Editor**: Adjusting one caption block automatically shifts downstream captions forward while maintaining natural gaps.
- **Multi-Format Subtitle Exporter**: Generates `.srt`, `.vtt`, and `.ass` (Advanced SubStation Alpha) with karaoke timing tags.

---

## 📁 Key File Inventory
- `components/CaptionStudioView.tsx`: Main studio layout with timeline, preview stage, and style panel.
- `components/CaptionTimeline.tsx`: DAW-style caption block and word block timing editor.
- `components/CaptionPreviewStage.tsx`: Real-time canvas rendering active word highlights and pops.
- `../../core/caption/captionAnimationEngine.ts`: Interpolates caption position, scale, and karaoke sweeps.
- `../../core/caption/timing/rippleEditingEngine.ts`: Frame-accurate ripple edit shift calculator.
