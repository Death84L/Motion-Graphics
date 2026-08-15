import { KeyframePoint } from '../../features/graph-editor/types';

export type UniversalTrackType =
  | 'video'
  | 'audio'
  | 'text'
  | 'shape'
  | 'camera'
  | 'light'
  | 'null'
  | 'adjustment'
  | 'controller'
  | 'precomp';

export type UniversalInterpolation =
  | 'linear'
  | 'bezier'
  | 'hold'
  | 'step'
  | 'spring'
  | 'elastic'
  | 'bounce';

export interface UniversalKeyframe {
  id: string;
  frame: number;
  value: number;
  interpolation: UniversalInterpolation;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
  velocityIn?: number;
  velocityOut?: number;
  isSelected?: boolean;
}

export interface UniversalPropertyLane {
  id: string;
  propertyName: string; // e.g. "position.x", "scale.uniform", "rotation.z", "opacity", "blur"
  displayName: string;
  color: string;
  currentValue: number;
  keyframes: UniversalKeyframe[];
  isExpanded: boolean;
  expression?: string;
  min?: number;
  max?: number;
  unit?: string;
}

export interface UniversalConstraint {
  id: string;
  type: 'look-at' | 'path' | 'distance' | 'follow' | 'aim' | 'parent-offset';
  targetTrackId: string;
  influence: number; // 0.0 to 1.0
  offset?: { x: number; y: number; z?: number };
}

export interface UniversalController {
  id: string;
  name: string;
  type: 'slider' | 'angle' | 'checkbox' | 'point2d' | 'color' | 'dropdown';
  value: number | string | boolean;
  min?: number;
  max?: number;
  options?: string[];
  boundPropertyIds: string[];
}

export interface UniversalMarker {
  id: string;
  frame: number;
  durationFrames?: number;
  label: string;
  color: string;
  type: 'cue' | 'beat' | 'chapter' | 'comment' | 'event';
  notes?: string;
}

export interface UniversalRegion {
  id: string;
  inFrame: number;
  outFrame: number;
  label: string;
  color: string;
  type: 'work-area' | 'render' | 'export' | 'protected';
}

export interface UniversalTrack {
  id: string;
  name: string;
  type: UniversalTrackType;
  color: string;
  visible: boolean;
  locked: boolean;
  solo: boolean;
  muted: boolean;
  shy: boolean;
  isExpanded: boolean;
  parentId?: string; // Null parenting / hierarchical transform
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'add';
  inFrame: number;
  outFrame: number;
  timeOffsetFrames: number;
  speedMultiplier: number;
  loopMode: 'none' | 'loop' | 'ping-pong' | 'cycle-offset';
  propertyLanes: UniversalPropertyLane[];
  constraints: UniversalConstraint[];
  nestedCompId?: string;
}

export interface UniversalComposition {
  id: string;
  name: string;
  fps: number;
  width: number;
  height: number;
  durationFrames: number;
  colorSpace: 'sRGB' | 'Rec.709' | 'Display P3';
  timecodeOrigin: string; // e.g. "00:00:00:00"
  backgroundColor: string;
  tracks: UniversalTrack[];
  markers: UniversalMarker[];
  regions: UniversalRegion[];
  controllers: UniversalController[];
}

