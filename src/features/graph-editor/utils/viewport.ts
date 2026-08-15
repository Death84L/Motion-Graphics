export const clampZoom = (scale: number, min = 0.25, max = 4) => Math.min(Math.max(scale, min), max);

export const zoomBy = (scale: number, delta: number) => clampZoom(scale * delta);
