# 📈 Velocity Lab (`src/features/velocity-lab`)

## Overview
The **Velocity Lab** is a dedicated kinematics engineering studio that visualizes motion through three synchronized differential curves: **Position ($x$)**, **Velocity ($v = \frac{dx}{dt}$)**, and **Acceleration ($a = \frac{dv}{dt}$)**.

---

## 🚀 Key Capabilities & Tools
- **Triple Synchronized Differential Curves**: Live inspection of position, velocity ramps, and acceleration peaks across the timeline.
- **Peak Velocity Normalization**: Scale peak velocity (e.g. $3.42 \to 2.00$) while preserving curve curvature.
- **Velocity Clamping**: Caps maximum speed spikes to eliminate jarring camera or UI jumps.
- **Velocity-Preserving Retiming**: Rescales animation duration ($400\text{ms} \to 800\text{ms}$) while mathematically preserving kinetic character and acceleration weight.
- **Zero-Crossing Detectors**: Pinpoints exact frames where velocity inverts for perfect overshoot tuning.

---

## 📐 Impact on Creators
- Allows designers to see *why* an animation feels bad (e.g. sudden acceleration spikes or jerky stops).
- Gives quantitative control over kinetic energy and fluid settling physics.

---

## 📁 Key File Inventory
- `components/VelocityLabView.tsx`: Main synchronized triple-graph canvas and modifier controls.
- `../../core/velocity/velocityLabEngine.ts`: Numerical differentiation and normalization math engine.
