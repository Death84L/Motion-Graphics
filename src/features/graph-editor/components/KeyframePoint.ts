export type KeyframePointState = {
  x: number;
  y: number;
  selected: boolean;
};

export const createKeyframePoint = (x: number, y: number, selected = false): KeyframePointState => ({
  x,
  y,
  selected,
});
