# 🦾 Complete Constraint & Rigging System (`src/features/constraints-rigging`)

## Overview
The **Complete Constraint & Rigging System** provides a 12-engine motion architecture for responsive UI layout rigging, 2D Inverse Kinematics (IK), universal property-to-property bindings, and 1-click Auto-Rig generation.

---

## 🚀 Key Capabilities & Tools

### 1. 📐 Transform, Relationship & Distance Constraints
- **Transform & Follow**: Position, Scale, Rotation, Opacity, and Pivot inheritance with lag damping.
- **Alignment & Distribution**: Align Left/Center/Right/Top/Bottom and distribute spacing evenly.
- **Fixed & Dynamic Distance**: Maintain fixed pixel gaps between elements (e.g. `Icon ↔ Text = 16px`).

### 2. 🦴 2D Inverse Kinematics (IK) & Character Rigging
- **Analytic 2-Bone & 3-Bone IK**: Law-of-cosines joint rotation solver placing end-effectors on interactive target coordinates.
- **Pole Vector & FK/IK Blending**: Seamless weight interpolation ($0\% \to 100\%$) between Forward Kinematics and Inverse Kinematics.

### 3. 📦 Responsive Layout & Flex Auto-Hug
- **Reactive Flexbox Stacks**: Dynamic Row and Column stacks with content-hug dimensions.
- **Content-Based Resizing**: Container dimensions automatically adapt when internal text or icons change.

### 4. 🔗 Universal Property Binding
- **Arbitrary Property Drivers**: Bind *ANY* property A to *ANY* property B:
  - `Button.width ➔ Text.fontSize`
  - `Audio.bass ➔ Circle.scale`
  - `Slider.value ➔ Camera.zoom`
- **Range Remapping & Math Expressions**: Map $[0, 100] \to [12, 36]$ with conditional triggers ($>$, $<$, $==$).

### 5. ✨ 1-Click Auto-Rig System
- Select `[Button, Text, Icon, Background]` $\to$ 1-click **"Auto-Rig UI System"** automatically synthesizes center alignment, content-hug width, and reactive hover spring dynamics.

### 6. 🩺 Circular Dependency Debugger
- Topological sort cycle detector highlighting any circular property loops in real time.

---

## 📁 Key File Inventory
- `components/ConstraintRiggingStudioView.tsx`: Main studio UI with interactive IK canvas and responsive layout preview.
- `../../core/constraints/universalConstraintSchema.ts`: Universal constraint definitions, property bindings, and rig presets.
- `../../core/constraints/ikRiggingEngine.ts`: Analytic 2-bone IK solver and FK/IK blending math.
- `../../core/constraints/layoutConstraintEngine.ts`: Flexbox and content-hug layout solver.
- `../../core/constraints/propertyBindingEngine.ts`: Universal property binding and circular dependency checker.
- `../../core/constraints/autoRigEngine.ts`: Spatial layer inference and auto-rig synthesizer.
