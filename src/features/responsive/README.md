# 🎯 Responsive Motion Lab & Breakpoint Engine (`src/features/responsive`)

## Overview
The **Responsive Motion Lab** transforms animation design from rigid, fixed-pixel coordinates into a **5-Level Adaptive Motion System** that automatically adjusts kinetic trajectories, velocity profiles, safe areas, and timing across Desktop (1920x1080), Tablets (iPad), Mobile (iPhone/Android), and Social Video formats (9:16 Reels/Shorts, 1:1 Feeds).

---

## 🚀 The 5-Level Adaptive Motion Hierarchy

1. **Level 1 — Fixed Breakpoint Overrides**: Step-by-step keyframe overrides for Mobile, Tablet, and Desktop.
2. **Level 2 — Continuous Fluid Interpolation**: Mathematical smoothstep scaling smoothly adapting between minimum ($360\text{px}$) and maximum ($1920\text{px}$) viewport widths.
3. **Level 3 — Relative & Container-Aware (`vw`, `vh`, `%`)**: Coordinate conversion relative to container and viewport bounds.
4. **Level 4 — Constraint-Driven Edge Anchoring**: Dynamic edge clamping ensuring objects dock exactly $N\text{px}$ from screen boundaries without manual recalculations.
5. **Level 5 — Semantic Intent Preserver**: Preserves perceptual kinetic character (e.g. *dock right with 380ms duration and safe-area clamp on mobile, 800ms on desktop*).

---

## 📱 Device Profiles & Safe-Area Protection
- **Desktop (1080p / 4K)**: Full unconstrained viewport boundaries.
- **Mobile (iPhone 15 / Android)**: Dynamic Island, Top Notch ($47\text{px}$), and Home Indicator ($34\text{px}$) safe area collision clamping.
- **Social Formats**: 9:16 (TikTok, Reels, Shorts) and 1:1 Square Feed safe overlays.

---

## ⚡ Responsive Code Generator
- **CSS `@media` Keyframes**: Production-ready media query keyframe animations with `prefers-reduced-motion` accessibility support.
- **React Framer Motion**: Responsive variant objects adapting spring parameters across viewport breakpoints.
- **GSAP `ScrollTrigger.matchMedia()`**: Breakpoint-specific timeline animations.

---

## 📁 Key File Inventory
- `components/ResponsiveMotionLabView.tsx`: Main multi-device responsive studio view with live device canvas, notch overlays, and code export.
- `../../core/responsive/responsiveMotionSchema.ts`: Device profiles, safe-area bounds, fluid rules, and semantic motion schemas.
- `../../core/responsive/responsiveMotionLabEngine.ts`: 5-level adaptive motion evaluator, safe-area collision detector, and CSS/Framer code generators.
