export interface LayoutBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  margin?: { left: number; right: number; top: number; bottom: number };
}

export interface FlexContainerConfig {
  direction: 'row' | 'column';
  gap: number;
  padding: number;
  justifyContent: 'start' | 'center' | 'end' | 'space-between';
  alignItems: 'start' | 'center' | 'end';
}

export class LayoutConstraintEngine {
  /**
   * Computes reactive flexbox layout positions for children inside a container.
   */
  static computeFlexLayout(
    container: LayoutBox,
    children: LayoutBox[],
    config: FlexContainerConfig
  ): { container: LayoutBox; children: LayoutBox[] } {
    const isRow = config.direction === 'row';
    let currentOffset = config.padding;

    // Calculate total content size
    const totalChildSize = children.reduce((acc, c) => acc + (isRow ? c.width : c.height), 0);
    const totalGaps = Math.max(0, children.length - 1) * config.gap;
    const requiredSize = totalChildSize + totalGaps + config.padding * 2;

    // Auto-hug container dimensions
    const updatedContainer: LayoutBox = {
      ...container,
      width: isRow ? Math.max(container.width, requiredSize) : container.width,
      height: !isRow ? Math.max(container.height, requiredSize) : container.height,
    };

    const updatedChildren: LayoutBox[] = children.map((c) => {
      let childX = c.x;
      let childY = c.y;

      if (isRow) {
        childX = updatedContainer.x + currentOffset;
        if (config.alignItems === 'center') {
          childY = updatedContainer.y + (updatedContainer.height - c.height) / 2;
        } else if (config.alignItems === 'end') {
          childY = updatedContainer.y + updatedContainer.height - c.height - config.padding;
        } else {
          childY = updatedContainer.y + config.padding;
        }
        currentOffset += c.width + config.gap;
      } else {
        childY = updatedContainer.y + currentOffset;
        if (config.alignItems === 'center') {
          childX = updatedContainer.x + (updatedContainer.width - c.width) / 2;
        } else if (config.alignItems === 'end') {
          childX = updatedContainer.x + updatedContainer.width - c.width - config.padding;
        } else {
          childX = updatedContainer.x + config.padding;
        }
        currentOffset += c.height + config.gap;
      }

      return {
        ...c,
        x: Math.round(childX * 10) / 10,
        y: Math.round(childY * 10) / 10,
      };
    });

    return { container: updatedContainer, children: updatedChildren };
  }
}
