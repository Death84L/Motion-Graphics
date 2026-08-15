# 🌐 Universal Motion Studio Multi-Host Guide

This guide explains how **Motion Studio** works across **Adobe Premiere Pro**, **Adobe After Effects**, and **Blackmagic DaVinci Resolve**.

---

## 🏗️ How Different Host Applications Load Plugins

| Host Application | Plugin Technology | Manifest / Loading Mechanism |
| :--- | :--- | :--- |
| **Adobe Premiere Pro** | Adobe UXP (Unified Extensibility Platform) | `manifest.json` (`app: "premierepro"` or `"PPRO"`) |
| **Adobe After Effects** | Adobe UXP & CEP / ExtendScript | `manifest.json` (`app: "aftereffects"` or `"AEFT"`) or JSX Script |
| **DaVinci Resolve** | Fusion Scripting (Lua / Python) | `scripts/MotionStudio_Resolve.lua` |

---

## ⚡ The Universal Multi-Host Motion JSON Standard (`.motionstudio`)

Instead of locking your animations to a single application, Motion Studio uses a **Universal Motion JSON Schema**:

```json
{
  "schemaVersion": "1.2.0",
  "metadata": {
    "name": "Elastic Hero Entrance",
    "fps": 60,
    "durationFrames": 60
  },
  "curveLayers": [
    {
      "id": "layer-1",
      "name": "Transform Scale",
      "property": "scale",
      "keyframes": [
        { "time": 0, "value": 0, "handleOut": { "x": 0.15, "y": 1.2 } },
        { "time": 20, "value": 118, "handleIn": { "x": 0.25, "y": 1.0 }, "handleOut": { "x": 0.35, "y": 1.0 } },
        { "time": 35, "value": 100, "handleIn": { "x": 0.5, "y": 1.0 } }
      ]
    }
  ]
}
```

---

## 🚀 How This Universal JSON Translates into Each Host:

1. **Inside Adobe Premiere Pro (Live UXP)**:
   - Compiles keyframe coordinates into native Premiere Pro clip properties (`Position`, `Scale`, `Rotation`, `Opacity`).
2. **Inside Adobe After Effects**:
   - Generates undo-safe JSX ExtendScript (`app.beginUndoGroup`) or `Adobe After Effects 8.0 Keyframe Data` for direct `Ctrl+V` pasting on any property.
3. **Inside DaVinci Resolve**:
   - Compiles the curve into a native **Fusion Spline Table**:
     ```lua
     {
       [0] = { 0, Flags = { Linear = false, Locked = true } },
       [20] = { 1.18, Flags = { Linear = false, Locked = true } },
       [35] = { 1.0, Flags = { Linear = false, Locked = true } }
     }
     ```
4. **Inside Web & Mobile**:
   - Compiles into CSS `linear()`, React Framer Motion, and Lottie JSON.
