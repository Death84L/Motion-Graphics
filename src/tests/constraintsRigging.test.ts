import { describe, it, expect } from 'vitest';
import { IkRiggingEngine } from '../core/constraints/ikRiggingEngine';
import { PropertyBindingEngine } from '../core/constraints/propertyBindingEngine';
import { LayoutConstraintEngine } from '../core/constraints/layoutConstraintEngine';
import { AutoRigEngine } from '../core/constraints/autoRigEngine';
import { INITIAL_UNIVERSAL_COMPOSITION } from '../core/timeline/universalTimelineSchema';

describe('Constraint & Rigging System Test Suite', () => {
  it('solves 2-Bone analytic Inverse Kinematics within geometric reach', () => {
    const rootPos = { x: 0, y: 0 };
    const targetPos = { x: 100, y: 50 };
    const length1 = 80;
    const length2 = 70;

    const result = IkRiggingEngine.solve2BoneIk(rootPos, targetPos, length1, length2, false);
    expect(result.isReachable).toBe(true);
    expect(result.elbow.x).toBeGreaterThan(0);
    expect(result.effector.x).toBeCloseTo(targetPos.x, 1);
    expect(result.effector.y).toBeCloseTo(targetPos.y, 1);
  });

  it('evaluates universal property range remapping accurately', () => {
    const binding = {
      id: 'b-test',
      name: 'Test Remap',
      sourceTrackId: 't1',
      sourceProperty: 'width',
      targetTrackId: 't2',
      targetProperty: 'fontSize',
      mappingType: 'remap-range' as const,
      sourceRange: [0, 1000] as [number, number],
      targetRange: [12, 48] as [number, number],
      enabled: true,
    };

    const midVal = PropertyBindingEngine.evaluateBinding(binding, 500);
    expect(midVal).toBe(30); // Exactly halfway between 12 and 48
  });

  it('detects circular property binding loops correctly', () => {
    const cyclicBindings = [
      {
        id: 'b1',
        name: 'A -> B',
        sourceTrackId: 'trackA',
        sourceProperty: 'width',
        targetTrackId: 'trackB',
        targetProperty: 'width',
        mappingType: 'direct' as const,
        enabled: true,
      },
      {
        id: 'b2',
        name: 'B -> A',
        sourceTrackId: 'trackB',
        sourceProperty: 'width',
        targetTrackId: 'trackA',
        targetProperty: 'width',
        mappingType: 'direct' as const,
        enabled: true,
      },
    ];

    const check = PropertyBindingEngine.detectCircularBindings(cyclicBindings);
    expect(check.hasCycle).toBe(true);
  });

  it('computes responsive auto-layout flexbox stacks and container auto-hug', () => {
    const container = { id: 'c1', x: 0, y: 0, width: 100, height: 50 };
    const children = [
      { id: 'icon', x: 0, y: 0, width: 24, height: 24 },
      { id: 'text', x: 0, y: 0, width: 120, height: 20 },
    ];

    const result = LayoutConstraintEngine.computeFlexLayout(container, children, {
      direction: 'row',
      gap: 12,
      padding: 16,
      justifyContent: 'start',
      alignItems: 'center',
    });

    // Expected container width = 24 + 120 + 12 (gap) + 32 (padding) = 188px
    expect(result.container.width).toBe(188);
    expect(result.children[1].x).toBe(16 + 24 + 12); // padding + iconWidth + gap = 52
  });

  it('synthesizes auto-rig layout recipes from layer pairs', () => {
    const container = INITIAL_UNIVERSAL_COMPOSITION.tracks[1];
    const textChild = INITIAL_UNIVERSAL_COMPOSITION.tracks[0];

    const autoRig = AutoRigEngine.generateAutoRig(container, [textChild]);
    expect(autoRig.constraints.length).toBeGreaterThan(0);
    expect(autoRig.bindings.length).toBeGreaterThan(0);
  });
});
