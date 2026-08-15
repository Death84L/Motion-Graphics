export type ChartType = 'racing-bar' | 'line-graph' | 'donut-pie' | 'counter-odometer';

export interface DataPoint {
  label: string;
  value: number;
  color: string;
  previousValue?: number;
}

export interface InfographicConfig {
  type: ChartType;
  title: string;
  data: DataPoint[];
  durationSec: number;
  isStaggered: boolean;
  prefix: string; // e.g. "$"
  suffix: string; // e.g. "K" or "%"
}

export const SAMPLE_CHART_DATA: DataPoint[] = [
  { label: 'Motion Design', value: 92, color: '#38bdf8' },
  { label: 'Video Editing', value: 84, color: '#ec4899' },
  { label: 'Color Grading', value: 76, color: '#f59e0b' },
  { label: 'Sound Foley', value: 68, color: '#10b981' },
  { label: 'VFX Compositing', value: 58, color: '#8b5cf6' },
];
