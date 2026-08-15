export interface MotionCommand<T = any> {
  id: string;
  name: string;
  timestamp: number;
  execute: () => T;
  undo: () => T;
}

export class UniversalCommandHistory {
  private undoStack: MotionCommand[] = [];
  private redoStack: MotionCommand[] = [];
  private maxHistorySize = 50;

  executeCommand<T>(command: MotionCommand<T>): T {
    const result = command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new action
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    return result;
  }

  undo(): any | null {
    const command = this.undoStack.pop();
    if (!command) return null;
    const result = command.undo();
    this.redoStack.push(command);
    return result;
  }

  redo(): any | null {
    const command = this.redoStack.pop();
    if (!command) return null;
    const result = command.execute();
    this.undoStack.push(command);
    return result;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getUndoHistorySummary(): string[] {
    return this.undoStack.map((c) => c.name);
  }
}

export const GlobalCommandManager = new UniversalCommandHistory();
