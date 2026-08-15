import { CompositionLayer } from '../../features/composition/types/composition.types';

export type TargetFilterMode =
  | 'all'
  | 'selected'
  | 'text-only'
  | 'shape-only'
  | 'ui-cards'
  | 'name-pattern';

export type SpatialSortOrder =
  | 'original-order'
  | 'position-x-asc'
  | 'position-x-desc'
  | 'position-y-asc'
  | 'position-y-desc'
  | 'center-outward'
  | 'outside-inward';

export interface SmartTargetingConfig {
  filterMode: TargetFilterMode;
  namePattern?: string;
  sortOrder: SpatialSortOrder;
  reverseOrder: boolean;
}

export const DEFAULT_TARGETING_CONFIG: SmartTargetingConfig = {
  filterMode: 'all',
  sortOrder: 'position-y-asc',
  reverseOrder: false,
};

/**
 * Filters and spatially sorts composition layers based on smart targeting rules.
 */
export function filterAndSortTargetLayers(
  layers: CompositionLayer[],
  selectedLayerId: string | null,
  config: SmartTargetingConfig = DEFAULT_TARGETING_CONFIG
): CompositionLayer[] {
  // 1. Filter
  let filtered = layers.filter((l) => {
    switch (config.filterMode) {
      case 'selected':
        return l.id === selectedLayerId;
      case 'text-only':
        return l.type === 'text';
      case 'shape-only':
        return l.type === 'shape';
      case 'ui-cards':
        return l.type === 'ui-card' || l.type === 'badge';
      case 'name-pattern':
        return config.namePattern ? l.name.toLowerCase().includes(config.namePattern.toLowerCase()) : true;
      case 'all':
      default:
        return true;
    }
  });

  // 2. Spatial Sort
  filtered = [...filtered].sort((a, b) => {
    switch (config.sortOrder) {
      case 'position-x-asc':
        return a.transform.x - b.transform.x;
      case 'position-x-desc':
        return b.transform.x - a.transform.x;
      case 'position-y-asc':
        return a.transform.y - b.transform.y;
      case 'position-y-desc':
        return b.transform.y - a.transform.y;
      case 'center-outward': {
        const distA = Math.sqrt(a.transform.x * a.transform.x + a.transform.y * a.transform.y);
        const distB = Math.sqrt(b.transform.x * b.transform.x + b.transform.y * b.transform.y);
        return distA - distB;
      }
      case 'outside-inward': {
        const distA = Math.sqrt(a.transform.x * a.transform.x + a.transform.y * a.transform.y);
        const distB = Math.sqrt(b.transform.x * b.transform.x + b.transform.y * b.transform.y);
        return distB - distA;
      }
      case 'original-order':
      default:
        return 0;
    }
  });

  if (config.reverseOrder) {
    filtered.reverse();
  }

  return filtered;
}
