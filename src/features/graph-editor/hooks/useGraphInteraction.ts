export function useGraphInteraction() {
  return {
    dragging: false,
    pointer: { x: 0, y: 0 },
    startDrag: () => ({ dragging: true }),
    stopDrag: () => ({ dragging: false }),
  };
}
