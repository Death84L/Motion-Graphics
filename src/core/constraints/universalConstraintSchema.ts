export type ConstraintCategory =
  | 'transform'
  | 'relationship'
  | 'alignment'
  | 'distance'
  | 'angle'
  | 'look-at'
  | 'path'
  | 'pin'
  | 'boundary'
  | 'layout-flex'
  | 'ik-bone'
  | 'spring'
  | 'expression'
  | 'auto-rig';

export type TransformSpace = 'local' | 'world' | 'parent' | 'screen';

export interface UniversalPropertyBinding {
  id: string;
  name: string;
  sourceTrackId: string;
  sourceProperty: string; // e.g. "width", "position.x", "audio.bass", "controller.slider"
  targetTrackId: string;
  targetProperty: string; // e.g. "fontSize", "scale", "position.y"
  mappingType: 'direct' | 'remap-range' | 'multiplier' | 'expression' | 'conditional';
  sourceRange?: [number, number]; // e.g. [0, 1920]
  targetRange?: [number, number]; // e.g. [12, 48]
  multiplier?: number;
  expressionCode?: string; // e.g. "Math.min(500, src * 1.2)"
  condition?: {
    operator: '>' | '<' | '==' | '!=' | '>=' | '<=';
    threshold: number;
    trueValue: number;
    falseValue: number;
  };
  enabled: boolean;
}

export interface UniversalConstraintDefinition {
  id: string;
  name: string;
  category: ConstraintCategory;
  sourceTrackId: string;
  targetTrackId: string;
  weight: number; // 0.0 to 1.0 (for constraint blending & animation)
  enabled: boolean;
  priority: number;
  space: TransformSpace;
  parameters: {
    // Transform & Follow
    followPosition?: boolean;
    followRotation?: boolean;
    followScale?: boolean;
    followOpacity?: boolean;
    lagDamping?: number; // 0.0 (instant) to 0.95 (heavy lag)
    offset?: { x: number; y: number; z?: number };

    // Alignment & Distance
    alignMode?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h' | 'distribute-v';
    minDistance?: number;
    maxDistance?: number;
    fixedDistance?: number;

    // Look-At & Path
    lookAtSmoothing?: number;
    lookAtReverse?: boolean;
    pathProgress?: number; // 0.0 to 1.0
    pathLoopMode?: 'loop' | 'ping-pong' | 'once';

    // Boundary & Clamp
    boundaryBox?: { minX: number; maxX: number; minY: number; maxY: number };
    clampElasticity?: number;

    // Layout & Flexbox
    flexDirection?: 'row' | 'column';
    flexGap?: number;
    flexPadding?: number;
    autoSizeToContent?: boolean;

    // 2-Bone IK
    ikPoleTargetId?: string;
    boneLength1?: number;
    boneLength2?: number;
    ikFlip?: boolean;

    // Spring & Physics
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export interface AutoRigRecipe {
  id: string;
  name: string;
  containerTrackId: string;
  childTrackIds: string[];
  autoLayoutMode: 'horizontal-stack' | 'vertical-stack' | 'content-hug-card' | 'navbar-rig';
  padding: number;
  gap: number;
  enableHoverSpring: boolean;
}

export interface RigPreset {
  id: string;
  name: string;
  category: 'ui' | 'character' | 'motion' | 'social';
  description: string;
  constraints: UniversalConstraintDefinition[];
  bindings: UniversalPropertyBinding[];
}

export const SAMPLE_RIG_PRESETS: RigPreset[] = [
  {
    id: 'rig-responsive-button',
    name: 'Responsive Button Rig',
    category: 'ui',
    description: 'Auto-resizes background card based on text length with fixed icon padding and hover springs.',
    constraints: [
      {
        id: 'c-btn-align',
        name: 'Center Text in Button',
        category: 'alignment',
        sourceTrackId: 'track-hero-title',
        targetTrackId: 'track-glow-card',
        weight: 1.0,
        enabled: true,
        priority: 1,
        space: 'local',
        parameters: { alignMode: 'center' },
      },
      {
        id: 'c-btn-layout',
        name: 'Auto-Padding Stack',
        category: 'layout-flex',
        sourceTrackId: 'track-glow-card',
        targetTrackId: 'track-hero-title',
        weight: 1.0,
        enabled: true,
        priority: 2,
        space: 'local',
        parameters: { flexDirection: 'row', flexGap: 12, flexPadding: 16, autoSizeToContent: true },
      },
    ],
    bindings: [
      {
        id: 'b-btn-width',
        name: 'Text Width -> Background Width',
        sourceTrackId: 'track-hero-title',
        sourceProperty: 'width',
        targetTrackId: 'track-glow-card',
        targetProperty: 'width',
        mappingType: 'remap-range',
        sourceRange: [50, 400],
        targetRange: [90, 450],
        enabled: true,
      },
    ],
  },
  {
    id: 'rig-2bone-arm-ik',
    name: '2-Bone Arm IK Rig',
    category: 'character',
    description: 'Analytic 2-Bone Inverse Kinematics with Pole Vector elbow orientation and FK/IK blending.',
    constraints: [
      {
        id: 'c-arm-ik',
        name: 'Arm IK Solver',
        category: 'ik-bone',
        sourceTrackId: 'track-hero-title',
        targetTrackId: 'track-glow-card',
        weight: 1.0,
        enabled: true,
        priority: 1,
        space: 'world',
        parameters: { boneLength1: 80, boneLength2: 70, ikFlip: false },
      },
    ],
    bindings: [],
  },
  {
    id: 'rig-eye-look-at',
    name: 'Interactive Eye Look-At Target',
    category: 'motion',
    description: 'Puppet eyes automatically track target coordinates with smooth lag damping.',
    constraints: [
      {
        id: 'c-eye-look',
        name: 'Look At Target',
        category: 'look-at',
        sourceTrackId: 'track-hero-title',
        targetTrackId: 'track-null-rig',
        weight: 1.0,
        enabled: true,
        priority: 1,
        space: 'world',
        parameters: { lookAtSmoothing: 0.15, lookAtReverse: false },
      },
    ],
    bindings: [],
  },
];
