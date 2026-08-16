import { describe, it, expect } from 'vitest';
import { AnimationQAEvaluator } from '../core/social/animationQAEvaluator';

describe('Animation QA Evaluator & Verification Suite', () => {
  it('evaluates smooth continuous Bézier keyframes with 100% QA score', () => {
    const panKeys = [
      { id: 1, time: 0.0, value: 200, type: 'bezier' as const },
      { id: 2, time: 1.5, value: 220, type: 'bezier' as const },
      { id: 3, time: 3.0, value: 240, type: 'bezier' as const },
    ];
    const scaleKeys = [
      { id: 4, time: 0.0, value: 100, type: 'bezier' as const },
      { id: 5, time: 1.5, value: 108, type: 'bezier' as const },
    ];

    const qa = AnimationQAEvaluator.evaluateAnimationQA(panKeys, scaleKeys, 1920);

    expect(qa.overallScore).toBeGreaterThanOrEqual(95);
    expect(qa.jitterDeltaPx).toBe(20);
    expect(qa.ruleOfThirdsEyeAlignment).toBe(true);
    expect(qa.safeZoneCompliancePercent).toBe(100);
    expect(qa.recommendations.length).toBeGreaterThan(0);
  });

  it('generates trajectory motion trail points with continuous velocity estimation', () => {
    const panKeys = [{ id: 1, time: 0.0, value: 200, type: 'bezier' as const }];
    const scaleKeys = [{ id: 2, time: 0.0, value: 100, type: 'bezier' as const }];

    const trail = AnimationQAEvaluator.generateTrajectoryTrail(panKeys, scaleKeys, 15.0, 10);

    expect(trail.length).toBe(11);
    expect(trail[0].timeSec).toBe(0);
    expect(trail[trail.length - 1].timeSec).toBe(15);
    expect(trail[0].x).toBeGreaterThan(0);
  });
});
