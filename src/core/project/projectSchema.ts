import { CurveLayer } from '../../features/graph-editor/types';
import { TimelineTrack } from '../../features/timeline/types/timeline.types';
import { MotionRecipe } from '../recipes/motionRecipeSchema';
import { CaptionSegment } from '../caption/captionModel';
import { CompleteDesignSystemTokens } from '../design-system/designSystemEngine';
import { MotionBranch } from '../git/animationGitEngine';

export interface MotionStudioProjectMetadata {
  id: string;
  name: string;
  author: string;
  version: string; // e.g. "1.2.0"
  createdAt: number;
  updatedAt: number;
  fps: number;
  width: number;
  height: number;
  durationFrames: number;
}

export interface MotionStudioAssetEntry {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'svg' | 'font';
  sizeBytes: number;
  uriOrBase64?: string;
}

export interface MotionStudioProjectFile {
  schemaVersion: string; // "1.2.0"
  metadata: MotionStudioProjectMetadata;
  assets: MotionStudioAssetEntry[];
  timelineTracks: TimelineTrack[];
  curveLayers: CurveLayer[];
  recipes: MotionRecipe[];
  captions: CaptionSegment[];
  designTokens?: CompleteDesignSystemTokens;
  gitBranches: MotionBranch[];
}

export const PROJECT_SCHEMA_VERSION = '1.2.0';

/**
 * Validates whether an imported object satisfies the .motionstudio project specification.
 */
export function validateProjectSchema(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Project data is not a valid JSON object.'] };
  }

  if (!data.schemaVersion) errors.push('Missing schemaVersion field.');
  if (!data.metadata || !data.metadata.id) errors.push('Missing metadata.id property.');
  if (!Array.isArray(data.curveLayers)) errors.push('curveLayers must be an array.');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Performs backward-compatible schema migrations (e.g. v1.0.0 -> v1.2.0).
 */
export function migrateProjectFile(project: any): MotionStudioProjectFile {
  const migrated = { ...project };

  if (!migrated.schemaVersion || migrated.schemaVersion === '1.0.0') {
    migrated.schemaVersion = PROJECT_SCHEMA_VERSION;
    if (!migrated.recipes) migrated.recipes = [];
    if (!migrated.captions) migrated.captions = [];
    if (!migrated.gitBranches) migrated.gitBranches = [];
    if (!migrated.assets) migrated.assets = [];
  }

  return migrated as MotionStudioProjectFile;
}
