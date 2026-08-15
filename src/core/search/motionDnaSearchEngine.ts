import { MotionDnaFingerprint } from '../analysis/motionDnaEngine';
import { SAMPLE_MOTION_RECIPES, MotionRecipe } from '../recipes/motionRecipeSchema';

export interface MotionDnaSearchResult {
  recipe: MotionRecipe;
  similarityPercent: number; // 0 to 100%
  dnaDistance: number;
}

export const PRESET_DNA_DATABASE: Array<{ recipe: MotionRecipe; dna: Partial<MotionDnaFingerprint> }> = [
  {
    recipe: SAMPLE_MOTION_RECIPES[0], // Tactile Pill Pop
    dna: { energy: 76, smoothness: 88, elasticity: 72, aggression: 42, rhythm: 85 },
  },
  {
    recipe: SAMPLE_MOTION_RECIPES[1], // Cinematic Elegance Drift
    dna: { energy: 38, smoothness: 96, elasticity: 15, aggression: 10, rhythm: 60 },
  },
];

/**
 * Searches the preset library by comparing target Motion DNA metrics against stored signatures.
 */
export function searchByMotionDna(
  targetDna: Partial<MotionDnaFingerprint>,
  limit = 5
): MotionDnaSearchResult[] {
  const tEnergy = targetDna.energy ?? 50;
  const tSmooth = targetDna.smoothness ?? 50;
  const tElastic = targetDna.elasticity ?? 50;
  const tAggro = targetDna.aggression ?? 50;
  const tRhythm = targetDna.rhythm ?? 50;

  const results: MotionDnaSearchResult[] = PRESET_DNA_DATABASE.map((item) => {
    // 5D Euclidean distance normalized
    const dE = Math.pow((item.dna.energy ?? 50) - tEnergy, 2);
    const dS = Math.pow((item.dna.smoothness ?? 50) - tSmooth, 2);
    const dEl = Math.pow((item.dna.elasticity ?? 50) - tElastic, 2);
    const dA = Math.pow((item.dna.aggression ?? 50) - tAggro, 2);
    const dR = Math.pow((item.dna.rhythm ?? 50) - tRhythm, 2);

    const dist = Math.sqrt(dE + dS + dEl + dA + dR);
    const maxDist = Math.sqrt(5 * Math.pow(100, 2)); // ~223.6
    const similarity = Math.max(0, Math.round((1 - dist / maxDist) * 100));

    return {
      recipe: item.recipe,
      similarityPercent: similarity,
      dnaDistance: Math.round(dist * 10) / 10,
    };
  });

  return results.sort((a, b) => b.similarityPercent - a.similarityPercent).slice(0, limit);
}

/**
 * Parses plain-text search phrases into target Motion DNA parameters deterministically.
 */
export function parseSemanticQueryToDna(query: string): Partial<MotionDnaFingerprint> {
  const q = query.toLowerCase();
  const dna: Partial<MotionDnaFingerprint> = { energy: 50, smoothness: 50, elasticity: 50, aggression: 50, rhythm: 50 };

  if (q.includes('cinematic') || q.includes('soft') || q.includes('elegant') || q.includes('gentle')) {
    dna.smoothness = 95;
    dna.aggression = 15;
    dna.elasticity = 20;
    dna.energy = 40;
  } else if (q.includes('pop') || q.includes('snappy') || q.includes('punchy') || q.includes('button')) {
    dna.energy = 85;
    dna.elasticity = 75;
    dna.aggression = 60;
    dna.smoothness = 80;
  } else if (q.includes('bounce') || q.includes('elastic') || q.includes('spring')) {
    dna.elasticity = 95;
    dna.energy = 80;
    dna.smoothness = 75;
  }

  return dna;
}
