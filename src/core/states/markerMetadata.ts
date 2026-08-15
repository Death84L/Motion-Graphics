export type MarkerCategory = 'impact' | 'cut' | 'beat' | 'cue' | 'comment';

export interface GraphMarkerMetadata {
  id: string;
  frame: number;
  label: string;
  category: MarkerCategory;
  intensity: number; // 0-100%
  color: string;
  notes?: string;
}

export const DEFAULT_MARKERS_WITH_METADATA: GraphMarkerMetadata[] = [
  { id: 'm-1', frame: 12, label: 'Camera Flash', category: 'cue', intensity: 90, color: '#38bdf8' },
  { id: 'm-2', frame: 45, label: 'Hero Impact', category: 'impact', intensity: 100, color: '#f43f5e' },
  { id: 'm-3', frame: 80, label: 'Audio Drop', category: 'beat', intensity: 75, color: '#10b981' },
];
