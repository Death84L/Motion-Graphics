import { StackModifier } from '../stack/animationStackEngine';
import { ParametricPresetDefinition } from '../presets/parametricPresetEngine';
import { MotionLogicNode } from '../nodes/motionLogicGraph';
import { ComponentSpecification } from '../design-system/componentCatalog';

export interface CustomExporterDefinition {
  id: string;
  name: string;
  fileExtension: string;
  exportHandler: (keyframes: any[], options?: any) => string;
}

export class MotionStudioSDK {
  private static customModifiers: Map<string, StackModifier> = new Map();
  private static customPresets: Map<string, ParametricPresetDefinition> = new Map();
  private static customNodes: Map<string, MotionLogicNode> = new Map();
  private static customExporters: Map<string, CustomExporterDefinition> = new Map();
  private static customComponents: Map<string, ComponentSpecification> = new Map();

  static registerModifier(modifier: StackModifier): void {
    this.customModifiers.set(modifier.id, modifier);
  }

  static registerPreset(preset: ParametricPresetDefinition): void {
    this.customPresets.set(preset.id, preset);
  }

  static registerNode(node: MotionLogicNode): void {
    this.customNodes.set(node.id, node);
  }

  static registerExporter(exporter: CustomExporterDefinition): void {
    this.customExporters.set(exporter.id, exporter);
  }

  static registerComponent(comp: ComponentSpecification): void {
    this.customComponents.set(comp.id, comp);
  }

  static getRegisteredPlugins(): {
    modifiersCount: number;
    presetsCount: number;
    nodesCount: number;
    exportersCount: number;
    componentsCount: number;
  } {
    return {
      modifiersCount: this.customModifiers.size,
      presetsCount: this.customPresets.size,
      nodesCount: this.customNodes.size,
      exportersCount: this.customExporters.size,
      componentsCount: this.customComponents.size,
    };
  }
}
