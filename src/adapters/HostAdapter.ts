export interface HostAdapter {
  exportProject(): Promise<void>;
  importProject(): Promise<void>;
}
