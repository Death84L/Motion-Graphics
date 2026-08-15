export const toScreenPoint = (x: number, y: number, scale = 1, offsetX = 0, offsetY = 0) => ({
  x: x * scale + offsetX,
  y: y * scale + offsetY,
});

export const toWorldPoint = (x: number, y: number, scale = 1, offsetX = 0, offsetY = 0) => ({
  x: (x - offsetX) / scale,
  y: (y - offsetY) / scale,
});
