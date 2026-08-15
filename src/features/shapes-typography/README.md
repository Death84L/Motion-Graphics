# 🎨 Advanced Vector Shapes & Kinetic Typography Studio (`src/features/shapes-typography`)

## Overview
The **Advanced Vector Shapes & Kinetic Typography Studio** transforms Motion Studio into an all-in-one vector compositor and motion typography powerhouse. Every vector path, Bézier curve, radial clone, and typography character is treated as a first-class animatable object connected directly to our **Universal Timeline, Motion Graph Editor, Physics, Constraints, Motion DNA, and Host Bridges**.

---

## 🚀 Key Capabilities & Tools

### 1. 🎨 Parametric Vector Shapes & Path Engine
- **Parametric Shapes**: Star (5 to 12 points), Circle, Ellipse, Hexagon/Polygon, Diamond, Capsule, Heart, Ring, and Rounded Rectangles.
- **Continuous Shape Morphing**: Seamlessly interpolates vertex coordinates between arbitrary shapes (e.g. *Circle $\leftrightarrow$ Star $\leftrightarrow$ Polygon $\leftrightarrow$ Heart*) from $0\% \to 100\%$.
- **Trim Path Write-On**: Dynamic stroke start/end percentage trimming for signature reveals, line write-on, and circular progress rings.
- **Radial & Grid Repeaters**: Clones shapes radially with progressive rotation and scale stagger offsets.

---

### 2. 🔤 Kinetic Typography Engine
- **Matrix Cipher Scramble Glitch**: Replaces incoming text with animated digital cipher glyphs (`#$%*@!&`) resolving left-to-right into words.
- **Kinetic Harmonic Wave**: Harmonic sinusoidal vertical oscillation travelling across character positions.
- **Elastic 2nd-Order Spring Pop**: Spring-damped scale and rotation overshoot per letter.
- **Cinematic Typewriter**: Mechanical letter-by-letter reveal with cursor bounce.
- **Word Stagger Rise**: Staggered word entrances with vertical momentum.

---

### 3. 🔥 1-Click Keyframe Baker & Host Interop
- Bakes vector morphing transitions and kinetic typography reveals into discrete Bézier keyframes for **Adobe Premiere Pro (UXP)**, **After Effects (JSX)**, and **DaVinci Resolve (Fusion)**!

---

## 📁 Key File Inventory
- `components/ShapeTypographyStudioView.tsx`: Main studio UI with live SVG vector canvas, morphing sliders, trim path controls, and kinetic typography inspector.
- `../../core/shapes/universalVectorSchema.ts`: Vector shape schemas, morph pairs, and repeater models.
- `../../core/shapes/vectorEngine.ts`: SVG path generator, vertex interpolation, and shape morphing.
- `../../core/typography/universalTypographySchema.ts`: Typography animation modes and character state models.
- `../../core/typography/universalTypographyEngine.ts`: Matrix scramble, kinetic wave, spring pop, and typewriter evaluators.
