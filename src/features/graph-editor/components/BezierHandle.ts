export type BezierHandleState = {
  x: number;
  y: number;
};

export const createBezierHandle = (x: number, y: number): BezierHandleState => ({ x, y });
