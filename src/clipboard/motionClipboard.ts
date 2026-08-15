export const motionClipboard = {
  copy<T>(data: T) {
    return data;
  },
  paste<T>() {
    return null as T | null;
  },
};
