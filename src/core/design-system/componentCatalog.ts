export type ComponentCategory = 'buttons' | 'cards' | 'navigation' | 'feedback' | 'inputs';

export interface ComponentSpecification {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  variants: string[];
  defaultMotionPreset: string;
  propsSchema: Record<string, 'string' | 'number' | 'boolean'>;
}

export const COMPONENT_CATALOG: ComponentSpecification[] = [
  {
    id: 'cmp-button',
    name: 'Pill Action Button',
    category: 'buttons',
    description: 'High-contrast interactive button with tactile scale compression.',
    variants: ['primary', 'glow', 'outline', 'ghost'],
    defaultMotionPreset: 'btn-tactile-pop',
    propsSchema: { label: 'string', disabled: 'boolean', loading: 'boolean' },
  },
  {
    id: 'cmp-card',
    name: 'Glassmorphic Card',
    category: 'cards',
    description: 'Elevated backdrop-filter container with 3D cursor tilt.',
    variants: ['elevated', 'glass', 'bordered'],
    defaultMotionPreset: 'card-lift-glow',
    propsSchema: { title: 'string', padding: 'number', glow: 'boolean' },
  },
  {
    id: 'cmp-toggle',
    name: 'Haptic Toggle Switch',
    category: 'inputs',
    description: 'Mechanical snap switch with spring settle.',
    variants: ['default', 'compact'],
    defaultMotionPreset: 'toggle-switch-snap',
    propsSchema: { checked: 'boolean', label: 'string' },
  },
  {
    id: 'cmp-modal',
    name: 'Centered Dialog Modal',
    category: 'feedback',
    description: 'Scale-spring dialog backdrop with atmospheric blur fade.',
    variants: ['default', 'danger', 'fullscreen'],
    defaultMotionPreset: 'modal-spring-scale',
    propsSchema: { title: 'string', isOpen: 'boolean' },
  },
  {
    id: 'cmp-badge',
    name: 'Status Indicator Badge',
    category: 'feedback',
    description: 'Pill indicator with subtle breathing glow pulse.',
    variants: ['success', 'warning', 'info', 'error'],
    defaultMotionPreset: 'badge-pulse-glow',
    propsSchema: { text: 'string', pulse: 'boolean' },
  },
  {
    id: 'cmp-navbar',
    name: 'Floating Glass Navbar',
    category: 'navigation',
    description: 'Sticky responsive navigation bar with active tab underline spring.',
    variants: ['floating', 'top-fixed'],
    defaultMotionPreset: 'nav-slide-down',
    propsSchema: { title: 'string', sticky: 'boolean' },
  },
];
