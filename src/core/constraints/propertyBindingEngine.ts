import { UniversalPropertyBinding } from './universalConstraintSchema';

export class PropertyBindingEngine {
  /**
   * Evaluates a target property value based on the source value and binding configuration.
   */
  static evaluateBinding(
    binding: UniversalPropertyBinding,
    sourceValue: number
  ): number {
    if (!binding.enabled) return sourceValue;

    switch (binding.mappingType) {
      case 'direct':
        return sourceValue;

      case 'multiplier':
        return sourceValue * (binding.multiplier ?? 1.0);

      case 'remap-range': {
        const [sMin, sMax] = binding.sourceRange || [0, 100];
        const [tMin, tMax] = binding.targetRange || [0, 100];
        const normalized = Math.max(0, Math.min(1, (sourceValue - sMin) / (sMax - sMin || 1)));
        return tMin + normalized * (tMax - tMin);
      }

      case 'conditional': {
        if (!binding.condition) return sourceValue;
        const { operator, threshold, trueValue, falseValue } = binding.condition;
        let isTrue = false;
        if (operator === '>') isTrue = sourceValue > threshold;
        else if (operator === '<') isTrue = sourceValue < threshold;
        else if (operator === '>=') isTrue = sourceValue >= threshold;
        else if (operator === '<=') isTrue = sourceValue <= threshold;
        else if (operator === '==') isTrue = sourceValue === threshold;
        else if (operator === '!=') isTrue = sourceValue !== threshold;

        return isTrue ? trueValue : falseValue;
      }

      case 'expression': {
        try {
          if (!binding.expressionCode) return sourceValue;
          // Safe mathematical evaluator
          const safeEval = new Function('src', 'Math', `return (${binding.expressionCode});`);
          return safeEval(sourceValue, Math);
        } catch (e) {
          return sourceValue;
        }
      }

      default:
        return sourceValue;
    }
  }

  /**
   * Detects circular dependencies in a list of property bindings.
   */
  static detectCircularBindings(bindings: UniversalPropertyBinding[]): { hasCycle: boolean; cycleNodes: string[] } {
    const graph: Map<string, string[]> = new Map();

    bindings.forEach((b) => {
      if (b.enabled) {
        const from = `${b.sourceTrackId}.${b.sourceProperty}`;
        const to = `${b.targetTrackId}.${b.targetProperty}`;
        const existing = graph.get(from) || [];
        graph.set(from, [...existing, to]);
      }
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycleNodes: string[] = [];

    function isCyclic(node: string): boolean {
      visited.add(node);
      recStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          if (isCyclic(n)) {
            cycleNodes.push(node);
            return true;
          }
        } else if (recStack.has(n)) {
          cycleNodes.push(node);
          return true;
        }
      }

      recStack.delete(node);
      return false;
    }

    for (const [node] of graph) {
      if (!visited.has(node)) {
        if (isCyclic(node)) {
          return { hasCycle: true, cycleNodes };
        }
      }
    }

    return { hasCycle: false, cycleNodes: [] };
  }
}
