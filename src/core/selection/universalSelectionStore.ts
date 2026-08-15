export interface UniversalSelectionState {
  selectedLayerIds: string[];
  selectedKeyframeIds: string[];
  selectedPropertyNames: string[];
  selectedWordIds: string[];
  activeChannel: string | null;
}

export const INITIAL_SELECTION_STATE: UniversalSelectionState = {
  selectedLayerIds: [],
  selectedKeyframeIds: [],
  selectedPropertyNames: ['positionY'],
  selectedWordIds: [],
  activeChannel: 'positionY',
};

export class UniversalSelectionStore {
  private state: UniversalSelectionState = { ...INITIAL_SELECTION_STATE };
  private listeners: Array<(state: UniversalSelectionState) => void> = [];

  getState(): UniversalSelectionState {
    return { ...this.state };
  }

  setSelection(updates: Partial<UniversalSelectionState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  selectKeyframe(keyframeId: string, multiSelect = false): void {
    if (multiSelect) {
      const exists = this.state.selectedKeyframeIds.includes(keyframeId);
      const newIds = exists
        ? this.state.selectedKeyframeIds.filter((id) => id !== keyframeId)
        : [...this.state.selectedKeyframeIds, keyframeId];
      this.setSelection({ selectedKeyframeIds: newIds });
    } else {
      this.setSelection({ selectedKeyframeIds: [keyframeId] });
    }
  }

  clearSelection(): void {
    this.setSelection({ selectedKeyframeIds: [], selectedLayerIds: [], selectedWordIds: [] });
  }

  subscribe(listener: (state: UniversalSelectionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.state));
  }
}

export const GlobalSelectionStore = new UniversalSelectionStore();
