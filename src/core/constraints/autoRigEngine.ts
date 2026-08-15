import {
  UniversalConstraintDefinition,
  UniversalPropertyBinding,
  RigPreset,
  AutoRigRecipe,
} from './universalConstraintSchema';
import { UniversalTrack } from '../timeline/universalTimelineSchema';

export class AutoRigEngine {
  /**
   * Analyzes spatial layer relationships and auto-generates a cohesive, responsive UI Rig.
   */
  static generateAutoRig(
    containerTrack: UniversalTrack,
    childTracks: UniversalTrack[],
    recipe: Partial<AutoRigRecipe> = {}
  ): RigPreset {
    const padding = recipe.padding ?? 16;
    const gap = recipe.gap ?? 12;

    const generatedConstraints: UniversalConstraintDefinition[] = [];
    const generatedBindings: UniversalPropertyBinding[] = [];

    // 1. Center child layers or create horizontal stack layout
    childTracks.forEach((child, idx) => {
      generatedConstraints.push({
        id: `c-auto-align-${child.id}`,
        name: `Auto Align: ${child.name} in ${containerTrack.name}`,
        category: 'alignment',
        sourceTrackId: child.id,
        targetTrackId: containerTrack.id,
        weight: 1.0,
        enabled: true,
        priority: 1,
        space: 'local',
        parameters: {
          alignMode: idx === 0 ? 'center' : 'middle',
        },
      });

      // 2. Parent child to container
      generatedConstraints.push({
        id: `c-auto-parent-${child.id}`,
        name: `Parent: ${child.name} -> ${containerTrack.name}`,
        category: 'relationship',
        sourceTrackId: child.id,
        targetTrackId: containerTrack.id,
        weight: 1.0,
        enabled: true,
        priority: 2,
        space: 'parent',
        parameters: {
          followPosition: true,
          followScale: true,
          followRotation: true,
          followOpacity: true,
        },
      });
    });

    // 3. Auto-Hug Content Size Binding (Container Width adapts dynamically to text length)
    const primaryTextChild = childTracks.find((c) => c.type === 'text') || childTracks[0];
    if (primaryTextChild) {
      generatedBindings.push({
        id: `b-auto-hug-width-${containerTrack.id}`,
        name: `Auto-Hug: ${containerTrack.name} Width -> ${primaryTextChild.name} Bounds`,
        sourceTrackId: primaryTextChild.id,
        sourceProperty: 'width',
        targetTrackId: containerTrack.id,
        targetProperty: 'width',
        mappingType: 'remap-range',
        sourceRange: [40, 300],
        targetRange: [40 + padding * 2, 300 + padding * 2 + gap],
        enabled: true,
      });
    }

    return {
      id: `rig-auto-${Date.now()}`,
      name: `Auto-Rig: ${containerTrack.name} System`,
      category: 'ui',
      description: `Automatically inferred responsive layout rig with ${childTracks.length} child elements.`,
      constraints: generatedConstraints,
      bindings: generatedBindings,
    };
  }
}
