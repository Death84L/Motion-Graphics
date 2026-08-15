import { MotionStudioProjectFile } from './projectSchema';
import { ProjectEngine } from './projectEngine';

export interface RecoveryJournalEntry {
  timestamp: number;
  projectSnapshot: MotionStudioProjectFile;
  checksum: string;
  isCrashFlag: boolean;
}

const RECOVERY_STORAGE_KEY = 'motion_studio_crash_journal_v1';
const CRASH_SENTINEL_KEY = 'motion_studio_active_session_flag';

function safeGetStorage(type: 'local' | 'session'): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    if (type === 'session' && typeof window.sessionStorage !== 'undefined') {
      return window.sessionStorage;
    }
    if (type === 'local' && typeof window.localStorage !== 'undefined') {
      return window.localStorage;
    }
  } catch (e) {
    // Storage access restricted in UXP or sandbox
  }
  return null;
}

export class CrashRecoveryEngine {
  /**
   * Initializes the session watchdog to detect unplanned terminations.
   */
  static initWatchdog(): void {
    try {
      const session = safeGetStorage('session');
      if (session) {
        session.setItem(CRASH_SENTINEL_KEY, 'active');
      }

      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('beforeunload', () => {
          try {
            const s = safeGetStorage('session');
            if (s) s.removeItem(CRASH_SENTINEL_KEY);
          } catch (e) {}
        });
      }
    } catch (err) {
      // UXP resilience
    }
  }

  /**
   * Checks if the previous session terminated abnormally.
   */
  static hasRecoverableCrash(): boolean {
    try {
      const local = safeGetStorage('local');
      if (!local) return false;
      const previousActive = local.getItem(CRASH_SENTINEL_KEY);
      const hasJournal = local.getItem(RECOVERY_STORAGE_KEY) !== null;
      return Boolean(previousActive && hasJournal);
    } catch (e) {
      return false;
    }
  }

  /**
   * Records an atomic journaled recovery snapshot.
   */
  static recordJournalSnapshot(project: MotionStudioProjectFile): void {
    try {
      const local = safeGetStorage('local');
      if (!local) return;
      const serialized = ProjectEngine.serialize(project);
      const entry: RecoveryJournalEntry = {
        timestamp: Date.now(),
        projectSnapshot: project,
        checksum: `chk_${serialized.length}_${Date.now()}`,
        isCrashFlag: true,
      };
      local.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(entry));
      local.setItem(CRASH_SENTINEL_KEY, 'running');
    } catch (err) {
      // Storage quota resilience
    }
  }

  /**
   * Retrieves the last valid recovery snapshot.
   */
  static getLastRecoverySnapshot(): RecoveryJournalEntry | null {
    try {
      const local = safeGetStorage('local');
      if (!local) return null;
      const raw = local.getItem(RECOVERY_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as RecoveryJournalEntry;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clears the recovery journal after clean restoration or dismissal.
   */
  static clearRecoveryJournal(): void {
    try {
      const local = safeGetStorage('local');
      if (local) {
        local.removeItem(RECOVERY_STORAGE_KEY);
        local.removeItem(CRASH_SENTINEL_KEY);
      }
    } catch (e) {}
  }
}
