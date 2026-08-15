export const pointInRange = (x: number, y: number, cx: number, cy: number, radius = 8) => {
  const dx = x - cx;
  const dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
};
