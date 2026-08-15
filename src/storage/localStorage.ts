export const localStorageService = {
  get<T>(key: string, fallback: T): T {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  },

  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};
