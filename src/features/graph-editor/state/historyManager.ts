export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export class HistoryManager<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];
  private maxHistory: number;

  constructor(initialState: T, maxHistory = 40) {
    this.present = JSON.parse(JSON.stringify(initialState));
    this.maxHistory = maxHistory;
  }

  get currentState(): T {
    return this.present;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  push(newState: T) {
    const serialized = JSON.parse(JSON.stringify(newState));
    // Don't push if unchanged
    if (JSON.stringify(this.present) === JSON.stringify(serialized)) return;

    this.past.push(this.present);
    if (this.past.length > this.maxHistory) {
      this.past.shift();
    }
    this.present = serialized;
    this.future = []; // Clear redo stack on new action
  }

  undo(): T | null {
    if (!this.canUndo) return null;
    const previous = this.past.pop()!;
    this.future.unshift(this.present);
    this.present = previous;
    return JSON.parse(JSON.stringify(this.present));
  }

  redo(): T | null {
    if (!this.canRedo) return null;
    const next = this.future.shift()!;
    this.past.push(this.present);
    this.present = next;
    return JSON.parse(JSON.stringify(this.present));
  }

  clear(initialState: T) {
    this.past = [];
    this.present = JSON.parse(JSON.stringify(initialState));
    this.future = [];
  }
}
