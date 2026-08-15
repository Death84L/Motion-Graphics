import { KeyframePoint } from '../../features/graph-editor/types';
import { MotionRecipe } from '../recipes/motionRecipeSchema';

export type UniversalClipboardType = 'motion-keyframes' | 'timing-only' | 'easing-only' | 'motion-recipe' | 'caption-style';

export interface UniversalClipboardPayload {
  type: UniversalClipboardType;
  sourceContext: string;
  timestamp: number;
  keyframes?: KeyframePoint[];
  recipe?: MotionRecipe;
  metadata?: Record<string, any>;
}

export class UniversalClipboardManager {
  private static clipboardPayload: UniversalClipboardPayload | null = null;

  static copyKeyframes(keyframes: KeyframePoint[], context = 'graph-editor'): void {
    this.clipboardPayload = {
      type: 'motion-keyframes',
      sourceContext: context,
      timestamp: Date.now(),
      keyframes: JSON.parse(JSON.stringify(keyframes)),
    };
  }

  static copyRecipe(recipe: MotionRecipe, context = 'recipe-studio'): void {
    this.clipboardPayload = {
      type: 'motion-recipe',
      sourceContext: context,
      timestamp: Date.now(),
      recipe: JSON.parse(JSON.stringify(recipe)),
    };
  }

  static paste(): UniversalClipboardPayload | null {
    if (!this.clipboardPayload) return null;
    return JSON.parse(JSON.stringify(this.clipboardPayload));
  }

  static hasClipboardData(): boolean {
    return this.clipboardPayload !== null;
  }

  static getClipboardSummary(): string {
    if (!this.clipboardPayload) return 'Empty Clipboard';
    if (this.clipboardPayload.type === 'motion-keyframes') {
      return `Keyframes (${this.clipboardPayload.keyframes?.length || 0} pts) from ${this.clipboardPayload.sourceContext}`;
    } else if (this.clipboardPayload.type === 'motion-recipe') {
      return `Recipe: ${this.clipboardPayload.recipe?.name || 'Custom'}`;
    }
    return `${this.clipboardPayload.type}`;
  }
}
