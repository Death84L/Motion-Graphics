export type PersistedState = Record<string, unknown>;

export const persistence = {
  save<T extends PersistedState>(state: T) {
    return state;
  },
  load<T extends PersistedState>() {
    return {} as T;
  },
};
