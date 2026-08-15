import {
  MotionStudioProjectFile,
  PROJECT_SCHEMA_VERSION,
  validateProjectSchema,
  migrateProjectFile,
} from './projectSchema';
import { INITIAL_CURVE_LAYERS } from '../../features/graph-editor/state/graphStore';
import { SAMPLE_MOTION_RECIPES } from '../recipes/motionRecipeSchema';

export class ProjectEngine {
  /**
   * Initializes a brand-new .motionstudio project container.
   */
  static createNewProject(name = 'Untitled Motion Project'): MotionStudioProjectFile {
    const now = Date.now();
    return {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      metadata: {
        id: `proj-${now}`,
        name,
        author: 'Motion Designer',
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        fps: 30,
        width: 1920,
        height: 1080,
        durationFrames: 100,
      },
      assets: [],
      timelineTracks: [],
      curveLayers: JSON.parse(JSON.stringify(INITIAL_CURVE_LAYERS)),
      recipes: JSON.parse(JSON.stringify(SAMPLE_MOTION_RECIPES)),
      captions: [],
      gitBranches: [
        {
          id: 'main',
          name: 'main',
          author: 'Motion Designer',
          createdAt: now,
          keyframes: INITIAL_CURVE_LAYERS[0]?.keyframes || [],
        },
      ],
    };
  }

  /**
   * Serializes a Motion Studio project into formatted JSON text.
   */
  static serialize(project: MotionStudioProjectFile): string {
    project.metadata.updatedAt = Date.now();
    return JSON.stringify(project, null, 2);
  }

  /**
   * Deserializes and validates a project file from text.
   */
  static deserialize(rawJson: string): MotionStudioProjectFile {
    const parsed = JSON.parse(rawJson);
    const validation = validateProjectSchema(parsed);
    if (!validation.isValid) {
      throw new Error(`Project file corrupted: ${validation.errors.join(', ')}`);
    }
    return migrateProjectFile(parsed);
  }

  /**
   * Triggers a browser download of the .motionstudio project file.
   */
  static exportToFile(project: MotionStudioProjectFile, filename?: string): void {
    const jsonStr = this.serialize(project);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${project.metadata.name.replace(/\s+/g, '-').toLowerCase()}.motionstudio`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
