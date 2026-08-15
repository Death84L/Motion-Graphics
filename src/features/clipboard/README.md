# 📋 Smart Motion Clipboard (`src/features/clipboard`)

## Overview
Advanced motion clipboard system supporting selective property copying, intelligent cross-property normalization, master-child linked motion bindings, and multi-slot clipboard history.

---

## 🚀 Key Capabilities
- **Selective Copy Mask**: Granular checkboxes to selectively copy *Values, Timing, Easing, Tangents, Velocity, Modifiers, Spring Parameters, or Styles*.
- **Smart Cross-Property Paste**: Pasting a Position X curve onto a Scale or Opacity channel automatically normalizes the numerical domain (e.g. $0\text{px} \to 1200\text{px}$ seamlessly adapts to $0\% \to 100\%$).
- **Paste as Linked Motion**: Establishes a master-child dependency where modifying the Master Motion dynamically updates all linked child layers.
- **12-Slot Clipboard History**: Stores up to 12 recent motion snapshots with instant search and paste capability.

---

## 📁 Key File Inventory
- `components/MotionClipboardDrawer.tsx`: UI drawer with copy mask checkboxes, history cards, and paste controls.
- `../../core/clipboard/smartMotionClipboard.ts`: Clipboard manager with domain normalization algorithms.
