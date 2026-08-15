import { KeyframePoint } from '../../features/graph-editor/types';

export type DenoiseAlgorithm = 'savitzky-golay' | 'gaussian' | 'median';

/**
 * De-jitters raw motion / MoCap keyframes using digital signal processing filters.
 */
export function denoiseKeyframes(
  keyframes: KeyframePoint[],
  algorithm: DenoiseAlgorithm = 'savitzky-golay',
  windowRadius = 2
): KeyframePoint[] {
  if (keyframes.length < 5) return keyframes;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const values = sorted.map((k) => k.value);
  const filteredValues: number[] = [...values];

  const n = values.length;

  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - windowRadius);
    const end = Math.min(n - 1, i + windowRadius);
    const window = values.slice(start, end + 1);

    if (algorithm === 'median') {
      const sortedWin = [...window].sort((a, b) => a - b);
      filteredValues[i] = sortedWin[Math.floor(sortedWin.length / 2)];
    } else if (algorithm === 'gaussian') {
      let weightSum = 0;
      let weightedSum = 0;
      for (let j = start; j <= end; j++) {
        const dist = j - i;
        const weight = Math.exp(-(dist * dist) / (2 * 1.5 * 1.5));
        weightedSum += values[j] * weight;
        weightSum += weight;
      }
      filteredValues[i] = weightedSum / weightSum;
    } else {
      // Savitzky-Golay 5-point quadratic filter weights: (-3, 12, 17, 12, -3) / 35
      if (i >= 2 && i <= n - 3) {
        filteredValues[i] =
          (-3 * values[i - 2] +
            12 * values[i - 1] +
            17 * values[i] +
            12 * values[i + 1] -
            3 * values[i + 2]) /
          35;
      } else {
        const sum = window.reduce((a, b) => a + b, 0);
        filteredValues[i] = sum / window.length;
      }
    }
  }

  return sorted.map((k, idx) => ({
    ...k,
    value: Math.round(filteredValues[idx] * 10) / 10,
  }));
}
