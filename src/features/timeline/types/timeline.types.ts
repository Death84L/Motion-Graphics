import { KeyframePoint, CurveLayer } from '../../graph-editor/types';

export type TimelinePropertyChannel =
  | 'position-x'
  | 'position-y'
  | 'scale'
  | 'rotation'
  | 'opacity'
  | 'blur'
  | 'color';

export interface TimelineTrackChannel {
  id: string;
  property: TimelinePropertyChannel;
  name: string;
  color: string;
  visible: boolean;
  keyframes: KeyframePoint[];
  currentValue: number;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'shape' | 'text' | 'group' | 'audio' | 'camera';
  color: string;
  visible: boolean;
  locked: boolean;
  solo: boolean;
  muted: boolean;
  expanded: boolean;
  channels: TimelineTrackChannel[];
}

export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color: string;
  notes?: string;
}

export interface TimelineState {
  currentTime: number; // 0 to 100 frames or beyond
  totalFrames: number; // e.g. 100, 150, 300
  fps: number;
  isPlaying: boolean;
  isLooping: boolean;
  workAreaIn: number;
  workAreaOut: number;
  zoom: number; // 1 to 5
  panOffset: number;
  selectedKeyframeIds: string[]; // "trackId:channelId:keyframeId"
  selectedTrackIds: string[];
  markers: TimelineMarker[];
}
