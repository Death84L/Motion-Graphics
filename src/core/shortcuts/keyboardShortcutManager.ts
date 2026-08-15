export interface ShortcutBinding {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: 'navigation' | 'editing' | 'playback' | 'host';
  action: () => void;
}

export class KeyboardShortcutManager {
  private static bindings: ShortcutBinding[] = [];
  private static isListenerAttached = false;

  static registerBinding(binding: ShortcutBinding): void {
    this.bindings.push(binding);
    this.ensureListener();
  }

  static unregisterAll(): void {
    this.bindings = [];
  }

  static getBindings(): ShortcutBinding[] {
    return [...this.bindings];
  }

  private static ensureListener(): void {
    if (this.isListenerAttached || typeof window === 'undefined') return;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // Exception: ⌘K or Escape should still fire
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          // Allow Command Palette
        } else {
          return;
        }
      }

      for (const b of this.bindings) {
        const matchesKey = e.key.toLowerCase() === b.key.toLowerCase();
        const matchesModifier = Boolean(b.ctrlOrCmd) === Boolean(e.metaKey || e.ctrlKey);
        const matchesShift = Boolean(b.shift) === Boolean(e.shiftKey);
        const matchesAlt = Boolean(b.alt) === Boolean(e.altKey);

        if (matchesKey && matchesModifier && matchesShift && matchesAlt) {
          e.preventDefault();
          b.action();
          return;
        }
      }
    });

    this.isListenerAttached = true;
  }
}
