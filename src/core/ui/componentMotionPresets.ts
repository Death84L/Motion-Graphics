export type UIComponentCategory = 'button' | 'card' | 'toggle' | 'modal' | 'badge';

export interface ComponentMotionBlueprint {
  id: string;
  name: string;
  category: UIComponentCategory;
  description: string;
  isMagnetic: boolean;
  hover: { scale: number; translateY: number; glowPx: number; shadowPx: number };
  press: { scale: number; translateY: number; glowPx: number; shadowPx: number };
  transitionDurationMs: number;
}

export const COMPONENT_MOTION_BLUEPRINTS: ComponentMotionBlueprint[] = [
  {
    id: 'bp-btn-tactile',
    name: 'Tactile Pill Button',
    category: 'button',
    description: 'Crisp scale compression with spring rebound.',
    isMagnetic: false,
    hover: { scale: 1.04, translateY: -3, glowPx: 12, shadowPx: 16 },
    press: { scale: 0.95, translateY: 2, glowPx: 4, shadowPx: 4 },
    transitionDurationMs: 160,
  },
  {
    id: 'bp-btn-magnetic',
    name: 'Magnetic Attraction Button',
    category: 'button',
    description: 'Smooth physical attraction towards the mouse cursor.',
    isMagnetic: true,
    hover: { scale: 1.06, translateY: -2, glowPx: 18, shadowPx: 20 },
    press: { scale: 0.94, translateY: 1, glowPx: 6, shadowPx: 6 },
    transitionDurationMs: 180,
  },
  {
    id: 'bp-card-tilt',
    name: 'Elevated Glass Card',
    category: 'card',
    description: 'Dynamic 3D perspective lift with deep atmospheric elevation.',
    isMagnetic: true,
    hover: { scale: 1.02, translateY: -8, glowPx: 25, shadowPx: 32 },
    press: { scale: 0.98, translateY: -2, glowPx: 10, shadowPx: 12 },
    transitionDurationMs: 240,
  },
  {
    id: 'bp-toggle-haptic',
    name: 'Haptic Snap Switch',
    category: 'toggle',
    description: 'Ultra-fast snap with mechanical spring settle.',
    isMagnetic: false,
    hover: { scale: 1.08, translateY: 0, glowPx: 8, shadowPx: 8 },
    press: { scale: 0.92, translateY: 0, glowPx: 2, shadowPx: 2 },
    transitionDurationMs: 120,
  },
];
