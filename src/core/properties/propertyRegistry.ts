export type PropertyDataType = 'number' | 'color' | 'boolean' | 'vector2' | 'vector3';

export interface UniversalPropertyDefinition {
  id: string;
  name: string;
  category: 'transform' | 'appearance' | 'typography' | 'camera' | 'custom';
  dataType: PropertyDataType;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: 'px' | '%' | 'deg' | 'em' | 'rem' | 'ms' | 'unitless';
  interpolator: 'scalar' | 'angle' | 'color' | 'step';
  description?: string;
}

export class PropertyRegistry {
  private static properties: Map<string, UniversalPropertyDefinition> = new Map();

  static initialize(): void {
    if (this.properties.size > 0) return;

    // Transform 2D / 3D
    this.register({ id: 'position-x', name: 'Position X', category: 'transform', dataType: 'number', defaultValue: 0, min: -2000, max: 2000, step: 1, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'position-y', name: 'Position Y', category: 'transform', dataType: 'number', defaultValue: 0, min: -2000, max: 2000, step: 1, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'position-z', name: 'Position Z', category: 'transform', dataType: 'number', defaultValue: 0, min: -1000, max: 1000, step: 1, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'scale-uniform', name: 'Scale Uniform', category: 'transform', dataType: 'number', defaultValue: 100, min: 0, max: 500, step: 1, unit: '%', interpolator: 'scalar' });
    this.register({ id: 'scale-x', name: 'Scale X', category: 'transform', dataType: 'number', defaultValue: 100, min: 0, max: 500, step: 1, unit: '%', interpolator: 'scalar' });
    this.register({ id: 'scale-y', name: 'Scale Y', category: 'transform', dataType: 'number', defaultValue: 100, min: 0, max: 500, step: 1, unit: '%', interpolator: 'scalar' });
    this.register({ id: 'rotation-z', name: 'Rotation (Roll)', category: 'transform', dataType: 'number', defaultValue: 0, min: -360, max: 360, step: 0.5, unit: 'deg', interpolator: 'angle' });
    this.register({ id: 'rotation-x', name: 'Rotation X (Pitch)', category: 'transform', dataType: 'number', defaultValue: 0, min: -360, max: 360, step: 0.5, unit: 'deg', interpolator: 'angle' });
    this.register({ id: 'rotation-y', name: 'Rotation Y (Yaw)', category: 'transform', dataType: 'number', defaultValue: 0, min: -360, max: 360, step: 0.5, unit: 'deg', interpolator: 'angle' });
    this.register({ id: 'skew-x', name: 'Skew X', category: 'transform', dataType: 'number', defaultValue: 0, min: -90, max: 90, step: 0.5, unit: 'deg', interpolator: 'scalar' });
    this.register({ id: 'skew-y', name: 'Skew Y', category: 'transform', dataType: 'number', defaultValue: 0, min: -90, max: 90, step: 0.5, unit: 'deg', interpolator: 'scalar' });

    // Appearance & VFX
    this.register({ id: 'opacity', name: 'Opacity', category: 'appearance', dataType: 'number', defaultValue: 100, min: 0, max: 100, step: 1, unit: '%', interpolator: 'scalar' });
    this.register({ id: 'blur', name: 'Gaussian Blur', category: 'appearance', dataType: 'number', defaultValue: 0, min: 0, max: 100, step: 0.5, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'brightness', name: 'Brightness', category: 'appearance', dataType: 'number', defaultValue: 100, min: 0, max: 300, step: 1, unit: '%', interpolator: 'scalar' });
    this.register({ id: 'contrast', name: 'Contrast', category: 'appearance', dataType: 'number', defaultValue: 100, min: 0, max: 300, step: 1, unit: '%', interpolator: 'scalar' });
    this.register({ id: 'glow-intensity', name: 'Glow Bloom', category: 'appearance', dataType: 'number', defaultValue: 0, min: 0, max: 100, step: 1, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'shadow-elevation', name: 'Shadow Depth', category: 'appearance', dataType: 'number', defaultValue: 0, min: 0, max: 80, step: 1, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'border-radius', name: 'Border Radius', category: 'appearance', dataType: 'number', defaultValue: 12, min: 0, max: 200, step: 1, unit: 'px', interpolator: 'scalar' });

    // Typography
    this.register({ id: 'font-size', name: 'Font Size', category: 'typography', dataType: 'number', defaultValue: 32, min: 8, max: 200, step: 1, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'letter-spacing', name: 'Tracking / Letter Spacing', category: 'typography', dataType: 'number', defaultValue: 0, min: -0.5, max: 2.0, step: 0.01, unit: 'em', interpolator: 'scalar' });
    this.register({ id: 'word-spacing', name: 'Word Spacing', category: 'typography', dataType: 'number', defaultValue: 0, min: -10, max: 100, step: 1, unit: 'px', interpolator: 'scalar' });

    // Camera
    this.register({ id: 'camera-zoom', name: 'Camera Zoom', category: 'camera', dataType: 'number', defaultValue: 1.0, min: 0.2, max: 5.0, step: 0.05, unit: 'unitless', interpolator: 'scalar' });
    this.register({ id: 'camera-pan-x', name: 'Camera Pan X', category: 'camera', dataType: 'number', defaultValue: 0, min: -1000, max: 1000, step: 1, unit: 'px', interpolator: 'scalar' });
    this.register({ id: 'camera-pan-y', name: 'Camera Pan Y', category: 'camera', dataType: 'number', defaultValue: 0, min: -1000, max: 1000, step: 1, unit: 'px', interpolator: 'scalar' });
  }

  static register(prop: UniversalPropertyDefinition): void {
    this.properties.set(prop.id, prop);
  }

  static get(id: string): UniversalPropertyDefinition | undefined {
    this.initialize();
    return this.properties.get(id);
  }

  static getAll(): UniversalPropertyDefinition[] {
    this.initialize();
    return Array.from(this.properties.values());
  }

  static getByCategory(category: UniversalPropertyDefinition['category']): UniversalPropertyDefinition[] {
    return this.getAll().filter((p) => p.category === category);
  }
}
