import { CurveLayer } from '../../features/graph-editor/types';

export interface AutoSaveSnapshot {
  id: string;
  timestamp: number;
  label: string;
  layers: CurveLayer[];
}

const AUTOSAVE_STORAGE_KEY = 'motion_studio_autosave_v2';
const SNAPSHOTS_KEY = 'motion_studio_snapshots_v2';

/**
 * Saves current workspace state to local storage.
 */
export function autoSaveWorkspace(layers: CurveLayer[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const payload: AutoSaveSnapshot = {
        id: `autosave-${Date.now()}`,
        timestamp: Date.now(),
        label: `Autosave ${new Date().toLocaleTimeString()}`,
        layers,
      };
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch (err) {
    // Storage quota or disabled
  }
}

/**
 * Checks for a recoverable autosave session.
 */
export function checkRecoverableSession(): AutoSaveSnapshot | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (item) {
        return JSON.parse(item);
      }
    }
  } catch (err) {
    // Ignore
  }
  return null;
}

/**
 * Creates a permanent version snapshot.
 */
export function saveVersionSnapshot(layers: CurveLayer[], label: string): AutoSaveSnapshot[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = getVersionSnapshots();
      const newSnap: AutoSaveSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: Date.now(),
        label: label || `Snapshot ${existing.length + 1}`,
        layers,
      };
      const updated = [newSnap, ...existing].slice(0, 10);
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch (err) {
    // Ignore
  }
  return [];
}

/**
 * Returns saved version snapshots.
 */
export function getVersionSnapshots(): AutoSaveSnapshot[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(SNAPSHOTS_KEY);
      if (item) return JSON.parse(item);
    }
  } catch (err) {
    // Ignore
  }
  return [];
}
