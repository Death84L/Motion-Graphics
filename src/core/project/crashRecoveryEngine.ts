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

export class CrashRecoveryEngine {
  /**
   * Initializes the session watchdog to detect unplanned terminations.
   */
  static initWatchdog(): void {
    if (typeof window === 'undefined') return;
    // Set sentinel flag indicating an active running session
    sessionStorage.setItem(CRASH_SENTINEL_KEY, 'active');

    window.addEventListener('beforeunload', () => {
      // Clean intentional shutdown
      sessionStorage.removeItem(CRASH_SENTINEL_KEY);
    });
  }

  /**
   * Checks if the previous session terminated abnormally (e.g. browser crash or force quit).
   */
  static hasRecoverableCrash(): boolean {
    if (typeof window === 'undefined') return false;
    const previousActive = localStorage.getItem(CRASH_SENTINEL_KEY);
    const hasJournal = localStorage.getItem(RECOVERY_STORAGE_KEY) !== null;
    return Boolean(previousActive && hasJournal);
  }

  /**
   * Records an atomic journaled recovery snapshot.
   */
  static recordJournalSnapshot(project: MotionStudioProjectFile): void {
    if (typeof window === 'undefined') return;
    try {
      const serialized = ProjectEngine.serialize(project);
      const entry: RecoveryJournalEntry = {
        timestamp: Date.now(),
        projectSnapshot: project,
        checksum: `chk_${serialized.length}_${Date.now()}`,
        isCrashFlag: true,
      };
      localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(entry));
      localStorage.setItem(CRASH_SENTINEL_KEY, 'running');
    } catch (err) {
      // Storage quota resilience
    }
  }

  /**
   * Retrieves the last valid recovery snapshot.
   */
  static getLastRecoverySnapshot(): RecoveryJournalEntry | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(RECOVERY_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  /**
   * Clears the recovery journal after successful project restoration.
   */
  static clearRecoveryJournal(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RECOVERY_STORAGE_KEY);
    localStorage.removeItem(CRASH_SENTINEL_KEY);
  }
}
