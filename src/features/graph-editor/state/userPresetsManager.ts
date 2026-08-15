import { UserCurvePreset } from '../types/presets.types';
import { KeyframePoint } from '../types/keyframe.types';

const STORAGE_KEY = 'motion_studio_user_presets_v1';

const DEFAULT_USER_PRESETS: UserCurvePreset[] = [
  {
    id: 'user-punchy-ui',
    name: 'Punchy UI Pop',
    category: 'UI Motion',
    description: 'Fast overshoot with immediate snappy settling',
    createdAt: Date.now() - 100000,
    isFavorite: true,
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'easeIn' },
      { id: 2, time: 35, value: 108, ease: 'easeOut', handleIn: { x: -10, y: 0 }, handleOut: { x: 10, y: 0 } },
      { id: 3, time: 100, value: 100, ease: 'easeOut' },
    ],
    tags: ['UI', 'Snappy', 'Button'],
  },
  {
    id: 'user-cinematic-slow',
    name: 'Cinematic Decel',
    category: 'Film',
    description: 'Ultra-smooth atmospheric camera easing',
    createdAt: Date.now() - 50000,
    isFavorite: false,
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'easeInOut', handleOut: { x: 45, y: 0, angle: 0, length: 45 } },
      { id: 2, time: 100, value: 100, ease: 'easeOut', handleIn: { x: -45, y: 0, angle: 180, length: 45 } },
    ],
    tags: ['Camera', 'Smooth', 'Film'],
  },
];

export class UserPresetsManager {
  /**
   * Loads all user presets from localStorage.
   */
  static loadPresets(): UserCurvePreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load user presets from localStorage', e);
    }
    return DEFAULT_USER_PRESETS;
  }

  /**
   * Saves presets array to localStorage.
   */
  static savePresets(presets: UserCurvePreset[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.warn('Failed to save user presets to localStorage', e);
    }
  }

  /**
   * Adds a new preset from the current curve keyframes.
   */
  static createPreset(name: string, keyframes: KeyframePoint[], category = 'Custom'): UserCurvePreset {
    const presets = this.loadPresets();
    const newPreset: UserCurvePreset = {
      id: `preset-${Date.now()}`,
      name: name.trim() || `My Preset ${presets.length + 1}`,
      category,
      createdAt: Date.now(),
      isFavorite: false,
      keyframes: JSON.parse(JSON.stringify(keyframes)),
    };

    const updated = [newPreset, ...presets];
    this.savePresets(updated);
    return newPreset;
  }

  /**
   * Deletes a preset by ID.
   */
  static deletePreset(id: string): UserCurvePreset[] {
    const presets = this.loadPresets().filter((p) => p.id !== id);
    this.savePresets(presets);
    return presets;
  }

  /**
   * Renames a preset.
   */
  static renamePreset(id: string, newName: string): UserCurvePreset[] {
    const presets = this.loadPresets().map((p) =>
      p.id === id ? { ...p, name: newName.trim() } : p
    );
    this.savePresets(presets);
    return presets;
  }

  /**
   * Toggles the favorite status of a preset.
   */
  static toggleFavorite(id: string): UserCurvePreset[] {
    const presets = this.loadPresets().map((p) =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    this.savePresets(presets);
    return presets;
  }

  /**
   * Exports presets as JSON string for backup/sharing.
   */
  static exportToJson(): string {
    const presets = this.loadPresets();
    return JSON.stringify(presets, null, 2);
  }

  /**
   * Imports presets from a JSON string.
   */
  static importFromJson(jsonStr: string): UserCurvePreset[] {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        const current = this.loadPresets();
        const combined = [...parsed, ...current.filter((c) => !parsed.some((p: any) => p.id === c.id))];
        this.savePresets(combined);
        return combined;
      }
    } catch (e) {
      throw new Error('Invalid preset JSON format');
    }
    return this.loadPresets();
  }
}
