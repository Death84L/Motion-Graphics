import { describe, it, expect } from 'vitest';
import { UniversalExporterEngine } from '../core/export/universalExporterEngine';
import { KeyframePoint } from '../features/graph-editor/types';

describe('Universal Exporter & Multi-Host Bridge Test Suite', () => {
  const sampleKeys: KeyframePoint[] = [
    { id: 1, time: 0, value: 0, type: 'bezier' },
    { id: 2, time: 50, value: 300, type: 'bezier' },
    { id: 3, time: 100, value: 600, type: 'bezier' },
  ];

  it('generates Adobe Premiere Pro UXP JSON package', () => {
    const jsonStr = UniversalExporterEngine.generateHostCode('premiere-uxp', sampleKeys, 'Scale', 'Logo');
    expect(jsonStr).toContain('"host": "premierepro"');
    expect(jsonStr).toContain('"propertyName": "Scale"');
    expect(jsonStr).toContain('"minVersion": "25.6.0"');
  });

  it('generates Adobe After Effects JSX ExtendScript', () => {
    const jsx = UniversalExporterEngine.generateHostCode('after-effects-jsx', sampleKeys, 'Position', 'TextLayer');
    expect(jsx).toContain('app.beginUndoGroup');
    expect(jsx).toContain('setValueAtTime');
  });

  it('generates DaVinci Resolve Fusion Lua Spline script', () => {
    const lua = UniversalExporterEngine.generateHostCode('davinci-fusion-lua', sampleKeys, 'Center', 'MediaIn1');
    expect(lua).toContain('comp:FindTool("MediaIn1")');
    expect(lua).toContain('spline:SetKey(50, 300)');
  });

  it('generates Blender Python script inserting F-Curves', () => {
    const py = UniversalExporterEngine.generateHostCode('blender-python', sampleKeys, 'location', 'Cube');
    expect(py).toContain('import bpy');
    expect(py).toContain('fcurve.keyframe_points.insert');
  });

  it('generates React Framer Motion component code', () => {
    const reactCode = UniversalExporterEngine.generateHostCode('react-framer-motion', sampleKeys, 'x', 'Hero');
    expect(reactCode).toContain('import { motion } from \'framer-motion\';');
    expect(reactCode).toContain('export function HeroComponent()');
  });
});