export const INITIAL_UNIVERSAL_COMPOSITION: UniversalComposition = {
  id: 'comp-master',
  name: 'Master Composition',
  fps: 60,
  width: 1920,
  height: 1080,
  durationFrames: 180, // 3 seconds at 60fps
  colorSpace: 'Rec.709',
  timecodeOrigin: '00:00:00:00',
  backgroundColor: '#040711',
  controllers: [
    {
      id: 'ctrl-master-speed',
      name: 'Master Kinetic Speed',
      type: 'slider',
      value: 1.0,
      min: 0.25,
      max: 3.0,
      boundPropertyIds: [],
    },
    {
      id: 'ctrl-elasticity',
      name: 'Bounce Elasticity',
      type: 'slider',
      value: 80,
      min: 0,
      max: 100,
      boundPropertyIds: [],
    },
  ],
  markers: [
    { id: 'm-1', frame: 0, label: 'Intro Strike', color: '#38bdf8', type: 'cue' },
    { id: 'm-2', frame: 45, label: 'Beat Drop (Bass)', color: '#ec4899', type: 'beat' },
    { id: 'm-3', frame: 90, label: 'Hero Settle', color: '#10b981', type: 'chapter' },
  ],
  regions: [
    { id: 'reg-work-area', inFrame: 0, outFrame: 120, label: 'Work Area', color: '#38bdf8', type: 'work-area' },
  ],
  tracks: [
    {
      id: 'track-hero-title',
      name: 'Hero Kinetic Typography',
      type: 'text',
      color: '#38bdf8',
      visible: true,
      locked: false,
      solo: false,
      muted: false,
      shy: false,
      isExpanded: true,
      blendMode: 'normal',
      inFrame: 0,
      outFrame: 120,
      timeOffsetFrames: 0,
      speedMultiplier: 1.0,
      loopMode: 'none',
      constraints: [],
      propertyLanes: [
        {
          id: 'lane-title-scale',
          propertyName: 'scale',
          displayName: 'Scale (%)',
          color: '#38bdf8',
          currentValue: 100,
          isExpanded: true,
          unit: '%',
          keyframes: [
            { id: 'k1', frame: 0, value: 0, interpolation: 'bezier', handleOut: { x: 0.15, y: 1.2 } },
            { id: 'k2', frame: 35, value: 118, interpolation: 'bezier', handleIn: { x: 0.25, y: 1.0 }, handleOut: { x: 0.35, y: 1.0 } },
            { id: 'k3', frame: 60, value: 100, interpolation: 'bezier', handleIn: { x: 0.5, y: 1.0 } },
          ],
        },
        {
          id: 'lane-title-pos-y',
          propertyName: 'position.y',
          displayName: 'Position Y (px)',
          color: '#818cf8',
          currentValue: 0,
          isExpanded: false,
          unit: 'px',
          keyframes: [
            { id: 'k4', frame: 0, value: 120, interpolation: 'bezier', handleOut: { x: 0.2, y: 1.0 } },
            { id: 'k5', frame: 50, value: 0, interpolation: 'bezier', handleIn: { x: 0.3, y: 1.0 } },
          ],
        },
        {
          id: 'lane-title-opacity',
          propertyName: 'opacity',
          displayName: 'Opacity',
          color: '#94a3b8',
          currentValue: 1.0,
          isExpanded: false,
          keyframes: [
            { id: 'k6', frame: 0, value: 0, interpolation: 'linear' },
            { id: 'k7', frame: 20, value: 1.0, interpolation: 'linear' },
          ],
        },
      ],
    },
    {
      id: 'track-glow-card',
      name: 'Glass Card Container',
      type: 'shape',
      color: '#ec4899',
      visible: true,
      locked: false,
      solo: false,
      muted: false,
      shy: false,
      isExpanded: false,
      blendMode: 'normal',
      inFrame: 10,
      outFrame: 140,
      timeOffsetFrames: 10,
      speedMultiplier: 1.0,
      loopMode: 'none',
      constraints: [],
      propertyLanes: [
        {
          id: 'lane-card-scale',
          propertyName: 'scale',
          displayName: 'Scale (%)',
          color: '#ec4899',
          currentValue: 100,
          isExpanded: true,
          unit: '%',
          keyframes: [
            { id: 'k8', frame: 10, value: 80, interpolation: 'bezier', handleOut: { x: 0.3, y: 1.0 } },
            { id: 'k9', frame: 70, value: 100, interpolation: 'bezier', handleIn: { x: 0.25, y: 1.0 } },
          ],
        },
      ],
    },
    {
      id: 'track-audio-master',
      name: 'Soundtrack & Bass Beat',
      type: 'audio',
      color: '#10b981',
      visible: true,
      locked: true,
      solo: false,
      muted: false,
      shy: false,
      isExpanded: false,
      blendMode: 'normal',
      inFrame: 0,
      outFrame: 180,
      timeOffsetFrames: 0,
      speedMultiplier: 1.0,
      loopMode: 'none',
      constraints: [],
      propertyLanes: [
        {
          id: 'lane-audio-vol',
          propertyName: 'volume',
          displayName: 'Volume (dB)',
          color: '#10b981',
          currentValue: 0,
          isExpanded: false,
          unit: 'dB',
          keyframes: [
            { id: 'k10', frame: 0, value: -12, interpolation: 'linear' },
            { id: 'k11', frame: 30, value: 0, interpolation: 'linear' },
          ],
        },
      ],
    },
    {
      id: 'track-null-rig',
      name: 'Master Null Controller',
      type: 'null',
      color: '#f59e0b',
      visible: true,
      locked: false,
      solo: false,
      muted: false,
      shy: false,
      isExpanded: false,
      blendMode: 'normal',
      inFrame: 0,
      outFrame: 180,
      timeOffsetFrames: 0,
      speedMultiplier: 1.0,
      loopMode: 'none',
      constraints: [],
      propertyLanes: [],
    },
  ],
};
