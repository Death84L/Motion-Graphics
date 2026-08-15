export type TimeDisplayFormat = 'frames' | 'seconds' | 'smpte';

/**
 * Formats a frame number into frames, seconds, or SMPTE timecode (HH:MM:SS:FF).
 */
export function formatTimecode(
  frame: number,
  fps = 30,
  format: TimeDisplayFormat = 'frames'
): string {
  const cleanFrame = Math.max(0, frame);

  if (format === 'frames') {
    return `${cleanFrame.toFixed(0)}f`;
  }

  if (format === 'seconds') {
    const secs = cleanFrame / fps;
    return `${secs.toFixed(2)}s`;
  }

  // SMPTE Timecode format: HH:MM:SS:FF
  const totalSeconds = Math.floor(cleanFrame / fps);
  const remainingFrames = Math.floor(cleanFrame % fps);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(remainingFrames)}`;
}

/**
 * Value axis formatter based on property unit type.
 */
export type ValueUnitType = '%' | 'px' | 'deg' | 'dB';

export function formatValueUnit(value: number, unit: ValueUnitType = '%'): string {
  switch (unit) {
    case 'deg':
      return `${value.toFixed(0)}°`;
    case 'px':
      return `${value.toFixed(0)}px`;
    case 'dB':
      return `${value.toFixed(1)}dB`;
    case '%':
    default:
      return `${value.toFixed(0)}%`;
  }
}
