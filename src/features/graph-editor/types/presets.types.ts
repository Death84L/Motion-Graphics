import { KeyframePoint } from './keyframe.types';

export interface UserCurvePreset {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: number;
  isFavorite: boolean;
  keyframes: KeyframePoint[];
  tags?: string[];
}
