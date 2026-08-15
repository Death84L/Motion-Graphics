import { CurveLayer, KeyframePoint } from '../../features/graph-editor/types';
import { processLayerBatch, BatchProcessingParams } from '../batch/motionBatchProcessor';
import { compileParametricPreset, ParametricPresetDefinition } from '../presets/parametricPresetSystem';
import { normalizeVelocityPeak } from '../velocity/velocityLabEngine';
import { optimizeCurveMatching } from '../matching/advancedMotionMatcher';

export interface MotionOperationStep {
  id: string;
  type: 'batch-edit' | 'apply-preset' | 'normalize-velocity' | 'match-reference' | 'stagger-timing';
  description: string;
  payload?: any;
}

export class MotionOperationsPipeline {
  private steps: MotionOperationStep[] = [];

  addStep(step: MotionOperationStep): this {
    this.steps.push(step);
    return this;
  }

  clear(): void {
    this.steps = [];
  }

  getSteps(): MotionOperationStep[] {
    return [...this.steps];
  }

  /**
   * Executes the entire chained pipeline of motion operations sequentially across layers.
   */
  executeChain(layers: CurveLayer[], selectedLayerIds: string[]): CurveLayer[] {
    let workingLayers = JSON.parse(JSON.stringify(layers)) as CurveLayer[];

    for (const step of this.steps) {
      switch (step.type) {
        case 'batch-edit': {
          const params = (step.payload as BatchProcessingParams) || {};
          const { updatedLayers } = processLayerBatch(workingLayers, selectedLayerIds, params);
          workingLayers = updatedLayers;
          break;
        }

        case 'apply-preset': {
          const preset = step.payload?.preset as ParametricPresetDefinition;
          if (preset) {
            const compiled = compileParametricPreset(preset, step.payload?.variant || 'medium');
            workingLayers = workingLayers.map((l) =>
              selectedLayerIds.includes(l.id) ? { ...l, keyframes: JSON.parse(JSON.stringify(compiled)) } : l
            );
          }
          break;
        }

        case 'normalize-velocity': {
          const targetPeak = step.payload?.targetPeak || 2.0;
          workingLayers = workingLayers.map((l) =>
            selectedLayerIds.includes(l.id) ? { ...l, keyframes: normalizeVelocityPeak(l.keyframes, targetPeak) } : l
          );
          break;
        }

        case 'match-reference': {
          const refKeys = step.payload?.referenceKeyframes as KeyframePoint[];
          if (refKeys && refKeys.length > 0) {
            workingLayers = workingLayers.map((l) =>
              selectedLayerIds.includes(l.id) ? { ...l, keyframes: optimizeCurveMatching(refKeys, l.keyframes) } : l
            );
          }
          break;
        }

        case 'stagger-timing': {
          const stepFrames = step.payload?.stepFrames || 10;
          let idx = 0;
          workingLayers = workingLayers.map((l) => {
            if (selectedLayerIds.includes(l.id)) {
              const offset = idx * stepFrames;
              idx++;
              return {
                ...l,
                keyframes: l.keyframes.map((k) => ({ ...k, time: k.time + offset })),
              };
            }
            return l;
          });
          break;
        }
      }
    }

    return workingLayers;
  }
}
