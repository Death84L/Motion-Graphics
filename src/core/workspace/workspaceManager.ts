export type WorkspaceProfile =
  | 'motion-design'
  | 'ui-animation'
  | 'character-animation'
  | 'data-visualization'
  | 'vfx';

export interface WorkspaceConfig {
  id: WorkspaceProfile;
  name: string;
  desc: string;
  leftDefaultTab: string;
  rightDefaultTab: string;
  showAudio: boolean;
  graphMode: 'value' | 'velocity' | 'speed';
  accentColor: string;
}

export const WORKSPACE_PRESETS: Record<WorkspaceProfile, WorkspaceConfig> = {
  'motion-design': {
    id: 'motion-design',
    name: 'Motion Design',
    desc: 'Optimized for commercial motion graphics, easing, and overshoot bounces',
    leftDefaultTab: 'extrapolation',
    rightDefaultTab: 'semantic',
    showAudio: true,
    graphMode: 'value',
    accentColor: '#38bdf8',
  },
  'ui-animation': {
    id: 'ui-animation',
    name: 'UI / Web Animation',
    desc: 'Focused on CSS linear(), GSAP, Framer Motion, and keyframe transfers',
    leftDefaultTab: 'tangents',
    rightDefaultTab: 'presets',
    showAudio: false,
    graphMode: 'value',
    accentColor: '#10b981',
  },
  'character-animation': {
    id: 'character-animation',
    name: 'Character Animation',
    desc: 'Tuned for dynamics, anticipation, secondary follow, and multi-layer hierarchy',
    leftDefaultTab: 'dynamics',
    rightDefaultTab: 'mocap',
    showAudio: true,
    graphMode: 'value',
    accentColor: '#ec4899',
  },
  'data-visualization': {
    id: 'data-visualization',
    name: 'Data Visualization',
    desc: 'Configured for mathematical curve fitting, rhythm quantization, and operators',
    leftDefaultTab: 'fit',
    rightDefaultTab: 'rhythm',
    showAudio: false,
    graphMode: 'speed',
    accentColor: '#a855f7',
  },
  vfx: {
    id: 'vfx',
    name: 'VFX & Speed Ramps',
    desc: 'Tailored for high-precision velocity curves, kinematic jerk, and health monitoring',
    leftDefaultTab: 'health',
    rightDefaultTab: 'states',
    showAudio: true,
    graphMode: 'velocity',
    accentColor: '#f59e0b',
  },
};
