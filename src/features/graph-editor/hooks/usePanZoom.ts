export function usePanZoom(initial = { x: 0, y: 0, scale: 1 }) {
  const viewport = { ...initial };

  const zoomIn = () => {
    viewport.scale = Math.min(viewport.scale + 0.1, 3);
    return viewport;
  };

  const zoomOut = () => {
    viewport.scale = Math.max(viewport.scale - 0.1, 0.4);
    return viewport;
  };

  const pan = (dx: number, dy: number) => {
    viewport.x += dx;
    viewport.y += dy;
    return viewport;
  };

  return {
    viewport,
    zoomIn,
    zoomOut,
    pan,
  };
}
